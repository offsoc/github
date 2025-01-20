/**
 * @generated SignedSource<<2d513b0b2615ae14d0097c0a81ed3b51>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Diff_viewer$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_viewer" | "DiffLines_viewer">;
  readonly " $fragmentType": "Diff_viewer";
};
export type Diff_viewer$key = {
  readonly " $data"?: Diff_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"Diff_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Diff_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffFileHeaderListView_viewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffLines_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "f9e78914d1669910a9196a802d9af8aa";

export default node;
