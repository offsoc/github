/**
 * @generated SignedSource<<2205840afa39d2f925c4df4d4c8e4ee6>>
 * @relayHash faf1f2ffec063512a277ac4c7251505c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID faf1f2ffec063512a277ac4c7251505c

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type UpdateIssueInput = {
  assigneeIds?: ReadonlyArray<string> | null | undefined;
  body?: string | null | undefined;
  bodyVersion?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  id: string;
  issueTypeId?: string | null | undefined;
  labelIds?: ReadonlyArray<string> | null | undefined;
  milestoneId?: string | null | undefined;
  projectIds?: ReadonlyArray<string> | null | undefined;
  state?: IssueState | null | undefined;
  tasklistBlocksOperation?: string | null | undefined;
  title?: string | null | undefined;
};
export type updateIssueMutation$variables = {
  input: UpdateIssueInput;
};
export type updateIssueMutation$data = {
  readonly updateIssue: {
    readonly issue: {
      readonly body: string;
      readonly bodyHTML: string;
      readonly id: string;
      readonly title: string;
      readonly titleHTML: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueMutation$rawResponse = {
  readonly updateIssue: {
    readonly issue: {
      readonly body: string;
      readonly bodyHTML: string;
      readonly id: string;
      readonly title: string;
      readonly titleHTML: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueMutation = {
  rawResponse: updateIssueMutation$rawResponse;
  response: updateIssueMutation$data;
  variables: updateIssueMutation$variables;
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
    "concreteType": "UpdateIssuePayload",
    "kind": "LinkedField",
    "name": "updateIssue",
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
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "titleHTML",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "body",
            "storageKey": null
          },
          {
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
          }
        ],
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
    "name": "updateIssueMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "faf1f2ffec063512a277ac4c7251505c",
    "metadata": {},
    "name": "updateIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "5a6c1ddf1dcb85765bc969b674d1587a";

export default node;
