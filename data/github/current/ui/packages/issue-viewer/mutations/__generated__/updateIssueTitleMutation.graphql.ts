/**
 * @generated SignedSource<<c096a6f81d8f69adb6465d37203174d0>>
 * @relayHash 248149933e592650d7f40772dde0d204
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 248149933e592650d7f40772dde0d204

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
export type updateIssueTitleMutation$variables = {
  input: UpdateIssueInput;
};
export type updateIssueTitleMutation$data = {
  readonly updateIssue: {
    readonly issue: {
      readonly id: string;
      readonly title: string;
      readonly titleHTML: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueTitleMutation$rawResponse = {
  readonly updateIssue: {
    readonly issue: {
      readonly id: string;
      readonly title: string;
      readonly titleHTML: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueTitleMutation = {
  rawResponse: updateIssueTitleMutation$rawResponse;
  response: updateIssueTitleMutation$data;
  variables: updateIssueTitleMutation$variables;
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
    "name": "updateIssueTitleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueTitleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "248149933e592650d7f40772dde0d204",
    "metadata": {},
    "name": "updateIssueTitleMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b5d09b83ee3a8c70127f501e0b43b95a";

export default node;
