/**
 * @generated SignedSource<<c1d4034d49ee9304b0046c90c3403e6b>>
 * @relayHash df686119d5caa11a8adecab8d8c96ffc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID df686119d5caa11a8adecab8d8c96ffc

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationAsUnreadInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type markAsUnreadMutation$variables = {
  input: MarkNotificationAsUnreadInput;
};
export type markAsUnreadMutation$data = {
  readonly markNotificationAsUnread: {
    readonly notificationThread: {
      readonly id: string;
      readonly isUnread: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsUnreadMutation$rawResponse = {
  readonly markNotificationAsUnread: {
    readonly notificationThread: {
      readonly id: string;
      readonly isUnread: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsUnreadMutation = {
  rawResponse: markAsUnreadMutation$rawResponse;
  response: markAsUnreadMutation$data;
  variables: markAsUnreadMutation$variables;
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
    "concreteType": "MarkNotificationAsUnreadPayload",
    "kind": "LinkedField",
    "name": "markNotificationAsUnread",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationThread",
        "kind": "LinkedField",
        "name": "notificationThread",
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
            "name": "isUnread",
            "storageKey": null
          }
        ],
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
    "name": "markAsUnreadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markAsUnreadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "df686119d5caa11a8adecab8d8c96ffc",
    "metadata": {},
    "name": "markAsUnreadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2d6fb3361bae035d774fac7cf5c84278";

export default node;
