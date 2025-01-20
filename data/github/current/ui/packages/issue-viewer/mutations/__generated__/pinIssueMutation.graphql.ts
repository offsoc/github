/**
 * @generated SignedSource<<4a8070b92f911b26f5701394e094a320>>
 * @relayHash f47cefa32c7a668269c7ef6b49373801
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f47cefa32c7a668269c7ef6b49373801

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PinIssueInput = {
  clientMutationId?: string | null | undefined;
  issueId: string;
};
export type pinIssueMutation$variables = {
  input: PinIssueInput;
};
export type pinIssueMutation$data = {
  readonly pinIssue: {
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
export type pinIssueMutation$rawResponse = {
  readonly pinIssue: {
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
export type pinIssueMutation = {
  rawResponse: pinIssueMutation$rawResponse;
  response: pinIssueMutation$data;
  variables: pinIssueMutation$variables;
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
  "name": "isPinned",
  "storageKey": null
},
v3 = {
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
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "pinIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "PinIssuePayload",
        "kind": "LinkedField",
        "name": "pinIssue",
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
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
    "name": "pinIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "PinIssuePayload",
        "kind": "LinkedField",
        "name": "pinIssue",
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f47cefa32c7a668269c7ef6b49373801",
    "metadata": {},
    "name": "pinIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2fa017a8b26ffc47e692978b43841a97";

export default node;
