/**
 * @generated SignedSource<<83f3e6a4531187fdb5db29bdc61a5907>>
 * @relayHash 67b42ffa2f310995849e95e1865abd64
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 67b42ffa2f310995849e95e1865abd64

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReplaceAssigneesForAssignableInput = {
  assignableId: string;
  assigneeIds: ReadonlyArray<string>;
  clientMutationId?: string | null | undefined;
};
export type updateIssueAssigneesMutation$variables = {
  input: ReplaceAssigneesForAssignableInput;
};
export type updateIssueAssigneesMutation$data = {
  readonly replaceAssigneesForAssignable: {
    readonly assignable: {
      readonly assignees?: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined> | null | undefined;
      };
      readonly id?: string;
      readonly participants?: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueAssigneesMutation$rawResponse = {
  readonly replaceAssigneesForAssignable: {
    readonly assignable: {
      readonly __typename: "Issue";
      readonly __isNode: "Issue";
      readonly assignees: {
        readonly nodes: ReadonlyArray<{
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly name: string | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly participants: {
        readonly nodes: ReadonlyArray<{
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly name: string | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | {
      readonly __typename: string;
      readonly __isNode: string;
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueAssigneesMutation = {
  rawResponse: updateIssueAssigneesMutation$rawResponse;
  response: updateIssueAssigneesMutation$data;
  variables: updateIssueAssigneesMutation$variables;
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
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v4 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "size",
        "value": 64
      }
    ],
    "kind": "ScalarField",
    "name": "avatarUrl",
    "storageKey": "avatarUrl(size:64)"
  }
],
v5 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      {
        "kind": "InlineDataFragmentSpread",
        "name": "AssigneePickerAssignee",
        "selections": (v4/*: any*/),
        "args": null,
        "argumentDefinitions": ([]/*: any*/)
      }
    ],
    "storageKey": null
  }
],
v6 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v7 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": (v4/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateIssueAssigneesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceAssigneesForAssignablePayload",
        "kind": "LinkedField",
        "name": "replaceAssigneesForAssignable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "assignable",
            "plural": false,
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "assignees",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": "assignees(first:20)"
                  },
                  {
                    "alias": null,
                    "args": (v6/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "participants",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": "participants(first:10)"
                  }
                ],
                "type": "Issue",
                "abstractKey": null
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
    "name": "updateIssueAssigneesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceAssigneesForAssignablePayload",
        "kind": "LinkedField",
        "name": "replaceAssigneesForAssignable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "assignable",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "assignees",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": "assignees(first:20)"
                  },
                  {
                    "alias": null,
                    "args": (v6/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "participants",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": "participants(first:10)"
                  }
                ],
                "type": "Issue",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/)
                ],
                "type": "Node",
                "abstractKey": "__isNode"
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
    "id": "67b42ffa2f310995849e95e1865abd64",
    "metadata": {},
    "name": "updateIssueAssigneesMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2418f6524b09a21ac5913628f1be0f9a";

export default node;
