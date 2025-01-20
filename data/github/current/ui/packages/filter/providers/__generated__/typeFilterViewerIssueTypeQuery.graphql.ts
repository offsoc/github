/**
 * @generated SignedSource<<922f589302ea258d0240cca8c65bcefe>>
 * @relayHash c3666f29c9feb3c2e86787b98e9fe48a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c3666f29c9feb3c2e86787b98e9fe48a

import { ConcreteRequest, Query } from 'relay-runtime';
export type typeFilterViewerIssueTypeQuery$variables = Record<PropertyKey, never>;
export type typeFilterViewerIssueTypeQuery$data = {
  readonly viewer: {
    readonly suggestedIssueTypeNames: ReadonlyArray<string> | null | undefined;
  };
};
export type typeFilterViewerIssueTypeQuery = {
  response: typeFilterViewerIssueTypeQuery$data;
  variables: typeFilterViewerIssueTypeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "suggestedIssueTypeNames",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "typeFilterViewerIssueTypeQuery",
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
    "name": "typeFilterViewerIssueTypeQuery",
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
    "id": "c3666f29c9feb3c2e86787b98e9fe48a",
    "metadata": {},
    "name": "typeFilterViewerIssueTypeQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b464effe8e3d73669952ff2bc6578276";

export default node;
