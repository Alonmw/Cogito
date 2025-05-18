## **Feature: Bot Persona Selection**

**Goal:** Allow users to choose a persona (e.g., Socrates, Nietzsche, Kant) for the AI for new chat sessions on the **Mobile App**. The chosen persona will have a tailored system prompt, specific conversation starter suggestions, and a customized initial greeting. The selected persona's name will be displayed in the chat interface, and conversation history will store this context.

**Key Components (Mobile Focus):**

1. **Persona Definitions:** Storing persona details (name, system prompt file mapping, conversation suggestions, initial greeting) for backend and frontend use.  
2. **Backend Adjustments:** Database schema changes, API modifications to handle personas.  
3. **Shared Type Updates:** Modifying common interfaces for API communication.  
4. **Mobile Frontend (React Native/Expo):**  
   * New Pre-Dialogue/Persona Selection Screen.  
   * Updates to Chat Screen UI and logic for persona handling and customized greetings.  
   * Updates to History Screen UI to display persona.  
   * Navigation flow adjustments.

### **Phase 1: Backend Modifications (Socratic-Web/backend/)**

**Objective:** Update the backend to support multiple personas and store persona context with conversations.

**Step 1.1: Define and Store Persona Prompts (Confirmed: File-based)**

* **Action:** Create new text files for each persona's system prompt in the Socratic-Web/backend/ directory.  
  * Files: prompt\_socrates.txt (can be the existing prompt.txt renamed or copied), prompt\_nietzsche.txt, prompt\_kant.txt.  
  * **Content:** Each file contains the detailed system prompt for that persona.

**Step 1.2: Update Configuration for Persona Prompts**

* **File:** Socratic-Web/backend/app/config.py  
* **Action:**  
  * Define a dictionary mapping persona IDs to their prompt file paths.  
  * Define the default persona ID.

\# In Config class:  
PERSONA\_PROMPTS\_PATHS \= {  
    "socrates": os.path.join(os.path.abspath(os.path.dirname(\_\_file\_\_)), '..', 'prompt\_socrates.txt'),  
    "nietzsche": os.path.join(os.path.abspath(os.path.dirname(\_\_file\_\_)), '..', 'prompt\_nietzsche.txt'),  
    "kant": os.path.join(os.path.abspath(os.path.dirname(\_\_file\_\_)), '..', 'prompt\_kant.txt'),  
}  
DEFAULT\_PERSONA\_ID \= "socrates"

* **File:** Socratic-Web/backend/app/\_\_init\_\_.py  
* **Action:**  
  * Load all persona prompts into a dictionary on the app object (e.g., app.persona\_prompts\_content).  
  * Store DEFAULT\_PERSONA\_ID on the app object.

\# In create\_app():  
app.persona\_prompts\_content \= {}  
for persona\_id, path in app.config\['PERSONA\_PROMPTS\_PATHS'\].items():  
    try:  
        with open(path, 'r') as f:  
            app.persona\_prompts\_content\[persona\_id\] \= f.read()  
        app.logger.info(f"System prompt for persona '{persona\_id}' loaded successfully from {path}.")  
    except Exception as e:  
        app.logger.error(f"Error reading system prompt file for persona '{persona\_id}' from {path}: {e}")

app.DEFAULT\_PERSONA\_ID \= app.config\['DEFAULT\_PERSONA\_ID'\]

\# Ensure the original app.system\_prompt is set to the default for any existing logic  
\# that might still use it, or refactor such logic.  
app.system\_prompt \= app.persona\_prompts\_content.get(app.DEFAULT\_PERSONA\_ID, "Default fallback prompt if socrates.txt is missing.")

**Step 1.3: Update Database Model (Conversation)**

