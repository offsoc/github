/**
 * @generated SignedSource<<18bd2473c2e6cb1d8d9cd049e93da79d>>
 * @relayHash ae396d2b6d19214575d91a9e5fe00764
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ae396d2b6d19214575d91a9e5fe00764

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type PullRequestActivityViewerContentQuery$variables = {
  number: number;
  owner: string;
  repo: string;
  timelinePageSize?: number | null | undefined;
};
export type PullRequestActivityViewerContentQuery$data = {
  readonly repository: {
    readonly pullRequest: {
      readonly headRefOid: any;
      readonly id: string;
      readonly isInMergeQueue: boolean;
      readonly repository: {
        readonly id: string;
      };
      readonly state: PullRequestState;
      readonly viewerCanApplySuggestion: boolean;
      readonly viewerCanComment: boolean;
      readonly " $fragmentSpreads": FragmentRefs<"ActivityView_pullRequest" | "useEmitPageViewEvent_pullRequest">;
    } | null | undefined;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"ActivityView_viewer">;
  };
};
export type PullRequestActivityViewerContentQuery = {
  response: PullRequestActivityViewerContentQuery$data;
  variables: PullRequestActivityViewerContentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "number"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "owner"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "repo"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "timelinePageSize"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "headRefOid",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanComment",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanApplySuggestion",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slashCommandsEnabled",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v16 = {
  "kind": "Literal",
  "name": "itemTypes",
  "value": [
    "ISSUE_COMMENT",
    "PULL_REQUEST_REVIEW",
    "PULL_REQUEST_COMMIT",
    "BASE_REF_FORCE_PUSHED_EVENT",
    "HEAD_REF_FORCE_PUSHED_EVENT",
    "CLOSED_EVENT",
    "REOPENED_EVENT",
    "MERGED_EVENT",
    "REVIEW_DISMISSED_EVENT",
    "REVIEW_REQUESTED_EVENT"
  ]
},
v17 = {
  "kind": "Literal",
  "name": "visibleEventsOnly",
  "value": true
},
v18 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "timelinePageSize"
  },
  (v16/*: any*/),
  (v17/*: any*/)
],
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
  "name": "__typename",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorAssociation",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanMinimize",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v31 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
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
  "name": "viewerDidAuthor",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v20/*: any*/),
    (v3/*: any*/),
    (v10/*: any*/),
    (v15/*: any*/)
  ],
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "locked",
  "storageKey": null
},
v39 = [
  (v20/*: any*/),
  (v10/*: any*/),
  (v3/*: any*/)
],
v40 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": (v39/*: any*/),
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
            (v20/*: any*/),
            (v15/*: any*/),
            (v10/*: any*/),
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
v44 = [
  (v10/*: any*/)
],
v45 = {
  "kind": "InlineFragment",
  "selections": (v4/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v46 = {
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
                (v20/*: any*/),
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
            (v19/*: any*/)
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
v47 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/),
    (v12/*: any*/),
    (v21/*: any*/),
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
    (v22/*: any*/),
    (v15/*: any*/),
    (v23/*: any*/),
    (v24/*: any*/),
    (v25/*: any*/),
    (v26/*: any*/),
    (v27/*: any*/),
    (v28/*: any*/),
    (v29/*: any*/),
    (v30/*: any*/),
    (v31/*: any*/),
    (v32/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdViaEmail",
      "storageKey": null
    },
    (v33/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Sponsorship",
      "kind": "LinkedField",
      "name": "authorToRepoOwnerSponsorship",
      "plural": false,
      "selections": [
        (v23/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isActive",
          "storageKey": null
        },
        (v3/*: any*/)
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
        (v20/*: any*/),
        (v3/*: any*/),
        (v10/*: any*/),
        (v11/*: any*/)
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
        (v34/*: any*/),
        (v35/*: any*/),
        (v36/*: any*/),
        (v14/*: any*/),
        (v13/*: any*/),
        (v12/*: any*/)
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
        (v37/*: any*/),
        (v3/*: any*/),
        (v38/*: any*/),
        (v40/*: any*/)
      ],
      "storageKey": null
    },
    (v43/*: any*/),
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
    (v46/*: any*/)
  ],
  "type": "IssueComment",
  "abstractKey": null
},
v48 = {
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
v49 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
},
v50 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v20/*: any*/),
    (v3/*: any*/),
    (v48/*: any*/),
    (v10/*: any*/),
    (v49/*: any*/)
  ],
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyText",
  "storageKey": null
},
v53 = [
  (v37/*: any*/),
  (v40/*: any*/),
  (v3/*: any*/)
],
v54 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": (v53/*: any*/),
  "storageKey": null
},
v55 = {
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
                (v34/*: any*/),
                (v3/*: any*/)
              ],
              "storageKey": null
            },
            (v34/*: any*/),
            (v15/*: any*/),
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
v56 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v36/*: any*/),
    (v34/*: any*/),
    (v35/*: any*/)
  ],
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dismissedReviewState",
  "storageKey": null
},
v58 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isResolved",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentDiffResourcePath",
  "storageKey": null
},
v63 = {
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
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subjectType",
  "storageKey": null
},
v65 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v20/*: any*/),
    (v11/*: any*/),
    (v3/*: any*/),
    (v10/*: any*/),
    (v15/*: any*/)
  ],
  "storageKey": null
},
v66 = {
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
        (v20/*: any*/),
        (v10/*: any*/),
        (v15/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    (v3/*: any*/)
  ],
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "publishedAt",
  "storageKey": null
},
v68 = {
  "alias": "reference",
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": (v53/*: any*/),
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeMinimizeButton",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeUnminimizeButton",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerRelationship",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stafftoolsUrl",
  "storageKey": null
},
v73 = {
  "kind": "InlineFragment",
  "selections": [
    (v41/*: any*/),
    (v42/*: any*/)
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v75 = {
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
v76 = {
  "alias": null,
  "args": (v58/*: any*/),
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
            (v20/*: any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                (v3/*: any*/),
                (v59/*: any*/),
                (v60/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "line",
                  "storageKey": null
                },
                (v61/*: any*/),
                (v62/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "subject",
                  "plural": false,
                  "selections": [
                    (v20/*: any*/),
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
                            (v63/*: any*/)
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
                (v64/*: any*/),
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
                            (v65/*: any*/),
                            (v24/*: any*/),
                            (v51/*: any*/),
                            (v21/*: any*/),
                            (v23/*: any*/),
                            (v62/*: any*/),
                            (v12/*: any*/),
                            (v3/*: any*/),
                            (v31/*: any*/),
                            (v66/*: any*/),
                            (v32/*: any*/),
                            (v67/*: any*/),
                            (v68/*: any*/),
                            (v56/*: any*/),
                            (v7/*: any*/),
                            (v64/*: any*/),
                            (v33/*: any*/),
                            (v29/*: any*/),
                            (v26/*: any*/),
                            (v27/*: any*/),
                            (v28/*: any*/),
                            (v69/*: any*/),
                            (v70/*: any*/),
                            (v30/*: any*/),
                            (v71/*: any*/),
                            (v72/*: any*/),
                            (v15/*: any*/),
                            (v25/*: any*/),
                            (v22/*: any*/),
                            (v73/*: any*/),
                            (v46/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    },
                    (v19/*: any*/),
                    (v63/*: any*/)
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
                (v62/*: any*/),
                (v61/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "PullRequestThread",
                  "kind": "LinkedField",
                  "name": "pullRequestThread",
                  "plural": false,
                  "selections": [
                    (v3/*: any*/),
                    (v59/*: any*/),
                    (v60/*: any*/)
                  ],
                  "storageKey": null
                },
                (v65/*: any*/),
                (v24/*: any*/),
                (v51/*: any*/),
                (v21/*: any*/),
                (v23/*: any*/),
                (v12/*: any*/),
                (v31/*: any*/),
                (v66/*: any*/),
                (v32/*: any*/),
                (v67/*: any*/),
                (v68/*: any*/),
                (v56/*: any*/),
                (v7/*: any*/),
                (v64/*: any*/),
                (v33/*: any*/),
                (v29/*: any*/),
                (v26/*: any*/),
                (v27/*: any*/),
                (v28/*: any*/),
                (v69/*: any*/),
                (v70/*: any*/),
                (v30/*: any*/),
                (v71/*: any*/),
                (v72/*: any*/),
                (v15/*: any*/),
                (v25/*: any*/),
                (v22/*: any*/),
                (v46/*: any*/),
                (v73/*: any*/)
              ],
              "type": "PullRequestReviewComment",
              "abstractKey": null
            },
            (v45/*: any*/)
          ],
          "storageKey": null
        },
        (v74/*: any*/)
      ],
      "storageKey": null
    },
    (v75/*: any*/)
  ],
  "storageKey": "pullRequestThreadsAndReplies(first:100)"
},
v77 = {
  "alias": null,
  "args": (v58/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "PullRequestReview_pullRequestThreadsAndReplies",
  "kind": "LinkedHandle",
  "name": "pullRequestThreadsAndReplies"
},
v78 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v80 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authoredDate",
  "storageKey": null
},
v81 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "first",
      "value": 1
    }
  ],
  "concreteType": "GitActorConnection",
  "kind": "LinkedField",
  "name": "authors",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "GitActorEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "GitActor",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "user",
              "plural": false,
              "selections": [
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v48/*: any*/),
                    (v10/*: any*/),
                    (v20/*: any*/)
                  ],
                  "type": "Actor",
                  "abstractKey": "__isActor"
                },
                (v3/*: any*/)
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
  "storageKey": "authors(first:1)"
},
v82 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "commit",
      "plural": false,
      "selections": [
        (v78/*: any*/),
        (v79/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "message",
          "storageKey": null
        },
        (v80/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "verificationStatus",
          "storageKey": null
        },
        (v81/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequestCommit",
  "abstractKey": null
},
v83 = [
  (v78/*: any*/),
  (v79/*: any*/),
  (v3/*: any*/)
],
v84 = [
  (v12/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "refName",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Commit",
    "kind": "LinkedField",
    "name": "beforeCommit",
    "plural": false,
    "selections": (v83/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Commit",
    "kind": "LinkedField",
    "name": "afterCommit",
    "plural": false,
    "selections": [
      (v78/*: any*/),
      (v79/*: any*/),
      (v80/*: any*/),
      (v81/*: any*/),
      (v3/*: any*/)
    ],
    "storageKey": null
  }
],
v85 = {
  "kind": "InlineFragment",
  "selections": (v84/*: any*/),
  "type": "BaseRefForcePushedEvent",
  "abstractKey": null
},
v86 = {
  "kind": "InlineFragment",
  "selections": (v84/*: any*/),
  "type": "HeadRefForcePushedEvent",
  "abstractKey": null
},
v87 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v34/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": (v39/*: any*/),
      "storageKey": null
    },
    (v3/*: any*/)
  ],
  "storageKey": null
},
v88 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v20/*: any*/),
    (v49/*: any*/),
    (v48/*: any*/),
    (v10/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v89 = {
  "kind": "InlineFragment",
  "selections": [
    (v12/*: any*/),
    (v23/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "stateReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "closingProjectItemStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "closer",
      "plural": false,
      "selections": [
        (v20/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v15/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            }
          ],
          "type": "ProjectV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v15/*: any*/),
            (v37/*: any*/),
            (v87/*: any*/)
          ],
          "type": "PullRequest",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v15/*: any*/),
            (v78/*: any*/),
            (v87/*: any*/)
          ],
          "type": "Commit",
          "abstractKey": null
        },
        (v45/*: any*/)
      ],
      "storageKey": null
    },
    (v88/*: any*/)
  ],
  "type": "ClosedEvent",
  "abstractKey": null
},
v90 = {
  "kind": "InlineFragment",
  "selections": [
    (v12/*: any*/),
    (v23/*: any*/),
    (v88/*: any*/)
  ],
  "type": "ReopenedEvent",
  "abstractKey": null
},
v91 = {
  "kind": "InlineFragment",
  "selections": [
    (v12/*: any*/),
    (v88/*: any*/),
    {
      "alias": "mergeCommit",
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "commit",
      "plural": false,
      "selections": (v83/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mergeRefName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viaMergeQueue",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viaMergeQueueAPI",
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "type": "MergedEvent",
  "abstractKey": null
},
v92 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourcePath",
  "storageKey": null
},
v93 = {
  "kind": "InlineFragment",
  "selections": [
    (v12/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        (v20/*: any*/),
        (v10/*: any*/),
        (v49/*: any*/),
        (v48/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestCommit",
      "kind": "LinkedField",
      "name": "pullRequestCommit",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Commit",
          "kind": "LinkedField",
          "name": "commit",
          "plural": false,
          "selections": [
            (v78/*: any*/),
            (v3/*: any*/)
          ],
          "storageKey": null
        },
        (v92/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestReview",
      "kind": "LinkedField",
      "name": "review",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fullDatabaseId",
          "storageKey": null
        },
        (v40/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dismissalMessageHTML",
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "type": "ReviewDismissedEvent",
  "abstractKey": null
},
v94 = {
  "kind": "InlineFragment",
  "selections": [
    (v12/*: any*/),
    (v88/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "requestedReviewAssignedFromTeamName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ReviewRequest",
      "kind": "LinkedField",
      "name": "reviewRequest",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "codeOwnersResourcePath",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "requestedReviewer",
          "plural": false,
          "selections": [
            (v20/*: any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                (v10/*: any*/),
                (v92/*: any*/)
              ],
              "type": "User",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "combinedSlug",
                  "storageKey": null
                },
                (v92/*: any*/)
              ],
              "type": "Team",
              "abstractKey": null
            },
            (v45/*: any*/)
          ],
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "type": "ReviewRequestedEvent",
  "abstractKey": null
},
v95 = [
  "visibleEventsOnly",
  "itemTypes"
],
v96 = [
  (v16/*: any*/),
  {
    "kind": "Literal",
    "name": "last",
    "value": 0
  },
  (v17/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestActivityViewerContentQuery",
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
            "name": "ActivityView_viewer"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": null
              },
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "args": [
                  {
                    "kind": "Variable",
                    "name": "timelinePageSize",
                    "variableName": "timelinePageSize"
                  }
                ],
                "kind": "FragmentSpread",
                "name": "ActivityView_pullRequest"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useEmitPageViewEvent_pullRequest"
              }
            ],
            "storageKey": null
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
    "name": "PullRequestActivityViewerContentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v11/*: any*/),
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
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isArchived",
                    "storageKey": null
                  },
                  (v13/*: any*/),
                  (v14/*: any*/),
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
                  (v15/*: any*/)
                ],
                "storageKey": null
              },
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "alias": "forwardTimeline",
                "args": (v18/*: any*/),
                "concreteType": "PullRequestTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  (v19/*: any*/),
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
                          (v20/*: any*/),
                          (v47/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              (v12/*: any*/),
                              (v50/*: any*/),
                              (v24/*: any*/),
                              (v51/*: any*/),
                              (v52/*: any*/),
                              (v23/*: any*/),
                              (v54/*: any*/),
                              (v55/*: any*/),
                              (v56/*: any*/),
                              (v57/*: any*/),
                              (v7/*: any*/),
                              (v15/*: any*/),
                              (v25/*: any*/),
                              (v22/*: any*/),
                              (v27/*: any*/),
                              (v28/*: any*/),
                              (v29/*: any*/),
                              (v30/*: any*/),
                              (v76/*: any*/),
                              (v77/*: any*/),
                              (v43/*: any*/),
                              (v46/*: any*/),
                              (v63/*: any*/)
                            ],
                            "type": "PullRequestReview",
                            "abstractKey": null
                          },
                          (v46/*: any*/),
                          (v82/*: any*/),
                          (v85/*: any*/),
                          (v86/*: any*/),
                          (v89/*: any*/),
                          (v90/*: any*/),
                          (v91/*: any*/),
                          (v93/*: any*/),
                          (v94/*: any*/),
                          (v45/*: any*/),
                          (v63/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v74/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v75/*: any*/),
                  (v63/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": "forwardTimeline",
                "args": (v18/*: any*/),
                "filters": (v95/*: any*/),
                "handle": "connection",
                "key": "PullRequestTimelineForwardPagination_forwardTimeline",
                "kind": "LinkedHandle",
                "name": "timelineItems"
              },
              {
                "alias": "backwardTimeline",
                "args": (v96/*: any*/),
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
                          (v20/*: any*/),
                          (v47/*: any*/),
                          (v46/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              (v12/*: any*/),
                              (v50/*: any*/),
                              (v24/*: any*/),
                              (v51/*: any*/),
                              (v52/*: any*/),
                              (v23/*: any*/),
                              (v54/*: any*/),
                              (v55/*: any*/),
                              (v56/*: any*/),
                              (v57/*: any*/),
                              (v7/*: any*/),
                              (v15/*: any*/),
                              (v25/*: any*/),
                              (v22/*: any*/),
                              (v27/*: any*/),
                              (v28/*: any*/),
                              (v29/*: any*/),
                              (v30/*: any*/),
                              (v76/*: any*/),
                              (v77/*: any*/),
                              (v43/*: any*/),
                              (v63/*: any*/)
                            ],
                            "type": "PullRequestReview",
                            "abstractKey": null
                          },
                          (v82/*: any*/),
                          (v85/*: any*/),
                          (v86/*: any*/),
                          (v89/*: any*/),
                          (v90/*: any*/),
                          (v91/*: any*/),
                          (v93/*: any*/),
                          (v94/*: any*/),
                          (v45/*: any*/),
                          (v63/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v74/*: any*/)
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
                  (v63/*: any*/)
                ],
                "storageKey": "timelineItems(itemTypes:[\"ISSUE_COMMENT\",\"PULL_REQUEST_REVIEW\",\"PULL_REQUEST_COMMIT\",\"BASE_REF_FORCE_PUSHED_EVENT\",\"HEAD_REF_FORCE_PUSHED_EVENT\",\"CLOSED_EVENT\",\"REOPENED_EVENT\",\"MERGED_EVENT\",\"REVIEW_DISMISSED_EVENT\",\"REVIEW_REQUESTED_EVENT\"],last:0,visibleEventsOnly:true)"
              },
              {
                "alias": "backwardTimeline",
                "args": (v96/*: any*/),
                "filters": (v95/*: any*/),
                "handle": "connection",
                "key": "PullRequestTimelineBackwardPagination_backwardTimeline",
                "kind": "LinkedHandle",
                "name": "timelineItems"
              },
              (v38/*: any*/),
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
              (v12/*: any*/),
              (v15/*: any*/),
              (v40/*: any*/),
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
                    "args": null,
                    "kind": "ScalarField",
                    "name": "filesChanged",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "linesChanged",
                    "storageKey": null
                  }
                ],
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
    "id": "ae396d2b6d19214575d91a9e5fe00764",
    "metadata": {},
    "name": "PullRequestActivityViewerContentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "3ff3c17df836200dc2ca1db0b9f1da78";

export default node;
