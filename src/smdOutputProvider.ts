
import * as vscode from "vscode";
import { ProviderResult, Event } from "vscode";
import { SpeechMarkdown } from "speechmarkdown-js";
import { SpeechOptions } from "speechmarkdown-js/dist/src/SpeechOptions";

const outChannel = vscode.window.createOutputChannel('Speech Markdown');
const speech = new SpeechMarkdown();

export default class  {


	public displaySSMLText(smdText : string) {
		  
	  var output : string = 'Speech Mardown text: \n';
	  
	  if(smdText.length == 0)
	  {
		output = 'No text selected';
	  }
	  else
	  {

		output += smdText;
		output += '\n------------------------\n';

		output += GetSSML(smdText, 'Amazon Alexa', 'amazon-alexa');

		output += GetSSML(smdText, 'Amazon Polly', 'amazon-polly');

		output += GetSSML(smdText, 'Amazon Polly Neural', 'amazon-polly-neural');

		output += GetSSML(smdText, 'Microsoft Azure', 'microsoft-azure');

		output += GetSSML(smdText, 'Samsung Bixby', 'samsung-bixby');

		output += GetSSML(smdText, 'Google Assistant', 'google-assistant');

		output += GetSSML(smdText, 'Plain Text');

	  }
  	  outChannel.clear();
	  outChannel.append(output);
	  outChannel.show(true);
	}

  };

function GetSSML(smdText: string, assistantLabel: string, platform?: string) {
	
	let output : string = '';
	var speechOut : string;
	
	let speechOpts : SpeechOptions = { platform : platform };

	speechOpts.includeParagraphTag = <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeParagraphTags');
	speechOpts.includeSpeakTag = <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeSpeakTags');
	speechOpts.includeFormatterComment = <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.includeFormatterComment');
	speechOpts.preserveEmptyLines = <boolean>vscode.workspace.getConfiguration().get('speechmarkdown.preserveEmptyLines');
	
	try {
		speechOut = speech.toSSML(smdText, speechOpts);
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

	output += '\n' + assistantLabel +': \n';
	output += speechOut;
	output += '\n';
	return output;
}
