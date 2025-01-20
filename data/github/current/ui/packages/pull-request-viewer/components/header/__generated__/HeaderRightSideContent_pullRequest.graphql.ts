/**
 * @generated SignedSource<<816b60365cca3c1e061d09a79d5c9a29>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type HeaderRightSideContent_pullRequest$data = {
  readonly id: string;
  readonly state: PullRequestState;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewMenu_pullRequest">;
  readonly " $fragmentType": "HeaderRightSideContent_pullRequest";
};
export type HeaderRightSideContent_pullRequest$key = {
  readonly " $data"?: HeaderRightSideContent_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderRightSideContent_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderRightSideContent_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReviewMenu_pullRequest"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "086361516ee4f754649297dfa01c4d21";

export default node;
