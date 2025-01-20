/**
 * @generated SignedSource<<aa589e9f7f9f70d4e317e8eeb1862694>>
 * @relayHash e5a693d51f81c0c0e48dba53110fe49a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e5a693d51f81c0c0e48dba53110fe49a

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerTestComponentSecondaryQuery$variables = {
  issueId: string;
};
export type IssueViewerTestComponentSecondaryQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueViewerSecondaryIssueData">;
  } | null | undefined;
};
export type IssueViewerTestComponentSecondaryQuery = {
  response: IssueViewerTestComponentSecondaryQuery$data;
  variables: IssueViewerTestComponentSecondaryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "issueId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "issueId"
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
  "name": "number",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
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
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v6/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stateReason",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "completed",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "SubIssuesSummary",
  "kind": "LinkedField",
  "name": "subIssuesSummary",
  "plural": false,
  "selections": [
    (v13/*: any*/)
  ],
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v16 = [
  (v15/*: any*/)
],
v17 = {
  "alias": "subIssuesConnection",
  "args": null,
  "concreteType": "IssueConnection",
  "kind": "LinkedField",
  "name": "subIssues",
  "plural": false,
  "selections": (v16/*: any*/),
  "storageKey": null
},
v18 = {
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
    (v2/*: any*/)
  ],
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestConnection",
  "kind": "LinkedField",
  "name": "associatedPullRequests",
  "plural": false,
  "selections": (v16/*: any*/),
  "storageKey": null
},
v20 = {
  "kind": "Literal",
  "name": "first",
  "value": 10
},
v21 = {
  "kind": "Literal",
  "name": "includeClosedPrs",
  "value": true
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v23 = [
  (v20/*: any*/)
],
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v25 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestConnection"
},
v26 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "PullRequest"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v30 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v31 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v32 = {
  "enumValues": [
    "CLOSED",
    "MERGED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestState"
},
v33 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v34 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Ref"
},
v35 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestConnection"
},
v36 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "GitObject"
},
v37 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
},
v38 = {
  "enumValues": [
    "CLOSED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "IssueState"
},
v39 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v40 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "IssueConnection"
},
v41 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "SubIssuesSummary"
},
v42 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UserConnection"
},
v43 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "Issue"
},
v44 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueViewerTestComponentSecondaryQuery",
    "selections": [
      {
        "alias": null,
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
                "name": "IssueViewerSecondaryIssueData"
              }
            ],
            "type": "Issue",
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
    "name": "IssueViewerTestComponentSecondaryQuery",
    "selections": [
      {
        "alias": null,
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isTransferInProgress",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "repository",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v7/*: any*/),
                      (v3/*: any*/),
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v14/*: any*/),
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReopen",
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "slashCommandsEnabled",
                    "storageKey": null
                  },
                  (v3/*: any*/),
                  (v5/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isArchived",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v11/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 25
                  }
                ],
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
                          (v5/*: any*/),
                          (v3/*: any*/),
                          (v2/*: any*/),
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Repository",
                            "kind": "LinkedField",
                            "name": "repository",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              (v8/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Ref",
                                "kind": "LinkedField",
                                "name": "defaultBranchRef",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
                                  (v3/*: any*/),
                                  (v18/*: any*/),
                                  (v19/*: any*/),
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
                          (v19/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:25)"
              },
              {
                "alias": null,
                "args": [
                  (v20/*: any*/),
                  (v21/*: any*/)
                ],
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequest",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v2/*: any*/),
                      (v12/*: any*/),
                      (v4/*: any*/),
                      (v11/*: any*/),
                      (v9/*: any*/),
                      (v22/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isInMergeQueue",
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
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v5/*: any*/),
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "owner",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              (v2/*: any*/),
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
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:true)"
              },
              {
                "alias": "linkedPullRequests",
                "args": [
                  (v20/*: any*/),
                  {
                    "kind": "Literal",
                    "name": "includeClosedPrs",
                    "value": false
                  },
                  {
                    "kind": "Literal",
                    "name": "orderByState",
                    "value": true
                  }
                ],
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequest",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v8/*: any*/),
                          (v3/*: any*/),
                          (v5/*: any*/),
                          (v7/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v9/*: any*/),
                      (v22/*: any*/),
                      (v12/*: any*/),
                      (v4/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateNext",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateMetadata",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerThreadSubscriptionFormAction",
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v23/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "participants",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v6/*: any*/),
                      (v5/*: any*/),
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
                      }
                    ],
                    "storageKey": null
                  },
                  (v15/*: any*/)
                ],
                "storageKey": "participants(first:10)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TaskListSummary",
                "kind": "LinkedField",
                "name": "taskListSummary",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "itemCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "completeCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TrackedIssueCompletion",
                "kind": "LinkedField",
                "name": "tasklistBlocksCompletion",
                "plural": false,
                "selections": [
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "total",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v23/*: any*/),
                "concreteType": "IssueConnection",
                "kind": "LinkedField",
                "name": "trackedInIssues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v4/*: any*/),
                      (v12/*: any*/),
                      (v10/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v15/*: any*/)
                ],
                "storageKey": "trackedInIssues(first:10)"
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
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 50
                  }
                ],
                "concreteType": "IssueConnection",
                "kind": "LinkedField",
                "name": "subIssues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      {
                        "alias": null,
                        "args": (v23/*: any*/),
                        "concreteType": "UserConnection",
                        "kind": "LinkedField",
                        "name": "assignees",
                        "plural": false,
                        "selections": [
                          (v15/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v3/*: any*/),
                                  (v6/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "assignees(first:10)"
                      },
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v7/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "databaseId",
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titleHTML",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "IssueType",
                        "kind": "LinkedField",
                        "name": "issueType",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "color",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v14/*: any*/),
                      (v17/*: any*/),
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 0
                          },
                          (v21/*: any*/)
                        ],
                        "concreteType": "PullRequestConnection",
                        "kind": "LinkedField",
                        "name": "closedByPullRequestsReferences",
                        "plural": false,
                        "selections": (v16/*: any*/),
                        "storageKey": "closedByPullRequestsReferences(first:0,includeClosedPrs:true)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "closed",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "subIssues(first:50)"
              },
              (v17/*: any*/),
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
                          (v2/*: any*/),
                          (v12/*: any*/),
                          (v6/*: any*/),
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
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "e5a693d51f81c0c0e48dba53110fe49a",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isComment": (v24/*: any*/),
        "node.__typename": (v24/*: any*/),
        "node.closedByPullRequestsReferences": (v25/*: any*/),
        "node.closedByPullRequestsReferences.nodes": (v26/*: any*/),
        "node.closedByPullRequestsReferences.nodes.__typename": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "node.closedByPullRequestsReferences.nodes.id": (v27/*: any*/),
        "node.closedByPullRequestsReferences.nodes.isDraft": (v28/*: any*/),
        "node.closedByPullRequestsReferences.nodes.isInMergeQueue": (v28/*: any*/),
        "node.closedByPullRequestsReferences.nodes.number": (v29/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository": (v30/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.id": (v27/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.name": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.nameWithOwner": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.owner": (v31/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.owner.__typename": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.owner.id": (v27/*: any*/),
        "node.closedByPullRequestsReferences.nodes.repository.owner.login": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.state": (v32/*: any*/),
        "node.closedByPullRequestsReferences.nodes.title": (v24/*: any*/),
        "node.closedByPullRequestsReferences.nodes.url": (v33/*: any*/),
        "node.id": (v27/*: any*/),
        "node.isTransferInProgress": (v28/*: any*/),
        "node.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "node.lastUserContentEdit.editor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "node.lastUserContentEdit.editor.__typename": (v24/*: any*/),
        "node.lastUserContentEdit.editor.id": (v27/*: any*/),
        "node.lastUserContentEdit.editor.login": (v24/*: any*/),
        "node.lastUserContentEdit.editor.url": (v33/*: any*/),
        "node.lastUserContentEdit.id": (v27/*: any*/),
        "node.linkedBranches": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "LinkedBranchConnection"
        },
        "node.linkedBranches.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "LinkedBranch"
        },
        "node.linkedBranches.nodes.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref": (v34/*: any*/),
        "node.linkedBranches.nodes.ref.__typename": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.associatedPullRequests": (v35/*: any*/),
        "node.linkedBranches.nodes.ref.associatedPullRequests.totalCount": (v29/*: any*/),
        "node.linkedBranches.nodes.ref.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.name": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.repository": (v30/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef": (v34/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.associatedPullRequests": (v35/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.associatedPullRequests.totalCount": (v29/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.name": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.repository": (v30/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.repository.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.target": (v36/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.target.__typename": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.target.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.repository.defaultBranchRef.target.oid": (v37/*: any*/),
        "node.linkedBranches.nodes.ref.repository.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.repository.nameWithOwner": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.target": (v36/*: any*/),
        "node.linkedBranches.nodes.ref.target.__typename": (v24/*: any*/),
        "node.linkedBranches.nodes.ref.target.id": (v27/*: any*/),
        "node.linkedBranches.nodes.ref.target.oid": (v37/*: any*/),
        "node.linkedPullRequests": (v25/*: any*/),
        "node.linkedPullRequests.nodes": (v26/*: any*/),
        "node.linkedPullRequests.nodes.id": (v27/*: any*/),
        "node.linkedPullRequests.nodes.isDraft": (v28/*: any*/),
        "node.linkedPullRequests.nodes.number": (v29/*: any*/),
        "node.linkedPullRequests.nodes.repository": (v30/*: any*/),
        "node.linkedPullRequests.nodes.repository.id": (v27/*: any*/),
        "node.linkedPullRequests.nodes.repository.name": (v24/*: any*/),
        "node.linkedPullRequests.nodes.repository.nameWithOwner": (v24/*: any*/),
        "node.linkedPullRequests.nodes.repository.owner": (v31/*: any*/),
        "node.linkedPullRequests.nodes.repository.owner.__typename": (v24/*: any*/),
        "node.linkedPullRequests.nodes.repository.owner.id": (v27/*: any*/),
        "node.linkedPullRequests.nodes.repository.owner.login": (v24/*: any*/),
        "node.linkedPullRequests.nodes.state": (v32/*: any*/),
        "node.linkedPullRequests.nodes.url": (v33/*: any*/),
        "node.number": (v29/*: any*/),
        "node.parent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "node.parent.id": (v27/*: any*/),
        "node.parent.number": (v29/*: any*/),
        "node.parent.repository": (v30/*: any*/),
        "node.parent.repository.id": (v27/*: any*/),
        "node.parent.repository.name": (v24/*: any*/),
        "node.parent.repository.nameWithOwner": (v24/*: any*/),
        "node.parent.repository.owner": (v31/*: any*/),
        "node.parent.repository.owner.__typename": (v24/*: any*/),
        "node.parent.repository.owner.id": (v27/*: any*/),
        "node.parent.repository.owner.login": (v24/*: any*/),
        "node.parent.state": (v38/*: any*/),
        "node.parent.stateReason": (v39/*: any*/),
        "node.parent.subIssuesConnection": (v40/*: any*/),
        "node.parent.subIssuesConnection.totalCount": (v29/*: any*/),
        "node.parent.subIssuesSummary": (v41/*: any*/),
        "node.parent.subIssuesSummary.completed": (v29/*: any*/),
        "node.parent.title": (v24/*: any*/),
        "node.parent.url": (v33/*: any*/),
        "node.participants": (v42/*: any*/),
        "node.participants.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "User"
        },
        "node.participants.nodes.avatarUrl": (v33/*: any*/),
        "node.participants.nodes.id": (v27/*: any*/),
        "node.participants.nodes.login": (v24/*: any*/),
        "node.participants.nodes.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "node.participants.totalCount": (v29/*: any*/),
        "node.repository": (v30/*: any*/),
        "node.repository.id": (v27/*: any*/),
        "node.repository.isArchived": (v28/*: any*/),
        "node.repository.name": (v24/*: any*/),
        "node.repository.nameWithOwner": (v24/*: any*/),
        "node.repository.owner": (v31/*: any*/),
        "node.repository.owner.__typename": (v24/*: any*/),
        "node.repository.owner.id": (v27/*: any*/),
        "node.repository.owner.login": (v24/*: any*/),
        "node.repository.slashCommandsEnabled": (v28/*: any*/),
        "node.subIssues": (v40/*: any*/),
        "node.subIssues.nodes": (v43/*: any*/),
        "node.subIssues.nodes.assignees": (v42/*: any*/),
        "node.subIssues.nodes.assignees.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "UserEdge"
        },
        "node.subIssues.nodes.assignees.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "node.subIssues.nodes.assignees.edges.node.avatarUrl": (v33/*: any*/),
        "node.subIssues.nodes.assignees.edges.node.id": (v27/*: any*/),
        "node.subIssues.nodes.assignees.edges.node.login": (v24/*: any*/),
        "node.subIssues.nodes.assignees.totalCount": (v29/*: any*/),
        "node.subIssues.nodes.closed": (v28/*: any*/),
        "node.subIssues.nodes.closedByPullRequestsReferences": (v25/*: any*/),
        "node.subIssues.nodes.closedByPullRequestsReferences.totalCount": (v29/*: any*/),
        "node.subIssues.nodes.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "node.subIssues.nodes.id": (v27/*: any*/),
        "node.subIssues.nodes.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "node.subIssues.nodes.issueType.color": {
          "enumValues": [
            "BLUE",
            "GRAY",
            "GREEN",
            "ORANGE",
            "PINK",
            "PURPLE",
            "RED",
            "YELLOW"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueTypeColor"
        },
        "node.subIssues.nodes.issueType.id": (v27/*: any*/),
        "node.subIssues.nodes.issueType.name": (v24/*: any*/),
        "node.subIssues.nodes.number": (v29/*: any*/),
        "node.subIssues.nodes.repository": (v30/*: any*/),
        "node.subIssues.nodes.repository.id": (v27/*: any*/),
        "node.subIssues.nodes.repository.name": (v24/*: any*/),
        "node.subIssues.nodes.repository.owner": (v31/*: any*/),
        "node.subIssues.nodes.repository.owner.__typename": (v24/*: any*/),
        "node.subIssues.nodes.repository.owner.id": (v27/*: any*/),
        "node.subIssues.nodes.repository.owner.login": (v24/*: any*/),
        "node.subIssues.nodes.state": (v38/*: any*/),
        "node.subIssues.nodes.stateReason": (v39/*: any*/),
        "node.subIssues.nodes.subIssuesConnection": (v40/*: any*/),
        "node.subIssues.nodes.subIssuesConnection.totalCount": (v29/*: any*/),
        "node.subIssues.nodes.subIssuesSummary": (v41/*: any*/),
        "node.subIssues.nodes.subIssuesSummary.completed": (v29/*: any*/),
        "node.subIssues.nodes.title": (v24/*: any*/),
        "node.subIssues.nodes.titleHTML": (v24/*: any*/),
        "node.subIssues.nodes.url": (v33/*: any*/),
        "node.subIssuesConnection": (v40/*: any*/),
        "node.subIssuesConnection.totalCount": (v29/*: any*/),
        "node.taskListSummary": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "TaskListSummary"
        },
        "node.taskListSummary.completeCount": (v29/*: any*/),
        "node.taskListSummary.itemCount": (v29/*: any*/),
        "node.tasklistBlocksCompletion": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "TrackedIssueCompletion"
        },
        "node.tasklistBlocksCompletion.completed": (v29/*: any*/),
        "node.tasklistBlocksCompletion.total": (v29/*: any*/),
        "node.title": (v24/*: any*/),
        "node.trackedInIssues": (v40/*: any*/),
        "node.trackedInIssues.nodes": (v43/*: any*/),
        "node.trackedInIssues.nodes.id": (v27/*: any*/),
        "node.trackedInIssues.nodes.number": (v29/*: any*/),
        "node.trackedInIssues.nodes.stateReason": (v39/*: any*/),
        "node.trackedInIssues.nodes.url": (v33/*: any*/),
        "node.trackedInIssues.totalCount": (v29/*: any*/),
        "node.viewerCanBlockFromOrg": (v28/*: any*/),
        "node.viewerCanClose": (v28/*: any*/),
        "node.viewerCanReadUserContentEdits": (v28/*: any*/),
        "node.viewerCanReopen": (v28/*: any*/),
        "node.viewerCanReport": (v28/*: any*/),
        "node.viewerCanReportToMaintainer": (v28/*: any*/),
        "node.viewerCanUnblockFromOrg": (v28/*: any*/),
        "node.viewerCanUpdateMetadata": (v44/*: any*/),
        "node.viewerCanUpdateNext": (v44/*: any*/),
        "node.viewerThreadSubscriptionFormAction": {
          "enumValues": [
            "NONE",
            "SUBSCRIBE",
            "UNSUBSCRIBE"
          ],
          "nullable": true,
          "plural": false,
          "type": "ThreadSubscriptionFormAction"
        }
      }
    },
    "name": "IssueViewerTestComponentSecondaryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "a9790308bcaf25c201e13284602be20e";

export default node;
