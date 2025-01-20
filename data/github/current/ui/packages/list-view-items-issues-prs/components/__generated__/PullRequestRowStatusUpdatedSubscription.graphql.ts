/**
 * @generated SignedSource<<d6c74b1c70ffb3ca3b1b0aca33ad7ccc>>
 * @relayHash 62f0856d23072df832d99c11f2061ca2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 62f0856d23072df832d99c11f2061ca2

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type PullRequestRowStatusUpdatedSubscription$variables = {
  id: string;
};
export type PullRequestRowStatusUpdatedSubscription$data = {
  readonly pullRequestStatusUpdated: {
    readonly id: string;
    readonly isDraft: boolean;
    readonly state: PullRequestState;
  };
};
export type PullRequestRowStatusUpdatedSubscription = {
  response: PullRequestRowStatusUpdatedSubscription$data;
  variables: PullRequestRowStatusUpdatedSubscription$variables;
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
    "name": "pullRequestStatusUpdated",
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
        "name": "state",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "isDraft",
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
    "name": "PullRequestRowStatusUpdatedSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestRowStatusUpdatedSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "62f0856d23072df832d99c11f2061ca2",
    "metadata": {},
    "name": "PullRequestRowStatusUpdatedSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "2c6fa54e180c24a3939b45f4ed793005";

export default node;
