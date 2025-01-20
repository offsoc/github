/**
 * @generated SignedSource<<5f8ad0eccd8e555afab430917d6e0c32>>
 * @relayHash 4a0a93b20b689a32c4988a4cfde3f259
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4a0a93b20b689a32c4988a4cfde3f259

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type updateIssueStateMutation$variables = {
  id: string;
};
export type updateIssueStateMutation$data = {
  readonly reopenIssue: {
    readonly issue: {
      readonly id: string;
      readonly state: IssueState;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueStateMutation$rawResponse = {
  readonly reopenIssue: {
    readonly issue: {
      readonly id: string;
      readonly state: IssueState;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueStateMutation = {
  rawResponse: updateIssueStateMutation$rawResponse;
  response: updateIssueStateMutation$data;
  variables: updateIssueStateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "ReopenIssuePayload",
    "kind": "LinkedField",
    "name": "reopenIssue",
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
    "name": "updateIssueStateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueStateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "4a0a93b20b689a32c4988a4cfde3f259",
    "metadata": {},
    "name": "updateIssueStateMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "ae2d2083b041ea68ea9a874dec3325d6";

export default node;
