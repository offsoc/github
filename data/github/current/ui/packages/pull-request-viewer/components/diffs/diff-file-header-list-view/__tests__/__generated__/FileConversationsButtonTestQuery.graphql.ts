/**
 * @generated SignedSource<<21020ee3325916aea203f7a0718d66ef>>
 * @relayHash bd2237f0aeda5e4d5d3a6b3a1195397f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID bd2237f0aeda5e4d5d3a6b3a1195397f

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileConversationsButtonTestQuery$variables = {
  pullRequestId: string;
};
export type FileConversationsButtonTestQuery$data = {
  readonly pullRequest: {
    readonly comparison?: {
      readonly diffEntries: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"FileConversationsButton_diffEntry">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"FileConversationsButton_viewer">;
  };
};
export type FileConversationsButtonTestQuery = {
  response: FileConversationsButtonTestQuery$data;
  variables: FileConversationsButtonTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pullRequestId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestId"
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
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v9 = {
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
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v11 = {
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
v12 = {
  "alias": null,
  "args": [
    (v4/*: any*/)
  ],
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v5/*: any*/),
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
                (v3/*: any*/),
                (v9/*: any*/),
                (v10/*: any*/),
                (v7/*: any*/)
              ],
              "storageKey": null
            },
            (v7/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v11/*: any*/)
  ],
  "storageKey": "comments(first:50)"
},
v13 = [
  (v4/*: any*/),
  {
    "kind": "Literal",
    "name": "subjectType",
    "value": "FILE"
  }
],
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestThreadConnection"
},
v17 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequestThreadEdge"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestThread"
},
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestReviewCommentConnection"
},
v20 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequestReviewCommentEdge"
},
v21 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestReviewComment"
},
v22 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FileConversationsButtonTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
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
                "alias": null,
                "args": null,
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v2/*: any*/),
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
                            "name": "FileConversationsButton_diffEntry"
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
      },
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
            "name": "FileConversationsButton_viewer"
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
    "name": "FileConversationsButtonTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v2/*: any*/),
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
                            "name": "path",
                            "storageKey": null
                          },
                          {
                            "alias": "outdatedThreads",
                            "args": [
                              (v4/*: any*/),
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
                              (v5/*: any*/),
                              (v6/*: any*/),
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
                                      (v7/*: any*/),
                                      (v8/*: any*/),
                                      (v12/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v11/*: any*/)
                            ],
                            "storageKey": "threads(first:50,outdatedFilter:\"ONLY_OUTDATED\",subjectType:\"LINE\")"
                          },
                          {
                            "alias": null,
                            "args": (v13/*: any*/),
                            "concreteType": "PullRequestThreadConnection",
                            "kind": "LinkedField",
                            "name": "threads",
                            "plural": false,
                            "selections": [
                              (v5/*: any*/),
                              (v6/*: any*/),
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
                                      (v7/*: any*/),
                                      (v8/*: any*/),
                                      (v12/*: any*/),
                                      (v3/*: any*/)
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
                              (v11/*: any*/)
                            ],
                            "storageKey": "threads(first:50,subjectType:\"FILE\")"
                          },
                          {
                            "alias": null,
                            "args": (v13/*: any*/),
                            "filters": [
                              "subjectType"
                            ],
                            "handle": "connection",
                            "key": "FileConversationsButton_threads",
                            "kind": "LinkedHandle",
                            "name": "threads"
                          },
                          (v7/*: any*/)
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
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v9/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "bd2237f0aeda5e4d5d3a6b3a1195397f",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v14/*: any*/),
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
        "pullRequest.comparison.diffEntries.nodes.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads": (v16/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.__id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges": (v17/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node": (v18/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments": (v19/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.__id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges": (v20/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node": (v21/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author": (v22/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.__typename": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.avatarUrl": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.author.login": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.edges.node.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.comments.totalCount": (v24/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.edges.node.isOutdated": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCommentsCount": (v24/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.outdatedThreads.totalCount": (v24/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.path": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads": (v16/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.__id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges": (v17/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.cursor": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node": (v18/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.__typename": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments": (v19/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.__id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges": (v20/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node": (v21/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author": (v22/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.__typename": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.avatarUrl": (v23/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.author.login": (v14/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.edges.node.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.comments.totalCount": (v24/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.id": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.edges.node.isOutdated": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.endCursor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "pullRequest.comparison.diffEntries.nodes.threads.pageInfo.hasNextPage": (v25/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCommentsCount": (v24/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.threads.totalCount": (v24/*: any*/),
        "pullRequest.id": (v15/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v23/*: any*/),
        "viewer.id": (v15/*: any*/),
        "viewer.login": (v14/*: any*/)
      }
    },
    "name": "FileConversationsButtonTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ab09e1f413fc002d640994a238a9891f";

export default node;
