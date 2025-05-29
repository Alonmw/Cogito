// Socratic-Mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the project root (Socratic-Mobile directory)
const projectRoot = __dirname;
// Get the workspace root (Socratic-Project directory)
const workspaceRoot = path.resolve(projectRoot, '../..');

// Get the default Expo Metro configuration
const config = getDefaultConfig(projectRoot);

// --- Monorepo Configuration ---

// 1. Add the workspace root to Metro's watch folders
// This allows Metro to see changes in your shared packages and other workspace projects.
config.watchFolders = [
    ...(config.watchFolders || []), // Include existing watch folders if any
    workspaceRoot,
    // path.resolve(projectRoot, '../../packages'), // Watching workspaceRoot implicitly includes packages
];

// 2. Define a list of paths to additional node_modules directories
// This helps Metro find dependencies from hoisted packages in the root
// and also from your shared workspace packages.
config.resolver.nodeModulesPaths = [
    path.resolve(workspaceRoot, 'node_modules'), // Root node_modules (for pnpm)
    path.resolve(projectRoot, 'node_modules'),   // Mobile app's own node_modules
    // path.resolve(projectRoot, '../../packages'), // Not strictly needed if root node_modules is correctly resolving workspace links
];

// 3. Add alias resolver configuration for @ path mapping
config.resolver.alias = {
    '@': projectRoot,
};

// 4. blockList modification removed
// The default blockList from expo/metro-config should be sufficient.
// If you later need to add custom block patterns, do it carefully:
// let currentBlockList = config.resolver.blockList;
// if (!Array.isArray(currentBlockList)) {
//   currentBlockList = currentBlockList ? [currentBlockList] : [];
// }
// config.resolver.blockList = [...currentBlockList, /your_new_pattern_here/];

// 5. Ensure symlinks are handled (often default in newer Metro, but can be explicit)
// config.resolver.unstable_enableSymlinks = true; // For newer Metro versions, if issues persist with symlinks

// --- End Monorepo Configuration ---

module.exports = config;
