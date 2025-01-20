/**
 * @generated SignedSource<<e8c82f5404fbd212fa871e2aeb92b43d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ActivityView_pullRequest_forwardPagination$data = {
  readonly forwardTimeline: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly __typename: string;
        readonly __id: string;
        readonly databaseId?: number | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BaseRefForcePushedEvent_baseRefForcePushedEvent" | "ClosedEvent" | "HeadRefForcePushedEvent_headRefForcePushedEvent" | "IssueComment_issueComment" | "MergedEvent_mergedEvent" | "PullRequestCommit_pullRequestCommit" | "PullRequestReview_pullRequestReview" | "ReactionViewerGroups" | "ReopenedEvent" | "ReviewDismissedEvent_reviewDismissedEvent" | "ReviewRequestedEvent_reviewRequestedEvent">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
  readonly id: string;
  readonly viewerCanComment: boolean;
  readonly " $fragmentType": "ActivityView_pullRequest_forwardPagination";
};
export type ActivityView_pullRequest_forwardPagination$key = {
  readonly " $data"?: ActivityView_pullRequest_forwardPagination$data;
  readonly " $fragmentSpreads": FragmentRefs<"ActivityView_pullRequest_forwardPagination">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "forwardTimeline"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v2 = [
  (v1/*: any*/)
],
v3 = {
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
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./PullRequestActivityForwardPaginationQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "ActivityView_pullRequest_forwardPagination",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanComment",
      "storageKey": null
    },
    {
      "alias": "forwardTimeline",
      "args": [
        {
          "kind": "Literal",
          "name": "itemTypes",
          "value": [
            "ISSUE_COMMENT",
            "PULL_REQUEST_REVIEW",
            "PULL_REQUEST_COMMIT",
            "BASE_REF_FORCE_PUSHED_EVENT",
            "HEAD_REF_FORCE_PUSHED_EVENT",
            "CLOSED_EVENT",
            "REOPENED_EVENT",
            "MERGED_EVENT",
            "REVIEW_DISMISSED_EVENT",
            "REVIEW_REQUESTED_EVENT"
          ]
        },
        {
          "kind": "Literal",
          "name": "visibleEventsOnly",
          "value": true
        }
      ],
      "concreteType": "PullRequestTimelineItemsConnection",
      "kind": "LinkedField",
      "name": "__PullRequestTimelineForwardPagination_forwardTimeline_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestTimelineItemsEdge",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "IssueComment_issueComment"
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "PullRequestReview_pullRequestReview"
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ReactionViewerGroups"
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v2/*: any*/),
                  "type": "IssueComment",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v2/*: any*/),
                  "type": "PullRequestReview",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "PullRequestCommit_pullRequestCommit"
                    }
                  ],
                  "type": "PullRequestCommit",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "BaseRefForcePushedEvent_baseRefForcePushedEvent"
                    }
                  ],
                  "type": "BaseRefForcePushedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "HeadRefForcePushedEvent_headRefForcePushedEvent"
                    }
                  ],
                  "type": "HeadRefForcePushedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ClosedEvent"
                    }
                  ],
                  "type": "ClosedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ReopenedEvent"
                    }
                  ],
                  "type": "ReopenedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "MergedEvent_mergedEvent"
                    }
                  ],
                  "type": "MergedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ReviewDismissedEvent_reviewDismissedEvent"
                    }
                  ],
                  "type": "ReviewDismissedEvent",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v1/*: any*/),
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ReviewRequestedEvent_reviewRequestedEvent"
                    }
                  ],
                  "type": "ReviewRequestedEvent",
                  "abstractKey": null
                },
                (v3/*: any*/)
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
        },
        (v3/*: any*/)
      ],
      "storageKey": "__PullRequestTimelineForwardPagination_forwardTimeline_connection(itemTypes:[\"ISSUE_COMMENT\",\"PULL_REQUEST_REVIEW\",\"PULL_REQUEST_COMMIT\",\"BASE_REF_FORCE_PUSHED_EVENT\",\"HEAD_REF_FORCE_PUSHED_EVENT\",\"CLOSED_EVENT\",\"REOPENED_EVENT\",\"MERGED_EVENT\",\"REVIEW_DISMISSED_EVENT\",\"REVIEW_REQUESTED_EVENT\"],visibleEventsOnly:true)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "8099d526ea7e683cc657bd8ff4ea216e";

export default node;
