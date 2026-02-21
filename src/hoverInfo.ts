import * as vscode from "vscode";

export enum SPModifierType
{
  Simple = 1,
  Adjunct = 2,
  Short = 3,
  SingleBracket = 4
}

export enum SPSupportType
{
  NotSupported = 0,
  PartiallySupported = 1,
  Supported = 2
}

export class SPSnippet 
{
  public snippetName: string;
  public snippet: string;
  public isSimpleModifier: boolean;
  public isAdjunctModifier: boolean;
  public isShortModifier: boolean;
  public isSingleBracketModifier: boolean;


  constructor(
    name: string,
    newSnippet: string,
    supportsSimpleModifier: boolean,
    supportsAdjunctModifier: boolean,
    supportsShortModifier: boolean,
    supportsSingleBracket: boolean
  ) {
    this.snippetName = name;
    this.snippet = newSnippet;
    this.isSimpleModifier = supportsSimpleModifier;
    this.isAdjunctModifier = supportsAdjunctModifier;
    this.isShortModifier = supportsShortModifier;
    this.isSingleBracketModifier = supportsSingleBracket;
  }
}

export class SPElement {
   element: string;
   snippets: SPSnippet [];



  constructor(
    name: string,
    newSnippets: SPSnippet[]
  ) {
    this.element = name;
    this.snippets = newSnippets;
  }

}

export class SPHoverInfo {
  markdownElements: SPElement[];

  hasAlexaSupport: SPSupportType;
  hasPollySupport: SPSupportType;
  hasPollyNeuralSupport: SPSupportType;
  hasMicrosoftAzureSupport: SPSupportType;
  hasGoogleSupport: SPSupportType;
  hasBixbySupport: SPSupportType;


  descriptionText: string;
  constructor(
    public names: SPElement[],
    public description: string,
    public alexaSupport: SPSupportType,
    public googleSupport: SPSupportType,
    public bixbySupport: SPSupportType,
    public pollySupport: SPSupportType,
    public pollyNeuralSupport: SPSupportType,
    public azureSupport: SPSupportType
  ) {
    this.markdownElements = names;
    this.descriptionText = description;
    this.hasAlexaSupport = alexaSupport;
    this.hasPollySupport = pollySupport;
    this.hasPollyNeuralSupport = pollyNeuralSupport;
    this.hasMicrosoftAzureSupport = azureSupport;
    this.hasGoogleSupport = googleSupport;
    this.hasBixbySupport = bixbySupport;
  }

  GetMarkdown(): vscode.MarkdownString {
    let labelList: Array<string> = [];

    this.names.forEach(function (speechPart)
    {
      labelList.push(speechPart.element);      
    });

    let markdownText: string = "**" + labelList.join("/") + "**  \n \n";

    markdownText = markdownText + this.description + " \n \n";

    markdownText = markdownText + "--- \n \n";

    markdownText = markdownText + "Alexa: " + this.GetSupport(this.hasAlexaSupport);

    markdownText = markdownText + ", Polly: " + this.GetSupport(this.hasPollySupport);

    markdownText = markdownText + ", Polly Neural: " + this.GetSupport(this.hasPollyNeuralSupport);

    markdownText = markdownText + ", Azure: " + this.GetSupport(this.hasMicrosoftAzureSupport);

    markdownText = markdownText + ", Samsung Bixby: " + this.GetSupport(this.hasBixbySupport);

    markdownText = markdownText + ", Google Actions: " + this.GetSupport(this.hasGoogleSupport);

    

    let retMarkdown: vscode.MarkdownString = new vscode.MarkdownString(
      markdownText
    );

    return retMarkdown;
  }


  GetSupport(supportType: SPSupportType) : string
  {
    var retVal : string;

    switch(supportType)
    {
      case SPSupportType.NotSupported:
        retVal = "_not supported_";
        break;  
      case SPSupportType.PartiallySupported:
        retVal = "_partially supported_";
        break;
      case SPSupportType.Supported:
        retVal = "_supported_";
        break;
    }
    return retVal;
  }

}


