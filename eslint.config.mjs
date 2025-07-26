// @ts-check

import myconfig from "@sergei-dyshel/eslint-config";
import tseslint from "typescript-eslint";

export default tseslint.config(...myconfig, {
  ignores: ["vscode.proposed.*.d.ts", "prettier.config.js"],
});
