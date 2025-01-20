/**
 * @generated SignedSource<<4ceb0d4c3ed1f1d55a88c5bce67498d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffEntriesList_EntryItem_entry$data = {
  readonly path: string;
  readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_DiffEntry">;
  readonly " $fragmentType": "DiffEntriesList_EntryItem_entry";
};
export type DiffEntriesList_EntryItem_entry$key = {
  readonly " $data"?: DiffEntriesList_EntryItem_entry$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffEntriesList_EntryItem_entry">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffEntriesList_EntryItem_entry",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useFileDiffReference_DiffEntry"
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};

(node as any).hash = "eb7d43db9623680dc60c042aad9d97fc";

export default node;
