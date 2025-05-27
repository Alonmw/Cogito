// Persona definitions for mobile persona selection
export interface PersonaUI {
  id: string; // e.g., "socrates", "nietzsche", "kant"
  name: string;
  description: string;
  image?: any; // For require('./path/to/image.png')
  promptSuggestions: string[];
  initialGreeting: string;
}

export const personas: PersonaUI[] = [
  {
    id: "socrates",
    name: "Socrates",
    description: "Engage in Socratic dialogue to exercise your critical thinking and explore your own thoughts and beliefs.",
    // image: require('@/src/assets/images/socrates.png'), // Example
    promptSuggestions: [
      "How can I live a happy life?",
      "Why were you executed?",
      "I believe that there is no such thing as free will",
      "How can I tell if someone is smart?",
      
    ],
    initialGreeting: "Greetings. What shall we ponder today?",
  },
  {
    id: "nietzsche",
    name: "Friedrich Nietzsche",
    description: "Challenge conventional morality and explore power, freedom and duty.",
    promptSuggestions: [
      "How do I know if my desires are truly my own or just inherited from others?",
      "Why choose courage over comfort?",
      "What replaces god in our age?",
      "Explain your view on good and evil.",
    ],
    initialGreeting: "So, you seek to converse with Nietzsche? Very well. What weighty matter burdens your thoughts?",
  },
  {
    id: "kant",
    name: "Immanuel Kant",
    description: "Uncover the foundations of an objective morality and challenge your reason.",
    promptSuggestions: [
      "Is it ever right to lie for a good reason?",
      "Can the world achieve universal morality?",
      "What is the categorical imperative?",
      "Does can i use reason to guide my actions?",
    ],
    initialGreeting: "I am Immanuel Kant. Let us reason together. What subject calls for our examination?",
  },
];

export const getDefaultPersona = (): PersonaUI => personas.find(p => p.id === "socrates")!; 