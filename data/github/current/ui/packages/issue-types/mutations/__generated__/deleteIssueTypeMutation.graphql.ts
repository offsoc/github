/**
 * @generated SignedSource<<c4332b08d5b6fdeb062a1c8bb26cb6e0>>
 * @relayHash d97c94919b8c5c49a429b8940b22f4ed
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d97c94919b8c5c49a429b8940b22f4ed

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteIssueTypeInput = {
  clientMutationId?: string | null | undefined;
  issueTypeId: string;
};
export type deleteIssueTypeMutation$variables = {
  input: DeleteIssueTypeInput;
};
export type deleteIssueTypeMutation$data = {
  readonly deleteIssueType: {
    readonly deletedIssueTypeId: string | null | undefined;
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
  } | null | undefined;
};
export type deleteIssueTypeMutation$rawResponse = {
  readonly deleteIssueType: {
    readonly deletedIssueTypeId: string | null | undefined;
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
  } | null | undefined;
};
export type deleteIssueTypeMutation = {
  rawResponse: deleteIssueTypeMutation$rawResponse;
  response: deleteIssueTypeMutation$data;
  variables: deleteIssueTypeMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedIssueTypeId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssueTypePayload",
        "kind": "LinkedField",
        "name": "deleteIssueType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "deleteIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssueTypePayload",
        "kind": "LinkedField",
        "name": "deleteIssueType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "d97c94919b8c5c49a429b8940b22f4ed",
    "metadata": {},
    "name": "deleteIssueTypeMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "a72e0da28b698ee5cea1700ba9c20b2e";

export default node;
