import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import {
  createTTSClient
} from "js-tts-wrapper";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";


const providers = [
  { label: "Amazon Polly (online, SSML)", value: "polly" },
  { label: "ElevenLabs (online, AI Voices)", value: "elevenlabs" },
  { label: "OpenAI (online, AI Voices)", value: "openai" },
  { label: "Microsoft Azure (online, SSML)", value: "azure" },
  { label: "SherpaOnnx (Offline)", value: "sherpaonnx" },
  { label: "Google Cloud TTS (online)", value: "google" },
  { label: "PlayHT (online, AI Voices)", value: "playht" },
  { label: "IBM Watson (online)", value: "watson" },
  { label: "WitAI (online, SSML)", value: "witai" },
  { label: "SAPI Windows (offline, SSML)", value: "sapi" },
  { label: "eSpeak NG (offline, SSML)", value: "espeak" },
  { label: "eSpeak NG WASM (offline, SSML)", value: "espeak-wasm" }
];
const defaultProvider = providers[0];

if (!vscode.workspace.getConfiguration("speechmarkdown").get<string>("ttsProvider")) {
  vscode.workspace.getConfiguration("speechmarkdown").update("ttsProvider", defaultProvider.value, vscode.ConfigurationTarget.Global);
}

var voiceLabels: { [x: string]: string; }={};

function getProviderId() {
  const providerId = vscode.workspace.getConfiguration("speechmarkdown").get<string>("ttsProvider");
  return providers.find(p => p.value === providerId)?.value || defaultProvider.value;
}

async function setProviderId(providerId: string) {
  await vscode.workspace.getConfiguration("speechmarkdown").update("ttsProvider", providerId, vscode.ConfigurationTarget.Global);
}

function getProviderLabel() {
  const providerId = getProviderId();
  return providers.find(p => p.value === providerId)?.label;
}

async function setVoiceId(voiceId: string, voiceLabel: string) {
  console.log(`setVoiceId: voiceId: ${voiceId}, voiceLabel: ${voiceLabel}`);
  const providerId=getProviderId();
  await vscode.workspace.getConfiguration("speechmarkdown").update(`${providerId}.voice`,voiceId,vscode.ConfigurationTarget.Global);
  //await vscode.workspace.getConfiguration("speechmarkdown").update(`${providerId}.voice.label`,voiceLabel,vscode.ConfigurationTarget.Global);  
  voiceLabels[`${providerId}.voice.label`]=voiceLabel;
}

function getVoiceId() {    
  const providerId = getProviderId();
  const voiceId=vscode.workspace.getConfiguration("speechmarkdown").get<string>(`${providerId}.voice`) || undefined;
  console.log(`getVoiceId: providerId: ${providerId}, voiceId: ${voiceId}`);

  return voiceId; 
}

