/**
 * @generated SignedSource<<2cb02ec0e31d68edf72b0cbe948636d2>>
 * @relayHash d1ac56830f6393076f2477d83df1717a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d1ac56830f6393076f2477d83df1717a

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationAsReadInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type markAsReadMutation$variables = {
  input: MarkNotificationAsReadInput;
};
export type markAsReadMutation$data = {
  readonly markNotificationAsRead: {
    readonly notificationThread: {
      readonly id: string;
      readonly isUnread: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsReadMutation$rawResponse = {
  readonly markNotificationAsRead: {
    readonly notificationThread: {
      readonly id: string;
      readonly isUnread: boolean;
    } | null | undefined;
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markAsReadMutation = {
  rawResponse: markAsReadMutation$rawResponse;
  response: markAsReadMutation$data;
  variables: markAsReadMutation$variables;
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
    "concreteType": "MarkNotificationAsReadPayload",
    "kind": "LinkedField",
    "name": "markNotificationAsRead",
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
    "name": "markAsReadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markAsReadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "d1ac56830f6393076f2477d83df1717a",
    "metadata": {},
    "name": "markAsReadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "55f0dd1f2e9fdad6d0cbb4883eb8e561";

export default node;
