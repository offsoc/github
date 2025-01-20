/**
 * @generated SignedSource<<36d5114a75e1f1732020f11ea8d9c702>>
 * @relayHash 8fb2ad8c640842c40c78555ec3de36ef
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8fb2ad8c640842c40c78555ec3de36ef

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateIssueIssueTypeInput = {
  clientMutationId?: string | null | undefined;
  issueId: string;
  issueTypeId?: string | null | undefined;
};
export type updateIssueIssueTypeMutation$variables = {
  input: UpdateIssueIssueTypeInput;
};
export type updateIssueIssueTypeMutation$data = {
  readonly updateIssueIssueType: {
    readonly issue: {
      readonly issueType: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueIssueTypeMutation$rawResponse = {
  readonly updateIssueIssueType: {
    readonly issue: {
      readonly id: string;
      readonly issueType: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueIssueTypeMutation = {
  rawResponse: updateIssueIssueTypeMutation$rawResponse;
  response: updateIssueIssueTypeMutation$data;
  variables: updateIssueIssueTypeMutation$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "issueType",
  "plural": false,
  "selections": [
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateIssueIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssueIssueTypePayload",
        "kind": "LinkedField",
        "name": "updateIssueIssueType",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
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
    "name": "updateIssueIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssueIssueTypePayload",
        "kind": "LinkedField",
        "name": "updateIssueIssueType",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "8fb2ad8c640842c40c78555ec3de36ef",
    "metadata": {},
    "name": "updateIssueIssueTypeMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "bb977961330cf582e078449e6127a944";

export default node;