* **File:** Socratic-Web/backend/app/models.py  
* **Action:** Add persona\_id field to Conversation model.  
  class Conversation(db.Model):  
      \# ... existing fields ...  
      persona\_id \= db.Column(db.String(50), nullable=False, default='socrates', index=True)  
      \# ... rest of the model ...

  * default='socrates' ensures existing conversations and new ones (if persona\_id isn't explicitly set during creation for some reason) get this default.

**Step 1.4: Create Database Migration (Handle Existing Conversations)**

* **Action:** Use Flask-Migrate.  
  * flask db migrate \-m "add\_persona\_id\_to\_conversation\_with\_default"  
  * Review the generated migration script. It should add the persona\_id column with server\_default='socrates'. This will automatically populate existing rows where persona\_id would be NULL with 'socrates'.  
  * flask db upgrade  
* **Verification:** Confirm existing rows in the conversation table have persona\_id set to 'socrates'.

**Step 1.5: Update API Endpoint (/api/dialogue)**

* **File:** Socratic-Web/backend/app/dialogue/routes.py  
* **Action:**  
  1. **Receive persona\_id:**  
     data \= request.get\_json()  
     incoming\_persona\_id \= data.get('persona\_id', current\_app.DEFAULT\_PERSONA\_ID)

  2. **Select System Prompt:**  
     system\_prompt\_content \= current\_app.persona\_prompts\_content.get(  
         incoming\_persona\_id,  
         current\_app.persona\_prompts\_content.get(current\_app.DEFAULT\_PERSONA\_ID)  
     )  
     if not system\_prompt\_content:  
         current\_app.logger.error(f"System prompt for persona '{incoming\_persona\_id}' or default not found.")  
         return jsonify({"error": "Internal server error: Persona configuration issue."}), 500

     messages\_for\_openai \= \[{"role": "system", "content": system\_prompt\_content}\]  
     \# ... append conversation\_history\_for\_openai ...

  3. **Store persona\_id (New Conversations):**  
     if not active\_conversation: \# When creating a new conversation  
         active\_conversation \= Conversation(  
             user\_id=db\_user.id,  
             title=latest\_user\_message\_content\[:80\] if latest\_user\_message\_content else "New Conversation",  
             persona\_id=incoming\_persona\_id \# Store the selected persona  
         )  
         \# ...

  4. **Return persona\_id in Response:**  
     response\_payload \= {"response": ai\_response\_content}  
     if active\_conversation:  
         response\_payload\["conversation\_id"\] \= active\_conversation.id  
         response\_payload\["persona\_id"\] \= active\_conversation.persona\_id \# Ensure this is returned

**Step 1.6: Update History API Endpoints (/api/history)**

* **File:** Socratic-Web/backend/app/dialogue/routes.py  
* **Action:** (As previously defined \- ensure persona\_id is included in summaries and specific conversation responses)  
  1. GET /api/history (List): Add persona\_id to each summary object.  
  2. GET /api/history/\<id\> (Messages): Add persona\_id to the main response object.

### **Phase 2: Shared Types Modifications (packages/common-types/)**

**Objective:** Update shared TypeScript interfaces.

**Step 2.1: Update Interfaces**

* **File:** packages/common-types/src/index.ts  
* **Action:** (Implement changes as previously defined in Step 2.1 of the original plan)  
  * Add persona\_id?: string; to DialoguePayload.  
  * Add persona\_id?: string; to DialogueResponse.  
  * Add persona\_id: string; to ConversationSummary.  
  * Add persona\_id: string; to ConversationMessagesResponse.  
  * Optional: Define export type PersonaId \= "socrates" | "nietzsche" | "kant"; and use it.

### **Phase 3: Mobile Frontend (React Native/Expo) Modifications (Socratic-Mobile/)**

**Objective:** Implement persona selection, integrate into chat and history.

**Step 3.1: Define Persona Data (Frontend)**

* **File:** Socratic-Mobile/src/personas.ts (Create this file)  
* **Action:**  
  // Socratic-Mobile/src/personas.ts  
  export interface PersonaUI {  
    id: string; // e.g., "socrates", "nietzsche", "kant"  
    name: string; // e.g., "Socrates", "Friedrich Nietzsche"  
    description: string;  
    image?: any; // For require('./path/to/image.png')  
    promptSuggestions: string\[\];  
    initialGreeting: string; // Customized greeting for this persona  
  }

  export const personas: PersonaUI\[\] \= \[  
    {  
      id: "socrates",  
      name: "Socrates",  
      description: "Engage in rigorous questioning to uncover assumptions and explore fundamental truths.",  
      // image: require('@/src/assets/images/socrates.png'), // Example  
      promptSuggestions: \[  
        "What is justice?",  
        "How can I live a good life?",  
        "Let's discuss the nature of knowledge.",  
      \],  
      initialGreeting: "Greetings. I am Socrates. What shall we ponder today?",  
    },  
    {  
      id: "nietzsche",  
      name: "Friedrich Nietzsche",  
      description: "Challenge conventional morality and explore concepts like the will to power.",  
      promptSuggestions: \[  
        "What is the meaning of suffering?",  
        "Discuss the concept of 'God is dead'.",  
        "Explore the idea of eternal recurrence.",  
      \],  
      initialGreeting: "So, you seek to converse with Nietzsche? Very well. What weighty matter burdens your thoughts?",  
    },  
    {  
      id: "kant",  
      name: "Immanuel Kant",  
      description: "Delve into metaphysics, ethics, and the nature of reason.",  
      promptSuggestions: \[  
        "What are the limits of human understanding?",  
        "Discuss moral dilemmas using the categorical imperative.",  
        "Explore the concept of duty.",  
      \],  
      initialGreeting: "I am Immanuel Kant. Let us reason together. What subject calls for our examination?",  
    },  
  \];

  export const getDefaultPersona \= (): PersonaUI \=\> personas.find(p \=\> p.id \=== "socrates")\!;

**Step 3.2: Create Persona Selection Screen**

* **File:** Socratic-Mobile/app/persona-selection.tsx (New file for Expo Router)  
* **Functionality:**  
  * Import personas from src/personas.ts.  
  * Use FlatList or ScrollView to display persona cards. Each card shows persona.name, persona.description, (optional persona.image), and persona.promptSuggestions (clickable).  
  * **Navigation:**  
    * Selecting a persona card directly: Navigate to app/(tabs)/index.tsx (Chat Screen) passing personaId: persona.id.  
    * Clicking a prompt suggestion: Navigate to app/(tabs)/index.tsx passing personaId: persona.id AND initialUserMessage: suggestionText.  
  * Style appropriately using themed colors.

**Step 3.3: Update Navigation Flow (app/\_layout.tsx and ChatHeader.tsx)**

* **File:** Socratic-Mobile/app/\_layout.tsx  
* **Action:**  
  * Modify the useEffect that handles routing based on auth state.  
  * If the user is authenticated (or guest) and segments\[0\] is not (tabs) or login or persona-selection, the initial navigation might need to go to persona-selection if no active chat is being loaded from history.  
  * **This logic can be complex. A simpler approach for now:** The ChatHeader's "New Chat" button will be the primary entry point to persona selection for a *new* chat. When the app first loads and there's no specific conversation to resume, it could default to the main chat tab (index.tsx) which then immediately presents the persona selection screen if no conversationId is present in params.  
* **File:** Socratic-Mobile/src/components/ChatHeader.tsx  
* **Action:**  
  1. Modify the onClearChat prop function. When "New Chat" is pressed:  
     * Call the parent's function to clear local chat messages and activeConversationId in app/(tabs)/index.tsx.  
     * Navigate to the persona-selection screen.

  // In ChatHeader.tsx  
       // interface ChatHeaderProps {  
       //   onNewChatPress: () \=\> void; // Renamed for clarity  
       //   personaName?: string; // For displaying current persona  
       // }

       // const ChatHeader: React.FC\<ChatHeaderProps\> \= ({ onNewChatPress, personaName }) \=\> {  
       // ...  
       // \<Pressable onPress={onNewChatPress} /\* ... \*/\>  
       //    \<Text\>New Chat\</Text\>  
       // \</Pressable\>  
       // ...  
       // \<Text style={\[styles.title, { color: themeColors.text }\]}\>{personaName || "Socratic Partner"}\</Text\>

  2. Accept and display personaName prop.

**Step 3.4: Modify Chat Screen (app/(tabs)/index.tsx)**

* **File:** Socratic-Mobile/app/(tabs)/index.tsx  
* **Action:**  
  1. **State for Persona:**  
     import { personas, getDefaultPersona, PersonaUI } from '@/src/personas'; // Adjust path  
     // ...  
     const \[currentPersona, setCurrentPersona\] \= useState\<PersonaUI\>(getDefaultPersona());  
     const \[initialUserMessage, setInitialUserMessage\] \= useState\<string | undefined\>(undefined);

  2. **Handle Route Params:** Use useLocalSearchParams to get personaId and initialUserMessage.  
     const params \= useLocalSearchParams\<{ conversationId?: string; conversationTitle?: string; personaId?: string; initialUserMessage?: string }\>();  
     // ...  
     useEffect(() \=\> {  
         const newPersonaId \= params.personaId;  
         const newInitialUserMessage \= params.initialUserMessage;

         if (newPersonaId) {  
             const foundPersona \= personas.find(p \=\> p.id \=== newPersonaId) || getDefaultPersona();  
             setCurrentPersona(foundPersona);  
             // If not loading an existing conversation, set the persona-specific greeting  
             if (\!params.conversationId) {  
                  setMessages(\[{  
                     \_id: \`assistant-greeting-${Date.now()}\`,  
                     text: foundPersona.initialGreeting,  
                     createdAt: new Date(),  
                     user: { \_id: 2, name: foundPersona.name, avatar: foundPersona.image },  
                 }\]);  
             }  
         } else if (\!params.conversationId) { // No personaId and no conversationId \-\> default persona greeting  
             const defaultP \= getDefaultPersona();  
             setCurrentPersona(defaultP);  
             setMessages(\[{  
                 \_id: \`assistant-greeting-${Date.now()}\`,  
                 text: defaultP.initialGreeting,  
                 createdAt: new Date(),  
                 user: { \_id: 2, name: defaultP.name, avatar: defaultP.image },  
             }\]);  
         }

         if (newInitialUserMessage && \!params.conversationId) {  
             // If there's an initialUserMessage and it's a new chat, send it  
             setInitialUserMessage(newInitialUserMessage);  
         } else {  
             setInitialUserMessage(undefined);  
         }

         // Update activeConversationId based on params.conversationId  
         setActiveConversationId(params.conversationId ? parseInt(params.conversationId, 10\) : undefined);

     }, \[params.personaId, params.conversationId, params.initialUserMessage\]);

     // Effect to send initialUserMessage if present (for new chats with prompt suggestion)  
     useEffect(() \=\> {  
         if (initialUserMessage && messages.length \=== 1 && messages\[0\].user.\_id \=== 2 /\* ASSISTANT \*/) {  
             const firstUserMsg: IMessage \= {  
                 \_id: \`user-initial-${Date.now()}\`,  
                 text: initialUserMessage,  
                 createdAt: new Date(),  
                 user: USER,  
             };  
             onSend(\[firstUserMsg\]);  
             setInitialUserMessage(undefined); // Clear after sending  
         }  
     }, \[initialUserMessage, messages, onSend\]);

     // Adjust ASSISTANT user object for GiftedChat based on currentPersona  
     const ASSISTANT\_CHAT\_USER: User \= {  
          \_id: 2, // Consistent ID for assistant  
          name: currentPersona.name,  
          avatar: currentPersona.image, // Optional  
     };

  3. **onSend Logic:**  
     * Pass currentPersona.id as persona\_id to apiClientInstance.postDialogue().  
  4. **Initial Greeting & Prompt Handling:**  
     * The useEffect above now sets the initial greeting based on currentPersona.  
     * If initialUserMessage is passed from PersonaSelectionScreen, it will be sent as the first user message.  
  5. **Pass Persona Name to Header:**  
     // In the return statement, for ChatHeader:  
     // \<ChatHeader onNewChatPress={handleNewChatPress} personaName={currentPersona.name} /\>

  6. **handleNewChatPress (replaces handleClearChat logic for this button):**  
     const handleNewChatPress \= useCallback(() \=\> {  
         setMessages(\[\]); // Clear local messages  
         setActiveConversationId(undefined); // Clear active conversation  
         setCurrentPersona(getDefaultPersona()); // Reset to default persona or wait for selection  
         router.setParams({ conversationId: undefined, conversationTitle: undefined, personaId: undefined, initialUserMessage: undefined });  
         router.push('/persona-selection'); // Navigate to persona selection  
     }, \[router\]);

     Ensure ChatHeader calls this.

**Step 3.5: Modify ChatHeader.tsx (Mobile)**

* **File:** Socratic-Mobile/src/components/ChatHeader.tsx  
* **Action:**  
  1. Update props:  
     interface ChatHeaderProps {  
       onNewChatPress: () \=\> void;  
       personaName?: string;  
     }

  2. Update onPress for the "New Chat" button to call onNewChatPress.  
  3. Display personaName if provided, otherwise a default title.  
     // Inside component:  
     // const { user, signOut } \= useAuth(); // Keep this  
     // ...  
     // \<Text style={\[styles.title, { color: themeColors.text }\]}\>{personaName || "Socratic Partner"}\</Text\>  
     // \<Pressable onPress={onNewChatPress} /\* ... \*/ \>  
     //   \<Text style={\[styles.buttonText, { color: themeColors.tint }\]}\>New Chat\</Text\>  
     // \</Pressable\>

**Step 3.6: Update History Screen (app/(tabs)/history.tsx)**

* **File:** Socratic-Mobile/app/(tabs)/history.tsx  
* **Action:**  
  1. **Import personas data:**  
     import { personas, PersonaUI } from '@/src/personas'; // Adjust path

  2. **Display Persona in renderHistoryItem:**  
     const renderHistoryItem \= ({ item }: { item: ConversationSummary }) \=\> {  
       const personaDetail \= personas.find(p \=\> p.id \=== item.persona\_id);  
       const personaDisplayName \= personaDetail?.name || item.persona\_id;  
       // ...  
       return (  
         \<Pressable /\* ... \*/ onPress={() \=\> handlePressConversation(item.id, item.title, item.persona\_id)}\>  
           {/\* ... \*/}  
           \<Text style={\[styles.itemPersona, { color: themeColors.tabIconDefault, fontStyle: 'italic' }\]}\>  
             Chat with: {personaDisplayName}  
           \</Text\>  
           {/\* ... \*/}  
         \</Pressable\>  
       );  
     };  
     // Add styles.itemPersona: { fontSize: 12, marginTop: 3 }

  3. **Pass personaId on Navigation:**  
     const handlePressConversation \= (conversationId: number, title: string, personaId: string) \=\> {  
       if (isEditMode) return;  
       router.push({  
         pathname: '/(tabs)', // Main chat screen  
         params: { conversationId: conversationId.toString(), conversationTitle: title, personaId: personaId },  
       });  
     };

Step 3.7: Update Root Layout (app/\_layout.tsx) for Initial Persona Selection  
\* File: Socratic-Mobile/app/\_layout.tsx  
\* Action: Modify the routing logic in MainLayout's useEffect.  
\`\`\`typescript  
useEffect(() \=\> {  
if (initializing) return;  
        const inAppTabsGroup \= segments\[0\] \=== '(tabs)';  
        const onLoginScreen \= segments\[0\] \=== 'login';  
        const onPersonaSelectionScreen \= segments\[0\] \=== 'persona-selection';

        const canAccessApp \= user || isGuest;

        if (canAccessApp) {  
            if (\!inAppTabsGroup && \!onPersonaSelectionScreen) {  
                // If authenticated/guest but not in tabs or persona selection,  
                // navigate to persona selection to start a new chat.  
                console.log('\[ROUTER\] User/Guest authenticated, navigating to persona-selection');  
                router.replace('/persona-selection');  
            }  
        } else if (\!onLoginScreen) {  
            // Not authenticated/guest and not on login, go to login.  
            console.log('\[ROUTER\] User not authenticated/guest, redirecting to /login');  
            router.replace('/login');  
        }  
    }, \[user, isGuest, initializing, segments, router\]);

    // Add persona-selection to Stack.Screen  
    // \<Stack.Screen name="persona-selection" /\>  
    \`\`\`

### **Phase 4: Testing & Documentation (Focus on Mobile)**

**Objective:** Ensure the feature works correctly on mobile and is documented.

**Step 4.1: Backend Testing** (Same as original plan \- ensure persona logic is sound)

**Step 4.2: Mobile Frontend Testing**

* Write unit tests for the new PersonaSelectionScreen (mobile).  
* Update tests for app/(tabs)/index.tsx, ChatHeader.tsx, and app/(tabs)/history.tsx to account for persona display and logic.  
* Perform manual end-to-end testing on mobile:  
  * Verify navigation to PersonaSelectionScreen on "New Chat" and initially after login if no active chat.  
  * Select different personas and start new chats.  
  * Verify customized initial greetings.  
  * Verify correct system prompt is used (observe AI responses).  
  * Verify the persona name is displayed correctly in ChatHeader.  
  * Verify conversations are saved with the correct persona\_id.  
  * Verify history items display the persona and load the correct context (persona, messages) when opened.  
  * Test selecting a prompt suggestion from PersonaSelectionScreen.

**Step 4.3: Documentation**

* Update mobile-specific developer documentation.  
* Update user-facing info in app/(tabs)/info.tsx if applicable.

**Self-Correction/Refinements during planning:**

* Clarified the DEFAULT\_PERSONA\_ID usage in app/\_\_init\_\_.py to ensure the old app.system\_prompt has a sensible default if any old code relies on it.  
* Made persona\_id non-nullable in the Conversation model with a default of 'socrates' to handle existing records cleanly during migration.  
* Detailed the logic in app/(tabs)/index.tsx for handling personaId and initialUserMessage from route params, and for setting the persona-specific initial greeting.  
* Adjusted the navigation flow in app/\_layout.tsx to direct users to persona selection after login if no specific chat is being resumed.  
* Renamed onClearChat in ChatHeader.tsx (mobile) to onNewChatPress for better clarity regarding its new function.  
* Added initialGreeting to the PersonaUI interface in Socratic-Mobile/src/personas.ts.

This revised plan focuses squarely on the mobile implementation while ensuring the backend and shared packages support the new feature correctly.