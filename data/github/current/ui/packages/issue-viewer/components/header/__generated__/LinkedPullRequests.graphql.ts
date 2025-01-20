/**
 * @generated SignedSource<<eb9fcc5721747fc24ca96fda03db70f6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type LinkedPullRequests$data = {
  readonly linkedPullRequests: {
    readonly nodes: ReadonlyArray<{
      readonly isDraft: boolean;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: PullRequestState;
      readonly " $fragmentSpreads": FragmentRefs<"LinkedPullRequest">;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly repository: {
    readonly nameWithOwner: string;
  };
  readonly " $fragmentType": "LinkedPullRequests";
};
export type LinkedPullRequests$key = {
  readonly " $data"?: LinkedPullRequests$data;
  readonly " $fragmentSpreads": FragmentRefs<"LinkedPullRequests">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameWithOwner",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LinkedPullRequests",
  "selections": [
    (v0/*: any*/),
    {
      "alias": "linkedPullRequests",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 10
        },
        {
          "kind": "Literal",
          "name": "includeClosedPrs",
          "value": false
        },
        {
          "kind": "Literal",
          "name": "orderByState",
          "value": true
        }
      ],
      "concreteType": "PullRequestConnection",
      "kind": "LinkedField",
      "name": "closedByPullRequestsReferences",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequest",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
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
              "kind": "ScalarField",
              "name": "isDraft",
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "LinkedPullRequest"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "8f9873eeccc20817002499d953d9fd2e";

export default node;
