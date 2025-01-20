/**
 * @generated SignedSource<<106e1c7f6d6204c525a69f78dd0d07df>>
 * @relayHash 5a818dc0d17b5d7eeb452e6eb9e298ef
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 5a818dc0d17b5d7eeb452e6eb9e298ef

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateNotificationViewPreferenceInput = {
  clientMutationId?: string | null | undefined;
  viewPreference: string;
};
export type updateNotificationViewPreferenceMutation$variables = {
  input: UpdateNotificationViewPreferenceInput;
};
export type updateNotificationViewPreferenceMutation$data = {
  readonly updateNotificationViewPreference: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type updateNotificationViewPreferenceMutation$rawResponse = {
  readonly updateNotificationViewPreference: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type updateNotificationViewPreferenceMutation = {
  rawResponse: updateNotificationViewPreferenceMutation$rawResponse;
  response: updateNotificationViewPreferenceMutation$data;
  variables: updateNotificationViewPreferenceMutation$variables;
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
    "concreteType": "UpdateNotificationViewPreferencePayload",
    "kind": "LinkedField",
    "name": "updateNotificationViewPreference",
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
    "name": "updateNotificationViewPreferenceMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateNotificationViewPreferenceMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "5a818dc0d17b5d7eeb452e6eb9e298ef",
    "metadata": {},
    "name": "updateNotificationViewPreferenceMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "e794df6bd1a6f1f0d86b338f612c11f7";

export default node;
