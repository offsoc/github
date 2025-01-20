/**
 * @generated SignedSource<<ad85a1a94f0494e5206227a8e242df9d>>
 * @relayHash 4c75d2dd75a3af4cc34d525194cff752
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4c75d2dd75a3af4cc34d525194cff752

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type RepositoryPermission = "ADMIN" | "MAINTAIN" | "READ" | "TRIAGE" | "WRITE" | "%future added value";
export type DeletePullRequestReviewCommentInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type deletePullRequestCommentMutation$variables = {
  connections: ReadonlyArray<string>;
  endOid?: string | null | undefined;
  filePath?: string | null | undefined;
  input: DeletePullRequestReviewCommentInput;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type deletePullRequestCommentMutation$data = {
  readonly deletePullRequestReviewComment: {
    readonly pullRequestReviewComment: {
      readonly id: string;
      readonly pullRequest: {
        readonly threads: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestThreadEdge";
          } | null | undefined> | null | undefined;
          readonly totalCommentsCount: number;
        };
        readonly " $fragmentSpreads": FragmentRefs<"ReviewMenu_pullRequest">;
      };
      readonly pullRequestReview: {
        readonly pullRequestThreadsAndReplies: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestReviewCommentItemEdge";
          } | null | undefined> | null | undefined;
          readonly totalCount: number;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestCommentMutation$rawResponse = {
  readonly deletePullRequestReviewComment: {
    readonly pullRequestReviewComment: {
      readonly id: string;
      readonly pullRequest: {
        readonly author: {
          readonly __typename: string;
          readonly id: string;
          readonly login: string;
        } | null | undefined;
        readonly comparison: {
          readonly newCommit: {
            readonly id: string;
            readonly oid: any;
          };
          readonly summary: ReadonlyArray<{
            readonly path: string;
          }> | null | undefined;
        } | null | undefined;
        readonly headRefOid: any;
        readonly id: string;
        readonly repository: {
          readonly id: string;
          readonly viewerPermission: RepositoryPermission | null | undefined;
        };
        readonly state: PullRequestState;
        readonly threads: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestThreadEdge";
            readonly cursor: string;
            readonly node: {
              readonly __typename: "PullRequestThread";
              readonly id: string;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly pageInfo: {
            readonly endCursor: string | null | undefined;
            readonly hasNextPage: boolean;
          };
          readonly totalCommentsCount: number;
        };
        readonly viewerCanLeaveNonCommentReviews: boolean;
        readonly viewerHasViolatedPushPolicy: boolean | null | undefined;
        readonly viewerPendingReview: {
          readonly comments: {
            readonly totalCount: number;
          };
          readonly id: string;
        } | null | undefined;
      };
      readonly pullRequestReview: {
        readonly id: string;
        readonly pullRequestThreadsAndReplies: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestReviewCommentItemEdge";
            readonly cursor: string;
            readonly node: {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly pageInfo: {
            readonly endCursor: string | null | undefined;
            readonly hasNextPage: boolean;
          };
          readonly totalCount: number;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestCommentMutation = {
  rawResponse: deletePullRequestCommentMutation$rawResponse;
  response: deletePullRequestCommentMutation$data;
  variables: deletePullRequestCommentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filePath"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
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
    "name": "input",
    "variableName": "input"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "kind": "Literal",
  "name": "isPositioned",
  "value": false
},
v9 = {
  "kind": "Variable",
  "name": "path",
  "variableName": "filePath"
},
v10 = {
  "kind": "Literal",
  "name": "subjectType",
  "value": "FILE"
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v14 = [
  (v12/*: any*/)
],
v15 = {
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
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v17 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  },
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/)
],
v18 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
];
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
    "name": "deletePullRequestCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "DeletePullRequestReviewCommentPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestReviewComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReviewComment",
            "kind": "LinkedField",
            "name": "pullRequestReviewComment",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ReviewMenu_pullRequest"
                  },
                  {
                    "alias": "threads",
                    "args": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/)
                    ],
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "__SingleFileViewConversation_threads_connection",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestThreadEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestThread",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": (v14/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestReview",
                "kind": "LinkedField",
                "name": "pullRequestReview",
                "plural": false,
                "selections": [
                  {
                    "alias": "pullRequestThreadsAndReplies",
                    "args": null,
                    "concreteType": "PullRequestReviewCommentItemConnection",
                    "kind": "LinkedField",
                    "name": "__PullRequestReview_pullRequestThreadsAndReplies_connection",
                    "plural": false,
                    "selections": [
                      (v16/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewCommentItemEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": (v14/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "deletePullRequestCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "DeletePullRequestReviewCommentPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestReviewComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReviewComment",
            "kind": "LinkedField",
            "name": "pullRequestReviewComment",
            "plural": false,
            "selections": [
              (v7/*: any*/),
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
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": [
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "login",
                        "storageKey": null
                      },
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "headRefOid",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "repository",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerPermission",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "state",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
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
                        "name": "newCommit",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "oid",
                            "storageKey": null
                          },
                          (v7/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestSummaryDelta",
                        "kind": "LinkedField",
                        "name": "summary",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "path",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanLeaveNonCommentReviews",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerHasViolatedPushPolicy",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReview",
                    "kind": "LinkedField",
                    "name": "viewerPendingReview",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewCommentConnection",
                        "kind": "LinkedField",
                        "name": "comments",
                        "plural": false,
                        "selections": [
                          (v16/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v17/*: any*/),
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "threads",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestThreadEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestThread",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v12/*: any*/),
                              (v7/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v17/*: any*/),
                    "filters": [
                      "isPositioned",
                      "subjectType",
                      "path"
                    ],
                    "handle": "connection",
                    "key": "SingleFileViewConversation_threads",
                    "kind": "LinkedHandle",
                    "name": "threads"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestReview",
                "kind": "LinkedField",
                "name": "pullRequestReview",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v18/*: any*/),
                    "concreteType": "PullRequestReviewCommentItemConnection",
                    "kind": "LinkedField",
                    "name": "pullRequestThreadsAndReplies",
                    "plural": false,
                    "selections": [
                      (v16/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewCommentItemEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v12/*: any*/),
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v12/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v7/*: any*/)
                                ],
                                "type": "Node",
                                "abstractKey": "__isNode"
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/)
                    ],
                    "storageKey": "pullRequestThreadsAndReplies(first:100)"
                  },
                  {
                    "alias": null,
                    "args": (v18/*: any*/),
                    "filters": null,
                    "handle": "connection",
                    "key": "PullRequestReview_pullRequestThreadsAndReplies",
                    "kind": "LinkedHandle",
                    "name": "pullRequestThreadsAndReplies"
                  },
                  (v7/*: any*/)
                ],
                "storageKey": null
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
    "id": "4c75d2dd75a3af4cc34d525194cff752",
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "deletePullRequestReviewComment",
            "pullRequestReviewComment",
            "pullRequest",
            "threads"
          ]
        },
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "deletePullRequestReviewComment",
            "pullRequestReviewComment",
            "pullRequestReview",
            "pullRequestThreadsAndReplies"
          ]
        }
      ]
    },
    "name": "deletePullRequestCommentMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "01644b7455ce3c5e854b72bd3c792716";

export default node;
