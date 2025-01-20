/**
 * @generated SignedSource<<5fa623b020c477a498c64dac0cb24548>>
 * @relayHash 3bb2b18124f6d9e474f1e4d67f4d648c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3bb2b18124f6d9e474f1e4d67f4d648c

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnblockUserFromOrganizationInput = {
  clientMutationId?: string | null | undefined;
  organizationId: string;
  unblockedUserId: string;
};
export type unblockUserFromOrganizationMutation$variables = {
  input: UnblockUserFromOrganizationInput;
};
export type unblockUserFromOrganizationMutation$data = {
  readonly unblockUserFromOrganization: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unblockUserFromOrganizationMutation$rawResponse = {
  readonly unblockUserFromOrganization: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unblockUserFromOrganizationMutation = {
  rawResponse: unblockUserFromOrganizationMutation$rawResponse;
  response: unblockUserFromOrganizationMutation$data;
  variables: unblockUserFromOrganizationMutation$variables;
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
    "concreteType": "UnblockUserFromOrganizationPayload",
    "kind": "LinkedField",
    "name": "unblockUserFromOrganization",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
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
    "name": "unblockUserFromOrganizationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unblockUserFromOrganizationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "3bb2b18124f6d9e474f1e4d67f4d648c",
    "metadata": {},
    "name": "unblockUserFromOrganizationMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "05b84828fae0f7858c1ccd7347bfbb3e";

export default node;
