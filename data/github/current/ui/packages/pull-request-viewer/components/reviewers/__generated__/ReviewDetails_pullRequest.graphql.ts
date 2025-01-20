/**
 * @generated SignedSource<<f6bee3f713e858e8d58bdcfb36af5b85>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ReviewDetails_pullRequest$data = {
  readonly latestReviews: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly author: {
          readonly avatarUrl: string;
          readonly login: string;
          readonly url: string;
        } | null | undefined;
        readonly onBehalfOfReviewers: ReadonlyArray<{
          readonly asCodeowner: boolean;
          readonly reviewer: {
            readonly __typename: "Team";
            readonly combinedSlug: string;
          } | {
            readonly __typename: "User";
            readonly login: string;
          } | {
            // This will never be '%other', but we need some
            // value in case none of the concrete values match.
            readonly __typename: "%other";
          } | null | undefined;
        }>;
        readonly state: PullRequestReviewState;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ReviewDetails_pullRequest";
};
export type ReviewDetails_pullRequest$key = {
  readonly " $data"?: ReviewDetails_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewDetails_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "latestReviewsCount"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReviewDetails_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "latestReviewsCount"
        },
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
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            (v0/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "combinedSlug",
                              "storageKey": null
                            }
                          ],
                          "type": "Team",
                          "abstractKey": null
                        },
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            (v0/*: any*/),
                            (v1/*: any*/)
                          ],
                          "type": "User",
                          "abstractKey": null
                        }
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
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "avatarUrl",
                      "storageKey": null
                    },
                    (v1/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "url",
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
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "7f869293e2896f050ba782b2f8570ffc";

export default node;
