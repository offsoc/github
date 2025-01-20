/**
 * @generated SignedSource<<621b9e2b992ff4b358185283dd8673e3>>
 * @relayHash d428ae3fc522474117ec5a6a4b300a04
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d428ae3fc522474117ec5a6a4b300a04

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestCommentComposerTestQuery$variables = {
  id: string;
};
export type PullRequestCommentComposerTestQuery$data = {
  readonly pullRequest: {
    readonly backwardTimeline?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly __typename: string;
          readonly __id: string;
          readonly " $fragmentSpreads": FragmentRefs<"IssueComment_issueComment" | "ReactionViewerGroups">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly " $fragmentSpreads": FragmentRefs<"PullRequestCommentComposer_pullRequest">;
  } | null | undefined;
};
export type PullRequestCommentComposerTestQuery = {
  response: PullRequestCommentComposerTestQuery$data;
  variables: PullRequestCommentComposerTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "Literal",
  "name": "itemTypes",
  "value": [
    "ISSUE_COMMENT",
    "PULL_REQUEST_REVIEW"
  ]
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v6 = {
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
      "name": "hasPreviousPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  (v2/*: any*/),
  {
    "kind": "Literal",
    "name": "last",
    "value": 10
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slashCommandsEnabled",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "locked",
  "storageKey": null
},
v16 = [
  (v12/*: any*/)
],
v17 = {
  "kind": "InlineFragment",
  "selections": [
    (v7/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v18 = {
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
                (v3/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v16/*: any*/),
                  "type": "User",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v16/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v16/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v16/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v17/*: any*/)
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
},
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v21 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v22 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v25 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v27 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v28 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v30 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestCommentComposerTestQuery",
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
                "alias": "backwardTimeline",
                "args": [
                  (v2/*: any*/)
                ],
                "concreteType": "PullRequestTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "__PullRequestTimelineBackwardPagination_backwardTimeline_connection",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestTimelineItemsEdge",
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
                          (v3/*: any*/),
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "IssueComment_issueComment"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ReactionViewerGroups"
                          },
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/)
                ],
                "storageKey": "__PullRequestTimelineBackwardPagination_backwardTimeline_connection(itemTypes:[\"ISSUE_COMMENT\",\"PULL_REQUEST_REVIEW\"])"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "PullRequestCommentComposer_pullRequest"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestCommentComposerTestQuery",
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
          (v7/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "backwardTimeline",
                "args": (v8/*: any*/),
                "concreteType": "PullRequestTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestTimelineItemsEdge",
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
                          (v3/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v7/*: any*/),
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "body",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": [
                                  {
                                    "kind": "Literal",
                                    "name": "unfurlReferences",
                                    "value": true
                                  }
                                ],
                                "kind": "ScalarField",
                                "name": "bodyHTML",
                                "storageKey": "bodyHTML(unfurlReferences:true)"
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "bodyVersion",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanUpdate",
                                "storageKey": null
                              },
                              (v10/*: any*/),
                              (v11/*: any*/),
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
                                "name": "viewerCanDelete",
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
                                "name": "viewerCanBlockFromOrg",
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
                                "alias": "isHidden",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "isMinimized",
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
                                "name": "createdViaEmail",
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
                                "concreteType": "Sponsorship",
                                "kind": "LinkedField",
                                "name": "authorToRepoOwnerSponsorship",
                                "plural": false,
                                "selections": [
                                  (v11/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isActive",
                                    "storageKey": null
                                  },
                                  (v7/*: any*/)
                                ],
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
                                  (v3/*: any*/),
                                  (v7/*: any*/),
                                  (v12/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  }
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
                                  (v7/*: any*/),
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
                                      (v3/*: any*/),
                                      (v7/*: any*/),
                                      (v12/*: any*/),
                                      (v10/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isPrivate",
                                    "storageKey": null
                                  },
                                  (v13/*: any*/),
                                  (v14/*: any*/),
                                  (v9/*: any*/)
                                ],
                                "storageKey": null
                              },
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
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "number",
                                    "storageKey": null
                                  },
                                  (v7/*: any*/),
                                  (v15/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "author",
                                    "plural": false,
                                    "selections": [
                                      (v3/*: any*/),
                                      (v12/*: any*/),
                                      (v7/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
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
                                          (v3/*: any*/),
                                          (v10/*: any*/),
                                          (v12/*: any*/),
                                          (v7/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v7/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "type": "Comment",
                                "abstractKey": "__isComment"
                              },
                              {
                                "kind": "ClientExtension",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingMinimizeReason",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingBlock",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingUnblock",
                                    "storageKey": null
                                  }
                                ]
                              },
                              (v18/*: any*/)
                            ],
                            "type": "IssueComment",
                            "abstractKey": null
                          },
                          (v18/*: any*/),
                          (v17/*: any*/),
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/)
                ],
                "storageKey": "timelineItems(itemTypes:[\"ISSUE_COMMENT\",\"PULL_REQUEST_REVIEW\"],last:10)"
              },
              {
                "alias": "backwardTimeline",
                "args": (v8/*: any*/),
                "filters": [
                  "itemTypes"
                ],
                "handle": "connection",
                "key": "PullRequestTimelineBackwardPagination_backwardTimeline",
                "kind": "LinkedHandle",
                "name": "timelineItems"
              },
              (v15/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanComment",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanClose",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReopen",
                "storageKey": null
              },
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isArchived",
                    "storageKey": null
                  },
                  (v14/*: any*/),
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "securityPolicyUrl",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "contributingFileUrl",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "codeOfConductFileUrl",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "visibility",
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
                "name": "state",
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
    "id": "d428ae3fc522474117ec5a6a4b300a04",
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "backward",
          "path": [
            "pullRequest",
            "backwardTimeline"
          ]
        }
      ],
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestTimelineItemsConnection"
        },
        "pullRequest.backwardTimeline.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestTimelineItemsEdge"
        },
        "pullRequest.backwardTimeline.edges.cursor": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestTimelineItems"
        },
        "pullRequest.backwardTimeline.edges.node.__id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.__isComment": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.__isNode": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.__isReactable": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.author": (v21/*: any*/),
        "pullRequest.backwardTimeline.edges.node.author.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.author.avatarUrl": (v22/*: any*/),
        "pullRequest.backwardTimeline.edges.node.author.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.author.login": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.authorAssociation": {
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
        "pullRequest.backwardTimeline.edges.node.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "pullRequest.backwardTimeline.edges.node.authorToRepoOwnerSponsorship.createdAt": (v23/*: any*/),
        "pullRequest.backwardTimeline.edges.node.authorToRepoOwnerSponsorship.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.authorToRepoOwnerSponsorship.isActive": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.body": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.bodyHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "pullRequest.backwardTimeline.edges.node.bodyVersion": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.createdAt": (v23/*: any*/),
        "pullRequest.backwardTimeline.edges.node.createdViaEmail": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.databaseId": (v25/*: any*/),
        "pullRequest.backwardTimeline.edges.node.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.isHidden": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "pullRequest.backwardTimeline.edges.node.issue.author": (v21/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.author.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.author.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.author.login": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.locked": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.issue.number": (v26/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.editor": (v21/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.editor.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.editor.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.editor.login": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.editor.url": (v22/*: any*/),
        "pullRequest.backwardTimeline.edges.node.lastUserContentEdit.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.minimizedReason": (v27/*: any*/),
        "pullRequest.backwardTimeline.edges.node.pendingBlock": (v28/*: any*/),
        "pullRequest.backwardTimeline.edges.node.pendingMinimizeReason": (v27/*: any*/),
        "pullRequest.backwardTimeline.edges.node.pendingUnblock": (v28/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "pullRequest.backwardTimeline.edges.node.reactionGroups.content": {
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
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.nodes.__isNode": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.nodes.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.nodes.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.nodes.login": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups.reactors.totalCount": (v26/*: any*/),
        "pullRequest.backwardTimeline.edges.node.reactionGroups.viewerHasReacted": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository": (v29/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.databaseId": (v25/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.isPrivate": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.name": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.nameWithOwner": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequest.backwardTimeline.edges.node.repository.owner.__typename": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.owner.id": (v20/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.owner.login": (v19/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.owner.url": (v22/*: any*/),
        "pullRequest.backwardTimeline.edges.node.repository.slashCommandsEnabled": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.url": (v22/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanBlockFromOrg": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanDelete": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanMinimize": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanReadUserContentEdits": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanReport": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanReportToMaintainer": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanUnblockFromOrg": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerCanUpdate": (v24/*: any*/),
        "pullRequest.backwardTimeline.edges.node.viewerDidAuthor": (v24/*: any*/),
        "pullRequest.backwardTimeline.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "pullRequest.backwardTimeline.pageInfo.hasPreviousPage": (v24/*: any*/),
        "pullRequest.backwardTimeline.pageInfo.startCursor": (v27/*: any*/),
        "pullRequest.databaseId": (v25/*: any*/),
        "pullRequest.id": (v20/*: any*/),
        "pullRequest.locked": (v24/*: any*/),
        "pullRequest.repository": (v29/*: any*/),
        "pullRequest.repository.codeOfConductFileUrl": (v30/*: any*/),
        "pullRequest.repository.contributingFileUrl": (v30/*: any*/),
        "pullRequest.repository.databaseId": (v25/*: any*/),
        "pullRequest.repository.id": (v20/*: any*/),
        "pullRequest.repository.isArchived": (v24/*: any*/),
        "pullRequest.repository.nameWithOwner": (v19/*: any*/),
        "pullRequest.repository.securityPolicyUrl": (v30/*: any*/),
        "pullRequest.repository.slashCommandsEnabled": (v24/*: any*/),
        "pullRequest.repository.visibility": {
          "enumValues": [
            "INTERNAL",
            "PRIVATE",
            "PUBLIC"
          ],
          "nullable": false,
          "plural": false,
          "type": "RepositoryVisibility"
        },
        "pullRequest.state": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "pullRequest.viewerCanClose": (v24/*: any*/),
        "pullRequest.viewerCanComment": (v24/*: any*/),
        "pullRequest.viewerCanReopen": (v24/*: any*/)
      }
    },
    "name": "PullRequestCommentComposerTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "c3dabd61c01b68b9ec163b694de45ec4";

export default node;
