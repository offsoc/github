/**
 * @generated SignedSource<<920b592c0d57570baa80c456aabaf9f0>>
 * @relayHash 7c9df64c41ef33594dd0882be84ef373
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7c9df64c41ef33594dd0882be84ef373

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffChatWrapper_DiffEntryQuery$variables = {
  diffEntryId: string;
};
export type DiffChatWrapper_DiffEntryQuery$data = {
  readonly diffEntry: {
    readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_DiffEntry">;
  } | null | undefined;
};
export type DiffChatWrapper_DiffEntryQuery = {
  response: DiffChatWrapper_DiffEntryQuery$data;
  variables: DiffChatWrapper_DiffEntryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "diffEntryId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "diffEntryId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v3 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "size",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DiffChatWrapper_DiffEntryQuery",
    "selections": [
      {
        "alias": "diffEntry",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useFileDiffReference_DiffEntry"
              }
            ],
            "type": "PullRequestDiffEntry",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DiffChatWrapper_DiffEntryQuery",
    "selections": [
      {
        "alias": "diffEntry",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "pathDigest",
                "storageKey": null
              },
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rawUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isBinary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isSubmodule",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isLfsPointer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TreeEntry",
                "kind": "LinkedField",
                "name": "oldTreeEntry",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TreeEntry",
                "kind": "LinkedField",
                "name": "newTreeEntry",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              }
            ],
            "type": "PullRequestDiffEntry",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "7c9df64c41ef33594dd0882be84ef373",
    "metadata": {},
    "name": "DiffChatWrapper_DiffEntryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "064698bd6869b0c7d063a68d0b3666d8";

export default node;
