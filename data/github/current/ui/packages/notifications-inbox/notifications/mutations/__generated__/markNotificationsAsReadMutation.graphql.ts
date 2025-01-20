/**
 * @generated SignedSource<<c6718665861e1f406d13f4f71bde94a8>>
 * @relayHash 494a601128f56dc8de6b41caac4f785b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 494a601128f56dc8de6b41caac4f785b

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationsAsReadInput = {
  clientMutationId?: string | null | undefined;
  ids: ReadonlyArray<string>;
};
export type markNotificationsAsReadMutation$variables = {
  input: MarkNotificationsAsReadInput;
};
export type markNotificationsAsReadMutation$data = {
  readonly markNotificationsAsRead: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsReadMutation$rawResponse = {
  readonly markNotificationsAsRead: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsReadMutation = {
  rawResponse: markNotificationsAsReadMutation$rawResponse;
  response: markNotificationsAsReadMutation$data;
  variables: markNotificationsAsReadMutation$variables;
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
    "concreteType": "MarkNotificationsAsReadPayload",
    "kind": "LinkedField",
    "name": "markNotificationsAsRead",
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
    "name": "markNotificationsAsReadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markNotificationsAsReadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "494a601128f56dc8de6b41caac4f785b",
    "metadata": {},
    "name": "markNotificationsAsReadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "89c6ec3caafbdb9c182e0e8ac6685c08";

export default node;
