/**
 * @generated SignedSource<<8dfa0f88c036c397d0524b6c3960b125>>
 * @relayHash 16bed8244ee96ad06b6638dbb86dd0ff
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 16bed8244ee96ad06b6638dbb86dd0ff

import { ConcreteRequest, Query } from 'relay-runtime';
export type DiffChatWrapper_ViewerQuery$variables = Record<PropertyKey, never>;
export type DiffChatWrapper_ViewerQuery$data = {
  readonly viewer: {
    readonly isCopilotDotcomChatEnabled: boolean;
  };
};
export type DiffChatWrapper_ViewerQuery = {
  response: DiffChatWrapper_ViewerQuery$data;
  variables: DiffChatWrapper_ViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isCopilotDotcomChatEnabled",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DiffChatWrapper_ViewerQuery",
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
    "name": "DiffChatWrapper_ViewerQuery",
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
    "id": "16bed8244ee96ad06b6638dbb86dd0ff",
    "metadata": {},
    "name": "DiffChatWrapper_ViewerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "4d1f99d4dad28f392f7ea1a3cecbcfff";

export default node;
