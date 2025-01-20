/**
 * @generated SignedSource<<1fdcf76873840bbe39f3d4d58494d8fd>>
 * @relayHash 65988ea6d3e1d232508360a12a05badd
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 65988ea6d3e1d232508360a12a05badd

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxListRow_v1_Test_Query$variables = Record<PropertyKey, never>;
export type InboxListRow_v1_Test_Query$data = {
  readonly testUser: {
    readonly notificationThreads: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"InboxListRow_v1_fragment">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
  };
};
export type InboxListRow_v1_Test_Query = {
  response: InboxListRow_v1_Test_Query$data;
  variables: InboxListRow_v1_Test_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
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
v17 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "User"
},
v18 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v22 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v23 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "InboxListRow_v1_Test_Query",
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
            "name": "notificationThreads",
            "plural": false,
            "selections": [
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
                    "concreteType": "NotificationThread",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "InboxListRow_v1_fragment"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "notificationThreads(first:1)"
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
    "name": "InboxListRow_v1_Test_Query",
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
            "name": "notificationThreads",
            "plural": false,
            "selections": [
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
                    "concreteType": "NotificationThread",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
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
                      (v2/*: any*/),
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
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "notificationThreads(first:1)"
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "65988ea6d3e1d232508360a12a05badd",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "testUser": (v17/*: any*/),
        "testUser.id": (v18/*: any*/),
        "testUser.notificationThreads": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "NotificationThreadConnection"
        },
        "testUser.notificationThreads.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "NotificationThreadEdge"
        },
        "testUser.notificationThreads.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "NotificationThread"
        },
        "testUser.notificationThreads.edges.node.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.isDone": (v19/*: any*/),
        "testUser.notificationThreads.edges.node.isUnread": (v19/*: any*/),
        "testUser.notificationThreads.edges.node.lastUpdatedAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "testUser.notificationThreads.edges.node.list": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "NotificationsList"
        },
        "testUser.notificationThreads.edges.node.list.__isNode": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.list.login": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.name": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Organization"
        },
        "testUser.notificationThreads.edges.node.list.organization.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.list.organization.login": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner": (v21/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.list.owner.login": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.list.slug": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.reason": {
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
        "testUser.notificationThreads.edges.node.subject": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "NotificationsSubject"
        },
        "testUser.notificationThreads.edges.node.subject.__isNode": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Advisory"
        },
        "testUser.notificationThreads.edges.node.subject.advisory.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.subject.advisory.summary": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.alertNumber": (v22/*: any*/),
        "testUser.notificationThreads.edges.node.subject.body": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.checkSuiteResult": {
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
        "testUser.notificationThreads.edges.node.subject.checkSuiteState": {
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
        "testUser.notificationThreads.edges.node.subject.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "testUser.notificationThreads.edges.node.subject.ghsaId": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.gistName": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.gistTitle": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter": (v17/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.subject.inviter.login": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.issueState": {
          "enumValues": [
            "CLOSED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueState"
        },
        "testUser.notificationThreads.edges.node.subject.message": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.name": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subject.number": (v22/*: any*/),
        "testUser.notificationThreads.edges.node.subject.oid": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitObjectID"
        },
        "testUser.notificationThreads.edges.node.subject.prState": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RepositoryInfo"
        },
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.__isNode": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.name": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner": (v21/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.__typename": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.subject.repositoryInvitation.owner.login": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.runNumber": (v22/*: any*/),
        "testUser.notificationThreads.edges.node.subject.stateReason": {
          "enumValues": [
            "COMPLETED",
            "NOT_PLANNED",
            "REOPENED"
          ],
          "nullable": true,
          "plural": false,
          "type": "IssueStateReason"
        },
        "testUser.notificationThreads.edges.node.subject.summary": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.tagName": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.title": (v20/*: any*/),
        "testUser.notificationThreads.edges.node.subject.url": (v24/*: any*/),
        "testUser.notificationThreads.edges.node.subject.workflowTitle": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.subscriptionStatus": {
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
        "testUser.notificationThreads.edges.node.summaryItemAuthor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "testUser.notificationThreads.edges.node.summaryItemAuthor.avatarUrl": (v24/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemAuthor.id": (v18/*: any*/),
        "testUser.notificationThreads.edges.node.summaryItemBody": (v23/*: any*/),
        "testUser.notificationThreads.edges.node.unreadItemsCount": (v22/*: any*/),
        "testUser.notificationThreads.edges.node.url": (v24/*: any*/)
      }
    },
    "name": "InboxListRow_v1_Test_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "16b206f3b606d224afab8e5ca6461f95";

export default node;
