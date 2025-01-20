/**
 * @generated SignedSource<<21f2e5ba30dd6762e8d922d5520052f7>>
 * @relayHash 8949b6eb7dd35047449be8ed93ca88e7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8949b6eb7dd35047449be8ed93ca88e7

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type TransferIssueInput = {
  clientMutationId?: string | null | undefined;
  createLabelsIfMissing?: boolean | null | undefined;
  issueId: string;
  repositoryId: string;
};
export type transferIssueMutation$variables = {
  input: TransferIssueInput;
};
export type transferIssueMutation$data = {
  readonly transferIssue: {
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
    readonly issue: {
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type transferIssueMutation$rawResponse = {
  readonly transferIssue: {
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
    readonly issue: {
      readonly id: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type transferIssueMutation = {
  rawResponse: transferIssueMutation$rawResponse;
  response: transferIssueMutation$data;
  variables: transferIssueMutation$variables;
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
  "name": "url",
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
    "name": "transferIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransferIssuePayload",
        "kind": "LinkedField",
        "name": "transferIssue",
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
              (v2/*: any*/)
            ],
            "storageKey": null
          },
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
    "name": "transferIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "TransferIssuePayload",
        "kind": "LinkedField",
        "name": "transferIssue",
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
    "id": "8949b6eb7dd35047449be8ed93ca88e7",
    "metadata": {},
    "name": "transferIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "a43fa3afdf97ee18c302ed5a02198d56";

export default node;
