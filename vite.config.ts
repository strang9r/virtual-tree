import { defineConfig, PluginOption, UserConfig } from "vite"; // loadEnv
import react from "@vitejs/plugin-react-swc";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";
import dts from "vite-plugin-dts";
import packageJson from "./package.json";

function reactVirtualized(): PluginOption {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

  return {
    name: "my:react-virtualized",
    async configResolved() {
      const reactVirtualizedPath = path.dirname(
        fileURLToPath(import.meta.resolve("react-virtualized"))
      );

      const brokenFilePath = path.join(
        reactVirtualizedPath,
        "..", // back to dist
        "es",
        "WindowScroller",
        "utils",
        "onScroll.js"
      );
      const brokenCode = await readFile(brokenFilePath, "utf-8");

      const fixedCode = brokenCode.replace(WRONG_CODE, "");
      await writeFile(brokenFilePath, fixedCode);
    },
  };
}
// https://vitejs.dev/config/
export default defineConfig((env) => {
  // loadEnv(env.mode, process.cwd(), '')
  const isLibMode = env.mode === "lib";

  const libPlugins = isLibMode
    ? [dts({ tsconfigPath: "./tsconfig.lib.json", rollupTypes: true })]
    : [];

  const buildOptions: UserConfig["build"] = isLibMode
    ? {
        lib: {
          entry: resolve(__dirname, "src/components/index.ts"),
          fileName: "virtual-tree",
          formats: ["es", "cjs"],
        },
        rollupOptions: {
          external: [...Object.keys(packageJson.peerDependencies)],
        },
      }
    : undefined;

  return {
    plugins: [react(), reactVirtualized(), ...libPlugins],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    build: buildOptions,
  };
});
