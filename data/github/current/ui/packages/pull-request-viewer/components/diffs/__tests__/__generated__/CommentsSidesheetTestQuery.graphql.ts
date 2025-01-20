/**
 * @generated SignedSource<<7c815fa4967a9548ca682fb57a7f7653>>
 * @relayHash 6316b6a422593fd00e2e5fa3c994fe4f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6316b6a422593fd00e2e5fa3c994fe4f

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentsSidesheetTestQuery$variables = {
  pullRequestId: string;
};
export type CommentsSidesheetTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"CommentsSidesheet_pullRequest">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"CommentsSidesheet_viewer">;
  };
};
export type CommentsSidesheetTestQuery = {
  response: CommentsSidesheetTestQuery$data;
  variables: CommentsSidesheetTestQuery$variables;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v5 = [
  (v4/*: any*/),
  {
    "kind": "Literal",
    "name": "isPositioned",
    "value": false
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": "DIFF_POSITION"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v9 = [
  (v6/*: any*/)
],
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestReviewCommentConnection"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequestReviewCommentEdge"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestReviewComment"
},
v14 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v17 = {
  "enumValues": [
    "COLLABORATOR",
    "CONTRIBUTOR",
    "FIRST_TIMER",
    "FIRST_TIME_CONTRIBUTOR",
    "MANNEQUIN",
    "MEMBER",
    "NONE",
    "OWNER"
  ],
  "nullable": false,
  "plural": false,
  "type": "CommentAuthorAssociation"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v19 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v21 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v22 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v24 = [
  "LEFT",
  "RIGHT"
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CommentsSidesheetTestQuery",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "CommentsSidesheet_pullRequest"
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
            "name": "CommentsSidesheet_viewer"
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
    "name": "CommentsSidesheetTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "allThreads",
                "args": (v5/*: any*/),
                "concreteType": "PullRequestThreadConnection",
                "kind": "LinkedField",
                "name": "threads",
                "plural": false,
                "selections": [
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
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isResolved",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "path",
                            "storageKey": null
                          },
                          {
                            "alias": "firstComment",
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "first",
                                "value": 1
                              }
                            ],
                            "concreteType": "PullRequestReviewCommentConnection",
                            "kind": "LinkedField",
                            "name": "comments",
                            "plural": false,
                            "selections": [
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
                                        "kind": "ScalarField",
                                        "name": "body",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": null,
                                        "kind": "LinkedField",
                                        "name": "author",
                                        "plural": false,
                                        "selections": [
                                          (v2/*: any*/),
                                          (v6/*: any*/),
                                          (v3/*: any*/),
                                          (v7/*: any*/),
                                          (v8/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v3/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "authorAssociation",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "bodyHTML",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "createdAt",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "currentDiffResourcePath",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "databaseId",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": "isHidden",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "isMinimized",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "UserContentEdit",
                                        "kind": "LinkedField",
                                        "name": "lastUserContentEdit",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": null,
                                            "kind": "LinkedField",
                                            "name": "editor",
                                            "plural": false,
                                            "selections": [
                                              (v2/*: any*/),
                                              (v6/*: any*/),
                                              (v8/*: any*/),
                                              (v3/*: any*/)
                                            ],
                                            "storageKey": null
                                          },
                                          (v3/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "minimizedReason",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "publishedAt",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": "reference",
                                        "args": null,
                                        "concreteType": "PullRequest",
                                        "kind": "LinkedField",
                                        "name": "pullRequest",
                                        "plural": false,
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
                                            "concreteType": null,
                                            "kind": "LinkedField",
                                            "name": "author",
                                            "plural": false,
                                            "selections": [
                                              (v2/*: any*/),
                                              (v6/*: any*/),
                                              (v3/*: any*/)
                                            ],
                                            "storageKey": null
                                          },
                                          (v3/*: any*/)
                                        ],
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
                                          (v3/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "isPrivate",
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
                                            "args": null,
                                            "concreteType": null,
                                            "kind": "LinkedField",
                                            "name": "owner",
                                            "plural": false,
                                            "selections": [
                                              (v2/*: any*/),
                                              (v3/*: any*/),
                                              (v6/*: any*/),
                                              (v8/*: any*/)
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
                                        "name": "state",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "subjectType",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerDidAuthor",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanBlockFromOrg",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanMinimize",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanReport",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanReportToMaintainer",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanSeeMinimizeButton",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanSeeUnminimizeButton",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanUnblockFromOrg",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerRelationship",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "stafftoolsUrl",
                                        "storageKey": null
                                      },
                                      (v8/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanDelete",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "viewerCanUpdate",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "viewerCanReadUserContentEdits",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "lastEditedAt",
                                            "storageKey": null
                                          }
                                        ],
                                        "type": "Comment",
                                        "abstractKey": "__isComment"
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "ReactionGroup",
                                            "kind": "LinkedField",
                                            "name": "reactionGroups",
                                            "plural": true,
                                            "selections": [
                                              {
                                                "alias": null,
                                                "args": null,
                                                "kind": "ScalarField",
                                                "name": "content",
                                                "storageKey": null
                                              },
                                              {
                                                "alias": null,
                                                "args": [
                                                  {
                                                    "kind": "Literal",
                                                    "name": "first",
                                                    "value": 5
                                                  }
                                                ],
                                                "concreteType": "ReactorConnection",
                                                "kind": "LinkedField",
                                                "name": "reactors",
                                                "plural": false,
                                                "selections": [
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "concreteType": null,
                                                    "kind": "LinkedField",
                                                    "name": "nodes",
                                                    "plural": true,
                                                    "selections": [
                                                      (v2/*: any*/),
                                                      {
                                                        "kind": "InlineFragment",
                                                        "selections": (v9/*: any*/),
                                                        "type": "User",
                                                        "abstractKey": null
                                                      },
                                                      {
                                                        "kind": "InlineFragment",
                                                        "selections": (v9/*: any*/),
                                                        "type": "Bot",
                                                        "abstractKey": null
                                                      },
                                                      {
                                                        "kind": "InlineFragment",
                                                        "selections": (v9/*: any*/),
                                                        "type": "Organization",
                                                        "abstractKey": null
                                                      },
                                                      {
                                                        "kind": "InlineFragment",
                                                        "selections": (v9/*: any*/),
                                                        "type": "Mannequin",
                                                        "abstractKey": null
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
                                                  },
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "kind": "ScalarField",
                                                    "name": "totalCount",
                                                    "storageKey": null
                                                  }
                                                ],
                                                "storageKey": "reactors(first:5)"
                                              },
                                              {
                                                "alias": null,
                                                "args": null,
                                                "kind": "ScalarField",
                                                "name": "viewerHasReacted",
                                                "storageKey": null
                                              }
                                            ],
                                            "storageKey": null
                                          }
                                        ],
                                        "type": "Reactable",
                                        "abstractKey": "__isReactable"
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "comments(first:1)"
                          },
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
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "subject",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "originalStartLine",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "originalEndLine",
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
                                    "name": "endDiffSide",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": [
                                      {
                                        "kind": "Literal",
                                        "name": "maxContextLines",
                                        "value": 3
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
                                        "name": "html",
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
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "type",
                                        "storageKey": null
                                      },
                                      {
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
                                      }
                                    ],
                                    "storageKey": "diffLines(maxContextLines:3)"
                                  }
                                ],
                                "type": "PullRequestDiffThread",
                                "abstractKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": "threadPreviewComments",
                            "args": [
                              (v4/*: any*/)
                            ],
                            "concreteType": "PullRequestReviewCommentConnection",
                            "kind": "LinkedField",
                            "name": "comments",
                            "plural": false,
                            "selections": [
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
                                          (v2/*: any*/),
                                          (v6/*: any*/),
                                          (v7/*: any*/),
                                          (v3/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v3/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "comments(first:50)"
                          },
                          (v2/*: any*/)
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
                  }
                ],
                "storageKey": "threads(first:50,isPositioned:false,orderBy:\"DIFF_POSITION\")"
              },
              {
                "alias": "allThreads",
                "args": (v5/*: any*/),
                "filters": [
                  "isPositioned",
                  "orderBy"
                ],
                "handle": "connection",
                "key": "CommentsSidesheet_allThreads",
                "kind": "LinkedHandle",
                "name": "threads"
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
                "name": "tabSize",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "6316b6a422593fd00e2e5fa3c994fe4f",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v10/*: any*/),
        "pullRequest.allThreads": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestThreadConnection"
        },
        "pullRequest.allThreads.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestThreadEdge"
        },
        "pullRequest.allThreads.edges.cursor": (v10/*: any*/),
        "pullRequest.allThreads.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThread"
        },
        "pullRequest.allThreads.edges.node.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment": (v11/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges": (v12/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node": (v13/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.__isComment": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.__isReactable": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author": (v14/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author.avatarUrl": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.author.url": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.authorAssociation": (v17/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.body": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.bodyHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.currentDiffResourcePath": (v18/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.databaseId": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.isHidden": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastEditedAt": (v21/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.editor": (v14/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.editor.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.editor.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.editor.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.editor.url": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.lastUserContentEdit.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.minimizedReason": (v22/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.publishedAt": (v21/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.content": {
          "enumValues": [
            "CONFUSED",
            "EYES",
            "HEART",
            "HOORAY",
            "LAUGH",
            "ROCKET",
            "THUMBS_DOWN",
            "THUMBS_UP"
          ],
          "nullable": false,
          "plural": false,
          "type": "ReactionContent"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.nodes.__isNode": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.nodes.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.nodes.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.nodes.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.reactors.totalCount": (v23/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reactionGroups.viewerHasReacted": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequest"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.author": (v14/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.author.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.author.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.author.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.reference.number": (v23/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.isPrivate": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.name": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.owner.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.owner.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.owner.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.repository.owner.url": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.stafftoolsUrl": (v18/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.state": {
          "enumValues": [
            "PENDING",
            "SUBMITTED"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewCommentState"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.subjectType": {
          "enumValues": [
            "FILE",
            "LINE"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewThreadSubjectType"
        },
        "pullRequest.allThreads.edges.node.firstComment.edges.node.url": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanBlockFromOrg": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanDelete": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanMinimize": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanReadUserContentEdits": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanReport": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanReportToMaintainer": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanSeeMinimizeButton": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanSeeUnminimizeButton": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanUnblockFromOrg": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerCanUpdate": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerDidAuthor": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.firstComment.edges.node.viewerRelationship": (v17/*: any*/),
        "pullRequest.allThreads.edges.node.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.isOutdated": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.isResolved": (v20/*: any*/),
        "pullRequest.allThreads.edges.node.line": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.path": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.subject": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestThreadSubject"
        },
        "pullRequest.allThreads.edges.node.subject.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "DiffLine"
        },
        "pullRequest.allThreads.edges.node.subject.diffLines.__id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines.html": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines.left": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines.right": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines.text": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.subject.diffLines.type": {
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
        "pullRequest.allThreads.edges.node.subject.endDiffSide": {
          "enumValues": (v24/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.allThreads.edges.node.subject.originalEndLine": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.subject.originalStartLine": (v19/*: any*/),
        "pullRequest.allThreads.edges.node.subject.startDiffSide": {
          "enumValues": (v24/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequest.allThreads.edges.node.threadPreviewComments": (v11/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges": (v12/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node": (v13/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.author": (v14/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.author.__typename": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.author.avatarUrl": (v15/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.author.id": (v16/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.author.login": (v10/*: any*/),
        "pullRequest.allThreads.edges.node.threadPreviewComments.edges.node.id": (v16/*: any*/),
        "pullRequest.allThreads.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequest.allThreads.pageInfo.endCursor": (v22/*: any*/),
        "pullRequest.allThreads.pageInfo.hasNextPage": (v20/*: any*/),
        "pullRequest.id": (v16/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v16/*: any*/),
        "viewer.pullRequestUserPreferences": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestUserPreferences"
        },
        "viewer.pullRequestUserPreferences.tabSize": (v23/*: any*/)
      }
    },
    "name": "CommentsSidesheetTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "22c296d0ef5e78b11f9eb9a6ad8a1a52";

export default node;
