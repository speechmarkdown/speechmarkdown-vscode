import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";
import { PollyTTSClient } from 'js-tts-wrapper/engines/polly';
import { ElevenLabsTTSClient } from 'js-tts-wrapper/engines/elevenlabs';
import { OpenAITTSClient } from 'js-tts-wrapper/engines/openai';
import { AzureTTSClient } from 'js-tts-wrapper/engines/azure';

import { SpeechMarkdown } from 'speechmarkdown-js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

let jsCentralProvider = new JSHoverProvider();

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand('speechmarkdown.speakSelectedText', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
  
      const text = editor.document.getText(editor.selection);
      if (!text) {
        vscode.window.showErrorMessage("No text selected.");
        return;
      }
  
      await speakWithTTS(text);
    })
  );

  async function speakWithTTS(text: string) {
    const config = vscode.workspace.getConfiguration('speechmarkdown');
    const provider = config.get<string>('ttsProvider') || 'Amazon Polly';
  
    let client: any;
  
    if (provider === 'Amazon Polly') {
      const accessKeyId = config.get<string>('aws.accessKeyId');
      const secretAccessKey = config.get<string>('aws.secretAccessKey');
      const region = config.get<string>('aws.region') || 'us-east-1';
  
      if (!accessKeyId || !secretAccessKey) {
        vscode.window.showErrorMessage('Missing AWS credentials in settings.');
        return;
      }
  
      client = new PollyTTSClient({
        accessKeyId,
        secretAccessKey,
        region
      });
    } else if (provider === 'ElevenLabs') {
      const apiKey = config.get<string>('elevenLabs.apiKey');
      const elevenVoiceId = config.get<string>('elevenLabs.voiceId');
      if (!apiKey) {
        vscode.window.showErrorMessage('Missing ElevenLabs API key in settings.');
        return;
      }
  
      client = new ElevenLabsTTSClient({
        apiKey
      });
      if (elevenVoiceId) {
        client.setVoice(elevenVoiceId);
        console.log("🔈 ElevenLabs voice set to:", elevenVoiceId);
      }
    } else if (provider === 'OpenAI') {
      const apiKey = config.get<string>('openai.apiKey');
      const voice = config.get<string>('openai.voice') || 'alloy';
      const model = config.get<string>('openai.model') || 'gpt-4o-mini-tts';
    
      if (!apiKey) {
        vscode.window.showErrorMessage('Missing OpenAI API key in settings.');
        return;
      }
    
      client = new OpenAITTSClient({ apiKey });
      client.setVoice(voice);
      client.setModel(model);
    }
    else if (provider === 'Azure') {
      const subscriptionKey = config.get<string>('azure.subscriptionKey');
      const region = config.get<string>('azure.region') || 'eastus';
      const voice = config.get<string>('azure.voice') || 'en-US-AriaNeural';

      if (!subscriptionKey){
        vscode.window.showErrorMessage('Missing Microsoft Azure API key in settings.');
        return;
      }
      client = new AzureTTSClient({
        subscriptionKey,
        region
      });
      client.setVoice(voice);

    } else {

      vscode.window.showErrorMessage('Invalid TTS provider.');
      return;
    }
  
    const sm = new SpeechMarkdown();
    const ssml = sm.toSSML(text, { platform: 'amazon-polly' });
  
    try {
      const audioBytes = await client.synthToBytes(ssml, { format: 'mp3' });
      const tempPath = path.join(os.tmpdir(), `speechmarkdown-${Date.now()}.mp3`);
      fs.writeFileSync(tempPath, Buffer.from(audioBytes));
  
      vscode.env.openExternal(vscode.Uri.file(tempPath));
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS Error: ${err.message}`);
      console.error(err);
    }
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