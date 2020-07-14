/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import smdOutputProvider from "./smdOutputProvider";

let jsCentralProvider = new JSHoverProvider();




export function activate(context: vscode.ExtensionContext) {


  var outProv = new smdOutputProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.speechmarkdownpreview', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined) {
         
          let selection : string = editor.document.getText(editor.selection);
          try
          {
            outProv.displaySSMLText(selection);
          }
          catch(ex)
          {

            console.log(ex);
          }
      }
    })
  );


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
