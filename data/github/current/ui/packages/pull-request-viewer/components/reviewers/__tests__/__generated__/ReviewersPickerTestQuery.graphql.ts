/**
 * @generated SignedSource<<f1521ce1cfd474ddf2cb7e05dc87c299>>
 * @relayHash f84fb0c1a6ce60328957ca896c59e0e7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f84fb0c1a6ce60328957ca896c59e0e7

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewersPickerTestQuery$variables = Record<PropertyKey, never>;
export type ReviewersPickerTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"ReviewersPickerCandidateReviewers_pullRequest" | "ReviewersPickerSuggestedReviewers_pullRequest">;
  } | null | undefined;
};
export type ReviewersPickerTestQuery = {
  response: ReviewersPickerTestQuery$data;
  variables: ReviewersPickerTestQuery$variables;
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
v3 = [
  {
    "kind": "Literal",
    "name": "size",
    "value": 64
  }
],
v4 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
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
    "args": (v3/*: any*/),
    "kind": "ScalarField",
    "name": "avatarUrl",
    "storageKey": "avatarUrl(size:64)"
  }
],
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReviewersPickerTestQuery",
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
                "name": "ReviewersPickerSuggestedReviewers_pullRequest"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ReviewersPickerCandidateReviewers_pullRequest"
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
    "name": "ReviewersPickerTestQuery",
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
                "args": null,
                "concreteType": "SuggestedReviewer",
                "kind": "LinkedField",
                "name": "suggestedReviewers",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isAuthor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isCommenter",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "reviewer",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 100
                  }
                ],
                "concreteType": "CandidateReviewerConnection",
                "kind": "LinkedField",
                "name": "candidateReviewers",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CandidateReviewerEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "CandidateReviewer",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
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
                                  (v2/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "combinedSlug",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": "teamName",
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "name",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": "teamAvatarUrl",
                                    "args": (v3/*: any*/),
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": "avatarUrl(size:64)"
                                  }
                                ],
                                "type": "Team",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v4/*: any*/),
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/)
                                ],
                                "type": "Node",
                                "abstractKey": "__isNode"
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
                "storageKey": "candidateReviewers(first:100)"
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
    "id": "f84fb0c1a6ce60328957ca896c59e0e7",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v5/*: any*/),
        "pullRequest.candidateReviewers": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "CandidateReviewerConnection"
        },
        "pullRequest.candidateReviewers.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "CandidateReviewerEdge"
        },
        "pullRequest.candidateReviewers.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CandidateReviewer"
        },
        "pullRequest.candidateReviewers.edges.node.reviewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReviewerResult"
        },
        "pullRequest.candidateReviewers.edges.node.reviewer.__isNode": (v5/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.__typename": (v5/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.avatarUrl": (v6/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.combinedSlug": (v5/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.id": (v7/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.login": (v5/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.name": (v8/*: any*/),
        "pullRequest.candidateReviewers.edges.node.reviewer.teamAvatarUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "pullRequest.candidateReviewers.edges.node.reviewer.teamName": (v5/*: any*/),
        "pullRequest.id": (v7/*: any*/),
        "pullRequest.suggestedReviewers": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "SuggestedReviewer"
        },
        "pullRequest.suggestedReviewers.isAuthor": (v9/*: any*/),
        "pullRequest.suggestedReviewers.isCommenter": (v9/*: any*/),
        "pullRequest.suggestedReviewers.reviewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "pullRequest.suggestedReviewers.reviewer.avatarUrl": (v6/*: any*/),
        "pullRequest.suggestedReviewers.reviewer.id": (v7/*: any*/),
        "pullRequest.suggestedReviewers.reviewer.login": (v5/*: any*/),
        "pullRequest.suggestedReviewers.reviewer.name": (v8/*: any*/)
      }
    },
    "name": "ReviewersPickerTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "aa143f40f909cb2cd45bed9fc07571b4";

export default node;
