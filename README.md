# Speech Markdown

This extentsion supports snippets, hover-over, syntax highlighting of Speech Markdown. Speech Markdown is a text-to-speech formatting for content authors, designers, and developers. Converts to SSML while handling inconsistencies across Amazon Alexa & Google Assistant.

[Speech Markdown](https://speechmarkdown.org)

## Features

- [Speech Markdown Preview](#speech-markdown-preview)
- [IntelliSense](#intellisense)
- [Syntax Highlighting](#syntax-highlighting)
- [Hover over](#hover-over)
- [Comprehensive Snippets](#snippets)

### Speech Markdown Preview

Speech Markdown outputs platform-compatible Speech Synthesis Markup Language (SSML). Selecting Speech Markdown in an editor, right-clicking and selecting the "Speech Markdown to SSML" menu option provides SSML output for all supported platforms. At the time of this release (v0.0.8) this includes:

- Alexa
- Google Assistant
- Samsung Bixby
- Plain Text

The resulting SSML is displayed in the Speech Markdown output channel.

For those that prefer keyboard shortcuts, use Ctrl+Shift+L.

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/markdownpref.gif" width="75%" alt="Speech Markdown Preview"/>

By default, the starting and ending speak tags are included in the output. This can be disabled in Settings -> Extensions -> SpeechMarkdown -> Include Speak Tags. Here are the current configuration options:

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/config01.png" width="75%" alt="Configuration"/>

### IntelliSense

As of version 0.0.6, IntelliSense is supported in strings. By default, Visual Studio Code does not support IntelliSense in strings. In order to enable it, please see section [Enable Intellisense in TypeScript and JavaScript](#enable-intellisense-in-typescript-and-javascript). 

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/intellisense01.gif" width="60%" alt="Syntax highlighting example"/>

Typing any of the following and using ctrl+space will trigger suggestions:

- #[
- (sometext)[
- [
- ; (when used within the brackets of the samples above)

### Syntax Highlighting

Syntax highlighting is supported in JSON, JavaScript, and TypeScript. Any Speech Markdown tags will be highligted within string literals.

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/syntaxhighlights.png" width="60%" alt="Syntax highlighting example"/>

Languages that support Speech Markdown syntax highlighting are:

- JavaScript
- TypeScript
- JSON
- YAML

### Hover Over

Hover over the mark up text for additional information.

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/hoverover.png" width="50%" alt="Hover over example"/>

### Snippets

All Speech Markdown snippets start with "smd." Here's a list of available snippets along with sample Speech Markdown it produces.

- smd address - Speaks the selected text as a street address.
```
I'm at (150th CT NE, Redmond, WA)[address].
```
- smd audio - Plays short, pre-recorded audio. Value in the tag should be a fully qualified URL to a publically accessible audio file.
```
!["https://intro.mp3"] Welcome back.
```
- smd bleep - 'Bleep' out the content.
```
You can't say (word)[bleep] on TV.
```
- smd break - A pause in speech. Valid values are none, x-weak, weak, medium, strong, x-strong.
```
A pause [break:"250ms"] then continue.
```
- smd break short - A pause in speech. Value is set in milliseconds or seconds.
```
A pause [250ms] then continue. A longer pause [1s] then continue.
```
- smd characters - Speaks a number or text as individual characters.
```
Countdown: (321)[characters]
The word is spelled: (park)[characters]
```
- smd date - Speak the text as a date. Valid date format values are mdy, dmy, ymd (not universally supported), ydm, md, dm, ym, my, y, m, d.
```
The date is (10-11-12)[date:"mdy"].     // October 11th, 2012
The date is (10-11-12)[date:"dmy"].     // November 10th, 2012
The date is (10-11-12)[date:"ymd"].     // Nov 12th, 2010
The date is (10-11-12)[date:"ydm"].     // December 11th, 2010
The date is (10-11)[date:"md"].         // October 11th
The date is (10-11)[date:"dm"].         // November 10th
The date is (10-11)[date:"ym"].         // November 2010
The date is (10-11)[date:"my"].         // October 2011
The date is (10)[date:"y"].             // 2010
The date is (10)[date:"m"].             // October
The date is (10)[date:"d"].             // 10th
```
- smd disappointed - Sets the spoken text to varying levels of disappointment. Valid disappointed modifiers are low, medium (default), high.
```
We can switch (from disappointed)[disappointed] to (really disappointed)[disappointed:"high"].
```
- smd emphasis - Add or remove emphasis from a word or phrase. Valid values are strong, moderate (default), reduced, none.
```
A (strong)[emphasis:"strong"] level
```
- smd excited - Sets the spoken text to varying levels of excitement. Valid values are strong, moderate (default), reduced, none.
```
We can switch (from excited)[excited] to (really excited)[excited:"high"].
```
- smd expletive - 'Bleep' out the content.
```
You said (word)[expletive] at school.
```
- smd fraction - Speaks the value as a fraction.
```
Add (2/3)[fraction] cup of milk.
Add (1+1/2)[fraction] cups of flour.
```
- smd interjection - Speaks the text in a more expressive voice.
```
(Wow)[interjection], I didn't see that coming.
```
- smd ipa - Provides a phonemic/phonetic pronunciation for the contained text using the International Phonetic Alphabet (IPA).
```
You say, (pecan)[ipa:"pɪˈkɑːn"].
```
- smd lang - Add a lang modifier. Valid values are en-US, en-AU, en-GB, en-IN, de-DE, es-ES, it-IT,j a-JP, fr-FR.
```
In Paris, they pronounce it (Paris)[lang:"fr-FR"].
```
- smd number - Speaks a number as a cardinal: one, twenty, twelve thousand three hundred forty five, etc. (same as cardinal)
```
One, two, (3)[number].
```
- smd ordinal - Speaks a number as an ordinal: first, second, third, etc.
```
The others came in 2nd and (3)[ordinal].
```
- smd phone - Speak the number/value as a 7-digit or 10-digit telephone number.
```
My number is NOT (8675309)[phone:"1"].
```
- smd pitch - Raise or lower the tone (pitch) of the speech. Valid values are x-low, low, medium (default), high, x-high.
```
I can speak with my normal pitch, (but also with a much higher pitch)[pitch:"x-high"].
```
- smd rate - Modify the rate of the speech. Valid values are x-slow, slow, medium (default), fast, x-fast.
```
When I wake up, (I speak quite slowly)[rate:"x-slow"].
```
- smd sub - Substitute one word or phrase with a different word or phrase. Often used to expand/clarify abbreviations.
```
My favorite chemical element is (Al)[sub:"aluminum"],
but Al prefers (Mg)["magnesium"].
```
- smd time - Add a time modifier. Valid values are hms12, hms24.
```
The time is (2:30pm)[time:"hms12"].
The time is (2:30pm)[time:"hms24"].
```
- smd unit - Speaks the value as a unit. Can be a number and unit or just a unit. (e.g. 10 foot, 10 ft, 10 mi, foot, ft, 6'3")
```
I would walk (500 mi)[unit]
```
- smd volume - Modify the volume of the speech. Valid volume modifiers are silent, x-soft, soft, medium, loud, x-loud. Default to medium if not specified.
```
Normal volume for the first sentence. (Louder volume for the second sentence)[volume:"x-loud"].
```
- smd voice - Apply voice modifier and use any Alexa voice. Valid values are Ivy,Joanna, Joey, Justin,Kendra, Kimberly, Matthew, Salli, Nicole, Russell, Amy, Brian, Emma, Aditi, Raveena, Hans, Marlene, Vicki, Conchita, Enrique, Carla, Giorgio, Mizuki, Takumi, Celine, Lea, and Mathieu.
```
Why do you keep switching voices (from one)[voice:"Brian"] (to the other)[voice:"Kendra"]?
```
- smd voice default - Sets the spoken text back to the normal voice for the plaform. Useful when switching to different voices.
```
#[defaults] Now back to normal speech.
```
- smd voice device - Apply voice modifier and switch back to the default device voice.
```
#[voice:'device'] Now back to normal speech.
```
- smd voice dj - Sets the spoken text similar to how a music/media announcer would speak them.
```
#[dj] Welcome back to the Morning Zoo!
```
- smd voice de-DE - Apply voice modifier and limit to de-DE Alexa voices. Valid values are Hans, Marlene, and Vicki.
```
(Wie geht's?)[voice:'Vicki';lang:'de-DE']
```
- smd voice en-AU - Apply voice modifier and limit to en-AU Alexa voices. Valid values are Nicole and Russell.
```
(Bob's gone walkabout)[voice:'Nicole';lang:'en-AU']
```
- smd voice en-ES - Apply voice modifier and limit to es-ES Alexa voices. Valid values are Conchita and Enrique.
```
(Ser pan comido)[voice:'Conchita';lang:'en-ES']
```
- smd voice en-GB - Apply voice modifier and limit to en-GB Alexa voices. Valid values are Amy, Brian, and Emma.
```
(Look on the bright side of life)[voice:'Brian';lang:'en-GB']
```
- smd voice en-IN - Apply voice modifier and limit to en-IN Alexa voices. Valid values are Aditi and Raveena.
```
(How are you?)[voice:'Aditi';lang:'en-IN']
```
- smd voice en-US - Apply voice modifier and limit to en-US Alexa voices. Valid values are Ivy, Joanna, Joey, Justin, Kendra, Kimberly, Matthew, and Salli.
```
(I don't sound like Alexa.)[voice:'Salli';lang:'en-US']
```
- smd voice fr-FR - Apply voice modifier and limit to fr-FR Alexa voices. Valid values are Celine, Lea, and Mathieu.
```
(Ça marche!)[voice:'Mathieu';lang:'fr-FR']
```
- smd voice it-IT - Apply voice modifier and limit to it-IT Alexa voices. Valid values are Carla and Giorgio.
```
(In bocca al lupo)[voice:'Carla';lang:'it-IT']
```
- smd voice ja-JP - Apply voice modifier and limit to ja-JP Alexa voices. Valid values are Mizuki and Takumi.
```
(海千山千)[voice:'Mizuki';lang:'ja-JP']
```
- smd voice newscaster - Sets the spoken text similar to how a news announcer would speak them.
```
#[newscaster] And now for today's top stories.
```
- smd whisper - Speak text in a whispered voice.
```
I want to tell you a secret. (I am not a real human.)[whisper]
```
There are two approaches to applying snippets.

#### Text Selection

1. Highlight the text.
2. Select F1
3. Locate the _Insert Snippets_ command
4. Locate the Speech Markdown snippet

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/snippetsample01.gif" width="80%" alt="Snippet text selection"/>

#### Insert Snippet

1. Position the cursor in the string literal where you want to insert a snippet.
2. Type "smd" and use _ctrl+space bar_
3. Select the snippet

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/snippetsample02.gif" width="65%" alt="Snippet text selection"/>

#### Enable Intellisense in TypeScript and JavaScript

By default Visual Studio Code does not provide IntelliSense handling in strings. For more information, please see:

[TS/JS Path Quick Suggestion IntelliSense Does Not Work Unless QuickSuggestions.strings is enabled #23962](https://github.com/microsoft/vscode/issues/23962)

**NOTE:** IntelliSense in strings is _not_ available in JSON or YAML. If you wish to use Intellisense
in JSON files you can temporarily change the file extension to _js_.

If you wish to enabled IntelliSense in strings, then apply the following settings to your project folder.

1. Create a .vscode folder
2. Ad the following settings a new settings.json file:

```json
 "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
  }
```

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/enableperproject.png" width="80%" alt="Intellisense Directions"/>

Once configured, then IntelliSense works in JavaScript and TypeScript:

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/snippetsample02.gif" width="80%" alt="IntelliSense Sample Snippets"/>
