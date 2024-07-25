import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import { builtinModules } from "module";
import fs from "fs";
import cleanup from 'rollup-plugin-cleanup';

const { dependencies } = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url)));

export default {
    input: "src/index.js",
    output: [
        { file: "dist/index.js", format: "esm" },
        { file: "dist/index.cjs", format: "cjs", exports: "default" },
    ],
    plugins: [
        resolve(),
        commonjs(),
        json(),
        esbuild({ target: "node16" }),
        cleanup({
            comments: 'none'
          })
    ],
    external: builtinModules.concat(["discord.js", ...Object.keys(dependencies)])
};