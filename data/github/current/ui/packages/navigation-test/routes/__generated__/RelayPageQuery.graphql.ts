/**
 * @generated SignedSource<<0f0feadb871adf3c258eaaca940de02e>>
 * @relayHash 4b3c4dfc6307087259496d0075611ec2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4b3c4dfc6307087259496d0075611ec2

import { ConcreteRequest, Query } from 'relay-runtime';
export type RelayPageQuery$variables = Record<PropertyKey, never>;
export type RelayPageQuery$data = {
  readonly viewer: {
    readonly login: string;
  };
};
export type RelayPageQuery = {
  response: RelayPageQuery$data;
  variables: RelayPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "4b3c4dfc6307087259496d0075611ec2",
    "metadata": {},
    "name": "RelayPageQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "680096acc5bf5e5220afb17ddd5c3852";

export default node;
