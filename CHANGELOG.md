# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Known issue with phonemes in ipa tags that include quotes

## [0.0.9] - 2021-01-26

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
