/**
 * @generated SignedSource<<7002c8881ed53b32574a94ea497e0485>>
 * @relayHash 5f429f8e8a90c80805262a7bb730507e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 5f429f8e8a90c80805262a7bb730507e

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReplaceAssigneesForAssignableInput = {
  assignableId: string;
  assigneeIds: ReadonlyArray<string>;
  clientMutationId?: string | null | undefined;
};
export type replaceAssigneesForAssignableMutation$variables = {
  input: ReplaceAssigneesForAssignableInput;
};
export type replaceAssigneesForAssignableMutation$data = {
  readonly replaceAssigneesForAssignable: {
    readonly assignable: {
      readonly assignees: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined> | null | undefined;
      };
      readonly suggestedAssignees: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type replaceAssigneesForAssignableMutation$rawResponse = {
  readonly replaceAssigneesForAssignable: {
    readonly assignable: {
      readonly __typename: string;
      readonly __isNode: string;
      readonly assignees: {
        readonly nodes: ReadonlyArray<{
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly name: string | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly suggestedAssignees: {
        readonly nodes: ReadonlyArray<{
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly name: string | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type replaceAssigneesForAssignableMutation = {
  rawResponse: replaceAssigneesForAssignableMutation$rawResponse;
  response: replaceAssigneesForAssignableMutation$data;
  variables: replaceAssigneesForAssignableMutation$variables;
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
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*: any*/),
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
    "name": "replaceAssigneesForAssignableMutation",
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
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "suggestedAssignees",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": "suggestedAssignees(first:20)"
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
    "name": "replaceAssigneesForAssignableMutation",
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
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": (v6/*: any*/),
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "suggestedAssignees",
                "plural": false,
                "selections": (v6/*: any*/),
                "storageKey": "suggestedAssignees(first:20)"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/)
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
    "id": "5f429f8e8a90c80805262a7bb730507e",
    "metadata": {},
    "name": "replaceAssigneesForAssignableMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "cf977844cd8f6fd52ecb0a04af299f76";

export default node;
