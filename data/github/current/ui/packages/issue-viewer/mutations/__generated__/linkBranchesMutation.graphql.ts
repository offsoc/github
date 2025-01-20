/**
 * @generated SignedSource<<dbf40f2207fad0d5ee70b020f02383ca>>
 * @relayHash 1ed695200ca0b6cac0e012fd4926b664
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1ed695200ca0b6cac0e012fd4926b664

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type linkBranchesMutation$variables = {
  baseIssueId: string;
  linkingIds: ReadonlyArray<string>;
};
export type linkBranchesMutation$data = {
  readonly linkBranches: {
    readonly issue: {
      readonly linkedBranches: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly ref: {
            readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRef">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type linkBranchesMutation$rawResponse = {
  readonly linkBranches: {
    readonly issue: {
      readonly id: string;
      readonly linkedBranches: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly ref: {
            readonly __typename: "Ref";
            readonly associatedPullRequests: {
              readonly totalCount: number;
            };
            readonly id: string;
            readonly name: string;
            readonly repository: {
              readonly defaultBranchRef: {
                readonly associatedPullRequests: {
                  readonly totalCount: number;
                };
                readonly id: string;
                readonly name: string;
                readonly repository: {
                  readonly id: string;
                };
                readonly target: {
                  readonly __typename: string;
                  readonly id: string;
                  readonly oid: any;
                } | null | undefined;
              } | null | undefined;
              readonly id: string;
              readonly nameWithOwner: string;
            };
            readonly target: {
              readonly __typename: string;
              readonly id: string;
              readonly oid: any;
            } | null | undefined;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type linkBranchesMutation = {
  rawResponse: linkBranchesMutation$rawResponse;
  response: linkBranchesMutation$data;
  variables: linkBranchesMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "baseIssueId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "linkingIds"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "issueId",
        "variableName": "baseIssueId"
      },
      {
        "kind": "Variable",
        "name": "linkingIds",
        "variableName": "linkingIds"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 25
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "target",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "oid",
      "storageKey": null
    },
    (v3/*: any*/),
    (v5/*: any*/)
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestConnection",
  "kind": "LinkedField",
  "name": "associatedPullRequests",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = [
  (v4/*: any*/),
  (v3/*: any*/),
  (v5/*: any*/),
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "repository",
    "plural": false,
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "nameWithOwner",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Ref",
        "kind": "LinkedField",
        "name": "defaultBranchRef",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v3/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Repository",
            "kind": "LinkedField",
            "name": "repository",
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
    "storageKey": null
  },
  (v7/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "linkBranchesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "LinkBranchesPayload",
        "kind": "LinkedField",
        "name": "linkBranches",
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
                "args": (v2/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "LinkedBranch",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "ref",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "BranchPickerRef",
                            "selections": (v8/*: any*/),
                            "args": null,
                            "argumentDefinitions": []
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:25)"
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
    "name": "linkBranchesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "LinkBranchesPayload",
        "kind": "LinkedField",
        "name": "linkBranches",
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
                "args": (v2/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "LinkedBranch",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "ref",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:25)"
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1ed695200ca0b6cac0e012fd4926b664",
    "metadata": {},
    "name": "linkBranchesMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "778891c21a5c7ddf60bb6d4c7f33ce39";

export default node;
