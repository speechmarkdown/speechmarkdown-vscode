import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";

let jsCentralProvider = new JSHoverProvider();

export function activate(context: vscode.ExtensionContext) {

  try
  {
    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownpreview', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            try
            {
              SMLTextWriter.displaySSMLText(selection);
            }
            catch(ex)
            {
              console.log(ex);
            }
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpolly', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.STANDARD);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpollyneural', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.NEURAL);
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

  } catch(ex)
  {
     console.error(ex);
  }
}