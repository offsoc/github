/**
 * @generated SignedSource<<e6910911539e819ce57322a76bb5132a>>
 * @relayHash 5b6695d0d52426caab20969458c7965f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 5b6695d0d52426caab20969458c7965f

import { ConcreteRequest, Query } from 'relay-runtime';
export type RelayRouteLazyLoadedQueryViewerQuery$variables = Record<PropertyKey, never>;
export type RelayRouteLazyLoadedQueryViewerQuery$data = {
  readonly viewer: {
    readonly login: string;
  };
};
export type RelayRouteLazyLoadedQueryViewerQuery = {
  response: RelayRouteLazyLoadedQueryViewerQuery$data;
  variables: RelayRouteLazyLoadedQueryViewerQuery$variables;
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
    "name": "RelayRouteLazyLoadedQueryViewerQuery",
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
    "name": "RelayRouteLazyLoadedQueryViewerQuery",
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
    "id": "5b6695d0d52426caab20969458c7965f",
    "metadata": {},
    "name": "RelayRouteLazyLoadedQueryViewerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "d9f81f7d57ab6555519824ade02c8fea";

export default node;
