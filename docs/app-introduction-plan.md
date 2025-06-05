**Project: Cogito App - New User Introduction Flow**

**Goal:** Implement a swipeable multi-slide introduction for new users, covering welcome, app purpose, personalization, account creation, and a final get-started prompt.

**General Notes:**
*   **Theme:** Maintain a personal and friendly feel throughout all slides.
*   **Font:** Use `Lora-SemiBold` for user-engaging text. ✅ **ALREADY CONFIGURED** in `_layout.tsx`
*   **Logo:** The `owl-logo-prod.png` image ✅ **ALREADY EXISTS** in `apps/mobile/src/shared/assets/images/`
*   **State Management:** Use `AsyncStorage` to track if the user has completed the introduction, so it's only shown once.
*   **Navigation:** This flow will be presented before the main app navigator, integrated into the existing routing logic in `_layout.tsx`.

---

**Implementation Plan:**

**Phase 1: Setup and Core Structure**

1.  **Create New Feature Module:** ✅ **READY**
    *   Create a new directory for the onboarding feature: `apps/mobile/src/features/onboarding/`.
    *   Within this, create a `slides` subdirectory: `apps/mobile/src/features/onboarding/slides/`.

2.  **Install AsyncStorage for State Persistence:** ⚠️ **REQUIRED**
    *   Install `@react-native-async-storage/async-storage` in the mobile app
    *   Command: `cd apps/mobile && pnpm add @react-native-async-storage/async-storage`

3.  **Swipeable Library:** ✅ **ALREADY AVAILABLE**
    *   `react-native-swiper` is already installed and used in `persona-selection.tsx`
    *   We'll reuse this library for consistency

4.  **Create Main Introduction Screen Component:**
    *   **File:** `apps/mobile/src/features/onboarding/IntroductionScreen.tsx`
    *   **Purpose:** This component will host the swipeable view and manage the sequence of slides.
    *   **Logic:**
        *   Import and use `react-native-swiper` (already available).
        *   Manage the current slide index.
        *   Handle navigation to the next slide or completion of the intro.
        *   Use AsyncStorage to mark completion

5.  **Integrate Introduction into App Navigation:**
    *   Modify the routing logic in `apps/mobile/src/app/_layout.tsx` in the `MainLayout` component
    *   Add new route for onboarding screen in the Stack.Screen configuration
    *   Update the useEffect routing logic to check for `hasCompletedIntroduction` flag
    *   Route flow: `login` → `onboarding` (if first time) → `persona-selection` → `(tabs)`

**Phase 2: Individual Slide Implementation**

For each slide, create a new React Native component. All text aimed at user engagement should use the `Lora-SemiBold` font (already configured).

6.  **Slide 1: Welcome Slide**
    *   **File:** `apps/mobile/src/features/onboarding/slides/WelcomeSlide.tsx`
    *   **Content:**
        *   Title: "Welcome explorer" (using `Lora-SemiBold`).
        *   Friendly welcome note.
        *   Image: `owl-logo-prod.png` (already available).
    *   **Styling:** Use existing `ThemedView`, `ThemedText` components

7.  **Slide 2: App Purpose Slide**
    *   **File:** `apps/mobile/src/features/onboarding/slides/PurposeSlide.tsx`
    *   **Content:**
        *   Text explaining the app's purpose, directed at the user (e.g., "Cogito allows you to discover philosophical insights tailored to your interests...").
        *   Use `Lora-SemiBold` for engaging phrases.
    *   **Styling:** Use existing themed components

8.  **Slide 3: Personalization - Topic Selection Slide**
    *   **File:** `apps/mobile/src/features/onboarding/slides/PersonalizationSlide.tsx`
    *   **Content:**
        *   Prompt: "Help us personalize your journey. Select topics you're curious about:" (using `Lora-SemiBold`).
        *   List of philosophy topics (e.g., "Stoicism", "Existentialism", "Ethics", "Epistemology"). These should be tappable.
        *   Allow multiple selections.
        *   "Skip" button: Always visible, allowing the user to proceed without selection.
    *   **Logic:**
        *   Manage selected topics in local state.
        *   Store selected topics in AsyncStorage for future personalization features.
    *   **Styling:** Use `ThemedButton` and `ThemedCard` components

