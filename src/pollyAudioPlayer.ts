
import { PollyClient, 
	SynthesizeSpeechCommand,
	SynthesizeSpeechCommandInput,
	SynthesizeSpeechCommandOutput,
    TextType,
    VoiceId
	 } from "@aws-sdk/client-polly";

import { Readable } from "stream";
//import { IncomingMessage } from "http";
//import fs = require("fs");


export class PollyAudioPlayer {
    client: PollyClient;

    public constructor(region: string, accessKeyId: string, secretAccessKey: string)
    {
        if (!region) {
            throw new Error('region cannot be an empty string');
        }

        if (!accessKeyId) {
            throw new Error('accessKeyId cannot be an empty string');
        }

		if (!secretAccessKey) {
            throw new Error('secretAccessKey cannot be an empty string');
        }

        this.client = new PollyClient({region: region, 
            credentials : { 
                accessKeyId: accessKeyId, 
                secretAccessKey: secretAccessKey
            } });
    }

	public async getAudioStream(ssmlText : string, pollyVoice: VoiceId) : Promise<Readable> {

        try {
        
            let synthCommandInp : SynthesizeSpeechCommandInput = { OutputFormat: 'mp3', Text: ssmlText, TextType: TextType.SSML, VoiceId: pollyVoice};

            let synthCommand : SynthesizeSpeechCommand = new SynthesizeSpeechCommand(synthCommandInp);

            let commandOutput : SynthesizeSpeechCommandOutput = await this.client.send(synthCommand);

            if (commandOutput.AudioStream instanceof Readable) {

                return await Promise.resolve(commandOutput.AudioStream);                
            }
            // process data.
        } catch (err) {
            if (err) {                
                return await Promise.reject(err);
            }
        } finally {
            // finally.
        }
        
        return await Promise.reject();
    }
    
    public async playAudioStream(ssmlText : string, pollyVoice: string)
    {

        // var audioStream : Readable = await this.getAudioStream(ssmlText, pollyVoice);


    }


}
  
