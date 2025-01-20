/**
 * @generated SignedSource<<5167ab3c7e0507f77713309fd94f3701>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CheckConclusionState = "ACTION_REQUIRED" | "CANCELLED" | "FAILURE" | "NEUTRAL" | "SKIPPED" | "STALE" | "STARTUP_FAILURE" | "SUCCESS" | "TIMED_OUT" | "%future added value";
export type CheckStatusState = "COMPLETED" | "IN_PROGRESS" | "PENDING" | "QUEUED" | "REQUESTED" | "WAITING" | "%future added value";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type NotificationReason = "APPROVAL_REQUESTED" | "ASSIGN" | "AUTHOR" | "CI_ACTIVITY" | "COMMENT" | "INVITATION" | "MANUAL" | "MEMBER_FEATURE_REQUESTED" | "MENTION" | "READY_FOR_REVIEW" | "REVIEW_REQUESTED" | "SAVED" | "SECURITY_ADVISORY_CREDIT" | "SECURITY_ALERT" | "STATE_CHANGE" | "SUBSCRIBED" | "TEAM_MENTION" | "%future added value";
export type NotificationThreadSubscriptionState = "LIST_IGNORED" | "LIST_SUBSCRIBED" | "THREAD_SUBSCRIBED" | "THREAD_TYPE_SUBSCRIBED" | "UNSUBSCRIBED" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type InboxListRow_fragment$data = {
  readonly id: string;
  readonly isDone: boolean;
  readonly isUnread: boolean;
  readonly lastUpdatedAt: string;
  readonly list: {
    readonly __typename: "Enterprise";
    readonly slug: string;
  } | {
    readonly __typename: "Organization";
    readonly login: string;
  } | {
    readonly __typename: "Repository";
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  } | {
    readonly __typename: "Team";
    readonly name: string;
    readonly organization: {
      readonly login: string;
    };
    readonly slug: string;
  } | {
    readonly __typename: "User";
    readonly login: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  };
  readonly reason: NotificationReason | null | undefined;
  readonly subject: {
    readonly __typename: "AdvisoryCredit";
    readonly advisory: {
      readonly summary: string;
    };
    readonly ghsaId: string;
  } | {
    readonly __typename: "CheckSuite";
    readonly checkSuiteResult: CheckConclusionState | null | undefined;
    readonly checkSuiteState: CheckStatusState;
    readonly databaseId: number | null | undefined;
  } | {
    readonly __typename: "Commit";
    readonly id: string;
    readonly message: string;
    readonly oid: any;
  } | {
    readonly __typename: "Discussion";
    readonly id: string;
    readonly number: number;
    readonly title: string;
  } | {
    readonly __typename: "Gist";
    readonly gistName: string;
    readonly gistTitle: string | null | undefined;
    readonly id: string;
  } | {
    readonly __typename: "Issue";
    readonly id: string;
    readonly issueState: IssueState;
    readonly number: number;
    readonly stateReason: IssueStateReason | null | undefined;
    readonly title: string;
    readonly url: string;
  } | {
    readonly __typename: "MemberFeatureRequestNotification";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "PullRequest";
    readonly id: string;
    readonly number: number;
    readonly prState: PullRequestState;
    readonly title: string;
  } | {
    readonly __typename: "Release";
    readonly name: string | null | undefined;
    readonly tagName: string;
  } | {
    readonly __typename: "RepositoryAdvisory";
    readonly ghsaId: string;
    readonly title: string;
  } | {
    readonly __typename: "RepositoryDependabotAlertsThread";
    readonly id: string;
  } | {
    readonly __typename: "RepositoryInvitation";
    readonly inviter: {
      readonly login: string;
    };
    readonly repositoryInvitation: {
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    } | null | undefined;
  } | {
    readonly __typename: "RepositoryVulnerabilityAlert";
    readonly alertNumber: number;
  } | {
    readonly __typename: "SecurityAdvisory";
    readonly ghsaId: string;
    readonly summary: string;
  } | {
    readonly __typename: "TeamDiscussion";
    readonly id: string;
    readonly number: number;
    readonly title: string;
  } | {
    readonly __typename: "WorkflowRun";
    readonly runNumber: number;
    readonly workflowTitle: string | null | undefined;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  };
  readonly subscriptionStatus: NotificationThreadSubscriptionState;
  readonly unreadItemsCount: number;
  readonly url: string;
  readonly " $fragmentSpreads": FragmentRefs<"InboxRowContent_fragment">;
  readonly " $fragmentType": "InboxListRow_fragment";
};
export type InboxListRow_fragment$key = {
  readonly " $data"?: InboxListRow_fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxListRow_fragment">;
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
  "name": "url",
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
  "name": "ghsaId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v7 = [
  (v0/*: any*/),
  (v5/*: any*/),
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  }
],
v10 = [
  (v8/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "owner",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  }
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InboxListRow_fragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "InboxRowContent_fragment"
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isUnread",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unreadItemsCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastUpdatedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "reason",
      "storageKey": null
    },
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isDone",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "subscriptionStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "subject",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v3/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "advisory",
              "plural": false,
              "selections": [
                (v4/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "AdvisoryCredit",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "databaseId",
              "storageKey": null
            },
            {
              "alias": "checkSuiteState",
              "args": null,
              "kind": "ScalarField",
              "name": "status",
              "storageKey": null
            },
            {
              "alias": "checkSuiteResult",
              "args": null,
              "kind": "ScalarField",
              "name": "conclusion",
              "storageKey": null
            }
          ],
          "type": "CheckSuite",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "oid",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "message",
              "storageKey": null
            }
          ],
          "type": "Commit",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v7/*: any*/),
          "type": "Discussion",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "gistName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": "gistTitle",
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            }
          ],
          "type": "Gist",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "issueState",
              "args": null,
              "kind": "ScalarField",
              "name": "state",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "stateReason",
              "storageKey": null
            },
            (v5/*: any*/),
            (v6/*: any*/),
            (v1/*: any*/)
          ],
          "type": "Issue",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": "prState",
              "args": null,
              "kind": "ScalarField",
              "name": "state",
              "storageKey": null
            },
            (v5/*: any*/),
            (v6/*: any*/)
          ],
          "type": "PullRequest",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "tagName",
              "storageKey": null
            },
            (v8/*: any*/)
          ],
          "type": "Release",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v3/*: any*/),
            (v5/*: any*/)
          ],
          "type": "RepositoryAdvisory",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/)
          ],
          "type": "RepositoryDependabotAlertsThread",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": "repositoryInvitation",
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": (v10/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "inviter",
              "plural": false,
              "selections": (v9/*: any*/),
              "storageKey": null
            }
          ],
          "type": "RepositoryInvitation",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": "alertNumber",
              "args": null,
              "kind": "ScalarField",
              "name": "number",
              "storageKey": null
            }
          ],
          "type": "RepositoryVulnerabilityAlert",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v3/*: any*/),
            (v4/*: any*/)
          ],
          "type": "SecurityAdvisory",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v7/*: any*/),
          "type": "TeamDiscussion",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "runNumber",
              "storageKey": null
            },
            {
              "alias": "workflowTitle",
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            }
          ],
          "type": "WorkflowRun",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v5/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "body",
              "storageKey": null
            }
          ],
          "type": "MemberFeatureRequestNotification",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "list",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": (v10/*: any*/),
          "type": "Repository",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v8/*: any*/),
            (v11/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Organization",
              "kind": "LinkedField",
              "name": "organization",
              "plural": false,
              "selections": (v9/*: any*/),
              "storageKey": null
            }
          ],
          "type": "Team",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v9/*: any*/),
          "type": "User",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v9/*: any*/),
          "type": "Organization",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v11/*: any*/)
          ],
          "type": "Enterprise",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationThread",
  "abstractKey": null
};
})();

(node as any).hash = "d6d9ef2bd0310253634fe060be2e9838";

export default node;
