/**
 * @generated SignedSource<<7a6e0255b090152ae8e787afb6ade72e>>
 * @relayHash a1404ba230fd4248febc2adc9eea7281
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a1404ba230fd4248febc2adc9eea7281

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteIssueInput = {
  clientMutationId?: string | null | undefined;
  issueId: string;
};
export type deleteIssueMutation$variables = {
  input: DeleteIssueInput;
};
export type deleteIssueMutation$data = {
  readonly deleteIssue: {
    readonly issue: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteIssueMutation$rawResponse = {
  readonly deleteIssue: {
    readonly issue: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteIssueMutation = {
  rawResponse: deleteIssueMutation$rawResponse;
  response: deleteIssueMutation$data;
  variables: deleteIssueMutation$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssuePayload",
        "kind": "LinkedField",
        "name": "deleteIssue",
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
    "name": "deleteIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssuePayload",
        "kind": "LinkedField",
        "name": "deleteIssue",
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
                "filters": null,
                "handle": "deleteRecord",
                "key": "",
                "kind": "ScalarHandle",
                "name": "id"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "a1404ba230fd4248febc2adc9eea7281",
    "metadata": {},
    "name": "deleteIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "375dc99ad25e760e083bdad49156a0e6";

export default node;
