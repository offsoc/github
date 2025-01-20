/**
 * @generated SignedSource<<dd0de40a553fe389b9e7db4b94493275>>
 * @relayHash 182187fb626bab1ed591bec846627ba6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 182187fb626bab1ed591bec846627ba6

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestMergeMethod = "MERGE" | "REBASE" | "SQUASH" | "%future added value";
export type useLoadMergeBoxQuery$variables = {
  id: string;
  mergeMethod?: PullRequestMergeMethod | null | undefined;
};
export type useLoadMergeBoxQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"useLoadMergeBoxQuery_pullRequest">;
  } | null | undefined;
  readonly viewer: {
    readonly login: string;
  };
};
export type useLoadMergeBoxQuery = {
  response: useLoadMergeBoxQuery$data;
  variables: useLoadMergeBoxQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "mergeMethod"
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
  "alias": null,
  "args": null,
  "concreteType": "AutoMergeRequest",
  "kind": "LinkedField",
  "name": "autoMergeRequest",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mergeMethod",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "baseRefName",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestCommitConnection",
  "kind": "LinkedField",
  "name": "commits",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": null
},
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
  "name": "headRefName",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v8 = [
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v13 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorCanPushToRepository",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v17 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "position",
  "storageKey": null
},
v20 = [
  {
    "kind": "Variable",
    "name": "mergeMethod",
    "variableName": "mergeMethod"
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitAuthor",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitMessageBody",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitMessageHeadline",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ruleType",
  "storageKey": null
},
v28 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "failureReasons",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "requiredReviewers",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "requiresCodeowners",
      "storageKey": null
    }
  ],
  "type": "PullRequestRuleRollup",
  "abstractKey": null
},
v29 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "conflicts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isConflictResolvableInWeb",
      "storageKey": null
    }
  ],
  "type": "PullRequestMergeConflictStateCondition",
  "abstractKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mergeStateStatus",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourcePath",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanAddAndRemoveFromMergeQueue",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDeleteHeadRef",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDisableAutoMerge",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanEnableAutoMerge",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanRestoreHeadRef",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdateBranch",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isAllowable",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "concreteType": "AllowablePullRequestMergeAction",
  "kind": "LinkedField",
  "name": "viewerMergeActions",
  "plural": true,
  "selections": [
    (v9/*: any*/),
    (v40/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "AllowablePullRequestMergeMethod",
      "kind": "LinkedField",
      "name": "mergeMethods",
      "plural": true,
      "selections": [
        (v9/*: any*/),
        (v40/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isAllowableWithBypass",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v42 = {
  "alias": "stateChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "STATE"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"STATE\")"
},
v43 = {
  "alias": "deployedChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "DEPLOYED"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"DEPLOYED\")"
},
v44 = {
  "alias": "reviewStateChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "REVIEW_STATE"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"REVIEW_STATE\")"
},
v45 = {
  "alias": "workflowsChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "WORKFLOWS"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"WORKFLOWS\")"
},
v46 = {
  "alias": "mergeQueueChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "MERGE_QUEUE"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"MERGE_QUEUE\")"
},
v47 = {
  "alias": "headRefChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "HEAD_REF"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"HEAD_REF\")"
},
v48 = {
  "alias": "baseRefChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "BASE_REF"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"BASE_REF\")"
},
v49 = {
  "alias": "commitHeadShaChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "COMMIT_HEAD_SHA"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"COMMIT_HEAD_SHA\")"
},
v50 = {
  "alias": "gitMergeStateChannel",
  "args": [
    {
      "kind": "Literal",
      "name": "name",
      "value": "GIT_MERGE_STATE"
    }
  ],
  "kind": "ScalarField",
  "name": "updatesChannel",
  "storageKey": "updatesChannel(name:\"GIT_MERGE_STATE\")"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLoadMergeBoxQuery",
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
                "kind": "InlineDataFragmentSpread",
                "name": "useLoadMergeBoxQuery_pullRequest",
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "headRepository",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": (v13/*: any*/),
                    "concreteType": "PullRequestReviewConnection",
                    "kind": "LinkedField",
                    "name": "latestOpinionatedReviews",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestReview",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v14/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v7/*: any*/),
                                  (v15/*: any*/),
                                  (v9/*: any*/),
                                  (v16/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": (v17/*: any*/),
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
                                          (v9/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": "onBehalfOf(first:10)"
                              },
                              (v18/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "latestOpinionatedReviews(first:100)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "MergeQueueEntry",
                    "kind": "LinkedField",
                    "name": "mergeQueueEntry",
                    "plural": false,
                    "selections": [
                      (v19/*: any*/),
                      (v18/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "MergeQueue",
                    "kind": "LinkedField",
                    "name": "mergeQueue",
                    "plural": false,
                    "selections": [
                      (v16/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v20/*: any*/),
                    "concreteType": "PullRequestMergeRequirements",
                    "kind": "LinkedField",
                    "name": "mergeRequirements",
                    "plural": false,
                    "selections": [
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      (v18/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "conditions",
                        "plural": true,
                        "selections": [
                          (v24/*: any*/),
                          (v25/*: any*/),
                          (v26/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "ruleRollups",
                                "plural": true,
                                "selections": [
                                  (v25/*: any*/),
                                  (v27/*: any*/),
                                  (v26/*: any*/),
                                  (v28/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "PullRequestRulesCondition",
                            "abstractKey": null
                          },
                          (v29/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v30/*: any*/),
                  (v31/*: any*/),
                  (v18/*: any*/),
                  (v32/*: any*/),
                  (v33/*: any*/),
                  (v34/*: any*/),
                  (v35/*: any*/),
                  (v36/*: any*/),
                  (v37/*: any*/),
                  (v38/*: any*/),
                  (v39/*: any*/),
                  (v41/*: any*/),
                  (v42/*: any*/),
                  (v43/*: any*/),
                  (v44/*: any*/),
                  (v45/*: any*/),
                  (v46/*: any*/),
                  (v47/*: any*/),
                  (v48/*: any*/),
                  (v49/*: any*/),
                  (v50/*: any*/)
                ],
                "args": null,
                "argumentDefinitions": [
                  {
                    "kind": "RootArgument",
                    "name": "mergeMethod"
                  }
                ]
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
        "selections": (v8/*: any*/),
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
    "name": "useLoadMergeBoxQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v24/*: any*/),
          (v10/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "headRepository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v24/*: any*/),
                      (v7/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              },
              (v11/*: any*/),
              (v12/*: any*/),
              {
                "alias": null,
                "args": (v13/*: any*/),
                "concreteType": "PullRequestReviewConnection",
                "kind": "LinkedField",
                "name": "latestOpinionatedReviews",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReview",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v14/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "author",
                            "plural": false,
                            "selections": [
                              (v24/*: any*/),
                              (v7/*: any*/),
                              (v15/*: any*/),
                              (v9/*: any*/),
                              (v16/*: any*/),
                              (v10/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": (v17/*: any*/),
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
                                      (v9/*: any*/),
                                      (v10/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "onBehalfOf(first:10)"
                          },
                          (v18/*: any*/),
                          (v10/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "latestOpinionatedReviews(first:100)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MergeQueueEntry",
                "kind": "LinkedField",
                "name": "mergeQueueEntry",
                "plural": false,
                "selections": [
                  (v19/*: any*/),
                  (v18/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MergeQueue",
                "kind": "LinkedField",
                "name": "mergeQueue",
                "plural": false,
                "selections": [
                  (v16/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v20/*: any*/),
                "concreteType": "PullRequestMergeRequirements",
                "kind": "LinkedField",
                "name": "mergeRequirements",
                "plural": false,
                "selections": [
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
                  (v18/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "conditions",
                    "plural": true,
                    "selections": [
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "ruleRollups",
                            "plural": true,
                            "selections": [
                              (v24/*: any*/),
                              (v25/*: any*/),
                              (v27/*: any*/),
                              (v26/*: any*/),
                              (v28/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "PullRequestRulesCondition",
                        "abstractKey": null
                      },
                      (v29/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v30/*: any*/),
              (v31/*: any*/),
              (v18/*: any*/),
              (v32/*: any*/),
              (v33/*: any*/),
              (v34/*: any*/),
              (v35/*: any*/),
              (v36/*: any*/),
              (v37/*: any*/),
              (v38/*: any*/),
              (v39/*: any*/),
              (v41/*: any*/),
              (v42/*: any*/),
              (v43/*: any*/),
              (v44/*: any*/),
              (v45/*: any*/),
              (v46/*: any*/),
              (v47/*: any*/),
              (v48/*: any*/),
              (v49/*: any*/),
              (v50/*: any*/)
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
          (v7/*: any*/),
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "182187fb626bab1ed591bec846627ba6",
    "metadata": {},
    "name": "useLoadMergeBoxQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e4fa23ecaf08321a3ceeeb839b941b7f";

export default node;
