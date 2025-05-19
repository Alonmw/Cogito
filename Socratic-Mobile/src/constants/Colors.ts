/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorPurple = '#6366f1'; // Standard purple for primary actions
const tintColorDarkPurple = '#6366f1'; // Use same for dark mode for now

export const Colors = {
  light: {
    text: '#36454F', // Charcoal
    background: '#FAF3E0', // Parchment
    tint: tintColorPurple, // Purple for all primary actions
    icon: '#5B4636', // Sepia (for subtle icons)
    tabIconDefault: '#B8A98F', // Muted brown/grey
    tabIconSelected: tintColorPurple, // Purple
  },
  dark: {
    text: '#E2E2E6', // Light text
    background: '#1A1C1E', // Deep dark
    tint: tintColorDarkPurple, // Purple for all primary actions
    icon: '#B8A98F', // Muted brown/grey for dark
    tabIconDefault: '#6C6F7A', // Muted grey
    tabIconSelected: tintColorDarkPurple, // Purple
  },
};
