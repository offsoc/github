/**
 * @generated SignedSource<<d25f8465dc0ab9552ba48fb69fa721bf>>
 * @relayHash cedc3455cf4c00cd3d46ae91848e9d5e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cedc3455cf4c00cd3d46ae91848e9d5e

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestReviewTestQuery$variables = {
  pullRequestReviewId: string;
};
export type PullRequestReviewTestQuery$data = {
  readonly pullRequestReview: {
    readonly " $fragmentSpreads": FragmentRefs<"PullRequestReview_pullRequestReview">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"Thread_viewer">;
  };
};
export type PullRequestReviewTestQuery = {
  response: PullRequestReviewTestQuery$data;
  variables: PullRequestReviewTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pullRequestReviewId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestReviewId"
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorAssociation",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v9 = [
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
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  (v3/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v12 = {
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
    (v10/*: any*/),
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
        (v5/*: any*/),
        (v11/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v20 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isResolved",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentDiffResourcePath",
  "storageKey": null
},
v25 = {
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
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subjectType",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v27/*: any*/),
    (v3/*: any*/),
    (v5/*: any*/),
    (v11/*: any*/)
  ],
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v30 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v31 = {
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
        (v5/*: any*/),
        (v11/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    (v3/*: any*/)
  ],
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "publishedAt",
  "storageKey": null
},
v34 = {
  "alias": "reference",
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanMinimize",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeMinimizeButton",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeUnminimizeButton",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerRelationship",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stafftoolsUrl",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReadUserContentEdits",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastEditedAt",
  "storageKey": null
},
v43 = {
  "kind": "InlineFragment",
  "selections": [
    (v41/*: any*/),
    (v42/*: any*/)
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v44 = [
  (v5/*: any*/)
],
v45 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v47 = {
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
                  "selections": (v44/*: any*/),
                  "type": "User",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v44/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v44/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v44/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v45/*: any*/)
              ],
              "storageKey": null
            },
            (v46/*: any*/)
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
},
v48 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v49 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v50 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v51 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v52 = {
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
v53 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v54 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v55 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v56 = [
  "APPROVED",
  "CHANGES_REQUESTED",
  "COMMENTED",
  "DISMISSED",
  "PENDING"
],
v57 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v58 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserContentEdit"
},
v59 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v60 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequest"
},
v61 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v62 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v63 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v64 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "ReactionGroup"
},
v65 = {
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
v66 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReactorConnection"
},
v67 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "Reactor"
},
v68 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v69 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v70 = {
  "enumValues": [
    "PENDING",
    "SUBMITTED"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestReviewCommentState"
},
v71 = {
  "enumValues": [
    "FILE",
    "LINE"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestReviewThreadSubjectType"
},
v72 = [
  "LEFT",
  "RIGHT"
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestReviewTestQuery",
    "selections": [
      {
        "alias": "pullRequestReview",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "PullRequestReview_pullRequestReview"
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
            "name": "Thread_viewer"
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
    "name": "PullRequestReviewTestQuery",
    "selections": [
      {
        "alias": "pullRequestReview",
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
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                  },
                  (v5/*: any*/),
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isActor"
                  }
                ],
                "storageKey": null
              },
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyText",
                "storageKey": null
              },
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": (v9/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 10
                  }
                ],
                "concreteType": "TeamConnection",
                "kind": "LinkedField",
                "name": "onBehalfOf",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TeamEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Team",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Organization",
                            "kind": "LinkedField",
                            "name": "organization",
                            "plural": false,
                            "selections": [
                              (v10/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v10/*: any*/),
                          (v11/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "onBehalfOf(first:10)"
              },
              (v12/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dismissedReviewState",
                "storageKey": null
              },
              (v13/*: any*/),
              (v11/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              {
                "alias": null,
                "args": (v20/*: any*/),
                "concreteType": "PullRequestReviewCommentItemConnection",
                "kind": "LinkedField",
                "name": "pullRequestThreadsAndReplies",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentItemEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              (v21/*: any*/),
                              (v22/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "line",
                                "storageKey": null
                              },
                              (v23/*: any*/),
                              (v24/*: any*/),
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
                                        "name": "startLine",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "endLine",
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
                                          (v25/*: any*/)
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
                              (v26/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanReply",
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
                                          (v28/*: any*/),
                                          (v6/*: any*/),
                                          (v7/*: any*/),
                                          (v29/*: any*/),
                                          (v8/*: any*/),
                                          (v24/*: any*/),
                                          (v4/*: any*/),
                                          (v3/*: any*/),
                                          (v30/*: any*/),
                                          (v31/*: any*/),
                                          (v32/*: any*/),
                                          (v33/*: any*/),
                                          (v34/*: any*/),
                                          (v12/*: any*/),
                                          (v13/*: any*/),
                                          (v26/*: any*/),
                                          (v35/*: any*/),
                                          (v18/*: any*/),
                                          (v36/*: any*/),
                                          (v16/*: any*/),
                                          (v17/*: any*/),
                                          (v37/*: any*/),
                                          (v38/*: any*/),
                                          (v19/*: any*/),
                                          (v39/*: any*/),
                                          (v40/*: any*/),
                                          (v11/*: any*/),
                                          (v14/*: any*/),
                                          (v15/*: any*/),
                                          (v43/*: any*/),
                                          (v47/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v46/*: any*/),
                                  (v25/*: any*/)
                                ],
                                "storageKey": "comments(first:50)"
                              }
                            ],
                            "type": "PullRequestThread",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              (v24/*: any*/),
                              (v23/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestThread",
                                "kind": "LinkedField",
                                "name": "pullRequestThread",
                                "plural": false,
                                "selections": [
                                  (v3/*: any*/),
                                  (v21/*: any*/),
                                  (v22/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v28/*: any*/),
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v29/*: any*/),
                              (v8/*: any*/),
                              (v4/*: any*/),
                              (v30/*: any*/),
                              (v31/*: any*/),
                              (v32/*: any*/),
                              (v33/*: any*/),
                              (v34/*: any*/),
                              (v12/*: any*/),
                              (v13/*: any*/),
                              (v26/*: any*/),
                              (v35/*: any*/),
                              (v18/*: any*/),
                              (v36/*: any*/),
                              (v16/*: any*/),
                              (v17/*: any*/),
                              (v37/*: any*/),
                              (v38/*: any*/),
                              (v19/*: any*/),
                              (v39/*: any*/),
                              (v40/*: any*/),
                              (v11/*: any*/),
                              (v14/*: any*/),
                              (v15/*: any*/),
                              (v47/*: any*/),
                              (v43/*: any*/)
                            ],
                            "type": "PullRequestReviewComment",
                            "abstractKey": null
                          },
                          (v45/*: any*/)
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
                "storageKey": "pullRequestThreadsAndReplies(first:100)"
              },
              {
                "alias": null,
                "args": (v20/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "PullRequestReview_pullRequestThreadsAndReplies",
                "kind": "LinkedHandle",
                "name": "pullRequestThreadsAndReplies"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v41/*: any*/),
                  (v42/*: any*/),
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
                          (v11/*: any*/),
                          (v5/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              (v47/*: any*/),
              (v25/*: any*/)
            ],
            "type": "PullRequestReview",
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
          (v27/*: any*/),
          (v5/*: any*/),
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
                "name": "tabSize",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "diffView",
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
    "id": "cedc3455cf4c00cd3d46ae91848e9d5e",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequestReview": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequestReview.__id": (v48/*: any*/),
        "pullRequestReview.__isComment": (v49/*: any*/),
        "pullRequestReview.__isReactable": (v49/*: any*/),
        "pullRequestReview.__typename": (v49/*: any*/),
        "pullRequestReview.author": (v50/*: any*/),
        "pullRequestReview.author.__isActor": (v49/*: any*/),
        "pullRequestReview.author.__typename": (v49/*: any*/),
        "pullRequestReview.author.avatarUrl": (v51/*: any*/),
        "pullRequestReview.author.id": (v48/*: any*/),
        "pullRequestReview.author.login": (v49/*: any*/),
        "pullRequestReview.authorAssociation": (v52/*: any*/),
        "pullRequestReview.bodyHTML": (v53/*: any*/),
        "pullRequestReview.bodyText": (v49/*: any*/),
        "pullRequestReview.createdAt": (v54/*: any*/),
        "pullRequestReview.databaseId": (v55/*: any*/),
        "pullRequestReview.dismissedReviewState": {
          "enumValues": (v56/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequestReview.id": (v48/*: any*/),
        "pullRequestReview.lastEditedAt": (v57/*: any*/),
        "pullRequestReview.lastUserContentEdit": (v58/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor": (v50/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.__typename": (v49/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.id": (v48/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.login": (v49/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.url": (v51/*: any*/),
        "pullRequestReview.lastUserContentEdit.id": (v48/*: any*/),
        "pullRequestReview.onBehalfOf": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "TeamConnection"
        },
        "pullRequestReview.onBehalfOf.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "TeamEdge"
        },
        "pullRequestReview.onBehalfOf.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Team"
        },
        "pullRequestReview.onBehalfOf.edges.node.id": (v48/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.name": (v49/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Organization"
        },
        "pullRequestReview.onBehalfOf.edges.node.organization.id": (v48/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.organization.name": (v59/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.url": (v51/*: any*/),
        "pullRequestReview.pullRequest": (v60/*: any*/),
        "pullRequestReview.pullRequest.author": (v50/*: any*/),
        "pullRequestReview.pullRequest.author.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequest.author.id": (v48/*: any*/),
        "pullRequestReview.pullRequest.author.login": (v49/*: any*/),
        "pullRequestReview.pullRequest.id": (v48/*: any*/),
        "pullRequestReview.pullRequest.number": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewCommentItemConnection"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestReviewCommentItemEdge"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.cursor": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewCommentItem"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.__isComment": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.__isNode": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.__isReactable": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author.avatarUrl": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.author.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.authorAssociation": (v52/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.body": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.bodyHTML": (v53/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewCommentConnection"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.__id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestReviewCommentEdge"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewComment"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.__isComment": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.__isReactable": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author.avatarUrl": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.author.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.authorAssociation": (v52/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.body": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.bodyHTML": (v53/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.createdAt": (v54/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.currentDiffResourcePath": (v62/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.databaseId": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.isHidden": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastEditedAt": (v57/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit": (v58/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.editor": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.editor.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.editor.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.editor.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.editor.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.lastUserContentEdit.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.minimizedReason": (v59/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.publishedAt": (v57/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups": (v64/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.content": (v65/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors": (v66/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.nodes": (v67/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.nodes.__isNode": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.nodes.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.nodes.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.nodes.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.reactors.totalCount": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reactionGroups.viewerHasReacted": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference": (v60/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.author": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.author.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.author.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.author.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.reference.number": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository": (v68/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.isPrivate": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.name": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.owner": (v69/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.owner.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.owner.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.owner.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.repository.owner.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.stafftoolsUrl": (v62/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.state": (v70/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.subjectType": (v71/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanBlockFromOrg": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanDelete": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanMinimize": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanReadUserContentEdits": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanReport": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanReportToMaintainer": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanSeeMinimizeButton": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanSeeUnminimizeButton": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanUnblockFromOrg": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerCanUpdate": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerDidAuthor": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.edges.node.viewerRelationship": (v52/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.comments.totalCount": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.createdAt": (v54/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.currentDiffResourcePath": (v62/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.databaseId": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.isHidden": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.isOutdated": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.isResolved": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastEditedAt": (v57/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit": (v58/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.editor": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.editor.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.editor.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.editor.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.editor.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.lastUserContentEdit.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.line": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.minimizedReason": (v59/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.path": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.publishedAt": (v57/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.pullRequestThread": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThread"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.pullRequestThread.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.pullRequestThread.isOutdated": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.pullRequestThread.isResolved": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups": (v64/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.content": (v65/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors": (v66/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.nodes": (v67/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.nodes.__isNode": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.nodes.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.nodes.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.nodes.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.reactors.totalCount": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reactionGroups.viewerHasReacted": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference": (v60/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.author": (v50/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.author.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.author.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.author.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.reference.number": (v61/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository": (v68/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.isPrivate": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.name": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.owner": (v69/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.owner.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.owner.id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.owner.login": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.repository.owner.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.stafftoolsUrl": (v62/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.state": (v70/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestThreadSubject"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.__typename": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "DiffLine"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.__id": (v48/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.html": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.left": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.right": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.text": (v49/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.diffLines.type": {
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
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.endDiffSide": {
          "enumValues": (v72/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.endLine": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.originalEndLine": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.originalStartLine": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.startDiffSide": {
          "enumValues": (v72/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "DiffSide"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subject.startLine": (v55/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.subjectType": (v71/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.url": (v51/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanBlockFromOrg": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanDelete": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanMinimize": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanReadUserContentEdits": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanReply": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanReport": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanReportToMaintainer": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanSeeMinimizeButton": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanSeeUnminimizeButton": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanUnblockFromOrg": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerCanUpdate": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerDidAuthor": (v63/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.edges.node.viewerRelationship": (v52/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequestReview.pullRequestThreadsAndReplies.pageInfo.endCursor": (v59/*: any*/),
        "pullRequestReview.pullRequestThreadsAndReplies.pageInfo.hasNextPage": (v63/*: any*/),
        "pullRequestReview.reactionGroups": (v64/*: any*/),
        "pullRequestReview.reactionGroups.content": (v65/*: any*/),
        "pullRequestReview.reactionGroups.reactors": (v66/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes": (v67/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.__isNode": (v49/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.__typename": (v49/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.id": (v48/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.login": (v49/*: any*/),
        "pullRequestReview.reactionGroups.reactors.totalCount": (v61/*: any*/),
        "pullRequestReview.reactionGroups.viewerHasReacted": (v63/*: any*/),
        "pullRequestReview.repository": (v68/*: any*/),
        "pullRequestReview.repository.id": (v48/*: any*/),
        "pullRequestReview.repository.isPrivate": (v63/*: any*/),
        "pullRequestReview.repository.name": (v49/*: any*/),
        "pullRequestReview.repository.owner": (v69/*: any*/),
        "pullRequestReview.repository.owner.__typename": (v49/*: any*/),
        "pullRequestReview.repository.owner.id": (v48/*: any*/),
        "pullRequestReview.repository.owner.login": (v49/*: any*/),
        "pullRequestReview.repository.owner.url": (v51/*: any*/),
        "pullRequestReview.state": {
          "enumValues": (v56/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequestReview.url": (v51/*: any*/),
        "pullRequestReview.viewerCanBlockFromOrg": (v63/*: any*/),
        "pullRequestReview.viewerCanDelete": (v63/*: any*/),
        "pullRequestReview.viewerCanReadUserContentEdits": (v63/*: any*/),
        "pullRequestReview.viewerCanReport": (v63/*: any*/),
        "pullRequestReview.viewerCanReportToMaintainer": (v63/*: any*/),
        "pullRequestReview.viewerCanUnblockFromOrg": (v63/*: any*/),
        "pullRequestReview.viewerCanUpdate": (v63/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v51/*: any*/),
        "viewer.id": (v48/*: any*/),
        "viewer.isSiteAdmin": (v63/*: any*/),
        "viewer.login": (v49/*: any*/),
        "viewer.pullRequestUserPreferences": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestUserPreferences"
        },
        "viewer.pullRequestUserPreferences.diffView": (v49/*: any*/),
        "viewer.pullRequestUserPreferences.tabSize": (v61/*: any*/)
      }
    },
    "name": "PullRequestReviewTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "8952ae40e009d1d82e4820b71e75d0c1";

export default node;
