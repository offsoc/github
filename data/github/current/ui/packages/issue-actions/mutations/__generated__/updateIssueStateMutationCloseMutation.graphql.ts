/**
 * @generated SignedSource<<4a406be209e8786597120fdb7266b94c>>
 * @relayHash cac4bf9cde645b1757c7ef9f43b03319
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cac4bf9cde645b1757c7ef9f43b03319

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueClosedStateReason = "COMPLETED" | "NOT_PLANNED" | "%future added value";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type updateIssueStateMutationCloseMutation$variables = {
  id: string;
  newStateReason: IssueClosedStateReason;
};
export type updateIssueStateMutationCloseMutation$data = {
  readonly closeIssue: {
    readonly issue: {
      readonly id: string;
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueStateMutationCloseMutation$rawResponse = {
  readonly closeIssue: {
    readonly issue: {
      readonly id: string;
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueStateMutationCloseMutation = {
  rawResponse: updateIssueStateMutationCloseMutation$rawResponse;
  response: updateIssueStateMutationCloseMutation$data;
  variables: updateIssueStateMutationCloseMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "newStateReason"
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
            "name": "issueId",
            "variableName": "id"
          },
          {
            "kind": "Variable",
            "name": "stateReason",
            "variableName": "newStateReason"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "CloseIssuePayload",
    "kind": "LinkedField",
    "name": "closeIssue",
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
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "stateReason",
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
    "name": "updateIssueStateMutationCloseMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueStateMutationCloseMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "cac4bf9cde645b1757c7ef9f43b03319",
    "metadata": {},
    "name": "updateIssueStateMutationCloseMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2728d181f220b1525bba5a9af246c5d2";

export default node;
