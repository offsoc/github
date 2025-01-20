/**
 * @generated SignedSource<<3133b5e6b9d5377318241f37f695a3c9>>
 * @relayHash f8780ab5958671e40dcfffd8d74dc0c8
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f8780ab5958671e40dcfffd8d74dc0c8

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffFileHeaderListViewTestQuery$variables = {
  endOid?: string | null | undefined;
  pullRequestId: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type DiffFileHeaderListViewTestQuery$data = {
  readonly pullRequest: {
    readonly comparison?: {
      readonly diffEntries: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_diffEntry">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_pullRequest">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_viewer">;
  };
};
export type DiffFileHeaderListViewTestQuery = {
  response: DiffFileHeaderListViewTestQuery$data;
  variables: DiffFileHeaderListViewTestQuery$variables;
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
  "name": "pullRequestId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
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
    "variableName": "pullRequestId"
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
    "name": "singleCommitOid",
    "variableName": "singleCommitOid"
  },
  {
    "kind": "Variable",
    "name": "startOid",
    "variableName": "startOid"
  }
],
v6 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v8 = {
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
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameWithOwner",
    "storageKey": null
  },
  (v9/*: any*/)
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v13 = [
  (v12/*: any*/),
  (v9/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v15 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "mode",
    "storageKey": null
  },
  (v14/*: any*/)
],
v16 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v20 = {
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
v21 = {
  "alias": null,
  "args": [
    (v16/*: any*/)
  ],
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v17/*: any*/),
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
                (v10/*: any*/),
                (v8/*: any*/),
                (v7/*: any*/),
                (v9/*: any*/)
              ],
              "storageKey": null
            },
            (v9/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v20/*: any*/)
  ],
  "storageKey": "comments(first:50)"
},
v22 = [
  (v16/*: any*/),
  {
    "kind": "Literal",
    "name": "subjectType",
    "value": "FILE"
  }
],
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v24 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Repository"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v28 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "TreeEntry"
},
v29 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v30 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestThreadConnection"
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
v38 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Commit"
},
v39 = {
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
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DiffFileHeaderListViewTestQuery",
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
            "name": "DiffFileHeaderListView_viewer"
          }
        ],
        "storageKey": null
      },
      {
        "alias": "pullRequest",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "DiffFileHeaderListView_pullRequest"
              },
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
                            "name": "DiffFileHeaderListView_diffEntry"
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "DiffFileHeaderListViewTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "pullRequest",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v9/*: any*/),
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
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "baseRepository",
                "plural": false,
                "selections": (v11/*: any*/),
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
                "args": (v5/*: any*/),
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
                    "selections": (v13/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "newCommit",
                    "plural": false,
                    "selections": (v13/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v6/*: any*/),
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
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pathDigest",
                            "storageKey": null
                          },
                          (v14/*: any*/),
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
                            "concreteType": "TreeEntry",
                            "kind": "LinkedField",
                            "name": "oldTreeEntry",
                            "plural": false,
                            "selections": (v15/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TreeEntry",
                            "kind": "LinkedField",
                            "name": "newTreeEntry",
                            "plural": false,
                            "selections": (v15/*: any*/),
                            "storageKey": null
                          },
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
                          (v9/*: any*/),
                          (v12/*: any*/),
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
                            "name": "isBinary",
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
                              (v16/*: any*/),
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
                              (v17/*: any*/),
                              (v18/*: any*/),
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
                                      (v9/*: any*/),
                                      (v19/*: any*/),
                                      (v21/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v20/*: any*/)
                            ],
                            "storageKey": "threads(first:50,outdatedFilter:\"ONLY_OUTDATED\",subjectType:\"LINE\")"
                          },
                          {
                            "alias": null,
                            "args": (v22/*: any*/),
                            "concreteType": "PullRequestThreadConnection",
                            "kind": "LinkedField",
                            "name": "threads",
                            "plural": false,
                            "selections": [
                              (v17/*: any*/),
                              (v18/*: any*/),
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
                                      (v9/*: any*/),
                                      (v19/*: any*/),
                                      (v21/*: any*/),
                                      (v10/*: any*/)
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
                              (v20/*: any*/)
                            ],
                            "storageKey": "threads(first:50,subjectType:\"FILE\")"
                          },
                          {
                            "alias": null,
                            "args": (v22/*: any*/),
                            "filters": [
                              "subjectType"
                            ],
                            "handle": "connection",
                            "key": "FileConversationsButton_threads",
                            "kind": "LinkedHandle",
                            "name": "threads"
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "viewerViewedState",
                            "storageKey": null
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
    "id": "f8780ab5958671e40dcfffd8d74dc0c8",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v23/*: any*/),
        "pullRequest.baseRepository": (v24/*: any*/),
        "pullRequest.baseRepository.id": (v25/*: any*/),
        "pullRequest.baseRepository.nameWithOwner": (v23/*: any*/),
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
        "pullRequest.comparison.diffEntries.nodes.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isBinary": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isLfsPointer": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.isSubmodule": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.linesAdded": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.linesDeleted": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.mode": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.newTreeEntry.path": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oid": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry": (v28/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry.mode": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.oldTreeEntry.path": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.__id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges": (v31/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node": (v32/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments": (v33/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.__id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges": (v34/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node": (v35/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author": (v36/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.__typename": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.login": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.totalCount": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.isOutdated": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCommentsCount": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCount": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.path": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathDigest": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PathOwnership"
        },
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.isOwnedByViewer": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.pathOwners": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "PathOwner"
        },
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.pathOwners.name": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.pathOwnership.ruleLineNumber": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
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
        "pullRequest.comparison.diffEntries.nodes.threads": (v30/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.__id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges": (v31/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.cursor": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node": (v32/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.__typename": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments": (v33/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.__id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges": (v34/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node": (v35/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author": (v36/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.__typename": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.login": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.totalCount": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.id": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.isOutdated": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.endCursor": (v29/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.hasNextPage": (v26/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCommentsCount": (v27/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCount": (v27/*: any*/),
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
        "pullRequest.comparison.newCommit": (v38/*: any*/),
        "pullRequest.comparison.newCommit.id": (v25/*: any*/),
        "pullRequest.comparison.newCommit.oid": (v39/*: any*/),
        "pullRequest.comparison.oldCommit": (v38/*: any*/),
        "pullRequest.comparison.oldCommit.id": (v25/*: any*/),
        "pullRequest.comparison.oldCommit.oid": (v39/*: any*/),
        "pullRequest.headRefName": (v23/*: any*/),
        "pullRequest.headRepository": (v24/*: any*/),
        "pullRequest.headRepository.id": (v25/*: any*/),
        "pullRequest.headRepository.nameWithOwner": (v23/*: any*/),
        "pullRequest.id": (v25/*: any*/),
        "pullRequest.number": (v27/*: any*/),
        "pullRequest.viewerCanEditFiles": (v26/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v37/*: any*/),
        "viewer.id": (v25/*: any*/),
        "viewer.login": (v23/*: any*/)
      }
    },
    "name": "DiffFileHeaderListViewTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "576ccf58916a0ee06aabc4e7e61a66a8";

export default node;
