/**
 * @generated SignedSource<<d7e82d4d536a8171e199f63322d82ad4>>
 * @relayHash 32bb1b62d84c9be05dfe4a93e598c82e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 32bb1b62d84c9be05dfe4a93e598c82e

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationsAsUnreadInput = {
  clientMutationId?: string | null | undefined;
  ids: ReadonlyArray<string>;
};
export type markNotificationsAsUnreadMutation$variables = {
  input: MarkNotificationsAsUnreadInput;
};
export type markNotificationsAsUnreadMutation$data = {
  readonly markNotificationsAsUnread: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsUnreadMutation$rawResponse = {
  readonly markNotificationsAsUnread: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsUnreadMutation = {
  rawResponse: markNotificationsAsUnreadMutation$rawResponse;
  response: markNotificationsAsUnreadMutation$data;
  variables: markNotificationsAsUnreadMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "MarkNotificationsAsUnreadPayload",
    "kind": "LinkedField",
    "name": "markNotificationsAsUnread",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "markNotificationsAsUnreadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markNotificationsAsUnreadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "32bb1b62d84c9be05dfe4a93e598c82e",
    "metadata": {},
    "name": "markNotificationsAsUnreadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "714b1099f3fb76edbb690cefdf2de75b";

export default node;
