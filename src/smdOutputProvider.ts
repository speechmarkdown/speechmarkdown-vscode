
import * as vscode from "vscode";
import { ProviderResult, Event } from "vscode";
import { SpeechMarkdown } from "speechmarkdown-js";
import { SpeechOptions } from "speechmarkdown-js/dist/src/SpeechOptions";


const outChannel = vscode.window.createOutputChannel('Speech Markdown');

export default class  {

	public displaySSMLText(smdText : string) {
	
	  const speech = new SpeechMarkdown();

	  let speechOpts :  SpeechOptions = { platform: "amazon-alexa" };
	  speechOpts.includeSpeakTag = false;
	  
	  var output : string = 'Speech Mardown text: \n';		 
	  
	  if(smdText.length == 0)
	  {
		output = 'No text selected';
	  }
	  else
	  {

		output += smdText;
		output += '\n------------------------\n';
		
		var speechOut : string = '';
		
		try
		{
			speechOut = speech.toSSML(smdText, speechOpts);	 
		}
		catch(ex)
		{
			speechOut = ex;
		}

		output +='\n\nAlexa: \n';
		output +=speechOut;
		output +='\n';


		speechOpts.platform = "google-assistant";
		try
		{
			speechOut = speech.toSSML(smdText, speechOpts);	 
		}
		catch(ex)
		{
			speechOut = ex;
		}

		output +='\n\nGoogle Assistant: \n';
		output +=speechOut;
		output +='\n';


		speechOpts.platform = "samsung-bixby";
		try
		{
			speechOut = speech.toSSML(smdText, speechOpts);	 
		}
		catch(ex)
		{
			speechOut = ex;
		}

		output +='\nSamsung Bixby: \n';
		output +=speechOut;
		output +='\n';


		try
		{
			speechOut = speech.toSSML(smdText);	 
		}
		catch(ex)
		{
			speechOut = ex;
		}

		output +='\nPlain Text: \n';
		output +=speechOut;
		output +='\n';

	  }
  	  outChannel.clear();
	  outChannel.append(output);
	  outChannel.show(true);
	}

  };