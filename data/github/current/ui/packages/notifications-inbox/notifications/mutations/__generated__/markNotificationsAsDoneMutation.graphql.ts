/**
 * @generated SignedSource<<4930e46179df9425bb03b32eab0036de>>
 * @relayHash b6ea7f02f5c979e311893838592508f2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b6ea7f02f5c979e311893838592508f2

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationsAsDoneInput = {
  clientMutationId?: string | null | undefined;
  ids: ReadonlyArray<string>;
};
export type markNotificationsAsDoneMutation$variables = {
  input: MarkNotificationsAsDoneInput;
};
export type markNotificationsAsDoneMutation$data = {
  readonly markNotificationsAsDone: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsDoneMutation$rawResponse = {
  readonly markNotificationsAsDone: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markNotificationsAsDoneMutation = {
  rawResponse: markNotificationsAsDoneMutation$rawResponse;
  response: markNotificationsAsDoneMutation$data;
  variables: markNotificationsAsDoneMutation$variables;
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
    "concreteType": "MarkNotificationsAsDonePayload",
    "kind": "LinkedField",
    "name": "markNotificationsAsDone",
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
    "name": "markNotificationsAsDoneMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markNotificationsAsDoneMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "b6ea7f02f5c979e311893838592508f2",
    "metadata": {},
    "name": "markNotificationsAsDoneMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "bfebf42591e4d2d2f84940fc5aedbe8f";

export default node;
