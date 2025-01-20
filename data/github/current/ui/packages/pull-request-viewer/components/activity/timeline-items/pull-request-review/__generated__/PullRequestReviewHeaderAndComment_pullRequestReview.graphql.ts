/**
 * @generated SignedSource<<f54d7e25217e7b6fe460ce0beea6f9bc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestReviewHeaderAndComment_pullRequestReview$data = {
  readonly author: {
    readonly avatarUrl: string;
    readonly id: string;
    readonly login: string;
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly authorAssociation: CommentAuthorAssociation;
  readonly bodyHTML: string;
  readonly bodyText: string;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly dismissedReviewState: PullRequestReviewState | null | undefined;
  readonly id: string;
  readonly onBehalfOf: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string;
        readonly organization: {
          readonly name: string | null | undefined;
        };
        readonly url: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly pullRequest: {
    readonly author: {
      readonly login: string;
    } | null | undefined;
    readonly number: number;
  };
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly id: string;
      readonly login: string;
      readonly url: string;
    };
  };
  readonly state: PullRequestReviewState;
  readonly url: string;
  readonly viewerCanBlockFromOrg: boolean;
  readonly viewerCanDelete: boolean;
  readonly viewerCanReport: boolean;
  readonly viewerCanReportToMaintainer: boolean;
  readonly viewerCanUnblockFromOrg: boolean;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"MarkdownEditHistoryViewer_comment" | "ReactionViewerGroups">;
  readonly " $fragmentType": "PullRequestReviewHeaderAndComment_pullRequestReview";
};
export type PullRequestReviewHeaderAndComment_pullRequestReview$key = {
  readonly " $data"?: PullRequestReviewHeaderAndComment_pullRequestReview$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestReviewHeaderAndComment_pullRequestReview">;
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
  "name": "login",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestReviewHeaderAndComment_pullRequestReview",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MarkdownEditHistoryViewer_comment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReactionViewerGroups"
    },
    (v0/*: any*/),
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "size",
              "value": 64
            }
          ],
          "kind": "ScalarField",
          "name": "avatarUrl",
          "storageKey": "avatarUrl(size:64)"
        },
        (v1/*: any*/),
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "authorAssociation",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bodyHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bodyText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequest",
      "kind": "LinkedField",
      "name": "pullRequest",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "number",
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
            (v1/*: any*/)
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
          "kind": "Literal",
          "name": "first",
          "value": 10
        }
      ],
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
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Organization",
                  "kind": "LinkedField",
                  "name": "organization",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/)
                  ],
                  "storageKey": null
                },
                (v2/*: any*/),
                (v3/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "onBehalfOf(first:10)"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isPrivate",
          "storageKey": null
        },
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            (v3/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dismissedReviewState",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanDelete",
      "storageKey": null
    },
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
      "kind": "ScalarField",
      "name": "viewerCanReport",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanReportToMaintainer",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanBlockFromOrg",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUnblockFromOrg",
      "storageKey": null
    }
  ],
  "type": "PullRequestReview",
  "abstractKey": null
};
})();

(node as any).hash = "8c72053ab40d47bd446b767800956dec";

export default node;
