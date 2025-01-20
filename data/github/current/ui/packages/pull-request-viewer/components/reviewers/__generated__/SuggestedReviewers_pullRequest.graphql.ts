/**
 * @generated SignedSource<<6efb28796b9cd1af209858c209179ab5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SuggestedReviewers_pullRequest$data = {
  readonly id: string;
  readonly state: PullRequestState;
  readonly suggestedReviewers: ReadonlyArray<{
    readonly reviewer: {
      readonly avatarUrl: string;
      readonly id: string;
      readonly login: string;
      readonly url: string;
    };
  } | null | undefined>;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentType": "SuggestedReviewers_pullRequest";
};
export type SuggestedReviewers_pullRequest$key = {
  readonly " $data"?: SuggestedReviewers_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"SuggestedReviewers_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SuggestedReviewers_pullRequest",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SuggestedReviewer",
      "kind": "LinkedField",
      "name": "suggestedReviewers",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "reviewer",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "avatarUrl",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUpdate",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "dcbe5131f23e9b54792cc61976baa32c";

export default node;
