import? '../../node_modules/@sergei-dyshel/eslint-config/export.just'
import? './node_modules/@sergei-dyshel/eslint-config/export.just'

import? '../../node_modules/@sergei-dyshel/prettier-config/export.just'
import? './node_modules/@sergei-dyshel/prettier-config/export.just'

import? '../../node_modules/@sergei-dyshel/typescript/export.just'
import? './node_modules/@sergei-dyshel/typescript/export.just'

import? '../../node_modules/@sergei-dyshel/vscode/export.just'
import? './node_modules/@sergei-dyshel/vscode/export.just'

_default:
    just --list

build:
    qcfg-build build --vscode-ext src/extension.ts

release: lint-fix format-write compile dpdm build test
