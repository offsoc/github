/**
 * @generated SignedSource<<5a03a1905f4e0c057cb92caaefe6e933>>
 * @relayHash 47471f1ccea140a1d41f7c1a4baa5dc7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 47471f1ccea140a1d41f7c1a4baa5dc7

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateIssueInput = {
  assigneeIds?: ReadonlyArray<string> | null | undefined;
  body?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  issueTemplate?: string | null | undefined;
  issueTypeId?: string | null | undefined;
  labelIds?: ReadonlyArray<string> | null | undefined;
  milestoneId?: string | null | undefined;
  parentIssueId?: string | null | undefined;
  position?: ReadonlyArray<number> | null | undefined;
  projectIds?: ReadonlyArray<string> | null | undefined;
  repositoryId: string;
  title: string;
};
export type createIssueFromChecklistItemMutation$variables = {
  input: CreateIssueInput;
};
export type createIssueFromChecklistItemMutation$data = {
  readonly createIssue: {
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
    readonly issue: {
      readonly parent: {
        readonly body: string;
        readonly bodyHTML: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueFromChecklistItemMutation$rawResponse = {
  readonly createIssue: {
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
    readonly issue: {
      readonly id: string;
      readonly parent: {
        readonly body: string;
        readonly bodyHTML: string;
        readonly id: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueFromChecklistItemMutation = {
  rawResponse: createIssueFromChecklistItemMutation$rawResponse;
  response: createIssueFromChecklistItemMutation$data;
  variables: createIssueFromChecklistItemMutation$variables;
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
  "name": "body",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "renderTasklistBlocks",
      "value": true
    },
    {
      "kind": "Literal",
      "name": "unfurlReferences",
      "value": true
    }
  ],
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": "bodyHTML(renderTasklistBlocks:true,unfurlReferences:true)"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v5 = {
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
    "name": "createIssueFromChecklistItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateIssuePayload",
        "kind": "LinkedField",
        "name": "createIssue",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
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
              (v4/*: any*/)
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
    "name": "createIssueFromChecklistItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateIssuePayload",
        "kind": "LinkedField",
        "name": "createIssue",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              (v5/*: any*/)
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
    "id": "47471f1ccea140a1d41f7c1a4baa5dc7",
    "metadata": {},
    "name": "createIssueFromChecklistItemMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0d540b33c19c7287427d057ee1c414a5";

export default node;
