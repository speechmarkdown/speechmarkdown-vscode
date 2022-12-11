/// <reference types="node" />
import { PollyClient } from "@aws-sdk/client-polly";
import { Readable } from "stream";
export declare class PollyAudioPlayer {
    client: PollyClient;
    constructor(region: string, accessKeyId: string, secretAccessKey: string);
    getAudioStream(ssmlText: string, pollyVoice: string): Promise<Readable>;
    playAudioStream(ssmlText: string, pollyVoice: string): Promise<void>;
}
