import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

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
export default defineConfig({
  plugins: [react(), reactVirtualized()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/components/index.ts"),
      name: "VirtualTree",
      // the proper extensions will be added
      fileName: "virtual-tree",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "React",
        },
      },
    },
  },
});
