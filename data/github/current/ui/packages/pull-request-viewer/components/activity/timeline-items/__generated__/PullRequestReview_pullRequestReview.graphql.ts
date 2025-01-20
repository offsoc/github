/**
 * @generated SignedSource<<6939165b2d2e3a72d32de6aa7006902b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestReview_pullRequestReview$data = {
  readonly __id: string;
  readonly bodyText: string;
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly pullRequestThreadsAndReplies: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly __typename: "PullRequestReviewComment";
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"ReviewComment_pullRequestReviewComment">;
      } | {
        readonly __typename: "PullRequestThread";
        readonly comments: {
          readonly totalCount: number;
        };
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"Thread_pullRequestThread">;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestReviewHeaderAndComment_pullRequestReview">;
  readonly " $fragmentType": "PullRequestReview_pullRequestReview";
};
export type PullRequestReview_pullRequestReview$key = {
  readonly " $data"?: PullRequestReview_pullRequestReview$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestReview_pullRequestReview">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "pullRequestThreadsAndReplies"
        ]
      }
    ]
  },
  "name": "PullRequestReview_pullRequestReview",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "PullRequestReviewHeaderAndComment_pullRequestReview"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bodyText",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": "pullRequestThreadsAndReplies",
      "args": null,
      "concreteType": "PullRequestReviewCommentItemConnection",
      "kind": "LinkedField",
      "name": "__PullRequestReview_pullRequestThreadsAndReplies_connection",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v0/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "Thread_pullRequestThread"
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
                          "kind": "ScalarField",
                          "name": "totalCount",
                          "storageKey": null
                        }
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
                    (v0/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ReviewComment_pullRequestReviewComment"
                    }
                  ],
                  "type": "PullRequestReviewComment",
                  "abstractKey": null
                }
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
      "storageKey": null
    },
    {
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
    }
  ],
  "type": "PullRequestReview",
  "abstractKey": null
};
})();

(node as any).hash = "056315840887914b1fa82fbf98406e1d";

export default node;
