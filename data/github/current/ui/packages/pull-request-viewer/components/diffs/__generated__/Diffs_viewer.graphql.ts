/**
 * @generated SignedSource<<1fe03b2d198fff9d814b1108026e300c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Diffs_viewer$data = {
  readonly " $fragmentSpreads": FragmentRefs<"Diff_viewer">;
  readonly " $fragmentType": "Diffs_viewer";
};
export type Diffs_viewer$key = {
  readonly " $data"?: Diffs_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"Diffs_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Diffs_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "Diff_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "92a858092a90f02181791cd7fa6ae135";

export default node;
