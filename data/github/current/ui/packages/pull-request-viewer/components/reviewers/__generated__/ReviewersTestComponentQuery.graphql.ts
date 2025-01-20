/**
 * @generated SignedSource<<894803148e6a2a0442816327ecf7ddb6>>
 * @relayHash 09f3662a93f43320f264acda3a091080
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 09f3662a93f43320f264acda3a091080

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewersTestComponentQuery$variables = Record<PropertyKey, never>;
export type ReviewersTestComponentQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"Reviewers_pullRequest">;
  } | null | undefined;
};
export type ReviewersTestComponentQuery = {
  response: ReviewersTestComponentQuery$data;
  variables: ReviewersTestComponentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "kind": "Literal",
  "name": "first",
  "value": 100
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "asCodeOwner",
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
  "kind": "InlineFragment",
  "selections": [
    (v2/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "combinedSlug",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v16 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "RequestedReviewer"
},
v17 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ReviewRequest"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReviewersTestComponentQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v0/*: any*/),
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
                "name": "Reviewers_pullRequest"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ReviewersTestComponentQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": [
                  (v3/*: any*/)
                ],
                "concreteType": "ReviewRequestConnection",
                "kind": "LinkedField",
                "name": "reviewRequests",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ReviewRequestEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ReviewRequest",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ReviewRequest",
                            "kind": "LinkedField",
                            "name": "assignedFromReviewRequest",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "requestedReviewer",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v2/*: any*/),
                                      (v5/*: any*/)
                                    ],
                                    "type": "Team",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v2/*: any*/),
                                      (v6/*: any*/)
                                    ],
                                    "type": "User",
                                    "abstractKey": null
                                  },
                                  (v7/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v4/*: any*/),
                              (v2/*: any*/)
                            ],
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
                              (v1/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  (v8/*: any*/),
                                  (v6/*: any*/),
                                  (v9/*: any*/)
                                ],
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v10/*: any*/),
                                  (v2/*: any*/),
                                  {
                                    "alias": "teamAvatarUrl",
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  },
                                  (v5/*: any*/),
                                  (v9/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Organization",
                                    "kind": "LinkedField",
                                    "name": "organization",
                                    "plural": false,
                                    "selections": [
                                      (v5/*: any*/),
                                      (v2/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "type": "Team",
                                "abstractKey": null
                              },
                              (v7/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "reviewRequests(first:100)"
              },
              {
                "alias": null,
                "args": [
                  (v3/*: any*/),
                  {
                    "kind": "Literal",
                    "name": "preferOpinionatedReviews",
                    "value": true
                  }
                ],
                "concreteType": "PullRequestReviewConnection",
                "kind": "LinkedField",
                "name": "latestReviews",
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
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "OnBehalfOfReviewer",
                            "kind": "LinkedField",
                            "name": "onBehalfOfReviewers",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "asCodeowner",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "reviewer",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/)
                                    ],
                                    "type": "Team",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v6/*: any*/)
                                    ],
                                    "type": "User",
                                    "abstractKey": null
                                  },
                                  (v7/*: any*/)
                                ],
                                "storageKey": null
                              }
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
                              (v1/*: any*/),
                              (v8/*: any*/),
                              (v6/*: any*/),
                              (v9/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v11/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "latestReviews(first:100,preferOpinionatedReviews:true)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isDraft",
                "storageKey": null
              },
              (v11/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "codeowners",
                "plural": true,
                "selections": [
                  (v1/*: any*/),
                  (v7/*: any*/)
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
    ]
  },
  "params": {
    "id": "09f3662a93f43320f264acda3a091080",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v12/*: any*/),
        "pullRequest.codeowners": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Codeowners"
        },
        "pullRequest.codeowners.__isNode": (v12/*: any*/),
        "pullRequest.codeowners.__typename": (v12/*: any*/),
        "pullRequest.codeowners.id": (v13/*: any*/),
        "pullRequest.id": (v13/*: any*/),
        "pullRequest.isDraft": (v14/*: any*/),
        "pullRequest.latestReviews": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewConnection"
        },
        "pullRequest.latestReviews.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestReviewEdge"
        },
        "pullRequest.latestReviews.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReview"
        },
        "pullRequest.latestReviews.edges.node.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.latestReviews.edges.node.author.__typename": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.author.avatarUrl": (v15/*: any*/),
        "pullRequest.latestReviews.edges.node.author.id": (v13/*: any*/),
        "pullRequest.latestReviews.edges.node.author.login": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.author.url": (v15/*: any*/),
        "pullRequest.latestReviews.edges.node.id": (v13/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "OnBehalfOfReviewer"
        },
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.asCodeowner": (v14/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer": (v16/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.__isNode": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.__typename": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.combinedSlug": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.id": (v13/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.login": (v12/*: any*/),
        "pullRequest.latestReviews.edges.node.state": {
          "enumValues": [
            "APPROVED",
            "CHANGES_REQUESTED",
            "COMMENTED",
            "DISMISSED",
            "PENDING"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequest.reviewRequests": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ReviewRequestConnection"
        },
        "pullRequest.reviewRequests.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReviewRequestEdge"
        },
        "pullRequest.reviewRequests.edges.node": (v17/*: any*/),
        "pullRequest.reviewRequests.edges.node.asCodeOwner": (v14/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest": (v17/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.asCodeOwner": (v14/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.id": (v13/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer": (v16/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.__isNode": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.__typename": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.id": (v13/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.login": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.name": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.id": (v13/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer": (v16/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.__isNode": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.__typename": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.avatarUrl": (v15/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.combinedSlug": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.id": (v13/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.login": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.name": (v12/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Organization"
        },
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization.id": (v13/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "pullRequest.reviewRequests.edges.node.requestedReviewer.teamAvatarUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "pullRequest.reviewRequests.edges.node.requestedReviewer.url": (v15/*: any*/),
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
        "pullRequest.viewerCanUpdate": (v14/*: any*/)
      }
    },
    "name": "ReviewersTestComponentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "37df8c49f15bb43e8ab22facb146e216";

export default node;
