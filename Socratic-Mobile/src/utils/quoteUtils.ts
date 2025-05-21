// src/utils/quoteUtils.ts
// Utility functions for handling philosophical quotes

// Array of philosophical quotes from quotes.txt
const quotes = [
  '"The only true wisdom is in knowing you know nothing." - Socrates',
  '"Wonder is the beginning of wisdom." - Socrates',
  '"I cannot teach anybody anything. I can only make them think." - Socrates',
  '"It is the mark of an educated mind to be able to entertain a thought without accepting it." - Aristotle',
  '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle',
  '"All human knowledge begins with intuitions, proceeds from thence to concepts, and ends with ideas." - Immanuel Kant',
  '"If you would be a real seeker after truth, it is necessary that at least once in your life you doubt, as far as possible, all things." - René Descartes',
  '"The greatest way to live with honor in this world is to be what we pretend to be." - Socrates',
  '"Opinion is the medium between knowledge and ignorance." - Plato',
  '"No man ever steps in the same river twice, for it\'s not the same river and he\'s not the same man." - Heraclitus',
  '"He who has a why to live can bear almost any how." - Friedrich Nietzsche',
  '"Thoughts without content are empty, intuitions without concepts are blind." - Immanuel Kant',
  '"Dare to know!" - Immanuel Kant'
];

/**
 * Get a random philosophical quote
 * @returns {string} A random quote from the collection
 */
export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
} 