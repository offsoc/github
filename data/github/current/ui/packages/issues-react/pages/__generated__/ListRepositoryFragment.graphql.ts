/**
 * @generated SignedSource<<447d179e47066a6b77c555255a63c6af>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListRepositoryFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"SearchRepositoryFragment">;
  readonly " $fragmentType": "ListRepositoryFragment";
};
export type ListRepositoryFragment$key = {
  readonly " $data"?: ListRepositoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListRepositoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListRepositoryFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SearchRepositoryFragment"
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "43412226b117b1577ed7fcaed18f763d";

export default node;
