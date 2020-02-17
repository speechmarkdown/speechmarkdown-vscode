import * as vscode from "vscode";

export class SPHoverInfo {
  merkdownElements: string[];

  hasAlexaSupport: boolean;

  hasGoogleSupport: boolean;

  descriptionText: string;

  constructor(
    public names: string[],
    public description: string,
    public alexaSupport: boolean,
    googleSupport: boolean
  ) {
    this.merkdownElements = names;
    this.descriptionText = description;
    this.hasAlexaSupport = alexaSupport;
    this.hasGoogleSupport = googleSupport;
  }

  GetMarkdown(): vscode.MarkdownString {
    let markdownText: string = "**" + this.names.join(" /") + "**  \n \n";

    markdownText = markdownText + this.description + " \n \n";

    markdownText = markdownText + "--- \n \n";

    markdownText = markdownText + "Alexa: ";

    if (this.hasAlexaSupport) markdownText = markdownText + "_supported_  \n";
    else markdownText = markdownText + "_not supported_  \n";

    markdownText = markdownText + "Google Actions: ";

    if (this.hasGoogleSupport) markdownText = markdownText + "_supported_  \n";
    else markdownText = markdownText + "_not supported_  \n";

    let retMarkdown: vscode.MarkdownString = new vscode.MarkdownString(
      markdownText
    );

    return retMarkdown;
  }
}

export class JSHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const start = position;

    let index: number = position.character;

    const line = document.lineAt(position.line);

    let openBracket: number = line.text.lastIndexOf("[", index);

    let endBracket: number = line.text.indexOf("]", openBracket);

    if (
      openBracket > -1 &&
      endBracket > -1 &&
      index > openBracket &&
      index < endBracket
    ) {
      let foundText: string = line.text.substring(openBracket + 1, endBracket);

      // there may be a closing colon
      let colonIndex = foundText.indexOf(":");
      if (colonIndex > -1) foundText = foundText.substring(0, colonIndex);

      let foundInfo = hoverInfoArr.find(x =>
        x.merkdownElements.find(x => x === foundText)
      );

      if (foundInfo) {
        let hoverRet: vscode.Hover = new vscode.Hover(foundInfo.GetMarkdown());
        return hoverRet;
      }
    }

    return null;
  }
}

