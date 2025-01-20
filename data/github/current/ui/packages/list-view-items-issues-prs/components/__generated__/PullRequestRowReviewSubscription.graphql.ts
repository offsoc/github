/**
 * @generated SignedSource<<ad60179857e9359e68820de745607c55>>
 * @relayHash f7a0455deeee4e2cb604d181c34d2419
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f7a0455deeee4e2cb604d181c34d2419

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type PullRequestReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | "%future added value";
export type PullRequestRowReviewSubscription$variables = {
  id: string;
};
export type PullRequestRowReviewSubscription$data = {
  readonly pullRequestReviewDecisionUpdated: {
    readonly id: string;
    readonly reviewDecision: PullRequestReviewDecision | null | undefined;
  };
};
export type PullRequestRowReviewSubscription = {
  response: PullRequestRowReviewSubscription$data;
  variables: PullRequestRowReviewSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "PullRequest",
    "kind": "LinkedField",
    "name": "pullRequestReviewDecisionUpdated",
    "plural": false,
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
        "name": "reviewDecision",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestRowReviewSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestRowReviewSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "f7a0455deeee4e2cb604d181c34d2419",
    "metadata": {},
    "name": "PullRequestRowReviewSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "25171224ff286ab953decc6e4bf6938a";

export default node;
