/**
 * @generated SignedSource<<65018570996c86a1797476d5c9ae88e9>>
 * @relayHash 7d4f35f0d8f09a210fc0b0e155cfecb4
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7d4f35f0d8f09a210fc0b0e155cfecb4

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type PullRequestHeaderWrapperTitleSubscription$variables = {
  id: string;
};
export type PullRequestHeaderWrapperTitleSubscription$data = {
  readonly pullRequestTitleUpdated: {
    readonly id: string;
    readonly title: string;
    readonly titleHTML: string;
  };
};
export type PullRequestHeaderWrapperTitleSubscription = {
  response: PullRequestHeaderWrapperTitleSubscription$data;
  variables: PullRequestHeaderWrapperTitleSubscription$variables;
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
    "name": "pullRequestTitleUpdated",
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
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "titleHTML",
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
    "name": "PullRequestHeaderWrapperTitleSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestHeaderWrapperTitleSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "7d4f35f0d8f09a210fc0b0e155cfecb4",
    "metadata": {},
    "name": "PullRequestHeaderWrapperTitleSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "c57a938f5d560f2160a5a83261f058be";

export default node;