var hoverInfoArr: SPHoverInfo[] = [
  new SPHoverInfo(
    ["address"],
    "Speaks the value as a street address. \n ```text \n I'm at (150th CT NE, Redmond, WA)[address]. \n ```",
    true,
    false
  ),
  new SPHoverInfo(
    ["audio"],
    'Plays short, pre-recorded audio.  \n ```text \n !["https://intro.mp3"] \n Welcome back. \n ```',
    true,
    true
  ),
  new SPHoverInfo(
    ["break"],
    'A pause in speech. \n ```text \n Step 1, take a deep breath. [200ms] \n Step 2, exhale. \n Step 3, take a deep breath again. [break:"weak"] \n Step 4, exhale. \n ```',
    true,
    true
  ),
  new SPHoverInfo(
    ["cardinal", "number"],
    "Speaks a number as a cardinal: one, twenty, twelve thousand three hundred forty five, etc. \n \n ```text \n One, two, (3)[cardinal]. \n Your balance is: (12345)[cardinal]. \n (801)[cardinal] is the same as (801)[number] \n ```",
    true,
    true
  ),
  new SPHoverInfo(
    ["characters"],
    "Speaks a number or text as individual characters. \n ```text \n Countdown: (321)[characters] \n The word is spelled: (park)[chars] \n ```",
    true,
    true
  ),

  new SPHoverInfo(
    ["date"],
    "Speak the text as a date. \n" +
      "The date can use slash (/), dash (-), and dot (.) separators. \n" +
      "Some SSML formatters require the year to be 4 digits. Some might auto-expand 2-digit years to 4 digits. \n" +
      "```text \n" +
      'The date is (10-11-12)[date:"mdy"].     // October 11th, 2012 \n' +
      'The date is (10-11-12)[date:"dmy"].     // November 10th, 2012 \n' +
      'The date is (10-11-12)[date:"ymd"].     // Nov 12th, 2010 \n' +
      "``` \n" +
      "The following format values are accepted: mdy, dmy, ydm, md, dm, ym, my, y, m, d \n \n" +
      "ydm (not supported by Alexa)",
    true,
    true
  ),

  new SPHoverInfo(
    ["disappointed"],
    "Sets the spoken text to varying levels of disappointment. \n" +
      "```text \n" +
      '#[disappointed:"low"] \n' +
      "I am disappointed - low. \n \n" +
      'We can switch (from disappointed)[disappointed] to (really disappointed)[disappointed:"high"]. \n' +
      "``` \n \n" +
      "Set intensity to: low, medium (default), high",
    true,
    false
  ),
  new SPHoverInfo(
    ["defaults"],
    "Sets the spoken text back to normal (default) settings after using another section such as: disappointed, dj, excited, newscaster, voice \n" +
      "```text \n" +
      "Normal speech. \n \n" +
      "#[dj] \n" +
      "Switching to a music/media announcer. \n \n" +
      "#[defaults] \n" +
      "Now back to normal speech. \n" +
      "```",
    true,
    false
  ),
  new SPHoverInfo(
    ["dj"],
    "Sets the spoken text similar to how a music/media announcer would speak them.\n" +
      "```text \n" +
      "Normal speech. \n \n" +
      "#[dj] \n" +
      "Switching to a music/media announcer. \n \n" +
      "#[defaults] \n" +
      "Now back to normal speech. \n" +
      "```",
    true,
    false
  ),

  new SPHoverInfo(
    ["emphasis"],
    'Add or remove emphasis from a word or phrase. \n ```text \n A (strong)[emphasis:"strong"] level \n ```',
    true,
    true
  ),

  new SPHoverInfo(
    ["expletive", "bleep"],
    '"Bleep" out the content \n' +
      "```text \n" +
      "You can't say (word)[bleep] on TV. \n" +
      "You said (word)[bleep] and (word)[expletive] at school. \n" +
      "```",
    true,
    true
  ),

  new SPHoverInfo(
    ["fraction"],
    "Speaks the value as a fraction. \n \n" +
      "```text \n" +
      "Add (2/3)[fraction] cup of milk. \n" +
      "Add (1+1/2)[fraction] cups of flour. \n " +
      "```",
    true,
    true
  ),

  new SPHoverInfo(
    ["excited"],
    "Sets the spoken text to varying levels of excitement. \n" +
      "Set intensity to: low, medium (default), high \n \n" +
      "```text \n" +
      ' #[excited:"high"] \n' +
      "I am excited - high. \n \n" +
      'We can switch (from excited)[excited] to (really excited)[excited:"high"]. \n' +
      "```",
    true,
    false
  ),

  new SPHoverInfo(
    ["interjection"],
    "Speaks the text in a more expressive voice. \n \n" +
      "```text \n" +
      "(Wow)[interjection], I didn't see that coming. \n" +
      "```",
    true,
    false
  ),
  new SPHoverInfo(
    ["ipa"],
    "Provides a phonemic/phonetic pronunciation for the contained text using the International Phonetic Alphabet (IPA). \n \n" +
      "```text \n" +
      'You say, (pecan)[ipa:"pɪˈkɑːn"]. \n' +
      "I say, (pecan)[/ˈpi.kæn/]. \n" +
      "```",
    true,
    false
  ),
  new SPHoverInfo(
    ["lang"],
    "Sets the language. Words and phrases in other languages usually sound better with the lang tag. \n \n" +
      "```text \n" +
      '#[voice:"Brian";lang:"en-GB"] \n \n' +
      'In Paris, they pronounce it (Paris)[lang:"fr-FR"]. \n' +
      "```",
    true,
    false
  ),

  new SPHoverInfo(
    ["newscaster"],
    "Sets the spoken text similar to how a news announcer would speak them. \n \n" +
      "```text \n" +
      "#[newscaster] \n" +
      "Switching to a news announcer. \n" +
      "```",
    true,
    false
  ),

  new SPHoverInfo(
    ["ordinal"],
    "Speaks a number as an ordinal: first, second, third, etc. \n \n" +
      "```text \n" +
      "The others came in 2nd and (3)[ordinal]. \n" +
      "Your rank is (123)[ordinal]. \n" +
      "```",
    true,
    true
  ),

  new SPHoverInfo(
    ["phone", "telephone"],

    "Speak the number/value as a 7-digit or 10-digit telephone number. \n \n" +
      "The key, **phone** is a shortened form of **telephone** for convenience. \n \n" +
      "```text \n" +
      "My number is NOT (8675309)[phone] \n" +
      "My number is NOT (8675309)[telephone]. \n" +
      'My number is NOT (8675309)[phone:"1"]. \n' +
      'My number is NOT (8675309)[telephone:"1"]. \n \n' +
      "The number is ((888) 555-1212)[phone]. \n" +
      "``` \n \n" +
      'Some implementations of SSML (Google Actions) need a country code set as a **format** attribute. If no format is included, the default is "1".',
    true,
    true
  ),

  new SPHoverInfo(
    ["pitch"],
    "Raise or lower the tone (pitch) of the speech. \n \n" +
      "```text \n" +
      'I can speak with my normal pitch, (but also with a much higher pitch)[pitch:"x-high"]. \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: x-low, low, medium (default), high, x-high",
    true,
    true
  ),

  new SPHoverInfo(
    ["rate"],
    "Modify the rate of the speech. \n \n" +
      "```text \n" +
      'When I wake up, (I speak quite slowly)[rate:"x-slow"]. \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: x-low, low, medium (default), high, x-high",
    true,
    true
  ),

  new SPHoverInfo(
    ["sub"],
    "Substitute one word or phrase with a different word or phrase. Often used to expand/clarify abbreviations. \n \n" +
      "```text \n" +
      'My favorite chemical element is (Al)[sub:"aluminum"], \n' +
      'but Al prefers (Mg)["magnesium"]. \n' +
      "```",
    true,
    true
  ),

  new SPHoverInfo(
    ["time"],
    "Speak the value as a time. \n \n" +
      "```text \n" +
      'The time is (2:30pm)[time:"hms12"]. \n' +
      'The time is (2:30pm)[time:"hms24"]. \n' +
      "``` \n \n" +
      "Some implementations of SSML (Google Assistant) need a value the **format** attribute: hms12, hms24",
    true,
    true
  ),

  new SPHoverInfo(
    ["unit"],
    "Speaks the value as a unit. Can be a number and unit or just a unit. \n " +
      "Units values include: 10 foot, 10 ft, 10ft, foot, ft, 6'3\" (depends on plaform) \n " +
      "Some implementations of SSML converts units to singular or plural depending on the number. \n \n " +
      "```text \n" +
      "I would walk (500 mi)[unit] \n" +
      "```",
    true,
    true
  ),

  new SPHoverInfo(
    ["voice"],
    "Sets the voice for the speech. The value is not validated. The formatter will use the value for a given voice if the platform supports it. \n \n " +
      "```text \n" +
      '#[voice:"Brian";lang:"en-GB"] \n' +
      "Brian from the UK. \n " +
      '#[voice:"device"] \n' +
      "Back to the device voice \n " +
      'Why do you keep switching voices (from one)[voice:"Brian"] (to the other)[voice:"Kendra"]? \n' +
      "``` \n \n" +
      "The **device** value removes any overrides, therefore using the device settings.",
    true,
    false
  ),

  new SPHoverInfo(
    ["volume", "vol"],
    "Modify the volume of the speech. \n \n" +
      "```text \n" +
      "Normal volume for the first sentence. \n" +
      '(Louder volume for the second sentence)[volume:"x-loud"]. \n \n' +
      'Volume modifier (can be abbreviated)[vol:"soft"]. \n \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: silent, x-soft, soft, medium (default), loud, x-loud",
    true,
    true
  ),

  new SPHoverInfo(
    ["whisper"],
    "Speak text in a whispered voice. \n \n " +
      "```text \n" +
      "I want to tell you a secret. \n" +
      "(I am not a real human.)[whisper] \n \n" +
      "``` \n \n" +
      "Since Google Assistant doesn’t have a whisper effect, through a configuration setting, you can either ignore the tag. Or use the **prosidy** tag.",

    true,
    false
  )
];
