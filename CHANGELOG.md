# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.18] - 2026-02-21

- Updated AWS Polly service endpoint regions list to include all current AWS regions
- AWS Secret Access Key is now stored securely using VS Code SecretStorage (OS credential store) instead of plaintext settings
- Added "Speech Markdown: Set AWS Secret Access Key" command to securely enter and save the AWS secret key
- Added "Speech Markdown: Clear AWS Secret Access Key" command to remove the stored secret
- Automatic migration of existing plaintext secret from settings to SecretStorage on first activation
- Removed `speechmarkdown.aws.secretAccessKey` configuration setting

## [0.0.17] - 2026-02-21

- fixed typos in snippets

## [0.0.16] - 2026-02-21

- Added new Polly voices and language codes to snippets
- Upgraded to speechmarkdown-js 2.3.0
- Added support for new voice platforms in speechmarkdown-js 2.3.0

## [0.0.15] - 2024-04-27

- Added new Polly voices to snippets
- Supported VoiceId mappings for AWS Polly client
- Minor bug fixes

## [0.0.14] - 2023-03-25

- Minor readme updates
- Upgraded dependency versions
- Added ap-south-1 to list of AWS regions in extension configuration
- Required minimum 1.76.0 engines.vscode

## [0.0.13] - 2022-12-23

- Fixed typos
- Upgraded to speechmarkdown-js 2.1.0

## [0.0.12] - 2022-12-11

- Play SSML generated from Speech Markdown through Amazon Polly or Amazon Polly Neural

## [0.0.11] - 2022-12-08

- Upgraded to speech-markdown 2.0.0
- Upgraded dependent libraries to latest
- Updated hover over information to be current with speechmarkdown-js 2.0.0
- Added support for the following providers for "Speech Markdown to SSML" context menu:
  - amazon-polly
  - amazon-polly-neural
  - microsoft-azure

## [0.0.10] - 2021-01-26

- Upgraded speechmarkdown-js to 1.8

## [0.0.9] - 2020-07-17

- Removed support for cardinal modifier as it is not supported in SpeechMarkdown
- Changed default SSML output to include speak tags
- Added four configuration settings:
  - speechmarkdown.includeFormatterComment
  - speechmarkdown.includeParagraphTags
  - speechmarkdown.includeSpeakTags
  - speechmarkdown.preserveEmptyLines

## [0.0.8] - 2020-07-14

- Output selected text in SpeechMarkdown output channel
- Added an editor context menu option which provides SSML that results from selected Speech Markdown text.

## [0.0.7] - 2020-07-12

- Corrected snippet typos and updated snippet documentation.

## [0.0.6] - 2020-07-11

- Completion handlers for JSON, YAML, JavaScript, and TypeScript (use Ctrl+space bar for autocompletion)
- Removed documentation images from deployed package to reduce package size
- Updated dependent packages for vulnerability fixes
- Fixed the smd rate and smd time snippets
- Moved Salli Alexa voice to en-US from en-AU
- Corrected typo in smd voice fr-FR snippet
- Syntax highlighing for short form Speech Markdown for emphasis

## [0.0.5] - 2020-02-23

- Added snippets for all formatting tags
- Added an indicator in hover over text for Bixby support
- Updated ReadMe documentation to show how to enabled IntelliSense in strings for JavaScript and TypeScript
- Significant updates to tighten the Speech Markdown grammar by using targeted Regular Expressions
- Added syntax highlighting for audio tag
- Added hover over support for YAML

## [0.0.4] - 2020-02-22

- Added YAML syntax highlighting support for Speech Markdown

## [0.0.3] - 2020-02-18

- listing Bixby in hover over information

## [0.0.2] - 2020-02-16

- basic smd snippets
- Speech Markdown syntax highlighting for javascript, typescript, and json
- Speech Markdown hover over support for javascript, typescript, and json
