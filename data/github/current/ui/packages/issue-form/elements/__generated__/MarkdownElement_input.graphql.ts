/**
 * @generated SignedSource<<cf0246500b34656f7166701802f7ac76>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MarkdownElement_input$data = {
  readonly contentHTML: string;
  readonly " $fragmentType": "MarkdownElement_input";
};
export type MarkdownElement_input$key = {
  readonly " $data"?: MarkdownElement_input$data;
  readonly " $fragmentSpreads": FragmentRefs<"MarkdownElement_input">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MarkdownElement_input",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "contentHTML",
      "storageKey": null
    }
  ],
  "type": "IssueFormElementMarkdown",
  "abstractKey": null
};

(node as any).hash = "bcf5223d492443ecf5db4594632948d9";

export default node;
