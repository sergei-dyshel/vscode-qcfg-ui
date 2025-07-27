// all modules that define commands
import "./workspace-history";

import { PACKAGE_JSON_PATH } from "@sergei-dyshel/node";
import { Commands, ExtensionPackageJson } from "@sergei-dyshel/vscode";

const packageJson = new ExtensionPackageJson(PACKAGE_JSON_PATH);

packageJson.modify({ contributes: Commands.generatePackageJson() });

if (!packageJson.isUpToDate()) {
  console.log(`Updating ${PACKAGE_JSON_PATH}`);
  packageJson.write();
}