9.  **Slide 4: Account Creation/Login Slide** ✅ **AUTH INTEGRATION READY**
    *   **File:** `apps/mobile/src/features/onboarding/slides/AccountSlide.tsx`
    *   **Content:**
        *   Title: "Let's create an account" (using `Lora-SemiBold`).
        *   Basic signup form (reuse pattern from `LoginScreen.tsx`).
        *   "Create Account" button.
        *   "Skip for now" option/button.
        *   "Already have an account? Log in" link/button.
    *   **Logic:**
        *   ✅ **LEVERAGE EXISTING AUTH CONTEXT:**
            *   `registerWithEmail(name, email, password)` from `AuthContext`
            *   `signInWithEmail(email, password)` from `AuthContext`
            *   `continueAsGuest()` from `AuthContext`
        *   Handle form input and validation (pattern from `LoginScreen.tsx`).
        *   On successful auth, proceed to next slide.
        *   On "Skip", proceed to the next slide.
    *   **Styling:** Reuse input styling from `LoginScreen.tsx`

10. **Slide 5: Get Started Slide**
    *   **File:** `apps/mobile/src/features/onboarding/slides/GetStartedSlide.tsx`
    *   **Content:**
        *   Encouraging message: "You're all set! Dive in and start exploring." (using `Lora-SemiBold`).
        *   "Get Started" button.
    *   **Logic:**
        *   On "Get Started", mark the introduction as complete (set flag in `AsyncStorage`) and navigate to `persona-selection`.
    *   **Styling:** Use `ThemedButton` for the final CTA

**Phase 3: Styling and Assets** ✅ **MOSTLY READY**

11. **Font Setup:** ✅ **ALREADY CONFIGURED**
    *   `Lora-SemiBold` font is already loaded in `_layout.tsx`
    *   Use the existing font family string: `'Lora-SemiBold'`

12. **Image Setup:** ✅ **ALREADY AVAILABLE**
    *   `owl-logo-prod.png` already exists in the correct location
    *   Can be imported with: `require('@shared/assets/images/owl-logo-prod.png')`

13. **UI Components:** ✅ **READY TO USE**
    *   Leverage existing components: `ThemedView`, `ThemedText`, `ThemedCard`, `ThemedButton`
    *   Use existing color scheme from `Colors` constant
    *   Follow spacing patterns from existing screens

**Phase 4: Future - Personalization Database (Note for next steps)**

14. **Personalization Data Handling:**
    *   The topics selected on Slide 3 will be stored in AsyncStorage initially
    *   When user creates account, sync preferences to backend
    *   Use these preferences to tailor content within the app
    *   This step will be detailed and implemented after the UI for the introduction flow is complete.

---

**Key Integration Points:**

**Navigation Flow Update:**
```
Current: login → persona-selection → (tabs)
New:     login → onboarding (first time) → persona-selection → (tabs)
         login → persona-selection (returning) → (tabs)
```

**Required Dependencies:**
- ✅ `react-native-swiper` (already installed)
- ✅ `Lora-SemiBold` font (already loaded)
- ✅ `owl-logo-prod.png` (already exists)
- ⚠️ `@react-native-async-storage/async-storage` (needs installation)

**Existing Components to Leverage:**
- ✅ `ThemedView`, `ThemedText`, `ThemedCard`, `ThemedButton`
- ✅ `AuthContext` functions for signup/login
- ✅ Input styling patterns from `LoginScreen.tsx`
- ✅ Swiper implementation pattern from `persona-selection.tsx`

---

**Summary of New Files/Directories:**
*   `apps/mobile/src/features/onboarding/` (directory)
*   `apps/mobile/src/features/onboarding/slides/` (directory)
*   `apps/mobile/src/features/onboarding/IntroductionScreen.tsx`
*   `apps/mobile/src/features/onboarding/slides/WelcomeSlide.tsx`
*   `apps/mobile/src/features/onboarding/slides/PurposeSlide.tsx`
*   `apps/mobile/src/features/onboarding/slides/PersonalizationSlide.tsx`
*   `apps/mobile/src/features/onboarding/slides/AccountSlide.tsx`
*   `apps/mobile/src/features/onboarding/slides/GetStartedSlide.tsx`

**Files to Modify:**
*   `apps/mobile/src/app/_layout.tsx` (routing logic)
*   `apps/mobile/package.json` (add AsyncStorage dependency) 