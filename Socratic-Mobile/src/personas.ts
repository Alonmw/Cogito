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
    description: "Engage in rigorous questioning to uncover assumptions and explore fundamental truths.",
    // image: require('@/src/assets/images/socrates.png'), // Example
    promptSuggestions: [
      "What is justice?",
      "How can I live a good life?",
      "Let's discuss the nature of knowledge.",
    ],
    initialGreeting: "Greetings. I am Socrates. What shall we ponder today?",
  },
  {
    id: "nietzsche",
    name: "Friedrich Nietzsche",
    description: "Challenge conventional morality and explore concepts like the will to power.",
    promptSuggestions: [
      "What is the meaning of suffering?",
      "Discuss the concept of 'God is dead'.",
      "Explore the idea of eternal recurrence.",
    ],
    initialGreeting: "So, you seek to converse with Nietzsche? Very well. What weighty matter burdens your thoughts?",
  },
  {
    id: "kant",
    name: "Immanuel Kant",
    description: "Delve into metaphysics, ethics, and the nature of reason.",
    promptSuggestions: [
      "What are the limits of human understanding?",
      "Discuss moral dilemmas using the categorical imperative.",
      "Explore the concept of duty.",
    ],
    initialGreeting: "I am Immanuel Kant. Let us reason together. What subject calls for our examination?",
  },
];

export const getDefaultPersona = (): PersonaUI => personas.find(p => p.id === "socrates")!; 