/**
 * @generated SignedSource<<bbce1b358b480d8e8e5e493004fe77a8>>
 * @relayHash 64df6a74553871c9cc2d1f0754a554da
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 64df6a74553871c9cc2d1f0754a554da

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnsubscribeFromNotificationsInput = {
  clientMutationId?: string | null | undefined;
  ids: ReadonlyArray<string>;
};
export type unsubscribeFromNotificationsMutation$variables = {
  input: UnsubscribeFromNotificationsInput;
};
export type unsubscribeFromNotificationsMutation$data = {
  readonly unsubscribeFromNotifications: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type unsubscribeFromNotificationsMutation$rawResponse = {
  readonly unsubscribeFromNotifications: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type unsubscribeFromNotificationsMutation = {
  rawResponse: unsubscribeFromNotificationsMutation$rawResponse;
  response: unsubscribeFromNotificationsMutation$data;
  variables: unsubscribeFromNotificationsMutation$variables;
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
    "concreteType": "UnsubscribeFromNotificationsPayload",
    "kind": "LinkedField",
    "name": "unsubscribeFromNotifications",
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
    "name": "unsubscribeFromNotificationsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unsubscribeFromNotificationsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "64df6a74553871c9cc2d1f0754a554da",
    "metadata": {},
    "name": "unsubscribeFromNotificationsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "a182350b35799138b7089e07052e9909";

export default node;
