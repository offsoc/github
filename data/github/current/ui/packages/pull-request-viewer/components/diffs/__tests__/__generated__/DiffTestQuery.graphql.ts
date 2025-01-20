/**
 * @generated SignedSource<<739d63beeeee6e0315b334053d3da5eb>>
 * @relayHash 495701c3c45dde97d56226f77bb1c7d3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 495701c3c45dde97d56226f77bb1c7d3

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffLineRange = {
  end: number;
  start: number;
};
export type DiffTestQuery$variables = {
  endOid?: string | null | undefined;
  injectedContextLines?: ReadonlyArray<DiffLineRange> | null | undefined;
  inlineThreadCount?: number | null | undefined;
  pullRequestId: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type DiffTestQuery$data = {
  readonly pullRequest: {
    readonly comparison?: {
      readonly diffEntries: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"Diff_diffEntry">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"Diff_pullRequest">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"Diff_viewer">;
  };
};
export type DiffTestQuery = {
  response: DiffTestQuery$data;
  variables: DiffTestQuery$variables;
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
  "name": "injectedContextLines"
},
v2 = {
  "defaultValue": 20,
  "kind": "LocalArgument",
  "name": "inlineThreadCount"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pullRequestId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v6 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestId"
  }
],
v7 = [
  {
    "kind": "Variable",
    "name": "endOid",
    "variableName": "endOid"
  },
  {
    "kind": "Variable",
    "name": "singleCommitOid",
    "variableName": "singleCommitOid"
  },
  {
    "kind": "Variable",
    "name": "startOid",
    "variableName": "startOid"
  }
],
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "size",
      "value": 48
    }
  ],
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": "avatarUrl(size:48)"
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v13 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameWithOwner",
    "storageKey": null
  },
  (v11/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v15 = [
  (v14/*: any*/),
  (v11/*: any*/)
],
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mode",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lineCount",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v22 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v23 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v24 = {
  "alias": null,
  "args": [
    (v22/*: any*/)
  ],
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v19/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestReviewCommentEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestReviewComment",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "author",
              "plural": false,
              "selections": [
                (v12/*: any*/),
                (v10/*: any*/),
                (v9/*: any*/),
                (v11/*: any*/)
              ],
              "storageKey": null
            },
            (v11/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "storageKey": "comments(first:50)"
},
v25 = [
  (v22/*: any*/),
  {
    "kind": "Literal",
    "name": "subjectType",
    "value": "FILE"
  }
],
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v27 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Repository"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v30 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v31 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequestThreadEdge"
},
v32 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestThread"
},
v33 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestReviewCommentConnection"
},
v34 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequestReviewCommentEdge"
},
v35 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestReviewComment"
},
v36 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v37 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v38 = [
  "LEFT",
  "RIGHT"
],
v39 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v40 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v41 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "TreeEntry"
},
v42 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v43 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestThreadConnection"
},
v44 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Commit"
},
v45 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DiffTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "Diff_viewer"
          }
        ],
        "storageKey": null
      },
      {
        "alias": "pullRequest",
        "args": (v6/*: any*/),
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
                "name": "Diff_pullRequest"
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v8/*: any*/),
                    "concreteType": "PullRequestDiffEntryConnection",
                    "kind": "LinkedField",
                    "name": "diffEntries",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestDiffEntry",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "Diff_diffEntry"
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "diffEntries(first:20)"
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
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Operation",
    "name": "DiffTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isSiteAdmin",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestUserPreferences",
            "kind": "LinkedField",
            "name": "pullRequestUserPreferences",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "diffView",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tabSize",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v11/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "pullRequest",
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v12/*: any*/),
          (v11/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "number",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "headRefName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "headRepository",
                "plural": false,
                "selections": (v13/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "baseRepository",
                "plural": false,
                "selections": (v13/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanEditFiles",
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "oldCommit",
                    "plural": false,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "newCommit",
                    "plural": false,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v8/*: any*/),
                    "concreteType": "PullRequestDiffEntryConnection",
                    "kind": "LinkedField",
                    "name": "diffEntries",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestDiffEntry",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          {
                            "alias": "diffEntryId",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "id",
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
                            "name": "isTooBig",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "linesChanged",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pathDigest",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "viewerViewedState",
                            "storageKey": null
                          },
                          (v16/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "status",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "truncatedReason",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TreeEntry",
                            "kind": "LinkedField",
                            "name": "oldTreeEntry",
                            "plural": false,
                            "selections": [
                              (v17/*: any*/),
                              (v18/*: any*/),
                              (v16/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TreeEntry",
                            "kind": "LinkedField",
                            "name": "newTreeEntry",
                            "plural": false,
                            "selections": [
                              (v17/*: any*/),
                              (v18/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "isGenerated",
                                "storageKey": null
                              },
                              (v16/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": [
                              {
                                "kind": "Variable",
                                "name": "injectedContextLines",
                                "variableName": "injectedContextLines"
                              }
                            ],
                            "concreteType": "DiffLine",
                            "kind": "LinkedField",
                            "name": "diffLines",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "blobLineNumber",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "left",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "right",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "html",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "type",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "text",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": [
                                  {
                                    "kind": "Variable",
                                    "name": "first",
                                    "variableName": "inlineThreadCount"
                                  }
                                ],
                                "concreteType": "PullRequestThreadConnection",
                                "kind": "LinkedField",
                                "name": "threads",
                                "plural": false,
                                "selections": [
                                  (v19/*: any*/),
                                  (v20/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "PullRequestThreadEdge",
                                    "kind": "LinkedField",
                                    "name": "edges",
                                    "plural": true,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "PullRequestThread",
                                        "kind": "LinkedField",
                                        "name": "node",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "diffSide",
                                            "storageKey": null
                                          },
                                          (v11/*: any*/),
                                          (v21/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "line",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "startDiffSide",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "startLine",
                                            "storageKey": null
                                          },
                                          (v24/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v23/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v23/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PathOwnership",
                            "kind": "LinkedField",
                            "name": "pathOwnership",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PathOwner",
                                "kind": "LinkedField",
                                "name": "pathOwners",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "name",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "ruleLineNumber",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "ruleUrl",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "isOwnedByViewer",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "linesAdded",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "linesDeleted",
                            "storageKey": null
                          },
                          (v11/*: any*/),
                          (v14/*: any*/),
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
                            "alias": "outdatedThreads",
                            "args": [
                              (v22/*: any*/),
                              {
                                "kind": "Literal",
                                "name": "outdatedFilter",
                                "value": "ONLY_OUTDATED"
                              },
                              {
                                "kind": "Literal",
                                "name": "subjectType",
                                "value": "LINE"
                              }
                            ],
                            "concreteType": "PullRequestThreadConnection",
                            "kind": "LinkedField",
                            "name": "threads",
                            "plural": false,
                            "selections": [
                              (v19/*: any*/),
                              (v20/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestThreadEdge",
                                "kind": "LinkedField",
                                "name": "edges",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "PullRequestThread",
                                    "kind": "LinkedField",
                                    "name": "node",
                                    "plural": false,
                                    "selections": [
                                      (v11/*: any*/),
                                      (v21/*: any*/),
                                      (v24/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v23/*: any*/)
                            ],
                            "storageKey": "threads(first:50,outdatedFilter:\"ONLY_OUTDATED\",subjectType:\"LINE\")"
                          },
                          {
                            "alias": null,
                            "args": (v25/*: any*/),
                            "concreteType": "PullRequestThreadConnection",
                            "kind": "LinkedField",
                            "name": "threads",
                            "plural": false,
                            "selections": [
                              (v19/*: any*/),
                              (v20/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestThreadEdge",
                                "kind": "LinkedField",
                                "name": "edges",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "PullRequestThread",
                                    "kind": "LinkedField",
                                    "name": "node",
                                    "plural": false,
                                    "selections": [
                                      (v11/*: any*/),
                                      (v21/*: any*/),
                                      (v24/*: any*/),
                                      (v12/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "cursor",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PageInfo",
                                "kind": "LinkedField",
                                "name": "pageInfo",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "endCursor",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "hasNextPage",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v23/*: any*/)
                            ],
                            "storageKey": "threads(first:50,subjectType:\"FILE\")"
                          },
                          {
                            "alias": null,
                            "args": (v25/*: any*/),
                            "filters": [
                              "subjectType"
                            ],
                            "handle": "connection",
                            "key": "FileConversationsButton_threads",
                            "kind": "LinkedHandle",
                            "name": "threads"
                          },
                          {
                            "kind": "ClientExtension",
                            "selections": [
                              {
                                "alias": "objectId",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "__id",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "isCollapsed",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "diffLinesManuallyExpandedListDiffView",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "diffLinesManuallyUnhidden",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "hasInjectedContextLinesListDiffView",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Range",
                                "kind": "LinkedField",
                                "name": "injectedContextLinesListDiffView",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "start",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "end",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ]
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "diffEntries(first:20)"
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
    ]
  },
  "params": {
    "id": "495701c3c45dde97d56226f77bb1c7d3",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v26/*: any*/),
        "pullRequest.baseRepository": (v27/*: any*/),
        "pullRequest.baseRepository.id": (v28/*: any*/),
        "pullRequest.baseRepository.nameWithOwner": (v26/*: any*/),
        "pullRequest.comparison": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestComparison"
        },
        "pullRequest.comparison.diffEntries": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestDiffEntryConnection"
        },
        "pullRequest.comparison.diffEntries.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestDiffEntry"
        },
        "pullRequest.comparison.diffEntries.nodes.diffEntryId": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "DiffLine"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.blobLineNumber": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.html": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.left": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.right": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.text": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThreadConnection"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges": (v31/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node": (v32/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments": (v33/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges": (v34/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node": (v35/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author": (v36/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.__typename": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.login": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.diffSide": {
          "enumValues": (v38/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.isOutdated": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.line": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.startDiffSide": {
          "enumValues": (v38/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.startLine": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.totalCommentsCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.type": {
          "enumValues": [
            "ADDITION",
            "CONTEXT",
            "DELETION",
            "HUNK",
            "INJECTED_CONTEXT"
          ],
          "nullable": false,
          "plural": false,
          "type": "DiffLineType"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLinesManuallyExpandedListDiffView": (v40/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLinesManuallyUnhidden": (v40/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.hasInjectedContextLinesListDiffView": (v40/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.injectedContextLinesListDiffView": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Range"
        },
        "pullRequest.comparison.diffEntries.nodes.injectedContextLinesListDiffView.end": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.injectedContextLinesListDiffView.start": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isBinary": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isCollapsed": (v40/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isLfsPointer": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isSubmodule": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isTooBig": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.linesAdded": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.linesChanged": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.linesDeleted": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry": (v41/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.isGenerated": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.lineCount": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.mode": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.path": (v42/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.objectId": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oid": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry": (v41/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry.lineCount": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry.mode": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry.path": (v42/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads": (v43/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges": (v31/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node": (v32/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments": (v33/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges": (v34/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node": (v35/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author": (v36/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.__typename": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.login": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.isOutdated": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCommentsCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.path": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathDigest": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PathOwnership"
        },
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.isOwnedByViewer": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.pathOwners": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "PathOwner"
        },
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.pathOwners.name": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.ruleLineNumber": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.ruleUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "pullRequest.comparison.diffEntries.nodes.status": {
          "enumValues": [
            "ADDED",
            "CHANGED",
            "COPIED",
            "DELETED",
            "MODIFIED",
            "RENAMED"
          ],
          "nullable": false,
          "plural": false,
          "type": "PatchStatus"
        },
        "pullRequest.comparison.diffEntries.nodes.threads": (v43/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges": (v31/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.cursor": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node": (v32/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.__typename": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments": (v33/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.__id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges": (v34/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node": (v35/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author": (v36/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.__typename": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.login": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.id": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.isOutdated": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.endCursor": (v42/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.hasNextPage": (v39/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCommentsCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCount": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.truncatedReason": (v42/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.viewerViewedState": {
          "enumValues": [
            "DISMISSED",
            "UNVIEWED",
            "VIEWED"
          ],
          "nullable": true,
          "plural": false,
          "type": "FileViewedState"
        },
        "pullRequest.comparison.newCommit": (v44/*: any*/),
        "pullRequest.comparison.newCommit.id": (v28/*: any*/),
        "pullRequest.comparison.newCommit.oid": (v45/*: any*/),
        "pullRequest.comparison.oldCommit": (v44/*: any*/),
        "pullRequest.comparison.oldCommit.id": (v28/*: any*/),
        "pullRequest.comparison.oldCommit.oid": (v45/*: any*/),
        "pullRequest.headRefName": (v26/*: any*/),
        "pullRequest.headRepository": (v27/*: any*/),
        "pullRequest.headRepository.id": (v28/*: any*/),
        "pullRequest.headRepository.nameWithOwner": (v26/*: any*/),
        "pullRequest.id": (v28/*: any*/),
        "pullRequest.number": (v29/*: any*/),
        "pullRequest.viewerCanEditFiles": (v39/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v37/*: any*/),
        "viewer.id": (v28/*: any*/),
        "viewer.isSiteAdmin": (v39/*: any*/),
        "viewer.login": (v26/*: any*/),
        "viewer.pullRequestUserPreferences": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestUserPreferences"
        },
        "viewer.pullRequestUserPreferences.diffView": (v26/*: any*/),
        "viewer.pullRequestUserPreferences.tabSize": (v29/*: any*/)
      }
    },
    "name": "DiffTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6049093cabb0f3d8f59b7b981de84943";

export default node;
