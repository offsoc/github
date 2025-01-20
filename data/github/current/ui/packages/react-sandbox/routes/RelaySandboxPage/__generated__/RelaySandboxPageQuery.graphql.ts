/**
 * @generated SignedSource<<e195097986b96b494e281b7970e5ba2e>>
 * @relayHash d3896e465ab6b5f46935851e5d5d5fca
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d3896e465ab6b5f46935851e5d5d5fca

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RelaySandboxPageQuery$variables = Record<PropertyKey, never>;
export type RelaySandboxPageQuery$data = {
  readonly viewer: {
    readonly login: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"RelayRouteViewerFragViewer">;
};
export type RelaySandboxPageQuery = {
  response: RelaySandboxPageQuery$data;
  variables: RelaySandboxPageQuery$variables;
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
    "name": "RelaySandboxPageQuery",
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
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "RelayRouteViewerFragViewer"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelaySandboxPageQuery",
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
    "id": "d3896e465ab6b5f46935851e5d5d5fca",
    "metadata": {},
    "name": "RelaySandboxPageQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0ccb48344206e52770e6ec45d13fa299";

require('relay-runtime').PreloadableQueryRegistry.set(node.params.id, node);

export default node;
