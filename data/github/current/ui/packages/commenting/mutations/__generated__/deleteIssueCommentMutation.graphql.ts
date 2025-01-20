/**
 * @generated SignedSource<<72e4bf16007214d4c5509edb07e6a23e>>
 * @relayHash b0f125991160e607a64d9407db9c01b3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b0f125991160e607a64d9407db9c01b3

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteIssueCommentInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type deleteIssueCommentMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteIssueCommentInput;
};
export type deleteIssueCommentMutation$data = {
  readonly deleteIssueComment: {
    readonly clientMutationId: string | null | undefined;
    readonly issueComment: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteIssueCommentMutation$rawResponse = {
  readonly deleteIssueComment: {
    readonly clientMutationId: string | null | undefined;
    readonly issueComment: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteIssueCommentMutation = {
  rawResponse: deleteIssueCommentMutation$rawResponse;
  response: deleteIssueCommentMutation$data;
  variables: deleteIssueCommentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
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
  "name": "clientMutationId",
  "storageKey": null
},
v3 = {
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
    "name": "deleteIssueCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssueCommentPayload",
        "kind": "LinkedField",
        "name": "deleteIssueComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "issueComment",
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
    "name": "deleteIssueCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteIssueCommentPayload",
        "kind": "LinkedField",
        "name": "deleteIssueComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "issueComment",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "deleteEdge",
                "key": "",
                "kind": "ScalarHandle",
                "name": "id",
                "handleArgs": [
                  {
                    "kind": "Variable",
                    "name": "connections",
                    "variableName": "connections"
                  }
                ]
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
    "id": "b0f125991160e607a64d9407db9c01b3",
    "metadata": {},
    "name": "deleteIssueCommentMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "df574a3555b46c55b652c9621c8d3581";

export default node;
