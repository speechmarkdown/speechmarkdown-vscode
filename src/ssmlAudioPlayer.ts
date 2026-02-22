
import * as vscode from "vscode";

import { PollyClient, 
	SynthesizeSpeechCommand,
	SynthesizeSpeechCommandInput,
	SynthesizeSpeechCommandOutput, 
	TextType, Engine, VoiceId,
	InvalidSsmlException} from "@aws-sdk/client-polly";

import { SMLTextWriter } from "./smdOutputProvider";
import { Readable } from "stream";
import * as child from 'child_process';
import * as path from 'path';
import tmp from 'tmp';
import fs from 'fs';

const outChannel = vscode.window.createOutputChannel('Speech Markdown');

export class SSMLAudioPlayer {

	public static async getSSMLSpeechAsync(smdText : string, engineType: Engine) {
		  
	  var output : string = ''; 
	  outChannel.clear();
	  outChannel.appendLine('Generating speech from Speech Markdown text...');

	  if(smdText.length == 0)
	  {
		output = 'No text selected';
	  }
	  else
	  {

		var ssmlEngine : string;

		switch(engineType)
		{
			case Engine.NEURAL:
				ssmlEngine = 'amazon-polly-neural';			
				output += 'Using Amazon Polly Neural\n';
				break;
			case Engine.LONG_FORM:
				ssmlEngine = 'amazon-polly';
				output += 'Using Amazon Polly Long Form\n';
				break;
			case Engine.GENERATIVE:
				ssmlEngine = 'amazon-polly';
				output += 'Using Amazon Polly Generative\n';
				break;
			case Engine.STANDARD:
				ssmlEngine = 'amazon-polly';				
				output += 'Using Amazon Polly Standard\n';
				break;
			default:
				ssmlEngine = 'amazon-polly';				
				output += 'Using Amazon Polly Standard by default\n';
				break;
		}

		var ssmlText = SMLTextWriter.GetSSMLDirect(smdText, ssmlEngine);

		output += ssmlText;
		
		let awsRegion = <string>vscode.workspace.getConfiguration().get('speechmarkdown.aws.region');
		
	  
		if(!awsRegion && process.env.AWS_DEFAULT_REGION)
		{
			awsRegion = process.env.AWS_DEFAULT_REGION;
		}

		let awsProfile = <string>vscode.workspace.getConfiguration().get('speechmarkdown.aws.profile');
		

		if(!awsProfile && process.env.AWS_PROFILE)
		{
			awsProfile = process.env.AWS_PROFILE;
		
		}
		
		if (!awsProfile)
		{
			awsProfile = 'default';
			
		}
		

		let pollyVoice = <VoiceId>vscode.workspace.getConfiguration().get('speechmarkdown.aws.pollyDefaultVoice');
		
		// if (!awsAccessKeyId || !awsSecretKey || !awsRegion || !pollyVoice)
		if (!awsRegion || !pollyVoice)
		{

			output += '\nAWS Configuration Incomplete';

			if(!awsRegion)
			{
				output += '\n speechmarkdown configuration setting AWS Region not specified. Configure in extension settings or set AWS_DEFAULT_REGION environment variable.';
			}

			if(!pollyVoice)
			{
				output += '\n speechmarkdown configuration setting AWS Polly Voice not specified. Configure in extension settings.';			
			}
		}
		else
		{

			output += `\nAWS Region: ${awsRegion}`;
			output += `\nAWS Profile: ${awsProfile}`;
			output += `\nAWS Polly Voice: ${pollyVoice}`;
	
			try {			
				let clientConfig: any = { region: awsRegion };
				clientConfig.profile = awsProfile;
				
				outChannel.appendLine('\nInitializing AWS Polly client...');
				
				

				let client : PollyClient = new PollyClient(clientConfig);

				let synthCommandInp : SynthesizeSpeechCommandInput = { OutputFormat: 'mp3', Text: ssmlText, VoiceId: pollyVoice, TextType: TextType.SSML, Engine: engineType};

				let synthCommand : SynthesizeSpeechCommand = new SynthesizeSpeechCommand(synthCommandInp);

				let data : SynthesizeSpeechCommandOutput = await client.send(synthCommand);
	
				this.playAudio(data, outChannel);
			} catch (err) {

				if(err instanceof InvalidSsmlException)
				{
				   output += `Invalid SSML: ${ssmlText}`;
				}
				if (err) {
					output += '\n' + String(err);
					console.error(err);
				}
			}
		}
	  }

	  outChannel.appendLine('-------------------------------');
	  outChannel.appendLine('');
	  
  	  // outChannel.clear();
	  outChannel.append(output);
	  outChannel.show(true);
	}

