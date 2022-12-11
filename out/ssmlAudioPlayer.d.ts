import { Engine } from "@aws-sdk/client-polly";
export declare class SSMLAudioPlayer {
    static getSSMLSpeechAsync(smdText: string, engineType: Engine): Promise<void>;
    private static playAudio;
}
