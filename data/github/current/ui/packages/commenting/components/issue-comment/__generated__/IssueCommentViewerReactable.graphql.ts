/**
 * @generated SignedSource<<3a42838d7d6a5eefa38d5b4d74df6d61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentViewerReactable$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ReactionViewerGroups">;
  readonly " $fragmentType": "IssueCommentViewerReactable";
};
export type IssueCommentViewerReactable$key = {
  readonly " $data"?: IssueCommentViewerReactable$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentViewerReactable">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueCommentViewerReactable",
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

(node as any).hash = "7bcfa6327b22a2529396680ed18777f7";

export default node;
