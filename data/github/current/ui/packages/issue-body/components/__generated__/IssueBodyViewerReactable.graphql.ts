/**
 * @generated SignedSource<<8937b8a0eb264c86c6ee5cb676d90d62>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyViewerReactable$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ReactionViewerGroups">;
  readonly " $fragmentType": "IssueBodyViewerReactable";
};
export type IssueBodyViewerReactable$key = {
  readonly " $data"?: IssueBodyViewerReactable$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyViewerReactable">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyViewerReactable",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReactionViewerGroups"
    }
  ],
  "type": "Reactable",
  "abstractKey": "__isReactable"
};

(node as any).hash = "1a4e0cee28424a096dfda82f264a4ab6";

export default node;
