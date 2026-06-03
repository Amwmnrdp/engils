const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Monorepo: mobile app is at artifacts/mobile, workspace root is 2 levels up.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo so Metro can see workspace packages
//    (e.g. lib/api-client-react) that live outside the project root.
config.watchFolders = [workspaceRoot];

// 2. Add both node_modules to the resolver path so symlinked workspace
//    packages resolve correctly in pnpm workspaces.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Ensure Metro can transform TypeScript files exported directly from
//    workspace packages (e.g. lib/api-client-react exports ./src/index.ts).
const existingSourceExts = config.resolver.sourceExts ?? [];
if (!existingSourceExts.includes("ts")) {
  config.resolver.sourceExts = [
    ...existingSourceExts,
    "ts",
    "tsx",
    "mts",
    "cts",
  ];
}

module.exports = config;
