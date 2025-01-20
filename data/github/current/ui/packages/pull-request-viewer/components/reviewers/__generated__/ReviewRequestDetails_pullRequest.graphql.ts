/**
 * @generated SignedSource<<dcc89d2858ae5c0095081e946268ef79>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewRequestDetails_pullRequest$data = {
  readonly id: string;
  readonly reviewRequests: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly asCodeOwner: boolean;
        readonly assignedFromReviewRequest: {
          readonly asCodeOwner: boolean;
          readonly requestedReviewer: {
            readonly __typename: "Team";
            readonly id: string;
            readonly name: string;
          } | {
            readonly __typename: "User";
            readonly id: string;
            readonly login: string;
          } | {
            // This will never be '%other', but we need some
            // value in case none of the concrete values match.
            readonly __typename: "%other";
          } | null | undefined;
        } | null | undefined;
        readonly requestedReviewer: {
          readonly __typename: "Team";
          readonly combinedSlug: string;
          readonly id: string;
          readonly name: string;
          readonly organization: {
            readonly name: string | null | undefined;
          };
          readonly teamAvatarUrl: string | null | undefined;
          readonly url: string;
        } | {
          readonly __typename: "User";
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
          readonly url: string;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        } | null | undefined;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ReviewRequestDetails_pullRequest";
};
export type ReviewRequestDetails_pullRequest$key = {
  readonly " $data"?: ReviewRequestDetails_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewRequestDetails_pullRequest">;
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
  "name": "asCodeOwner",
  "storageKey": null
},
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
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "reviewRequestsCount"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReviewRequestDetails_pullRequest",
  "selections": [
    (v0/*: any*/),
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
                (v1/*: any*/),
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
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            (v0/*: any*/),
                            (v2/*: any*/),
                            (v3/*: any*/)
                          ],
                          "type": "Team",
                          "abstractKey": null
                        },
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            (v0/*: any*/),
                            (v4/*: any*/),
                            (v2/*: any*/)
                          ],
                          "type": "User",
                          "abstractKey": null
                        }
                      ],
                      "storageKey": null
                    },
                    (v1/*: any*/)
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
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v0/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "avatarUrl",
                          "storageKey": null
                        },
                        (v4/*: any*/),
                        (v5/*: any*/),
                        (v2/*: any*/)
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
                        (v0/*: any*/),
                        {
                          "alias": "teamAvatarUrl",
                          "args": null,
                          "kind": "ScalarField",
                          "name": "avatarUrl",
                          "storageKey": null
                        },
                        (v3/*: any*/),
                        (v5/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Organization",
                          "kind": "LinkedField",
                          "name": "organization",
                          "plural": false,
                          "selections": [
                            (v3/*: any*/)
                          ],
                          "storageKey": null
                        },
                        (v2/*: any*/)
                      ],
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

(node as any).hash = "8a2d0ab5e8e192e0cce52638292f6a5f";

export default node;
