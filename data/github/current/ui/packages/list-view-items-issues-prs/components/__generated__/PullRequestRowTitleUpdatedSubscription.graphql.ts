/**
 * @generated SignedSource<<c10d53c8ea83f5e527e2926eaf46a09e>>
 * @relayHash a94c38f511b0bf82679e4034de7dcaae
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a94c38f511b0bf82679e4034de7dcaae

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type PullRequestRowTitleUpdatedSubscription$variables = {
  id: string;
};
export type PullRequestRowTitleUpdatedSubscription$data = {
  readonly pullRequestTitleUpdated: {
    readonly id: string;
    readonly title: string;
    readonly titleHTML: string;
  };
};
export type PullRequestRowTitleUpdatedSubscription = {
  response: PullRequestRowTitleUpdatedSubscription$data;
  variables: PullRequestRowTitleUpdatedSubscription$variables;
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
    "name": "PullRequestRowTitleUpdatedSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestRowTitleUpdatedSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "a94c38f511b0bf82679e4034de7dcaae",
    "metadata": {},
    "name": "PullRequestRowTitleUpdatedSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "a2fdd16da7a5dc39dd035c3334c00473";

export default node;
