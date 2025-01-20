/**
 * @generated SignedSource<<f50e183171651f9c63756c60a7f74963>>
 * @relayHash b104e6fdeae0d0d55a66898768241b2b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b104e6fdeae0d0d55a66898768241b2b

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestBranchUpdateMethod = "MERGE" | "REBASE" | "%future added value";
export type PullRequestMergeMethod = "MERGE" | "REBASE" | "SQUASH" | "%future added value";
export type UpdatePullRequestBranchInput = {
  clientMutationId?: string | null | undefined;
  expectedHeadOid?: any | null | undefined;
  pullRequestId: string;
  updateMethod?: PullRequestBranchUpdateMethod | null | undefined;
};
export type updatePullRequestBranchMutation$variables = {
  input: UpdatePullRequestBranchInput;
  mergeMethod?: PullRequestMergeMethod | null | undefined;
};
export type updatePullRequestBranchMutation$data = {
  readonly updatePullRequestBranch: {
    readonly pullRequest: {
      readonly " $fragmentSpreads": FragmentRefs<"useLoadMergeBoxQuery_pullRequest">;
    } | null | undefined;
  } | null | undefined;
};
export type updatePullRequestBranchMutation = {
  response: updatePullRequestBranchMutation$data;
  variables: updatePullRequestBranchMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
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
    "name": "input",
    "variableName": "input"
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
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
  "name": "isDraft",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v12 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorCanPushToRepository",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v16 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "position",
  "storageKey": null
},
v19 = [
  {
    "kind": "Variable",
    "name": "mergeMethod",
    "variableName": "mergeMethod"
  }
],
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitAuthor",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitMessageBody",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commitMessageHeadline",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ruleType",
  "storageKey": null
},
v27 = {
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
v28 = {
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
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mergeStateStatus",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourcePath",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanAddAndRemoveFromMergeQueue",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDeleteHeadRef",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDisableAutoMerge",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanEnableAutoMerge",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanRestoreHeadRef",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdateBranch",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isAllowable",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "concreteType": "AllowablePullRequestMergeAction",
  "kind": "LinkedField",
  "name": "viewerMergeActions",
  "plural": true,
  "selections": [
    (v8/*: any*/),
    (v39/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "AllowablePullRequestMergeMethod",
      "kind": "LinkedField",
      "name": "mergeMethods",
      "plural": true,
      "selections": [
        (v8/*: any*/),
        (v39/*: any*/),
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
v41 = {
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
v42 = {
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
v43 = {
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
v44 = {
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
v45 = {
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
v46 = {
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
v47 = {
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
v48 = {
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
v49 = {
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
    "name": "updatePullRequestBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestBranchPayload",
        "kind": "LinkedField",
        "name": "updatePullRequestBranch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
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
                        "selections": [
                          (v7/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": (v12/*: any*/),
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
                              (v13/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v7/*: any*/),
                                  (v14/*: any*/),
                                  (v8/*: any*/),
                                  (v15/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": (v16/*: any*/),
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
                                          (v8/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": "onBehalfOf(first:10)"
                              },
                              (v17/*: any*/)
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
                      (v18/*: any*/),
                      (v17/*: any*/)
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
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v19/*: any*/),
                    "concreteType": "PullRequestMergeRequirements",
                    "kind": "LinkedField",
                    "name": "mergeRequirements",
                    "plural": false,
                    "selections": [
                      (v20/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v17/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "conditions",
                        "plural": true,
                        "selections": [
                          (v23/*: any*/),
                          (v24/*: any*/),
                          (v25/*: any*/),
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
                                  (v26/*: any*/),
                                  (v25/*: any*/),
                                  (v27/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "PullRequestRulesCondition",
                            "abstractKey": null
                          },
                          (v28/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v29/*: any*/),
                  (v30/*: any*/),
                  (v17/*: any*/),
                  (v31/*: any*/),
                  (v32/*: any*/),
                  (v33/*: any*/),
                  (v34/*: any*/),
                  (v35/*: any*/),
                  (v36/*: any*/),
                  (v37/*: any*/),
                  (v38/*: any*/),
                  (v40/*: any*/),
                  (v41/*: any*/),
                  (v42/*: any*/),
                  (v43/*: any*/),
                  (v44/*: any*/),
                  (v45/*: any*/),
                  (v46/*: any*/),
                  (v47/*: any*/),
                  (v48/*: any*/),
                  (v49/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updatePullRequestBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestBranchPayload",
        "kind": "LinkedField",
        "name": "updatePullRequestBranch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
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
                      (v23/*: any*/),
                      (v7/*: any*/),
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "storageKey": null
              },
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              {
                "alias": null,
                "args": (v12/*: any*/),
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
                          (v13/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "author",
                            "plural": false,
                            "selections": [
                              (v23/*: any*/),
                              (v7/*: any*/),
                              (v14/*: any*/),
                              (v8/*: any*/),
                              (v15/*: any*/),
                              (v9/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": (v16/*: any*/),
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
                                      (v8/*: any*/),
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
                          (v17/*: any*/),
                          (v9/*: any*/)
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
                  (v18/*: any*/),
                  (v17/*: any*/),
                  (v9/*: any*/)
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
                  (v15/*: any*/),
                  (v9/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v19/*: any*/),
                "concreteType": "PullRequestMergeRequirements",
                "kind": "LinkedField",
                "name": "mergeRequirements",
                "plural": false,
                "selections": [
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v17/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "conditions",
                    "plural": true,
                    "selections": [
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
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
                              (v23/*: any*/),
                              (v24/*: any*/),
                              (v26/*: any*/),
                              (v25/*: any*/),
                              (v27/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "PullRequestRulesCondition",
                        "abstractKey": null
                      },
                      (v28/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v29/*: any*/),
              (v30/*: any*/),
              (v17/*: any*/),
              (v31/*: any*/),
              (v32/*: any*/),
              (v33/*: any*/),
              (v34/*: any*/),
              (v35/*: any*/),
              (v36/*: any*/),
              (v37/*: any*/),
              (v38/*: any*/),
              (v40/*: any*/),
              (v41/*: any*/),
              (v42/*: any*/),
              (v43/*: any*/),
              (v44/*: any*/),
              (v45/*: any*/),
              (v46/*: any*/),
              (v47/*: any*/),
              (v48/*: any*/),
              (v49/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "b104e6fdeae0d0d55a66898768241b2b",
    "metadata": {},
    "name": "updatePullRequestBranchMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b5defa81b2f997f86b63cba9581d1656";

export default node;