function getVoiceLabel() {
  const providerId = getProviderId();
  var voiceLabel=voiceLabels[`${providerId}.voice.label`] || "voice not set";   
  //voiceLabel=vscode.workspace.getConfiguration("speechmarkdown").get<string>(`${providerId}.voice.label`) || "voice not set";
  //console.log(`getVoiceId: providerId: ${providerId}, voiceId ${voiceId}, voiceLabel ${voiceLabel}`);
  console.log(`getVoiceId: providerId: ${providerId}, voiceLabel ${voiceLabel}`);
  return voiceLabel;
}

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

  ["typescript", "javascript", "json", "yaml"].forEach(lang => {
    context.subscriptions.push(vscode.languages.registerHoverProvider(lang, jsCentralProvider));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(lang, jsCentralProvider));
  });

  const speakBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  speakBtn.text = '$(unmute) Speak Text';
  speakBtn.command = "speechmarkdown.speakText";
  speakBtn.tooltip = "Speak selected text or entire document (Ctrl+Alt+S or F13)";
  speakBtn.show();
  context.subscriptions.push(speakBtn);

  const providerBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  providerBtn.command = "speechmarkdown.selectTTSProvider";
  providerBtn.tooltip = "Select TTS Provider (Ctrl+Alt+P  or F14)";
  
  function updateProviderButton() {
    providerBtn.text = `$(gear) ${getProviderLabel()}`;
  }
  providerBtn.show();
  context.subscriptions.push(providerBtn);

  const listVoicesBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
  listVoicesBtn.text = '$(megaphone) List Voices';
  listVoicesBtn.command = "speechmarkdown.listVoices";
  listVoicesBtn.tooltip = "List and select available voices (Ctrl+Alt+L or F15)";

  function updateVoiceButton() {
    //console.log(`Current TTS Provider: ${provider}, Voice: ${voice}`);
    listVoicesBtn.text = `$(megaphone) ${getVoiceLabel()}`;
  }

  listVoicesBtn.show();
  context.subscriptions.push(listVoicesBtn);

  updateProviderButton();
  updateVoiceButton();

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.selectTTSProvider", async () => {
      const currentId = getProviderId();
      const quickPickItems = providers.map(p => ({ label: p.label, description: p.value }));
      const selection = await vscode.window.showQuickPick(quickPickItems, { placeHolder: "Select TTS Provider" });
      if (selection) {
        const selectedProvider = providers.find(p => p.label === selection.label);
        if (selectedProvider && selectedProvider.value !== currentId) {
          await setProviderId(selectedProvider.value);
          await updateProviderButton();
          await updateVoiceButton();
          vscode.window.showInformationMessage(`TTS provider set to ${selectedProvider.label}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.listVoices", async () => {
      const config = vscode.workspace.getConfiguration("speechmarkdown");
      const providerId = getProviderId();
      const client = await getTTSClient(providerId, config);
      if (!client) {
        await updateProviderButton();
        await updateVoiceButton();
        return;
      }
      try {
        const voices = await client.getVoices();
        if (!voices || voices.length === 0) {
          vscode.window.showInformationMessage("No voices found for this provider.");
          return;
        }
        const items: vscode.QuickPickItem[] = voices.map((v: any) => ({
          label: v.name,
          value: v.id,
          description: v.lang || v.language || ''
        }));
        const selection = await vscode.window.showQuickPick(items, { placeHolder: "Available Voices" });
        if (selection) {
          const selected = voices.find((v: { name: string; }) => v.name === selection.label);
          if (selected) {
            await setVoiceId(selected.id,selected.name);
            await updateVoiceButton();
            console.log(`Voice set to ${selected.name} with id ${selected.id} for ${providerId}`);
            vscode.window.showInformationMessage(`Voice set to ${selected.name} for ${providerId}`);
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
    const providerId = getProviderId();
    const client = await getTTSClient(providerId, config);
    if (!client) return;

    try {
      const editor = vscode.window.activeTextEditor;
      const baseName = editor && editor.document.uri.fsPath
        ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
        : "untitled";
      const fileName = `${providerId.replace(/\s+/g, "")}_${baseName}_${getTimestamp()}.mp3`;
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

  async function getTTSClient(providerId: string, config: vscode.WorkspaceConfiguration): Promise<any> {  
    console.log(`Initializing TTS client for provider: ${providerId}`);

    if (!providerId) {
      vscode.window.showErrorMessage("Invalid TTS provider.");
      return null;
    }

    let opts: any = {};
    switch (providerId) {
      case "polly":
        opts = {
          accessKeyId: config.get<string>(`${providerId}.accessKeyId`),
          secretAccessKey: config.get<string>(`${providerId}.secretAccessKey`),
          region: config.get<string>(`${providerId}.region`) || "us-east-1",
          //voice: config.get<string>(`${providerId}.voice`)
        };
        if (!opts.accessKeyId || !opts.secretAccessKey) {
          vscode.window.showErrorMessage("Missing Amazon Polly credentials.");
          return null;
        }
        break;

      case "elevenlabs":
        const elevenKey = config.get<string>(`${providerId}.apiKey`);
        if (!elevenKey) {
          vscode.window.showErrorMessage("Missing ElevenLabs API key.");
          return null;
        }
        opts = { apiKey: elevenKey, voice: config.get<string>(`${providerId}.voice`) };
        break;

      case "openai":
        opts = {
          apiKey: config.get<string>(`${providerId}.apiKey`),
          //voice: config.get<string>(`${providerId}.voice`),
          model: config.get<string>(`${providerId}.model`)
        };
        if (!opts.apiKey) {
          vscode.window.showErrorMessage("Missing OpenAI API key.");
          return null;
        }
        break;

      case "azure":
        opts = {
          subscriptionKey: config.get<string>(`${providerId}.subscriptionKey`),
          region: config.get<string>(`${providerId}.region`) || "eastus",
          //voice: config.get<string>(`${providerId}.voice`)
        };
        if (!opts.subscriptionKey) {
          vscode.window.showErrorMessage("Missing Azure subscription key.");
          return null;
        }
        break;

      case "google":
        opts = {
          keyFile: config.get<string>(`${providerId}.keyFilePath`),
          //voice: config.get<string>(`${providerId}.voice`)
        };
        if (!opts.keyFile) {
          vscode.window.showErrorMessage("Missing Google key file path.");
          return null;
        }
        break;

      case "playht":
        opts = {
          apiKey: config.get<string>(`${providerId}.apiKey`),
          userId: config.get<string>(`${providerId}.userId`),
          //voice: config.get<string>(`${providerId}.voice`)
        };
        if (!opts.apiKey || !opts.userId) {
          vscode.window.showErrorMessage("Missing PlayHT API key or User ID.");
          return null;
        }
        break;

      case "watson":
        opts = {
          apiKey: config.get<string>(`${providerId}.apiKey`),
          region: config.get<string>(`${providerId}.region`),
          instanceId: config.get<string>(`${providerId}.instanceId`),
          //voice: config.get<string>(`${providerId}.voice`)
        };
        if (!opts.apiKey || !opts.region || !opts.instanceId) {
          vscode.window.showErrorMessage("Missing IBM Watson config.");
          return null;
        }
        break;

      case "witai":
        opts = { 
          token: config.get<string>(`${providerId}.token`), 
          //voice: config.get<string>(`${providerId}.voice`) 
        };
        if (!opts.token) {
          vscode.window.showErrorMessage("Missing WitAI token.");
          return null;
        }
        break;

      case "sapi":
        /*
        if (process.platform !== "win32") {
          vscode.window.showErrorMessage("SAPI is only supported on Windows.");
          return null;
        }*/
        //opts = { voice: config.get<string>(`${providerId}.voice`) };
        break;

      case "espeak":
        //opts = { voice: config.get<string>(`${providerId}.voice`) };
        break;

      case "espeak-wasm":
        //opts = { voice: config.get<string>(`${providerId}.voice`) };
        break;

      case "sherpaonnx":
        opts = {
          modelPath: config.get<string>(`${providerId}.modelPath`),
          token: config.get<string>(`${providerId}.token`)
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
      opts["voice"]=getVoiceId();
      console.log(`Creating TTS client for ${providerId} with options:`, opts);
      const client = createTTSClient(providerId as any, opts);
      if (client.checkCredentialsDetailed) {
        const res = await client.checkCredentialsDetailed();
        if (!res.success) {
          vscode.window.showErrorMessage(`${providerId} Error: ${res.error}`);
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
