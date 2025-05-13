// Socratic-Mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// --- Monorepo Configuration ---

// 1. Get the workspace root
const workspaceRoot = path.resolve(__dirname, '../..'); // Points to Socratic-Project

// 2. Add the workspace root to Metro's watch folders
defaultConfig.watchFolders = [
    ...(defaultConfig.watchFolders || []), // Include existing watch folders if any
    workspaceRoot,
    path.resolve(__dirname, '../../packages'), // Watch the shared packages directory
];

// 3. Define a list of paths to additional node_modules directories
// This helps Metro find dependencies from hoisted packages in the root
// and also from your shared workspace packages.
defaultConfig.resolver.nodeModulesPaths = [
    path.resolve(workspaceRoot, 'node_modules'), // Root node_modules
    path.resolve(__dirname, 'node_modules'), // Mobile app's own node_modules
    path.resolve(__dirname, '../../packages'), // To resolve workspace packages
];

// 4. Optionally, ensure symlinks are followed (pnpm uses symlinks heavily)
defaultConfig.resolver.blockList = defaultConfig.resolver.blockList || [];
defaultConfig.resolver.blockList.push(
    // Example: if you have issues with specific symlinked directories being blocked
    // /.*\/__tests__\/.*/,
);
// defaultConfig.resolver.unstable_enableSymlinks = true; // For newer Metro versions, this might be an option

// --- End Monorepo Configuration ---

module.exports = defaultConfig;
