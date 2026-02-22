
import * as vscode from "vscode";
import { SpeechMarkdown } from "speechmarkdown-js";
import { SpeechOptions } from "speechmarkdown-js/dist/src/SpeechOptions";

const outChannel = vscode.window.createOutputChannel('Speech Markdown');
const speech = new SpeechMarkdown();

export class SMLTextWriter {


	public static displaySSMLText(smdText : string) {
		  
	  var output : string = 'Speech Markdown text: \n';
	  
	  if(smdText.length == 0)
	  {
		output = 'No text selected';
	  }
	  else
	  {

		output += smdText;
		output += '\n------------------------\n';

		output += SMLTextWriter.GetSSML(smdText, 'amazon-alexa', 'Amazon Alexa SSML');

		output += SMLTextWriter.GetSSML(smdText, 'amazon-polly', 'Amazon Polly SSML', );

		output += SMLTextWriter.GetSSML(smdText, 'amazon-polly-neural', 'Amazon Polly Neural SSML');

		output += SMLTextWriter.GetSSML(smdText, 'apple-avspeechsynthesizer', 'Apple AVSpeechSynthesizer voices');

		output += SMLTextWriter.GetSSML(smdText, 'google-assistant', 'Google Cloud Text-to-Speech SSML');

		output += SMLTextWriter.GetSSML(smdText, 'ibm-watson', 'IBM Watson Text to Speech SSML');

		output += SMLTextWriter.GetSSML(smdText, 'microsoft-azure', 'Microsoft Azure Speech Service SSML');

		output += SMLTextWriter.GetSSML(smdText, 'microsoft-sapi', 'Microsoft Speech API (SAPI) voices');

		output += SMLTextWriter.GetSSML(smdText, 'w3c', 'W3C SSML');

		output += SMLTextWriter.GetSSML(smdText, 'samsung-bixby', 'Samsung Bixby');

		output += SMLTextWriter.GetSSML(smdText, 'elevenlabs', 'ElevenLabs prompt controls');		

		output += SMLTextWriter.GetSSML(smdText, null, 'Plain Text');

	  }
  	  outChannel.clear();
	  outChannel.append(output);
	  outChannel.show(true);
	}

	public static GetSSMLDirect(markdownText: string, platform: string | null) : string {
		let output : string = '';
		let speechOut : string = SMLTextWriter.getSpeechText(markdownText, platform, false, true, false, false);

		output += speechOut;		
		return output;

	}

	public static GetSSML(markdownText: string, platform: string | null, assistantLabel?: string) : string {
		
		let output : string = '';
		let speechOut : string = SMLTextWriter.getSpeechText(markdownText, platform);

		if(assistantLabel)
		{
			output += '\n' + assistantLabel +': \n';
		}
		
		output += speechOut;
		output += '\n';
		return output;
	}

	private static getSpeechText(markdownText: string, 
		platform: string | null, 
		includeParagraphTag?: boolean,
		includeSpeakTag?: boolean,
		includeFormatterComment?: boolean,
		preserveEmptyLines?: boolean) : string
	{
		var speechOut : string;
		let speechOpts : SpeechOptions = {};
		if (platform) {
			speechOpts.platform = platform;
		}

		speechOpts.includeParagraphTag = includeParagraphTag ?? <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeParagraphTags') ?? true;
		speechOpts.includeSpeakTag = includeSpeakTag ?? <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeSpeakTags') ?? true;
		speechOpts.includeFormatterComment = includeFormatterComment ?? <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeFormatterComment') ?? false;
		speechOpts.preserveEmptyLines = preserveEmptyLines ?? <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.preserveEmptyLines') ?? false;

		try {
			speechOut = speech.toSSML(markdownText, speechOpts);
		}
		catch (ex) {
			if (ex instanceof Error) 
			{
				speechOut = ex.name + ': ' + ex.message + ' \n';
				if (ex.stack !== undefined)
					speechOut += ex.stack;
			}
			else
			{
				speechOut = String(ex);
			}
		}

		return speechOut;
	}

};
