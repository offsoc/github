/**
 * @generated SignedSource<<15e5442f87cfbac80ba91acdb785589d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchRepositoryFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"SearchBarRepositoryFragment" | "SearchListRepo">;
  readonly " $fragmentType": "SearchRepositoryFragment";
};
export type SearchRepositoryFragment$key = {
  readonly " $data"?: SearchRepositoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SearchRepositoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SearchRepositoryFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SearchBarRepositoryFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SearchListRepo"
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "0ec85edcae4573e0d7b45e50e9557d69";

export default node;
