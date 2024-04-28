
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
import tmp from 'tmp';
import fs from 'fs';

const outChannel = vscode.window.createOutputChannel('Speech Markdown');

export class SSMLAudioPlayer {

	public static async getSSMLSpeechAsync(smdText : string, engineType: Engine) {
		  
	  var output : string = 'Speech Markdown text: \n';
	  

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
			case Engine.STANDARD:
				ssmlEngine = 'amazon-polly';
				output += 'Using Amazon Polly Standard\n';
				break;
			default:
				ssmlEngine = 'amazon-polly';
				output += 'Using Amazon Polly Standard by default\n';
				break;
		}

		var ssmlText = SMLTextWriter.GetSSML(smdText, ssmlEngine);

		output += ssmlText;

		//let awsprofile = <string>vscode.workspace.getConfiguration().get('speechmarkdown.awsProfile');
		let awsRegion = <string>vscode.workspace.getConfiguration().get('speechmarkdown.aws.region');
		if(!awsRegion && process.env.AWS_DEFAULT_REGION)
		{
			awsRegion = process.env.AWS_DEFAULT_REGION;
		}

		let awsAccessKeyId = <string>vscode.workspace.getConfiguration().get('speechmarkdown.aws.accessKeyId');
		if(!awsAccessKeyId && process.env.AWS_ACCESS_KEY_ID)
		{
			awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
		}

		let awsSecretKey = <string>vscode.workspace.getConfiguration().get('speechmarkdown.aws.secretAccessKey');
		if(!awsSecretKey && process.env.AWS_SECRET_ACCESS_KEY)
		{
			awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
		}

		let pollyVoice = <VoiceId>vscode.workspace.getConfiguration().get('speechmarkdown.aws.pollyDefaultVoice');
		
		if (!awsAccessKeyId || !awsSecretKey || !awsRegion || !pollyVoice)
		{

			output += '\nAWS Configuration Incomplete';

			if(!awsRegion)
			{
				output += '\n speechmarkdown configuration setting AWS Region not specified';
			}

			if(!awsAccessKeyId)
			{
				output += '\n speechmarkdown configuration setting AWS Access Key ID not specified';			
			}
			
			if(!awsSecretKey)
			{
				output += '\n speechmarkdown configuration setting AWS Secret Key not specified';			
			}

			if(!pollyVoice)
			{
				output += '\n speechmarkdown configuration setting AWS Polly Voice not specified';			
			}
		}
		else
		{

			try {			
				let client : PollyClient = new PollyClient({ region: awsRegion,
					credentials: {
						accessKeyId: awsAccessKeyId,
						secretAccessKey: awsSecretKey
					}		
				});

				let synthCommandInp : SynthesizeSpeechCommandInput = { OutputFormat: 'mp3', Text: ssmlText, VoiceId: pollyVoice, TextType: TextType.SSML, Engine: Engine.STANDARD};

				let synthCommand : SynthesizeSpeechCommand = new SynthesizeSpeechCommand(synthCommandInp);

				let data : SynthesizeSpeechCommandOutput = await client.send(synthCommand);
	
				this.playAudio(data, outChannel);
			} catch (err) {

				if(err instanceof InvalidSsmlException)
				{
				   output += `Invalid SSML: ${ssmlText}`;
				}
				if (err) {
					output += String(err);
					console.error(err);
				}
			}
		}
	  }

  	  outChannel.clear();
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
			
			// First, we need to wait for the command output to end
			// before playing the audio.
			commandOutput.AudioStream.on('end',  () =>
			{

			  writableStream.close((err?: NodeJS.ErrnoException | null) => {

				var cmd: string;

				switch (process.platform) {
				  case 'darwin': {
					  cmd = `osascript -e 'tell application "QuickTime Player"' -e 'set theMovie to open POSIX file "${outfile}"' -e 'tell theMovie to play' -e 'end tell'`;
					  break;
				  }
				  case 'win32': {
					  cmd = `start ${outfile}`;
					  break;
				  }
				  default: {
					  cmd = `xdg-open ${outfile}`;
					  break;
				  }
				}

				outChannel.appendLine(`Open command: ${cmd}`);

				child.exec(cmd, {}, (err: Error | null, stdout: string, stderr: string) => {
					if (err) {
						//vscode.window.showErrorMessage(`Launch error: ${err}`);
						outChannel.appendLine(`Launch stdout: ${stdout}`);		
						console.error(err, err.stack);

						fs.unlink(outfile, (err) => {
						  if (err) throw err;
						  outChannel.appendLine(`${outfile}  was deleted\n`);
						});
					}
				  });
				}); 
			});
		}
	}
  }
