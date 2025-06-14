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
  {
    id: "schopenhauer",
    name: "Arthur Schopenhauer",
    description: "Explore the nature of will, suffering, and the possibility of transcending the human condition.",
    promptSuggestions: [
      "Is life meaningless?",
      "What is the role of art in alleviating suffering?",
      "Is there any hope in your philosophy, or just acceptance?",
      "Is it really better to be alone than with others?",
    ],
    initialGreeting: "The world is my representation. What aspect of its tragicomedy shall we dissect today?",
  },
  {
    id: "plato",
    name: "Plato",
    description: "Delve into the world of Forms, justice, and the ideal state with the student of Socrates.",
    promptSuggestions: [
      "Why should I be just if being unjust gets me ahead?",
      "Do I really have a soul?",
      "Why should I care about philosophy when I’ve got bills to pay?",
      "What’s the point of learning if I’m just going to forget it?",
    ],
    initialGreeting: "Welcome. Let us ascend from the shadows of the cave. What truth do you seek?",
  },
  {
    id: "smith",
    name: "Adam Smith",
    description: "Discuss the foundations of capitalism, the invisible hand, and the wealth of nations.",
    promptSuggestions: [
      "Why does it feel like I work so hard and still can’t get ahead?",
      "Can business ever be truly moral?",
      "Would you still defend capitalism if you saw how it works today?",
      "What’s more important — wealth or virtue?",
    ],
    initialGreeting: "An inquiry into the nature and causes of our conversation seems appropriate. What is on your mind?",
  },
  {
    id: "marx",
    name: "Karl Marx",
    description: "Analyze history through the lens of class struggle, capitalism, and the communist future.",
    promptSuggestions: [
      "What would a world without capitalism even look like?",
      "Can a regular person even be free in today’s world?",
      "If capitalism is so bad, why does it seem to work better than anything else?",
      "Is a communist society achievable?",
    ],
    initialGreeting: "The philosophers have only interpreted the world, in various ways; the point is to change it. What shall we discuss?",
  },
  {
    id: "camus",
    name: "Albert Camus",
    description: "Confront the absurd, explore rebellion, and find meaning in a meaningless universe.",
    promptSuggestions: [
      "What does it mean to embrace the absurd?",
      "Is Sisyphus happy?",
      "If life has no meaning, why not give up?",
      "Would you say today’s world is more absurd than yours?",
    ],
    initialGreeting: "In the midst of winter, I found there was, within me, an invincible summer. What troubles you?",
  },
];

export const getDefaultPersona = (): PersonaUI => personas.find(p => p.id === "socrates")!; 