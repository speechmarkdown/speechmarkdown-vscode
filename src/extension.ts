import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";
import {
  createTTSClient
} from "js-tts-wrapper";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import sound from "sound-play";

export function activate(context: vscode.ExtensionContext) {
  const jsCentralProvider = new JSHoverProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.speakText", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection) || editor.document.getText();
      if (!text) {
        vscode.window.showErrorMessage("Document is empty.");
        return;
      }
      await speakWithTTS(text);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownpreview", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const sel = editor.document.getText(editor.selection);
      try {
        SMLTextWriter.displaySSMLText(sel);
      } catch (ex) {
        console.error(ex);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownspeakpolly", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const text = editor.document.getText(editor.selection) || editor.document.getText();
      SSMLAudioPlayer.getSSMLSpeechAsync(text, Engine.STANDARD);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownspeakpollyneural", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { return; }
      const text = editor.document.getText(editor.selection) || editor.document.getText();
      SSMLAudioPlayer.getSSMLSpeechAsync(text, Engine.NEURAL);
    })
  );


  ["typescript", "javascript", "json", "yaml"].forEach(lang => {
    context.subscriptions.push(vscode.languages.registerHoverProvider(lang, jsCentralProvider));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(lang, jsCentralProvider));
  });

  const speakBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  speakBtn.text = '$(unmute) Speak Text';
  speakBtn.command = "speechmarkdown.speakText";
  speakBtn.tooltip = "Speak selected text or entire document (Ctrl+Shift+S)";
  speakBtn.show();
  context.subscriptions.push(speakBtn);

  const providerBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  providerBtn.command = "speechmarkdown.selectTTSProvider";
  providerBtn.tooltip = "Select TTS Provider";
  function updateProviderButton() {
    const provider = vscode.workspace.getConfiguration("speechmarkdown").get<string>("ttsProvider") || "Amazon Polly";
    providerBtn.text = `$(gear) ${provider}`;
  }
  updateProviderButton();
  providerBtn.show();
  context.subscriptions.push(providerBtn);

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.selectTTSProvider", async () => {
      const config = vscode.workspace.getConfiguration("speechmarkdown");
      const current = config.get<string>("ttsProvider") || "Amazon Polly";
      const providers = ["Amazon Polly", "ElevenLabs", "OpenAI", "Azure", "SherpaOnnx"];
      const selection = await vscode.window.showQuickPick(providers, { placeHolder: "Select TTS Provider" });
      if (selection && selection !== current) {
      await config.update("ttsProvider", selection, vscode.ConfigurationTarget.Workspace);
        updateProviderButton();
        vscode.window.showInformationMessage(`TTS provider set to ${selection}`);
      }
    })
  );


  function getTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }

  async function speakWithTTS(text: string) {
    const config = vscode.workspace.getConfiguration("speechmarkdown");
    const provider = config.get<string>("ttsProvider") || "Amazon Polly";
    const client = await getTTSClient(provider, config);
    if (!client) return;

    const { SpeechMarkdown } = await import("speechmarkdown-js");
    const platform = { "Amazon Polly": "amazon-polly", "Azure": "microsoft", "Google": "google" }[provider] || "generic";
    const ssml = new SpeechMarkdown().toSSML(text, { platform });
    const input = client.supportsSSML?.() === false ? text : ssml;

    try {
      const audio = await client.synthToBytes(input, { format: "mp3" });

      const editor = vscode.window.activeTextEditor;
      const baseName = editor && editor.document.uri.fsPath
        ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
        : "untitled";

      const fileName = `${provider.replace(/\s+/g, "")}_${baseName}_${getTimestamp()}.mp3`;
      const outDir = config.get<string>("outputDir")?.trim()
        || path.join(os.homedir(), "tts-output");
      fs.mkdirSync(outDir, { recursive: true });

      const fullPath = path.join(outDir, fileName);
      fs.writeFileSync(fullPath, Buffer.from(audio));

      vscode.window.showInformationMessage(`Saved audio: ${fullPath}`);
      await sound.play(fullPath);
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS/Playback Error: ${err.message}`);
      console.error(err);
    }
  }

  async function getTTSClient(provider: string, config: vscode.WorkspaceConfiguration): Promise<BaseTTSClient | null> {
    try {
      switch (provider) {
        case "Amazon Polly": {
          const ak = config.get<string>("aws.accessKeyId");
          const sk = config.get<string>("aws.secretAccessKey");
          const region = config.get<string>("aws.region") || "us-east-1";
          if (!ak || !sk) {
            vscode.window.showErrorMessage("Missing AWS credentials.");
            return null;
          }
          const client = new PollyTTSClient({ accessKeyId: ak, secretAccessKey: sk, region });
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`AWS Error: ${res.error}`);
            return null;
          }
          return client;
        }
        case "ElevenLabs": {
          const apiKey = config.get<string>("elevenLabs.apiKey");
          const voiceId = config.get<string>("elevenLabs.voiceId");
          if (!apiKey) {
            vscode.window.showErrorMessage("Missing ElevenLabs API key.");
            return null;
          }
          const client = new ElevenLabsTTSClient({ apiKey });
          if (voiceId) client.setVoice?.(voiceId);
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`ElevenLabs Error: ${res.error}`);
            return null;
          }
          return client;
        }
        case "OpenAI": {
          const apiKey = config.get<string>("openai.apiKey");
          const voice = config.get<string>("openai.voice") || "alloy";
          const model = config.get<string>("openai.model") || "gpt-4o-mini-tts";
          if (!apiKey) {
            vscode.window.showErrorMessage("Missing OpenAI API key.");
            return null;
          }
          const client = new OpenAITTSClient({ apiKey });
          client.setVoice?.(voice);
          client.setModel?.(model);
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`OpenAI Error: ${res.error}`);
            return null;
          }
          return client;
        }
        case "Azure": {
          const key = config.get<string>("azure.subscriptionKey");
          const region = config.get<string>("azure.region") || "eastus";
          const voice = config.get<string>("azure.voice") || "en-US-AriaNeural";
          if (!key) {
            vscode.window.showErrorMessage("Missing Azure subscription key.");
            return null;
          }
          const client = new AzureTTSClient({ subscriptionKey: key, region });
          client.setVoice?.(voice);
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`Azure Error: ${res.error}`);
            return null;
          }
          return client;
        }
        case "SherpaOnnx": {
          const mp = config.get<string>("sherpa.modelPath");
          const token = config.get<string>("sherpa.token");
          if (!mp || !token) {
            vscode.window.showErrorMessage("Missing SherpaONNX config.");
            return null;
          }
          const client = new SherpaOnnxTTSClient({ modelPath: mp, token });
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`Sherpa Error: ${res.error}`);
            return null;
          }
          return client;
        }
        case "Google": {
          const keyFile = config.get<string>("google.keyFilePath");
          if (!keyFile) {
            vscode.window.showErrorMessage("Missing Google key file path.");
            return null;
          }
          const client = new GoogleTTSClient({ keyFile });
          const res = await client.checkCredentialsDetailed();
          if (!res.success) {
            vscode.window.showErrorMessage(`Google TTS Error: ${res.error}`);
            return null;
          }
          return client;
        }
        default:
          vscode.window.showErrorMessage("Invalid TTS provider.");
          return null;
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS init failed: ${err.message}`);
      return null;
    }
  }
}
