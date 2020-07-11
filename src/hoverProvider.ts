import * as vscode from "vscode";
import { hoverInfoArr, SPModifierType } from "./hoverInfo";


export class JSHoverProvider
implements vscode.HoverProvider, vscode.CompletionItemProvider {
provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
): vscode.ProviderResult<vscode.Hover> {
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
	  x.markdownElements.find(x => x.element === foundText)
	);

	if (foundInfo) {
	  let hoverRet: vscode.Hover = new vscode.Hover(foundInfo.GetMarkdown());
	  return hoverRet;
	}
  }

  return null;
}


provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken,
	context: vscode.CompletionContext
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> 
	{
		let index: number = position.character;

		var retResults = new vscode.CompletionList();

		const line = document.lineAt(position.line);

		var foundText: string = line.text.substring(index-2, index);

		var snippetItems : vscode.CompletionItem[] = [];


		if (foundText === ")[") 
		{      
			snippetItems = getModifiers(SPModifierType.Simple);			
		}
		else if(foundText === "#[")
		{
			snippetItems =  getModifiers(SPModifierType.Short);
		}

		else if(foundText === " [")
		{
			snippetItems =  getModifiers(SPModifierType.SingleBracket);			
		}
		else
		{
			foundText = line.text.substring(index-1, index);
			var semiSpace = line.text.substring(index-2, index);

			if(foundText === ';' || semiSpace === '; ')
			{
				snippetItems =getModifiers(SPModifierType.Adjunct);
			}
		}

		snippetItems.forEach(i => {
			retResults.items.push(i);	

		})
			
		retResults.isIncomplete = false;

		return retResults;
	}
}



function getModifiers(modType: SPModifierType) : Array<vscode.CompletionItem>  {

	var  retItems: Array<vscode.CompletionItem> = new Array<vscode.CompletionItem>();

	hoverInfoArr.forEach(x => {
		x.markdownElements?.forEach(me => {

			me.snippets?.forEach(s => {

				var isMatchingModifier;
				switch(modType)
				{
					case SPModifierType.Adjunct:
						isMatchingModifier = s.isAdjunctModifier;
						break;
					case SPModifierType.Short:
						isMatchingModifier = s.isShortModifier;
						break;
					case SPModifierType.Simple:
						isMatchingModifier = s.isSimpleModifier;
						break;
					case SPModifierType.SingleBracket:
						isMatchingModifier = s.isSingleBracketModifier;
						break;
				}

				if (isMatchingModifier) {
					const snippetCompletion = new vscode.CompletionItem(s.snippetName);

					console.log('adding snippet: ' + s.snippetName);

					snippetCompletion.insertText = new vscode.SnippetString(
						s.snippet
					);
					snippetCompletion.documentation = new vscode.MarkdownString(
						x.GetMarkdown().value
					);

					snippetCompletion.kind = vscode.CompletionItemKind.Snippet;

					retItems.push(snippetCompletion);
				}
			});
		});
	});

	return retItems;
}