export var hoverInfoArr: SPHoverInfo[] = [
  new SPHoverInfo(
    [ new SPElement("address", [  new SPSnippet("address", "address", true, false, false, false) ])],
    "Speaks the value as a street address. \n ```text \n I'm at (150th CT NE, Redmond, WA)[address]. \n ```",
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("audio", [  ])],
    'Plays short, pre-recorded audio.  \n ```text \n !["https://intro.mp3"] \n Welcome back. \n ```',
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("break", [ new SPSnippet("break", "break:'${1|none,x-weak,weak,medium,strong,x-strong|}'", false, false, false, true),
       new SPSnippet("break short", "$0ms", false, false, false, true)
      ])],
    'A pause in speech. \n ```text \n Step 1, take a deep breath. [200ms] \n Step 2, exhale. \n Step 3, take a deep breath again. [break:"weak"] \n Step 4, exhale. \n ```',
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("characters", [new SPSnippet("characters", "characters", true, false, false, false)])],
    "Speaks a number or text as individual characters. \n ```text \n Countdown: (321)[characters] \n The word is spelled: (park)[chars] \n ```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),

  new SPHoverInfo(
    [new SPElement("date", [  new SPSnippet("date", " date:'${1|mdy,dmy,ymd,ydm,md,dm,ym,my,y,m,d|}'", true, false, false, false) ])],
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
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),

  new SPHoverInfo(
    [new SPElement("disappointed", [  new SPSnippet("disappointed", "disappointed:'${1|low,medium,high|}'", true, false, true, false), new SPSnippet("disappointed (short)", "disappointed", true, false, true, false)])],
    "Sets the spoken text to varying levels of disappointment. \n" +
      "```text \n" +
      '#[disappointed:"low"] \n' +
      "I am disappointed - low. \n \n" +
      'We can switch (from disappointed)[disappointed] to (really disappointed)[disappointed:"high"]. \n' +
      "``` \n \n" +
      "Set intensity to: low, medium (default), high",
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),
  new SPHoverInfo(
    [new SPElement("defaults", [ new SPSnippet("defaults", "defaults", false, false, true, false)])],
    "Sets the spoken text back to normal (default) settings after using another section such as: disappointed, dj, excited, newscaster, voice \n" +
      "```text \n" +
      "Normal speech. \n \n" +
      "#[dj] \n" +
      "Switching to a music/media announcer. \n \n" +
      "#[defaults] \n" +
      "Now back to normal speech. \n" +
      "```",
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),
  new SPHoverInfo(
    [new SPElement("dj",[ new SPSnippet("dj", "dj", false, false, true, false)])],
    "Sets the spoken text similar to how a music/media announcer would speak them.\n" +
      "```text \n" +
      "Normal speech. \n \n" +
      "#[dj] \n" +
      "Switching to a music/media announcer. \n \n" +
      "#[defaults] \n" +
      "Now back to normal speech. \n" +
      "```",
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),

  new SPHoverInfo(
    [new SPElement("emphasis", [ new SPSnippet("emphasis", "emphasis:'${1|strong,moderate,redurced,none|}'", true, false, false, false), new SPSnippet("emphasis (short)", "emphasis", true, false, false, false)])],
    'Add or remove emphasis from a word or phrase. \n ```text \n A (strong)[emphasis:"strong"] level \n ```',
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),

  new SPHoverInfo(
    [new SPElement("excited", [new SPSnippet("excited", "excited:'${1|low,medium,high|}'", true, false, true, false), new SPSnippet("excited (short)", "excited", true, false, true, false)])],
    "Sets the spoken text to varying levels of excitement. \n" +
      "Set intensity to: low, medium (default), high \n \n" +
      "```text \n" +
      ' #[excited:"high"] \n' +
      "I am excited - high. \n \n" +
      'We can switch (from excited)[excited] to (really excited)[excited:"high"]. \n' +
      "```",
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),

  new SPHoverInfo(
    [new SPElement("expletive", [ new SPSnippet("expletive", "expletive", true, false, false, false)]), new SPElement("bleep", [ new SPSnippet("bleep", "bleep", true, false, false, false)])],
    '"Bleep" out the content \n' +
      "```text \n" +
      "You can't say (word)[bleep] on TV. \n" +
      "You said (word)[bleep] and (word)[expletive] at school. \n" +
      "```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
  ),

  new SPHoverInfo(
    [new SPElement("fraction", [new SPSnippet("fraction", "fraction", true, false, false, false)])],
    "Speaks the value as a fraction. \n \n" +
      "```text \n" +
      "Add (2/3)[fraction] cup of milk. \n" +
      "Add (1+1/2)[fraction] cups of flour. \n " +
      "```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),



  new SPHoverInfo(
    [new SPElement("interjection", [new SPSnippet("interjection", "interjection", true, false, false, false)])],
    "Speaks the text in a more expressive voice. \n \n" +
      "```text \n" +
      "(Wow)[interjection], I didn't see that coming. \n" +
      "```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("ipa", [ new SPSnippet("ipa", "ipa:'$0'", true, false, false, false)   ])],
    "Provides a phonemic/phonetic pronunciation for the contained text using the International Phonetic Alphabet (IPA). \n \n" +
      "```text \n" +
      'You say, (pecan)[ipa:"pɪˈkɑːn"]. \n' +
      "I say, (pecan)[/ˈpi.kæn/]. \n" +
      "```",
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),
  new SPHoverInfo(
    [new SPElement("lang", [ new SPSnippet("lang", " lang:'${1|ar-AE,arb,ca-ES,cmn-CN,cs-CZ,cy-GB,da-DK,de-AT,de-CH,de-DE,en-AU,en-GB,en-GB-WLS,en-IE,en-IN,en-NZ,en-SG,en-US,en-ZA,es-ES,es-MX,es-US,fi-FI,fr-BE,fr-CA,fr-FR,hi-IN,is-IS,it-IT,ja-JP,ko-KR,nb-NO,nl-BE,nl-NL,pl-PL,pt-BR,pt-PT,ro-RO,ru-RU,sv-SE,tr-TR,yue-CN|}'", true, true, false, false) ])],
    "Sets the language. Words and phrases in other languages usually sound better with the lang tag. \n \n" +
      "```text \n" +
      '#[voice:"Brian";lang:"en-GB"] \n \n' +
      'In Paris, they pronounce it (Paris)[lang:"fr-FR"]. \n' +
      "```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.PartiallySupported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.PartiallySupported,
  ),
  new SPHoverInfo(
    [new SPElement("newscaster", [new SPSnippet("newscaster", "newscaster", false, false, true, false)])],
    "Sets the spoken text similar to how a news announcer would speak them. \n \n" +
      "```text \n" +
      "#[newscaster] \n" +
      "Switching to a news announcer. \n" +
      "```",
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  ),
  new SPHoverInfo(
    [new SPElement("ordinal", [ new SPSnippet("ordinal", "ordinal", true, false, false, false)])],
    "Speaks a number as an ordinal: first, second, third, etc. \n \n" +
      "```text \n" +
      "The others came in 2nd and (3)[ordinal]. \n" +
      "Your rank is (123)[ordinal]. \n" +
      "```",
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("phone", 
      [ new SPSnippet("phone", "phone", true,false, false, false), 
        new SPSnippet("phone (with country code)", "phone:'$0'", true, false, false, false)]),      
      new SPElement("telephone", 
       [  new SPSnippet("telephone", "telephone", true, false, false, false) ,
          new SPSnippet("telephone (with country code)", "telephone:'$0'", true, false, false, false) ])
     ],     
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
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.Supported,
    SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("pitch", [ new SPSnippet("pitch", "pitch:'${1|x-low,low,medium,high,x-high|}'", true, true, false, false)])],
    "Raise or lower the tone (pitch) of the speech. \n \n" +
      "```text \n" +
      'I can speak with my normal pitch, (but also with a much higher pitch)[pitch:"x-high"]. \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: x-low, low, medium (default), high, x-high",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.NotSupported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("rate", [ new SPSnippet("rate", "rate:'${1|x-slow,slow,medium,fast,x-fast|}'", true, true, false, false)])],
    "Modify the rate of the speech. \n \n" +
      "```text \n" +
      'When I wake up, (I speak quite slowly)[rate:"x-slow"]. \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: x-low, low, medium (default), high, x-high",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),

  new SPHoverInfo(
    [new SPElement("sub", [ new SPSnippet("sub", "sub:'$0'", true, false, false, false), new SPSnippet("sub short", "'$0'", true, false, false, false)   ])],
    "Substitute one word or phrase with a different word or phrase. Often used to expand/clarify abbreviations. \n \n" +
      "```text \n" +
      'My favorite chemical element is (Al)[sub:"aluminum"], \n' +
      'but Al prefers (Mg)["magnesium"]. \n' +
      "```",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("time", [ new SPSnippet("time", "time:'${1|hms12,hms24|}'", true, false, false, false)])],
    "Speak the value as a time. \n \n" +
      "```text \n" +
      'The time is (2:30pm)[time:"hms12"]. \n' +
      'The time is (2:30pm)[time:"hms24"]. \n' +
      "``` \n \n" +
      "Some implementations of SSML (Google Assistant) need a value the **format** attribute: hms12, hms24",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.NotSupported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("unit", [new SPSnippet("unit", "unit", true, false, false, false)])],
    "Speaks the value as a unit. Can be a number and unit or just a unit. \n " +
      "Units values include: 10 foot, 10 ft, 10ft, foot, ft, 6'3\" (depends on plaform) \n " +
      "Some implementations of SSML converts units to singular or plural depending on the number. \n \n " +
      "```text \n" +
      "I would walk (500 mi)[unit] \n" +
      "```",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.NotSupported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),
  new SPHoverInfo(
    [new SPElement("voice", [ 
      new SPSnippet("voice", "voice:'${1|device,Aditi,Adriano,Alba,Amy,Andrés,Aria,Arlet,Arthur,Astrid,Ayanda,Bianca,Brian,Burcu,Camila,Carmen,Carla,Celine,Chantal,Conchita,Cristiano,Daniel,Danielle,Dora,Elin,Emma,Enrique,Ewa,Filiz,Gabrielle,Geraint,Giorgio,Gregory,Gwyneth,Hala,Hannah,Hans,Hiujin,Ida,Inês,Isabelle,Ivy,Jacek,Jan,Jasmine,Jihye,Jitka,Joanna,Joey,Justin,Kajal,Karl,Kazuha,Kendra,Kevin,Kimberly,Laura,Lea,Liam,Lisa,Liv,Lotte,Lucia,Lupe,Mads,Maja,Marlene,Mathieu,Matthew,Maxim,Mia,Miguel,Mizuki,Naja,Nicole,Niamh,Ola,Olivia,Patrick,Pedro,Penelope,Raúl,Raveena,Rémi,Ricardo,Ruben,Russell,Ruth,Sabrina,Salli,Seoyeon,Sergio,Sofie,Stephen,Suvi,Takumi,Tatyana,Thiago,Tomoko,Vicki,Vitória,Zayd,Zeina,Zhiyu|}'", true, false, true, false),
      new SPSnippet("voice en-US", "voice:'${1|Ivy,Joanna,Joey,Justin,Kendra,Kimberly,Matthew,Salli,Kevin,Ruth|}';lang:'en-US'", true, false, true, false),
      new SPSnippet("voice en-AU", "voice:'${1|Nicole,Russell,Olivia|}';lang:'en-AU'", true, false, true, false),
      new SPSnippet("voice en-GB", "voice:'${1|Amy,Brian,Emma,Arthur|}';lang:'en-GB'", true, false, true, false),
      new SPSnippet("voice en-GB-WLS", "voice:'${1|Geraint|}';lang:'en-GB-WLS'", true, false, true, false),
      new SPSnippet("voice en-IN", "voice:'${1|Aditi,Raveena,Kajal|}';lang:'en-IN'", true, false, true, false),
      new SPSnippet("voice en-NZ", "voice:'${1|Aria|}';lang:'en-NZ'", true, false, true, false),
      new SPSnippet("voice en-SG", "voice:'${1|Olivia|}';lang:'en-SG'", true, false, true, false),
      new SPSnippet("voice en-ZA", "voice:'${1|Ayanda|}';lang:'en-ZA'", true, false, true, false),
      new SPSnippet("voice es-ES", "voice:'${1|Conchita,Enrique,Lucia,Sergio|}';lang:'es-ES'", true, false, true, false),
      new SPSnippet("voice es-MX", "voice:'${1|Mia,Andrés|}';lang:'es-MX'", true, false, true, false),
      new SPSnippet("voice es-US", "voice:'${1|Lupe,Penelope,Miguel|}';lang:'es-US'", true, false, true, false),
      new SPSnippet("voice fr-FR", "voice:'${1|Celine,Lea,Mathieu,Rémi|}';lang:'fr-FR'", true, false, true, false),
      new SPSnippet("voice fr-CA", "voice:'${1|Chantal,Gabrielle,Liam|}';lang:'fr-CA'", true, false, true, false),
      new SPSnippet("voice de-DE", "voice:'${1|Hans,Marlene,Vicki,Daniel;}';lang:'de-DE'", true, false, true, false),
      new SPSnippet("voice de-AT", "voice:'${1|Hannah|}';lang:'de-AT'", true, false, true, false),
      new SPSnippet("voice it-IT", "voice:'${1|Carla,Giorgio,Bianca,Adriano|}';lang:'it-IT'", true, false, true, false),
      new SPSnippet("voice pt-BR", "voice:'${1|Camila,Ricardo,Vitória,Thiago|}';lang:'pt-BR'", true, false, true, false),
      new SPSnippet("voice pt-PT", "voice:'${1|Inês,Cristiano|}';lang:'pt-PT'", true, false, true, false),
      new SPSnippet("voice ja-JP", "voice:'${1|Mizuki,Takumi,Kazuha,Tomoko|}';lang:'ja-JP'", true, false, true, false),
      new SPSnippet("voice ko-KR", "voice:'${1|Seoyeon|}';lang:'ko-KR'", true, false, true, false),
      new SPSnippet("voice cmn-CN", "voice:'${1|Zhiyu|}';lang:'cmn-CN'", true, false, true, false),
      new SPSnippet("voice yue-CN", "voice:'${1|Hiujin|}';lang:'yue-CN'", true, false, true, false),
      new SPSnippet("voice hi-IN", "voice:'${1|Aditi,Kajal|}';lang:'hi-IN'", true, false, true, false),
      new SPSnippet("voice tr-TR", "voice:'${1|Filiz,Burcu|}';lang:'tr-TR'", true, false, true, false),
      new SPSnippet("voice ar-AE", "voice:'${1|Zeina,Hala|}';lang:'ar-AE'", true, false, true, false),
      new SPSnippet("voice arb", "voice:'${1|Zeina,Hala|}';lang:'arb'", true, false, true, false),
      new SPSnippet("voice ru-RU", "voice:'${1|Tatyana,Maxim|}';lang:'ru-RU'", true, false, true, false),
      new SPSnippet("voice pl-PL", "voice:'${1|Ewa,Jacek,Jan,Maja,Ola|}';lang:'pl-PL'", true, false, true, false),
      new SPSnippet("voice ro-RO", "voice:'${1|Carmen|}';lang:'ro-RO'", true, false, true, false),
      new SPSnippet("voice sv-SE", "voice:'${1|Astrid,Elin|}';lang:'sv-SE'", true, false, true, false),
      new SPSnippet("voice da-DK", "voice:'${1|Naja,Mads,Sofie|}';lang:'da-DK'", true, false, true, false),
      new SPSnippet("voice nb-NO", "voice:'${1|Liv,Ida|}';lang:'nb-NO'", true, false, true, false),
      new SPSnippet("voice fi-FI", "voice:'${1|Suvi|}';lang:'fi-FI'", true, false, true, false),
      new SPSnippet("voice nl-NL", "voice:'${1|Lotte,Ruben|}';lang:'nl-NL'", true, false, true, false),
      new SPSnippet("voice nl-BE", "voice:'${1|Lisa|}';lang:'nl-BE'", true, false, true, false),
      new SPSnippet("voice is-IS", "voice:'${1|Dora,Karl|}';lang:'is-IS'", true, false, true, false),
      new SPSnippet("voice cy-GB", "voice:'${1|Gwyneth|}';lang:'cy-GB'", true, false, true, false),
      new SPSnippet("voice cs-CZ", "voice:'${1|Jitka|}';lang:'cs-CZ'", true, false, true, false),
      new SPSnippet("voice ca-ES", "voice:'${1|Arlet|}';lang:'ca-ES'", true, false, true, false)
    ])],
    "Sets the voice for the speech. The value is not validated. The formatter will use the value for a given voice if the platform supports it. \n \n " +
      "```text \n" +
      '#[voice:"Brian";lang:"en-GB"] \n' +
      "Brian from the UK. \n " +
      '#[voice:"device"] \n' +
      "Back to the device voice \n " +
      'Why do you keep switching voices (from one)[voice:"Brian"] (to the other)[voice:"Kendra"]? \n' +
      "``` \n \n" +
      "The **device** value removes any overrides, therefore using the device settings.",
    SPSupportType.Supported,
    SPSupportType.PartiallySupported,
    SPSupportType.NotSupported,
    SPSupportType.PartiallySupported,
    SPSupportType.PartiallySupported,
    SPSupportType.PartiallySupported,
  ),

  new SPHoverInfo(
    [new SPElement("volume", [ new SPSnippet("volume", "volume:'${1|silent,x-soft,soft,medium,loud,x-loud|}'", true, true, false, false)]), new SPElement("vol", [new SPSnippet("vol", "vol:'${1|silent,x-soft,soft,medium,loud,x-loud|}'", true, true, false, false)])],
    "Modify the volume of the speech. \n \n" +
      "```text \n" +
      "Normal volume for the first sentence. \n" +
      '(Louder volume for the second sentence)[volume:"x-loud"]. \n \n' +
      'Volume modifier (can be abbreviated)[vol:"soft"]. \n \n' +
      'I can combine (multiple values)[pitch:"low";rate:"slow";volume:"loud";voice:"Brian"] at once. \n' +
      "``` \n \n" +
      "Possible values: silent, x-soft, soft, medium (default), loud, x-loud",
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
      SPSupportType.Supported,
  ),

  new SPHoverInfo(
    [new SPElement("whisper", [new SPSnippet("whisper", "whisper", true, false, false, false)])],
    "Speak text in a whispered voice. \n \n " +
      "```text \n" +
      "I want to tell you a secret. \n" +
      "(I am not a real human.)[whisper] \n \n" +
      "``` \n \n" +
      "Since Google Assistant doesn’t have a whisper effect, through a configuration setting, you can either ignore the tag. Or use the **prosidy** tag.",

    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.Supported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
    SPSupportType.NotSupported,
  )
];
