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
      const providers = [
        "Amazon Polly",
        "ElevenLabs",
        "OpenAI",
        "Azure",
        "SherpaOnnx",
        "Google",
        "PlayHT",
        "IBM Watson",
        "WitAI",
        "SAPI",
        "eSpeak NG",
        "eSpeak NG WASM"
      ];
      const selection = await vscode.window.showQuickPick(providers, { placeHolder: "Select TTS Provider" });
      if (selection && selection !== current) {
        await config.update("ttsProvider", selection, vscode.ConfigurationTarget.Global);
        updateProviderButton();
        vscode.window.showInformationMessage(`TTS provider set to ${selection}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.listVoices", async () => {
      const config = vscode.workspace.getConfiguration("speechmarkdown");
      const provider = config.get<string>("ttsProvider") || "Amazon Polly";
      const client = await getTTSClient(provider, config);
      if (!client) return;
      try {
        const voices = await client.getVoices();
        if (!voices || voices.length === 0) {
          vscode.window.showInformationMessage("No voices found for this provider.");
          return;
        }
        const items: vscode.QuickPickItem[] = voices.map((v: any) => ({
          label: v.id || v.name,
          description: v.lang || v.language || ''
        }));
        const selection = await vscode.window.showQuickPick(items, { placeHolder: "Available Voices" });
        if (selection) {
          let key = '';
          switch (provider) {
            case 'Amazon Polly':
              key = 'aws.voice';
              break;
            case 'ElevenLabs':
              key = 'elevenLabs.voiceId';
              break;
            case 'OpenAI':
              key = 'openai.voice';
              break;
            case 'Azure':
              key = 'azure.voice';
              break;
            case 'Google':
              key = 'google.voice';
              break;
            case 'PlayHT':
              key = 'playht.voice';
              break;
            case 'IBM Watson':
              key = 'watson.voice';
              break;
            case 'WitAI':
              key = 'witai.voice';
              break;
            case 'SAPI':
              key = 'sapi.voice';
              break;
            case 'eSpeak NG':
              key = 'espeak.voice';
              break;
            case 'eSpeak NG WASM':
              key = 'espeakWasm.voice';
              break;
            case 'SherpaOnnx':
              key = 'sherpa.voice';
              break;
            default:
              key = '';
          }
          if (key) {
            await config.update(key, selection.label, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Voice set to ${selection.label} for ${provider}`);
          }
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error fetching voices: ${err.message}`);
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

    try {
      const editor = vscode.window.activeTextEditor;
      const baseName = editor && editor.document.uri.fsPath
        ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
        : "untitled";
      const fileName = `${provider.replace(/\s+/g, "")}_${baseName}_${getTimestamp()}.mp3`;
      const outDir = config.get<string>("outputDir")?.trim()
        || path.join(os.homedir(), "tts-output");
      fs.mkdirSync(outDir, { recursive: true });
      const fullPath = path.join(outDir, fileName);
      await client.synthToFile(text, fullPath, "mp3", { useSpeechMarkdown: true });
      vscode.window.showInformationMessage(`Saved audio: ${fullPath}`);
      await client.speak({filename : fullPath});
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS/Playback Error: ${err.message}`);
      console.error(err);
    }
  }

  async function getTTSClient(provider: string, config: vscode.WorkspaceConfiguration): Promise<any> {

  const engine = {
  "Amazon Polly": "polly",
  "ElevenLabs": "elevenlabs",
  "OpenAI": "openai",
  "Azure": "azure",
  "SherpaOnnx": "sherpaonnx",
  "Google": "google",
  "PlayHT": "playht",
  "IBM Watson": "watson",
  "WitAI": "witai",
  "SAPI": "sapi",
  "eSpeak NG": "espeak",
  "eSpeak NG WASM": "espeak-wasm"
}[provider];

    if (!engine) {
      vscode.window.showErrorMessage("Invalid TTS provider.");
      return null;
    }

    let opts: any = {};
    switch (engine) {
      case "polly":
        opts = {
          accessKeyId: config.get<string>("aws.accessKeyId"),
          secretAccessKey: config.get<string>("aws.secretAccessKey"),
          region: config.get<string>("aws.region") || "us-east-1",
          voice: config.get<string>("aws.voice")
        };
        if (!opts.accessKeyId || !opts.secretAccessKey) {
          vscode.window.showErrorMessage("Missing AWS credentials.");
          return null;
        }
        break;

      case "elevenlabs":
        const elevenKey = config.get<string>("elevenLabs.apiKey");
        if (!elevenKey) {
          vscode.window.showErrorMessage("Missing ElevenLabs API key.");
          return null;
        }
        opts = { apiKey: elevenKey, voice: config.get<string>("elevenLabs.voiceId") };
        break;

      case "openai":
        opts = {
          apiKey: config.get<string>("openai.apiKey"),
          voice: config.get<string>("openai.voice"),
          model: config.get<string>("openai.model")
        };
        if (!opts.apiKey) {
          vscode.window.showErrorMessage("Missing OpenAI API key.");
          return null;
        }
        break;

      case "azure":
        opts = {
          subscriptionKey: config.get<string>("azure.subscriptionKey"),
          region: config.get<string>("azure.region") || "eastus",
          voice: config.get<string>("azure.voice")
        };
        if (!opts.subscriptionKey) {
          vscode.window.showErrorMessage("Missing Azure subscription key.");
          return null;
        }
        break;

      case "google":
        opts = {
          keyFile: config.get<string>("google.keyFilePath"),
          voice: config.get<string>("google.voice")
        };
        if (!opts.keyFile) {
          vscode.window.showErrorMessage("Missing Google key file path.");
          return null;
        }
        break;

      case "playht":
        opts = {
          apiKey: config.get<string>("playht.apiKey"),
          userId: config.get<string>("playht.userId"),
          voice: config.get<string>("playht.voice")
        };
        if (!opts.apiKey || !opts.userId) {
          vscode.window.showErrorMessage("Missing PlayHT API key or User ID.");
          return null;
        }
        break;

      case "watson":
        opts = {
          apiKey: config.get<string>("watson.apiKey"),
          region: config.get<string>("watson.region"),
          instanceId: config.get<string>("watson.instanceId"),
          voice: config.get<string>("watson.voice")
        };
        if (!opts.apiKey || !opts.region || !opts.instanceId) {
          vscode.window.showErrorMessage("Missing IBM Watson config.");
          return null;
        }
        break;

      case "witai":
        opts = { token: config.get<string>("witai.token"), voice: config.get<string>("witai.voice") };
        if (!opts.token) {
          vscode.window.showErrorMessage("Missing WitAI token.");
          return null;
        }
        break;

      case "sapi":
        if (process.platform !== "win32") {
          vscode.window.showErrorMessage("SAPI is only supported on Windows.");
          return null;
        }
        opts = { voice: config.get<string>("sapi.voice") };
        break;

      case "espeak":
        opts = { voice: config.get<string>("espeak.voice") };
        break;

      case "espeak-wasm":
        opts = { voice: config.get<string>("espeakWasm.voice") };
        break;

      case "sherpaonnx":
        opts = {
          modelPath: config.get<string>("sherpa.modelPath"),
          token: config.get<string>("sherpa.token")
        };
        if (!opts.modelPath || !opts.token) {
          vscode.window.showErrorMessage("Missing SherpaONNX config.");
          return null;
        }
        break;

      default:
        opts = {};
    }

    try {
      const client = createTTSClient(engine as any, opts);
      if (client.checkCredentialsDetailed) {
        const res = await client.checkCredentialsDetailed();
        if (!res.success) {
          vscode.window.showErrorMessage(`${provider} Error: ${res.error}`);
          return null;
        }
      }
      if (client.setVoice && opts.voice) client.setVoice(opts.voice);
      if (client.setModel && opts.model) client.setModel(opts.model);
      return client;
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS init failed: ${err.message}`);
      return null;
    }
  }
}
