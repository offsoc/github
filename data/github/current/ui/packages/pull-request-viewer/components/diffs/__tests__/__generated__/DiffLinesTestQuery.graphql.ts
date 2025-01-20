/**
 * @generated SignedSource<<5a207657d3007cff528f369cc6b56cf6>>
 * @relayHash e6c1fca01faedb32fffb77a1cdc54c61
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e6c1fca01faedb32fffb77a1cdc54c61

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffLineRange = {
  end: number;
  start: number;
};
export type DiffLinesTestQuery$variables = {
  injectedContextLines?: ReadonlyArray<DiffLineRange> | null | undefined;
  inlineThreadCount?: number | null | undefined;
};
export type DiffLinesTestQuery$data = {
  readonly pullRequest: {
    readonly comparison?: {
      readonly diffEntries: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"DiffLines_diffEntry">;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"DiffLines_viewer">;
  };
};
export type DiffLinesTestQuery = {
  response: DiffLinesTestQuery$data;
  variables: DiffLinesTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "injectedContextLines"
  },
  {
    "defaultValue": 20,
    "kind": "LocalArgument",
    "name": "inlineThreadCount"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v8 = {
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
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v14 = [
  "LEFT",
  "RIGHT"
],
v15 = {
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
    "name": "DiffLinesTestQuery",
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
            "name": "DiffLines_viewer"
          }
        ],
        "storageKey": null
      },
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
                            "name": "DiffLines_diffEntry"
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
        "storageKey": "node(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DiffLinesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isSiteAdmin",
            "storageKey": null
          },
          (v4/*: any*/),
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
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "pullRequest",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
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
                          (v5/*: any*/),
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
                                "name": "blobLineNumber",
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
                                  (v7/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "totalCommentsCount",
                                    "storageKey": null
                                  },
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
                                          (v5/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "isOutdated",
                                            "storageKey": null
                                          },
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
                                          {
                                            "alias": null,
                                            "args": [
                                              {
                                                "kind": "Literal",
                                                "name": "first",
                                                "value": 50
                                              }
                                            ],
                                            "concreteType": "PullRequestReviewCommentConnection",
                                            "kind": "LinkedField",
                                            "name": "comments",
                                            "plural": false,
                                            "selections": [
                                              (v7/*: any*/),
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
                                                          (v6/*: any*/),
                                                          (v3/*: any*/),
                                                          (v4/*: any*/),
                                                          (v5/*: any*/)
                                                        ],
                                                        "storageKey": null
                                                      },
                                                      (v5/*: any*/)
                                                    ],
                                                    "storageKey": null
                                                  }
                                                ],
                                                "storageKey": null
                                              },
                                              (v8/*: any*/)
                                            ],
                                            "storageKey": "comments(first:50)"
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v8/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v8/*: any*/)
                            ],
                            "storageKey": null
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
          },
          (v5/*: any*/)
        ],
        "storageKey": "node(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "id": "e6c1fca01faedb32fffb77a1cdc54c61",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v9/*: any*/),
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
        "pullRequest.comparison.diffEntries.nodes.diffLines": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "DiffLine"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.__id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.blobLineNumber": (v11/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.html": (v9/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.left": (v12/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.right": (v12/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.text": (v9/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThreadConnection"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.__id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestThreadEdge"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThread"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewCommentConnection"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.__id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestReviewCommentEdge"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewComment"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.__typename": (v9/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.avatarUrl": (v13/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.author.login": (v9/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.edges.node.id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.comments.totalCount": (v11/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.diffSide": {
          "enumValues": (v14/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.isOutdated": (v15/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.line": (v12/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.startDiffSide": {
          "enumValues": (v14/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.edges.node.startLine": (v12/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.totalCommentsCount": (v11/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.diffLines.threads.totalCount": (v11/*: any*/),
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
        "pullRequest.comparison.diffEntries.nodes.id": (v10/*: any*/),
        "pullRequest.comparison.diffEntries.nodes.objectId": (v10/*: any*/),
        "pullRequest.id": (v10/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v13/*: any*/),
        "viewer.id": (v10/*: any*/),
        "viewer.isSiteAdmin": (v15/*: any*/),
        "viewer.login": (v9/*: any*/),
        "viewer.pullRequestUserPreferences": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestUserPreferences"
        },
        "viewer.pullRequestUserPreferences.diffView": (v9/*: any*/),
        "viewer.pullRequestUserPreferences.tabSize": (v11/*: any*/)
      }
    },
    "name": "DiffLinesTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "a5c1f72b6034c7b7dee2f7f92c017a40";

export default node;
