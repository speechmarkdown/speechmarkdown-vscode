import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";

let jsCentralProvider = new JSHoverProvider();

export async function activate(context: vscode.ExtensionContext) {

  // Migrate any existing plaintext secret from settings to SecretStorage
  const config = vscode.workspace.getConfiguration();
  const legacySecret = config.get<string>('speechmarkdown.aws.secretAccessKey');
  if (legacySecret) {
    await context.secrets.store('speechmarkdown.aws.secretAccessKey', legacySecret);
    await config.update('speechmarkdown.aws.secretAccessKey', undefined, vscode.ConfigurationTarget.Global);
  }

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
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.STANDARD, context.secrets);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpollyneural', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.NEURAL, context.secrets);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdown.setAwsSecretKey', async () => {
        const secretKey = await vscode.window.showInputBox({
          prompt: 'Enter AWS Secret Access Key',
          password: true,
          ignoreFocusOut: true
        });
        if (secretKey) {
          await context.secrets.store('speechmarkdown.aws.secretAccessKey', secretKey);
          vscode.window.showInformationMessage('AWS Secret Access Key saved securely.');
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdown.clearAwsSecretKey', async () => {
        await context.secrets.delete('speechmarkdown.aws.secretAccessKey');
        vscode.window.showInformationMessage('AWS Secret Access Key cleared.');
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