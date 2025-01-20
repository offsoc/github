/**
 * @generated SignedSource<<3ca00169cb37ac66909a3c92b289069d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestFilesViewerContent_viewer$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DiffsWithComments_viewer">;
  readonly " $fragmentType": "PullRequestFilesViewerContent_viewer";
};
export type PullRequestFilesViewerContent_viewer$key = {
  readonly " $data"?: PullRequestFilesViewerContent_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestFilesViewerContent_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestFilesViewerContent_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffsWithComments_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "83fb18640203614d148e50be758e88a5";

export default node;
