import { MarkdownString } from "vscode";
import { throws } from "assert";
import { stringify } from "querystring";

export class SPHoverInfo {
  merkdownElement: string;

  hasAlexaSupport: boolean;

  hasGoogleSupport: boolean;

  constructor(
    public name: string,
    public alexaSupport: boolean,
    googleSupport: boolean
  ) {
    this.merkdownElement = name;
    this.hasAlexaSupport = alexaSupport;
    this.hasGoogleSupport = googleSupport;
  }

  GetMarkdown(): MarkdownString {
    let markdownText: string = "**" + this.name + "**  \n";

    markdownText = markdownText + "Alexa: ";

    if (this.hasAlexaSupport) markdownText = markdownText + "_supported_  \n";
    else markdownText = markdownText + "_not supported_  \n";

    markdownText = markdownText + "Google Actions: ";

    if (this.hasGoogleSupport) markdownText = markdownText + "_supported_  \n";
    else markdownText = markdownText + "_not supported_  \n";

    let retMarkdown: MarkdownString = new MarkdownString(markdownText);

    return retMarkdown;
  }
}

export var hoverInfoArr: SPHoverInfo[] = [
  new SPHoverInfo("emphasis", true, true),
  new SPHoverInfo("whisper", true, true),
  new SPHoverInfo("voice", true, false),
  new SPHoverInfo("break", true, true),
  new SPHoverInfo("address", true, true),
  new SPHoverInfo("audio", true, true),
  new SPHoverInfo("cardinal", true, true),
  new SPHoverInfo("character", true, true),
  new SPHoverInfo("date", true, true),
  new SPHoverInfo("disappointed", true, true),
  new SPHoverInfo("excited", true, true),
  new SPHoverInfo("expletive", true, true),
  new SPHoverInfo("bleep", true, true),
  new SPHoverInfo("fraction", true, true),
  new SPHoverInfo("interjection", true, true),
  new SPHoverInfo("ipa", true, true),
  new SPHoverInfo("lang", true, true),
  new SPHoverInfo("number", true, true),
  new SPHoverInfo("ordinal", true, true),
  new SPHoverInfo("phone", true, true),
  new SPHoverInfo("telephone", true, true),
  new SPHoverInfo("pitch", true, true),
  new SPHoverInfo("rate", true, true),
  new SPHoverInfo("sub", true, true),
  new SPHoverInfo("time", true, true),
  new SPHoverInfo("unit", true, true),
  new SPHoverInfo("volume", true, true),
  new SPHoverInfo("vol", true, true)
];
