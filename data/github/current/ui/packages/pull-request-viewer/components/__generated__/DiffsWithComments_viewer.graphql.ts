/**
 * @generated SignedSource<<9d703d499899488e57a361000869b78d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffsWithComments_viewer$data = {
  readonly " $fragmentSpreads": FragmentRefs<"CommitDiffHeading_viewer" | "Diffs_viewer" | "FilesChangedHeading_viewer">;
  readonly " $fragmentType": "DiffsWithComments_viewer";
};
export type DiffsWithComments_viewer$key = {
  readonly " $data"?: DiffsWithComments_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffsWithComments_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffsWithComments_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CommitDiffHeading_viewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "Diffs_viewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FilesChangedHeading_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "1e5bf1264109d0d71abecb6a6f3dd657";

export default node;
