/**
 * @generated SignedSource<<396ba012c41a3165409e070877f84dee>>
 * @relayHash 9fd211e9ada999fbd9d0193e7eaff36e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9fd211e9ada999fbd9d0193e7eaff36e

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type PullRequestRowCommentsSubscription$variables = {
  id: string;
};
export type PullRequestRowCommentsSubscription$data = {
  readonly pullRequestCommentsUpdated: {
    readonly id: string;
    readonly totalCommentsCount: number | null | undefined;
  };
};
export type PullRequestRowCommentsSubscription = {
  response: PullRequestRowCommentsSubscription$data;
  variables: PullRequestRowCommentsSubscription$variables;
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
    "name": "pullRequestCommentsUpdated",
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
        "name": "totalCommentsCount",
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
    "name": "PullRequestRowCommentsSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestRowCommentsSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "9fd211e9ada999fbd9d0193e7eaff36e",
    "metadata": {},
    "name": "PullRequestRowCommentsSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "c07750a7baf2631bfdee073a48c7ec32";

export default node;
