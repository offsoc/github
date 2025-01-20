/**
 * @generated SignedSource<<b6aea1071a2e2945106640c7ecb83452>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestHeaderWrapper_user$data = {
  readonly " $fragmentSpreads": FragmentRefs<"HeaderRightSideContent_user">;
  readonly " $fragmentType": "PullRequestHeaderWrapper_user";
};
export type PullRequestHeaderWrapper_user$key = {
  readonly " $data"?: PullRequestHeaderWrapper_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestHeaderWrapper_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestHeaderWrapper_user",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderRightSideContent_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "c9fba0bdd2a134bebe089cee26ff9c26";

export default node;
