/**
 * @generated SignedSource<<8e9fb48620684ef7ff6c40411162fd25>>
 * @relayHash 3fb05766a6c88cc98148254d4ba5940e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3fb05766a6c88cc98148254d4ba5940e

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ViewerQuery$variables = Record<PropertyKey, never>;
export type ViewerQuery$data = {
  readonly viewer: {
    readonly login: string;
    readonly " $fragmentSpreads": FragmentRefs<"IssuesShowFragmentViewer">;
  };
};
export type ViewerQuery = {
  response: ViewerQuery$data;
  variables: ViewerQuery$variables;
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
    "name": "ViewerQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "IssuesShowFragmentViewer"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ViewerQuery",
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
            "name": "name",
            "storageKey": null
          },
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
    "id": "3fb05766a6c88cc98148254d4ba5940e",
    "metadata": {},
    "name": "ViewerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "f563f6fdb524672a32e2afc726187630";

export default node;
