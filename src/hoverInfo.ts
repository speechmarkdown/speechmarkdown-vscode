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
  new SPHoverInfo("break", true, true)
];
