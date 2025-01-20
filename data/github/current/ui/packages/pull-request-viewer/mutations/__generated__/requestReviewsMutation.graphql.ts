/**
 * @generated SignedSource<<07aae28e96b8bc9199792a528d3090b4>>
 * @relayHash cfcd8cac039c644f757da61ea7831ab0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cfcd8cac039c644f757da61ea7831ab0

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RequestReviewsInput = {
  clientMutationId?: string | null | undefined;
  pullRequestId: string;
  reRequest?: boolean | null | undefined;
  teamIds?: ReadonlyArray<string> | null | undefined;
  union?: boolean | null | undefined;
  userIds?: ReadonlyArray<string> | null | undefined;
};
export type requestReviewsMutation$variables = {
  input: RequestReviewsInput;
};
export type requestReviewsMutation$data = {
  readonly requestReviews: {
    readonly pullRequest: {
      readonly " $fragmentSpreads": FragmentRefs<"ReviewRequestDetails_pullRequest">;
    } | null | undefined;
  } | null | undefined;
};
export type requestReviewsMutation$rawResponse = {
  readonly requestReviews: {
    readonly pullRequest: {
      readonly id: string;
      readonly reviewRequests: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly asCodeOwner: boolean;
            readonly assignedFromReviewRequest: {
              readonly asCodeOwner: boolean;
              readonly id: string;
              readonly requestedReviewer: {
                readonly __typename: "Team";
                readonly __isNode: "Team";
                readonly id: string;
                readonly name: string;
              } | {
                readonly __typename: "User";
                readonly __isNode: "User";
                readonly id: string;
                readonly login: string;
              } | {
                readonly __typename: string;
                readonly __isNode: string;
                readonly id: string;
              } | null | undefined;
            } | null | undefined;
            readonly id: string;
            readonly requestedReviewer: {
              readonly __typename: "Team";
              readonly __isNode: "Team";
              readonly combinedSlug: string;
              readonly id: string;
              readonly name: string;
              readonly organization: {
                readonly id: string;
                readonly name: string | null | undefined;
              };
              readonly teamAvatarUrl: string | null | undefined;
              readonly url: string;
            } | {
              readonly __typename: "User";
              readonly __isNode: "User";
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
              readonly url: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            } | null | undefined;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type requestReviewsMutation = {
  rawResponse: requestReviewsMutation$rawResponse;
  response: requestReviewsMutation$data;
  variables: requestReviewsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
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
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "asCodeOwner",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
  "name": "url",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "requestReviewsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RequestReviewsPayload",
        "kind": "LinkedField",
        "name": "requestReviews",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "ReviewRequestDetails_pullRequest"
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
    "name": "requestReviewsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RequestReviewsPayload",
        "kind": "LinkedField",
        "name": "requestReviews",
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
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 100
                  }
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
                          (v3/*: any*/),
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
                                  (v4/*: any*/),
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
                              (v3/*: any*/),
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
                              (v4/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  },
                                  (v6/*: any*/),
                                  (v8/*: any*/)
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
                                  (v2/*: any*/),
                                  {
                                    "alias": "teamAvatarUrl",
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  },
                                  (v5/*: any*/),
                                  (v8/*: any*/),
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
    "id": "cfcd8cac039c644f757da61ea7831ab0",
    "metadata": {},
    "name": "requestReviewsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "fe23cd9357b18086371ab73a605101bf";

export default node;
