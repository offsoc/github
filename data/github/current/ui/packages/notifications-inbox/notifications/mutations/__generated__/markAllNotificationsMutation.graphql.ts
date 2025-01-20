/**
 * @generated SignedSource<<86719e4f802eb683ff48bc074abbc885>>
 * @relayHash b7d13d1dd41ad7a0825ff93a1f687578
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b7d13d1dd41ad7a0825ff93a1f687578

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type NotificationStatus = "ARCHIVED" | "DONE" | "READ" | "UNREAD" | "%future added value";
export type MarkAllNotificationsInput = {
  clientMutationId?: string | null | undefined;
  query: string;
  state: NotificationStatus;
};
export type markAllNotificationsMutation$variables = {
  input: MarkAllNotificationsInput;
};
export type markAllNotificationsMutation$data = {
  readonly markAllNotifications: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAllNotificationsMutation$rawResponse = {
  readonly markAllNotifications: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAllNotificationsMutation = {
  rawResponse: markAllNotificationsMutation$rawResponse;
  response: markAllNotificationsMutation$data;
  variables: markAllNotificationsMutation$variables;
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
    "concreteType": "MarkAllNotificationsPayload",
    "kind": "LinkedField",
    "name": "markAllNotifications",
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
    "name": "markAllNotificationsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markAllNotificationsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "b7d13d1dd41ad7a0825ff93a1f687578",
    "metadata": {},
    "name": "markAllNotificationsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "a5bbceabd9e329b9fcccfaed2c491174";

export default node;
