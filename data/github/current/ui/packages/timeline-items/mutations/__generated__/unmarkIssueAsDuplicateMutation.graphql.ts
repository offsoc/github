/**
 * @generated SignedSource<<72e75f0de1b7ae8c5732fa45f5184cd6>>
 * @relayHash 08d7312cd1d6f4f1696df8aa4f43f531
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 08d7312cd1d6f4f1696df8aa4f43f531

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type unmarkIssueAsDuplicateMutation$variables = {
  cannonicalId: string;
  duplicateId: string;
};
export type unmarkIssueAsDuplicateMutation$data = {
  readonly unmarkIssueAsDuplicate: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unmarkIssueAsDuplicateMutation$rawResponse = {
  readonly unmarkIssueAsDuplicate: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unmarkIssueAsDuplicateMutation = {
  rawResponse: unmarkIssueAsDuplicateMutation$rawResponse;
  response: unmarkIssueAsDuplicateMutation$data;
  variables: unmarkIssueAsDuplicateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cannonicalId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "duplicateId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "canonicalId",
            "variableName": "cannonicalId"
          },
          {
            "kind": "Variable",
            "name": "duplicateId",
            "variableName": "duplicateId"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "UnmarkIssueAsDuplicatePayload",
    "kind": "LinkedField",
    "name": "unmarkIssueAsDuplicate",
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
    "name": "unmarkIssueAsDuplicateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unmarkIssueAsDuplicateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "08d7312cd1d6f4f1696df8aa4f43f531",
    "metadata": {},
    "name": "unmarkIssueAsDuplicateMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "5fc4fde2e881b6e6aac8dbcb074018f1";

export default node;
