/**
 * @generated SignedSource<<26c75f15ec581deaf56b76d416bae0bd>>
 * @relayHash 06b2b99a2fc9dd3fbf8cef4df4e1096b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 06b2b99a2fc9dd3fbf8cef4df4e1096b

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InjectedDiffEntries_DiffEntryQuery$variables = {
  endOid: string;
  path: string;
  prId: string;
  startOid: string;
};
export type InjectedDiffEntries_DiffEntryQuery$data = {
  readonly node: {
    readonly comparison?: {
      readonly diffEntry: {
        readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_DiffEntry">;
      };
    } | null | undefined;
  } | null | undefined;
};
export type InjectedDiffEntries_DiffEntryQuery = {
  response: InjectedDiffEntries_DiffEntryQuery$data;
  variables: InjectedDiffEntries_DiffEntryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "path"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "prId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "prId"
  }
],
v5 = [
  {
    "kind": "Variable",
    "name": "endOid",
    "variableName": "endOid"
  },
  {
    "kind": "Variable",
    "name": "startOid",
    "variableName": "startOid"
  }
],
v6 = [
  {
    "kind": "Variable",
    "name": "path",
    "variableName": "path"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v8 = [
  (v7/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "size",
    "storageKey": null
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InjectedDiffEntries_DiffEntryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v6/*: any*/),
                    "concreteType": "PullRequestDiffEntry",
                    "kind": "LinkedField",
                    "name": "diffEntry",
                    "plural": false,
                    "selections": [
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "useFileDiffReference_DiffEntry"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "PullRequest",
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "InjectedDiffEntries_DiffEntryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
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
                "args": (v5/*: any*/),
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v6/*: any*/),
                    "concreteType": "PullRequestDiffEntry",
                    "kind": "LinkedField",
                    "name": "diffEntry",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pathDigest",
                        "storageKey": null
                      },
                      (v7/*: any*/),
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
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TreeEntry",
                        "kind": "LinkedField",
                        "name": "newTreeEntry",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "06b2b99a2fc9dd3fbf8cef4df4e1096b",
    "metadata": {},
    "name": "InjectedDiffEntries_DiffEntryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "76f7e4c6cf06253ca66cb057950d6297";

export default node;
