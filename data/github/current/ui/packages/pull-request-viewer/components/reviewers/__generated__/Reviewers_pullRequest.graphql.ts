/**
 * @generated SignedSource<<6a8da42f5c58a723021af7b555530742>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type Reviewers_pullRequest$data = {
  readonly codeowners: ReadonlyArray<{
    readonly __typename: string;
  }> | null | undefined;
  readonly id: string;
  readonly isDraft: boolean;
  readonly latestReviews: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly author: {
          readonly login: string;
        } | null | undefined;
        readonly state: PullRequestReviewState;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly reviewRequests: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly requestedReviewer: {
          readonly __typename: "Team";
          readonly id: string;
        } | {
          readonly __typename: "User";
          readonly id: string;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        } | null | undefined;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly state: PullRequestState;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewDetails_pullRequest" | "ReviewRequestDetails_pullRequest">;
  readonly " $fragmentType": "Reviewers_pullRequest";
};
export type Reviewers_pullRequest$key = {
  readonly " $data"?: Reviewers_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"Reviewers_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  (v0/*: any*/),
  (v2/*: any*/)
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "latestReviewsCount"
    },
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "reviewRequestsCount"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "Reviewers_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReviewRequestDetails_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReviewDetails_pullRequest"
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isDraft",
      "storageKey": null
    },
    (v1/*: any*/),
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
        (v2/*: any*/)
      ],
      "storageKey": null
    },
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
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "author",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "login",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                (v1/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "reviewRequestsCount"
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
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "requestedReviewer",
                  "plural": false,
                  "selections": [
                    {
                      "kind": "InlineFragment",
                      "selections": (v3/*: any*/),
                      "type": "User",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v3/*: any*/),
                      "type": "Team",
                      "abstractKey": null
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
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "4b6911f6401c08fc8ffb4b4c85343f9a";

export default node;
