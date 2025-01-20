/**
 * @generated SignedSource<<32bea842b685e19977124237896b0300>>
 * @relayHash efc2589909958cd08a6fd4a6643b747c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID efc2589909958cd08a6fd4a6643b747c

import { ConcreteRequest, Query } from 'relay-runtime';
export type RepositoryContextQuery$variables = {
  limit: number;
};
export type RepositoryContextQuery$data = {
  readonly viewer: {
    readonly notificationRepositories: ReadonlyArray<{
      readonly repository: {
        readonly nameWithOwner: string;
      };
    }>;
  };
};
export type RepositoryContextQuery = {
  response: RepositoryContextQuery$data;
  variables: RepositoryContextQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RepositoryContextQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "RepositoryNotificationCounts",
            "kind": "LinkedField",
            "name": "notificationRepositories",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RepositoryContextQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "RepositoryNotificationCounts",
            "kind": "LinkedField",
            "name": "notificationRepositories",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "efc2589909958cd08a6fd4a6643b747c",
    "metadata": {},
    "name": "RepositoryContextQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6c31c009a93d35ff9489d3a132a0e21f";

export default node;