    private static playAudio(commandOutput : SynthesizeSpeechCommandOutput, outChannel: vscode.OutputChannel) {
		if (commandOutput.AudioStream instanceof Readable) {
			let outfile : string = tmp.tmpNameSync() + ".mp3";
			const writableStream = fs.createWriteStream(outfile);

			commandOutput.AudioStream.on('data', chunk => {
				writableStream.write(chunk);
			});
			
			// Wait for the stream to end before opening in VS Code
			commandOutput.AudioStream.on('end', () => {
				writableStream.close(async (err?: NodeJS.ErrnoException | null) => {
					if (err) {
						outChannel.appendLine(`Error writing audio file: ${err.message}`);
						return;
					}

					try {
						// Create a WebView to display the audio player
						const panel = vscode.window.createWebviewPanel(
							'audioPlayer',
							'Speech Markdown Audio Player',
							vscode.ViewColumn.Beside,
							{
								enableScripts: true,
								localResourceRoots: [vscode.Uri.file(path.dirname(outfile))]
							}
						);

						// Convert file path to webview URI
						const audioUri = panel.webview.asWebviewUri(vscode.Uri.file(outfile));
						
						// Generate HTML content with audio player
						const htmlContent = this.getAudioPlayerHTML(audioUri.toString(), path.basename(outfile));
						panel.webview.html = htmlContent;
						
						// Clean up file when webview is closed
						panel.onDidDispose(() => {
							const deleteAfterPlayback = <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.deleteAudioAfterPlayback');
							
							if (deleteAfterPlayback) {
								fs.unlink(outfile, (err) => {
									if (err) {
										outChannel.appendLine(`Error deleting audio file: ${err.message}`);
									} else {
										outChannel.appendLine(`Audio file deleted: ${outfile}`);
									}
								});
							} else {
								outChannel.appendLine(`Audio file preserved: ${outfile}`);
							}
						});
						
						outChannel.appendLine(`\nOpened audio in WebView player: ${outfile}`);
						
					} catch (openErr) {
						outChannel.appendLine(`Error opening audio in WebView: ${openErr}`);
						outChannel.appendLine(`Attempting VS Code native audio player...`);

						try {
							await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(outfile), {
								viewColumn: vscode.ViewColumn.Beside,
								preview: false,
								preserveFocus: false
							});
							outChannel.appendLine(`Opened audio in VS Code native audio player: ${outfile}`);
						} catch (nativeErr) {
							outChannel.appendLine(`Error opening native player: ${nativeErr}`);
							outChannel.appendLine(`Falling back to system default player...`);

							// Fallback to system default player
							const cmd = process.platform === 'win32' ? `start "${outfile}"` : 
									   process.platform === 'darwin' ? `open "${outfile}"` : 
									   `xdg-open "${outfile}"`;
							
							child.exec(cmd, {}, (execErr: Error | null) => {
								if (execErr) {
									outChannel.appendLine(`Fallback launch error: ${execErr.message}`);
								}
							});
						}
					}
				}); 
			});
		}
	}

	private static getAudioPlayerHTML(audioUri: string, fileName: string): string {
		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Player</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            padding: 20px;
            margin: 0;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .audio-container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .file-info {
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: bold;
        }
        audio {
            width: 100%;
            max-width: 500px;
            margin: 20px 0;
        }
        .controls {
            margin-top: 20px;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 0 5px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .status {
            margin-top: 15px;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="audio-container">
        <div class="file-info">🎵 ${fileName}</div>
        <audio id="audioPlayer" controls preload="auto" autoplay>
            <source src="${audioUri}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        <div class="controls">
            <button onclick="playAudio()">▶️ Play</button>
            <button onclick="pauseAudio()">⏸️ Pause</button>
            <button onclick="stopAudio()">⏹️ Stop</button>
        </div>
        <div class="status" id="status">Ready to play</div>
    </div>

    <script>
        const audio = document.getElementById('audioPlayer');
        const status = document.getElementById('status');
        let userStopped = false; // Track if user manually stopped

        function playAudio() {
            userStopped = false; // Reset stop flag when user plays
            audio.play().then(() => {
                status.textContent = 'Playing...';
            }).catch(e => {
                status.textContent = 'Error playing audio: ' + e.message;
            });
        }

        function pauseAudio() {
            audio.pause();
            status.textContent = 'Paused';
        }

        function stopAudio() {
            userStopped = true; // User manually stopped
            audio.pause();
            audio.currentTime = 0;
            status.textContent = 'Stopped';
        }

        // Event listeners
        audio.addEventListener('loadstart', () => status.textContent = 'Loading...');
        audio.addEventListener('canplay', () => status.textContent = 'Ready to play');
        audio.addEventListener('play', () => status.textContent = 'Playing...');
        audio.addEventListener('pause', () => status.textContent = 'Paused');
        audio.addEventListener('ended', () => status.textContent = 'Playback completed');
        audio.addEventListener('error', (e) => status.textContent = 'Error: ' + e.message);

        // Auto-play when loaded (only if user hasn't manually stopped)
        audio.addEventListener('canplay', () => {
            if (!userStopped) {
                setTimeout(() => {
                    audio.play().catch(e => {
                        status.textContent = 'Auto-play blocked. Click Play button.';
                    });
                }, 100);
            }
        });
    </script>
</body>
</html>`;
	}
  }
