/**
 * @generated SignedSource<<c465c8cbd3dd4c989cbe898d8bff016b>>
 * @relayHash 3535ac81b0a0cde41584253cd9f59d9b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3535ac81b0a0cde41584253cd9f59d9b

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnpinIssueInput = {
  clientMutationId?: string | null | undefined;
  issueId: string;
};
export type unpinIssueMutation$variables = {
  input: UnpinIssueInput;
};
export type unpinIssueMutation$data = {
  readonly unpinIssue: {
    readonly id: string | null | undefined;
    readonly issue: {
      readonly isPinned: boolean | null | undefined;
      readonly repository: {
        readonly pinnedIssues: {
          readonly totalCount: number;
        } | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type unpinIssueMutation$rawResponse = {
  readonly unpinIssue: {
    readonly id: string | null | undefined;
    readonly issue: {
      readonly id: string;
      readonly isPinned: boolean | null | undefined;
      readonly repository: {
        readonly id: string;
        readonly pinnedIssues: {
          readonly totalCount: number;
        } | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type unpinIssueMutation = {
  rawResponse: unpinIssueMutation$rawResponse;
  response: unpinIssueMutation$data;
  variables: unpinIssueMutation$variables;
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
  "kind": "ScalarField",
  "name": "isPinned",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "first",
      "value": 3
    }
  ],
  "concreteType": "PinnedIssueConnection",
  "kind": "LinkedField",
  "name": "pinnedIssues",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": "pinnedIssues(first:3)"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unpinIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnpinIssuePayload",
        "kind": "LinkedField",
        "name": "unpinIssue",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
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
    "name": "unpinIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnpinIssuePayload",
        "kind": "LinkedField",
        "name": "unpinIssue",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteRecord",
            "key": "",
            "kind": "ScalarHandle",
            "name": "id"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
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
    "id": "3535ac81b0a0cde41584253cd9f59d9b",
    "metadata": {},
    "name": "unpinIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "ac0b483a2f30bd79ec6902f7acb7acec";

export default node;
