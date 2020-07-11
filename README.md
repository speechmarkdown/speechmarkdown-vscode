# Speech Markdown

This extentsion supports snippets, hover-over, syntax highlighting of Speech Markdown. Speech Markdown is a text-to-speech formatting for content authors, designers, and developers. Converts to SSML while handling inconsistencies across Amazon Alexa & Google Assistant.

[Speech Markdown](https://speechmarkdown.org)

## Features

- Intellisense
- Syntax Highlighting
- Hover over informational text
- Comprehensive Snippets


<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/smd-demo-1.gif" width="75%" alt="Speech Markdown Visual Studio Code Sample"/>

### IntelliSense

As of version 0.0.6, IntelliSense is supported in strings. By default, Visual Studio Code does not support IntelliSense in strings. In order to enable it, please see section [Enable Intellisense in TypeScript, JavaScript](enable-intellisense). 

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
- YAML (new)

### Hover Over

Hover over the mark up text for additional information.

<img src="https://raw.githubusercontent.com/speechmarkdown/speechmarkdown-vscode/master/images/hoverover.png" width="50%" alt="Hover over example"/>

### Snippets

All Speech Markdown snippets start with "smd."

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

#### <a name="enable-intellisense"></a> Enable Intellisense in TypeScript, JavaScript

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
