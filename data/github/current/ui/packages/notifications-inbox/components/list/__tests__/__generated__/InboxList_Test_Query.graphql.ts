/**
 * @generated SignedSource<<14dc3e697e052e086b5e25c63110f248>>
 * @relayHash 325314c225af49cab5f9bf1ffb43d92d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 325314c225af49cab5f9bf1ffb43d92d

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxList_Test_Query$variables = Record<PropertyKey, never>;
export type InboxList_Test_Query$data = {
  readonly testUser: {
    readonly " $fragmentSpreads": FragmentRefs<"InboxList_fragment" | "InboxList_threadFragment">;
  };
};
export type InboxList_Test_Query = {
  response: InboxList_Test_Query$data;
  variables: InboxList_Test_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  },
  {
    "kind": "Literal",
    "name": "query",
    "value": ""
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ghsaId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v8 = [
  (v1/*: any*/),
  (v6/*: any*/),
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = [
  (v1/*: any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v11/*: any*/),
    (v1/*: any*/)
  ],
  "storageKey": null
},
v13 = {
  "kind": "InlineFragment",
  "selections": (v10/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v14 = [
  (v11/*: any*/),
  (v1/*: any*/)
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v16 = [
  (v11/*: any*/)
],
v17 = [
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
    "concreteType": "NotificationThreadEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cursor",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "NotificationThread",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
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
            "name": "isUnread",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "summaryItemAuthor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "avatarUrl",
                "storageKey": null
              },
              (v1/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "summaryItemBody",
            "storageKey": null
          },
          (v1/*: any*/),
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
          (v2/*: any*/),
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
              (v3/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "advisory",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v5/*: any*/),
                      (v1/*: any*/)
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
                  (v1/*: any*/),
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
                "selections": (v8/*: any*/),
                "type": "Discussion",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v1/*: any*/),
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
                  (v1/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v2/*: any*/)
                ],
                "type": "Issue",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": "prState",
                    "args": null,
                    "kind": "ScalarField",
                    "name": "state",
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  (v7/*: any*/)
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
                  (v9/*: any*/)
                ],
                "type": "Release",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  (v6/*: any*/)
                ],
                "type": "RepositoryAdvisory",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v10/*: any*/),
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
                    "selections": [
                      (v3/*: any*/),
                      (v9/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": (v10/*: any*/),
                        "type": "StaffAccessedRepository",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "inviter",
                    "plural": false,
                    "selections": (v14/*: any*/),
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
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "type": "SecurityAdvisory",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v8/*: any*/),
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
                  (v6/*: any*/),
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
              },
              (v13/*: any*/)
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
              (v3/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v9/*: any*/),
                  (v12/*: any*/)
                ],
                "type": "Repository",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v9/*: any*/),
                  (v15/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Organization",
                    "kind": "LinkedField",
                    "name": "organization",
                    "plural": false,
                    "selections": (v14/*: any*/),
                    "storageKey": null
                  }
                ],
                "type": "Team",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v16/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v16/*: any*/),
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v15/*: any*/)
                ],
                "type": "Enterprise",
                "abstractKey": null
              },
              (v13/*: any*/)
            ],
            "storageKey": null
          },
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
v18 = [
  "query"
],
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "User"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "NotificationThreadConnection"
},
v22 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "NotificationThreadEdge"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v24 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "NotificationThread"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "NotificationsList"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Organization"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v30 = {
  "enumValues": [
    "APPROVAL_REQUESTED",
    "ASSIGN",
    "AUTHOR",
    "CI_ACTIVITY",
    "COMMENT",
    "INVITATION",
    "MANUAL",
    "MEMBER_FEATURE_REQUESTED",
    "MENTION",
    "READY_FOR_REVIEW",
    "REVIEW_REQUESTED",
    "SAVED",
    "SECURITY_ADVISORY_CREDIT",
    "SECURITY_ALERT",
    "STATE_CHANGE",
    "SUBSCRIBED",
    "TEAM_MENTION"
  ],
  "nullable": true,
  "plural": false,
  "type": "NotificationReason"
},
v31 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "NotificationsSubject"
},
v32 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Advisory"
},
v33 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v34 = {
  "enumValues": [
    "ACTION_REQUIRED",
    "CANCELLED",
    "FAILURE",
    "NEUTRAL",
    "SKIPPED",
    "STALE",
    "STARTUP_FAILURE",
    "SUCCESS",
    "TIMED_OUT"
  ],
  "nullable": true,
  "plural": false,
  "type": "CheckConclusionState"
},
v35 = {
  "enumValues": [
    "COMPLETED",
    "IN_PROGRESS",
    "PENDING",
    "QUEUED",
    "REQUESTED",
    "WAITING"
  ],
  "nullable": false,
  "plural": false,
  "type": "CheckStatusState"
},
v36 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v37 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v38 = {
  "enumValues": [
    "CLOSED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "IssueState"
},
v39 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
},
v40 = {
  "enumValues": [
    "CLOSED",
    "MERGED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestState"
},
v41 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "RepositoryInfo"
},
v42 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v43 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v44 = {
  "enumValues": [
    "LIST_IGNORED",
    "LIST_SUBSCRIBED",
    "THREAD_SUBSCRIBED",
    "THREAD_TYPE_SUBSCRIBED",
    "UNSUBSCRIBED"
  ],
  "nullable": false,
  "plural": false,
  "type": "NotificationThreadSubscriptionState"
},
v45 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v46 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PageInfo"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "InboxList_Test_Query",
    "selections": [
      {
        "alias": "testUser",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": (v0/*: any*/),
            "kind": "FragmentSpread",
            "name": "InboxList_fragment"
          },
          {
            "args": (v0/*: any*/),
            "kind": "FragmentSpread",
            "name": "InboxList_threadFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "InboxList_Test_Query",
    "selections": [
      {
        "alias": "testUser",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": "NotificationThreadConnection",
            "kind": "LinkedField",
            "name": "notifications",
            "plural": false,
            "selections": (v17/*: any*/),
            "storageKey": "notifications(first:1,query:\"\")"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "filters": (v18/*: any*/),
            "handle": "connection",
            "key": "InboxSearch_notifications",
            "kind": "LinkedHandle",
            "name": "notifications"
          },
          (v1/*: any*/),
          {
            "alias": null,
            "args": (v0/*: any*/),
            "concreteType": "NotificationThreadConnection",
            "kind": "LinkedField",
            "name": "notificationThreads",
            "plural": false,
            "selections": (v17/*: any*/),
            "storageKey": "notificationThreads(first:1,query:\"\")"
          },
          {
            "alias": null,
            "args": (v0/*: any*/),
            "filters": (v18/*: any*/),
            "handle": "connection",
            "key": "InboxSearch_notificationThreads",
            "kind": "LinkedHandle",
            "name": "notificationThreads"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "325314c225af49cab5f9bf1ffb43d92d",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "testUser": (v19/*: any*/),
        "testUser.id": (v20/*: any*/),
        "testUser.notificationThreads": (v21/*: any*/),
        "testUser.notificationThreads.edges": (v22/*: any*/),
        "testUser.notificationThreads.edges.cursor": (v23/*: any*/),
        "testUser.notificationThreads.edges.node": (v24/*: any*/),
        "testUser.notificationThreads.edges.node.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.isDone": (v25/*: any*/),
        "testUser.notificationThreads.edges.node.isUnread": (v25/*: any*/),
        "testUser.notificationThreads.edges.node.lastUpdatedAt": (v26/*: any*/),
        "testUser.notificationThreads.edges.node.list": (v27/*: any*/),
        "testUser.notificationThreads.edges.node.list.__isNode": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.login": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.name": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.organization": (v28/*: any*/),
        "testUser.notificationThreads.edges.node.list.organization.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.organization.login": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner": (v29/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.login": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.list.slug": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.reason": (v30/*: any*/),
        "testUser.notificationThreads.edges.node.subject": (v31/*: any*/),
        "testUser.notificationThreads.edges.node.subject.__isNode": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory": (v32/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory.summary": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.alertNumber": (v33/*: any*/),
        "testUser.notificationThreads.edges.node.subject.body": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.checkSuiteResult": (v34/*: any*/),
        "testUser.notificationThreads.edges.node.subject.checkSuiteState": (v35/*: any*/),
        "testUser.notificationThreads.edges.node.subject.databaseId": (v36/*: any*/),
        "testUser.notificationThreads.edges.node.subject.ghsaId": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.gistName": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.gistTitle": (v37/*: any*/),
        "testUser.notificationThreads.edges.node.subject.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter": (v19/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter.login": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.issueState": (v38/*: any*/),
        "testUser.notificationThreads.edges.node.subject.message": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.name": (v37/*: any*/),
        "testUser.notificationThreads.edges.node.subject.number": (v33/*: any*/),
        "testUser.notificationThreads.edges.node.subject.oid": (v39/*: any*/),
        "testUser.notificationThreads.edges.node.subject.prState": (v40/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation": (v41/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.__isNode": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.name": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner": (v29/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.__typename": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.login": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.runNumber": (v33/*: any*/),
        "testUser.notificationThreads.edges.node.subject.stateReason": (v42/*: any*/),
        "testUser.notificationThreads.edges.node.subject.summary": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.tagName": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.title": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.url": (v43/*: any*/),
        "testUser.notificationThreads.edges.node.subject.workflowTitle": (v37/*: any*/),
        "testUser.notificationThreads.edges.node.subscriptionStatus": (v44/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemAuthor": (v45/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemAuthor.avatarUrl": (v43/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemAuthor.id": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemBody": (v37/*: any*/),
        "testUser.notificationThreads.edges.node.unreadItemsCount": (v33/*: any*/),
        "testUser.notificationThreads.edges.node.url": (v43/*: any*/),
        "testUser.notificationThreads.pageInfo": (v46/*: any*/),
        "testUser.notificationThreads.pageInfo.endCursor": (v37/*: any*/),
        "testUser.notificationThreads.pageInfo.hasNextPage": (v25/*: any*/),
        "testUser.notificationThreads.totalCount": (v33/*: any*/),
        "testUser.notifications": (v21/*: any*/),
        "testUser.notifications.edges": (v22/*: any*/),
        "testUser.notifications.edges.cursor": (v23/*: any*/),
        "testUser.notifications.edges.node": (v24/*: any*/),
        "testUser.notifications.edges.node.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.id": (v20/*: any*/),
        "testUser.notifications.edges.node.isDone": (v25/*: any*/),
        "testUser.notifications.edges.node.isUnread": (v25/*: any*/),
        "testUser.notifications.edges.node.lastUpdatedAt": (v26/*: any*/),
        "testUser.notifications.edges.node.list": (v27/*: any*/),
        "testUser.notifications.edges.node.list.__isNode": (v23/*: any*/),
        "testUser.notifications.edges.node.list.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.list.id": (v20/*: any*/),
        "testUser.notifications.edges.node.list.login": (v23/*: any*/),
        "testUser.notifications.edges.node.list.name": (v23/*: any*/),
        "testUser.notifications.edges.node.list.organization": (v28/*: any*/),
        "testUser.notifications.edges.node.list.organization.id": (v20/*: any*/),
        "testUser.notifications.edges.node.list.organization.login": (v23/*: any*/),
        "testUser.notifications.edges.node.list.owner": (v29/*: any*/),
        "testUser.notifications.edges.node.list.owner.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.list.owner.id": (v20/*: any*/),
        "testUser.notifications.edges.node.list.owner.login": (v23/*: any*/),
        "testUser.notifications.edges.node.list.slug": (v23/*: any*/),
        "testUser.notifications.edges.node.reason": (v30/*: any*/),
        "testUser.notifications.edges.node.subject": (v31/*: any*/),
        "testUser.notifications.edges.node.subject.__isNode": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.advisory": (v32/*: any*/),
        "testUser.notifications.edges.node.subject.advisory.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.advisory.id": (v20/*: any*/),
        "testUser.notifications.edges.node.subject.advisory.summary": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.alertNumber": (v33/*: any*/),
        "testUser.notifications.edges.node.subject.body": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.checkSuiteResult": (v34/*: any*/),
        "testUser.notifications.edges.node.subject.checkSuiteState": (v35/*: any*/),
        "testUser.notifications.edges.node.subject.databaseId": (v36/*: any*/),
        "testUser.notifications.edges.node.subject.ghsaId": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.gistName": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.gistTitle": (v37/*: any*/),
        "testUser.notifications.edges.node.subject.id": (v20/*: any*/),
        "testUser.notifications.edges.node.subject.inviter": (v19/*: any*/),
        "testUser.notifications.edges.node.subject.inviter.id": (v20/*: any*/),
        "testUser.notifications.edges.node.subject.inviter.login": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.issueState": (v38/*: any*/),
        "testUser.notifications.edges.node.subject.message": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.name": (v37/*: any*/),
        "testUser.notifications.edges.node.subject.number": (v33/*: any*/),
        "testUser.notifications.edges.node.subject.oid": (v39/*: any*/),
        "testUser.notifications.edges.node.subject.prState": (v40/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation": (v41/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.__isNode": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.id": (v20/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.name": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.owner": (v29/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.owner.__typename": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.owner.id": (v20/*: any*/),
        "testUser.notifications.edges.node.subject.repositoryInvitation.owner.login": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.runNumber": (v33/*: any*/),
        "testUser.notifications.edges.node.subject.stateReason": (v42/*: any*/),
        "testUser.notifications.edges.node.subject.summary": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.tagName": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.title": (v23/*: any*/),
        "testUser.notifications.edges.node.subject.url": (v43/*: any*/),
        "testUser.notifications.edges.node.subject.workflowTitle": (v37/*: any*/),
        "testUser.notifications.edges.node.subscriptionStatus": (v44/*: any*/),
        "testUser.notifications.edges.node.summaryItemAuthor": (v45/*: any*/),
        "testUser.notifications.edges.node.summaryItemAuthor.avatarUrl": (v43/*: any*/),
        "testUser.notifications.edges.node.summaryItemAuthor.id": (v20/*: any*/),
        "testUser.notifications.edges.node.summaryItemBody": (v37/*: any*/),
        "testUser.notifications.edges.node.unreadItemsCount": (v33/*: any*/),
        "testUser.notifications.edges.node.url": (v43/*: any*/),
        "testUser.notifications.pageInfo": (v46/*: any*/),
        "testUser.notifications.pageInfo.endCursor": (v37/*: any*/),
        "testUser.notifications.pageInfo.hasNextPage": (v25/*: any*/),
        "testUser.notifications.totalCount": (v33/*: any*/)
      }
    },
    "name": "InboxList_Test_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0d4c1714077fdbb85691daa12c171732";

export default node;
