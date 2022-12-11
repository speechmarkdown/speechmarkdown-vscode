import * as vscode from "vscode";
export declare enum SPModifierType {
    Simple = 1,
    Adjunct = 2,
    Short = 3,
    SingleBracket = 4
}
export declare enum SPSupportType {
    NotSupported = 0,
    PartiallySupported = 1,
    Supported = 2
}
export declare class SPSnippet {
    snippetName: string;
    snippet: string;
    isSimpleModifier: boolean;
    isAdjunctModifier: boolean;
    isShortModifier: boolean;
    isSingleBracketModifier: boolean;
    constructor(name: string, newSnippet: string, supportsSimpleModifier: boolean, supportsAdjunctModifier: boolean, supportsShortModifier: boolean, supportsSingleBracket: boolean);
}
export declare class SPElement {
    element: string;
    snippets: SPSnippet[];
    constructor(name: string, newSnippets: SPSnippet[]);
}
export declare class SPHoverInfo {
    names: SPElement[];
    description: string;
    alexaSupport: SPSupportType;
    googleSupport: SPSupportType;
    bixbySupport: SPSupportType;
    pollySupport: SPSupportType;
    pollyNeuralSupport: SPSupportType;
    azureSupport: SPSupportType;
    markdownElements: SPElement[];
    hasAlexaSupport: SPSupportType;
    hasPollySupport: SPSupportType;
    hasPollyNeuralSupport: SPSupportType;
    hasMicrosoftAzureSupport: SPSupportType;
    hasGoogleSupport: SPSupportType;
    hasBixbySupport: SPSupportType;
    descriptionText: string;
    constructor(names: SPElement[], description: string, alexaSupport: SPSupportType, googleSupport: SPSupportType, bixbySupport: SPSupportType, pollySupport: SPSupportType, pollyNeuralSupport: SPSupportType, azureSupport: SPSupportType);
    GetMarkdown(): vscode.MarkdownString;
    GetSupport(supportType: SPSupportType): string;
}
export declare var hoverInfoArr: SPHoverInfo[];
