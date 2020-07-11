/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";

let jsCentralProvider = new JSHoverProvider();

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("typescript", jsCentralProvider)
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider("javascript", jsCentralProvider)
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider("json", jsCentralProvider)
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider("yaml", jsCentralProvider)
  );
 
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("json", jsCentralProvider)
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "typescript",
      jsCentralProvider
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "javascript",
      jsCentralProvider
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "yaml",
      jsCentralProvider
    )
  );
 /*
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider("json", jsCentralProvider)
  );
  */
  // TODO: Add a YAML parser for hover over support.
}
