/**
 * @generated SignedSource<<36ef07b966c5688a182e7dc12dcfc5d1>>
 * @relayHash 3731f12cfeeced568c221d72ca4d6093
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3731f12cfeeced568c221d72ca4d6093

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationAsDoneInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type markAsDoneMutation$variables = {
  input: MarkNotificationAsDoneInput;
};
export type markAsDoneMutation$data = {
  readonly markNotificationAsDone: {
    readonly notificationThread: {
      readonly id: string;
      readonly isDone: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsDoneMutation$rawResponse = {
  readonly markNotificationAsDone: {
    readonly notificationThread: {
      readonly id: string;
      readonly isDone: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsDoneMutation = {
  rawResponse: markAsDoneMutation$rawResponse;
  response: markAsDoneMutation$data;
  variables: markAsDoneMutation$variables;
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
    "concreteType": "MarkNotificationAsDonePayload",
    "kind": "LinkedField",
    "name": "markNotificationAsDone",
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
            "name": "isDone",
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
    "name": "markAsDoneMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markAsDoneMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "3731f12cfeeced568c221d72ca4d6093",
    "metadata": {},
    "name": "markAsDoneMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b1949dbee6f91702369a13549c1eea21";

export default node;
