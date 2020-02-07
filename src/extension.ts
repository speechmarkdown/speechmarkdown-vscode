/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import * as hoverInfo from "./hoverinfo";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("javascript", {
      provideHover(document, position, token) {
        const start = position;

        let index: number = position.character;

        //	var pos = position.line.lastIndexOf("locate", 15);

        const line = document.lineAt(position.line);

        let openBracket: number = line.text.lastIndexOf("[", index);

        let endBracket: number = line.text.indexOf("]", openBracket);

        if (
          openBracket > -1 &&
          endBracket > -1 &&
          index > openBracket &&
          index < endBracket
        ) {
          let foundText: string = line.text.substring(
            openBracket + 1,
            endBracket
          );

          // there may be a closing colon
          let colonIndex = foundText.indexOf(":");
          if (colonIndex > -1) foundText = foundText.substring(0, colonIndex);

          var hoverTextArr: vscode.MarkdownString[] = new Array();

          let foundInfo = hoverInfo.hoverInfoArr.find(
            x => x.merkdownElement === foundText
          );

          if (foundInfo) {
            let hoverRet: vscode.Hover = new vscode.Hover(
              foundInfo.GetMarkdown()
            );
            return hoverRet;
          }
        }

        return {
          contents: ["Hover " + index]
        };
      }
    })
  );
}
