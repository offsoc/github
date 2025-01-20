/**
 * @generated SignedSource<<b424fc2edc2ae43d3e532ba286572641>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewersPickerCandidateReviewers_pullRequest$data = {
  readonly candidateReviewers: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly reviewer: {
          readonly __typename: "Team";
          readonly combinedSlug: string;
          readonly id: string;
          readonly teamAvatarUrl: string | null | undefined;
          readonly teamName: string;
        } | {
          readonly __typename: "User";
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly name: string | null | undefined;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        };
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly " $fragmentType": "ReviewersPickerCandidateReviewers_pullRequest";
};
export type ReviewersPickerCandidateReviewers_pullRequest$key = {
  readonly " $data"?: ReviewersPickerCandidateReviewers_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewersPickerCandidateReviewers_pullRequest">;
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
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "size",
    "value": 64
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "query"
    },
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "reviewersCount"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ReviewersPickerCandidateReviewersQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "ReviewersPickerCandidateReviewers_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "reviewersCount"
        },
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "query"
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
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v0/*: any*/),
                        (v1/*: any*/),
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
                          "args": (v2/*: any*/),
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
                      "selections": [
                        (v0/*: any*/),
                        (v1/*: any*/),
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
                          "args": (v2/*: any*/),
                          "kind": "ScalarField",
                          "name": "avatarUrl",
                          "storageKey": "avatarUrl(size:64)"
                        }
                      ],
                      "type": "User",
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
    },
    (v1/*: any*/)
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "399b61b6879fefa17ffe677b2ee976cb";

export default node;
