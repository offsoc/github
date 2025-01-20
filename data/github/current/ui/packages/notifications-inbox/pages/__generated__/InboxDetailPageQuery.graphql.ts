/**
 * @generated SignedSource<<93e0fb9d25824d39d5cd91e7e76b3139>>
 * @relayHash 18f0f21c2ac5f70ee32819731d14a589
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 18f0f21c2ac5f70ee32819731d14a589

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationThreadSubscriptionState = "LIST_IGNORED" | "LIST_SUBSCRIBED" | "THREAD_SUBSCRIBED" | "THREAD_TYPE_SUBSCRIBED" | "UNSUBSCRIBED" | "%future added value";
export type InboxDetailPageQuery$variables = {
  first: number;
  id: string;
  query: string;
  useNewQueryField: boolean;
};
export type InboxDetailPageQuery$data = {
  readonly node: {
    readonly id?: string;
    readonly isUnread?: boolean;
    readonly subject?: {
      readonly __typename: "Issue";
      readonly id: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
    readonly subscriptionStatus?: NotificationThreadSubscriptionState;
    readonly url?: string;
    readonly " $fragmentSpreads": FragmentRefs<"InboxDetail_details">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"InboxSidebar_notifications">;
};
export type InboxDetailPageQuery = {
  response: InboxDetailPageQuery$data;
  variables: InboxDetailPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useNewQueryField"
},
v4 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v5 = {
  "kind": "Variable",
  "name": "query",
  "variableName": "query"
},
v6 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isUnread",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subscriptionStatus",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v12 = [
  (v7/*: any*/)
],
v13 = [
  (v4/*: any*/),
  (v5/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ghsaId",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v18 = [
  (v7/*: any*/),
  (v16/*: any*/),
  (v17/*: any*/)
],
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v11/*: any*/),
    (v20/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v22 = {
  "kind": "InlineFragment",
  "selections": (v12/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v23 = [
  (v20/*: any*/),
  (v7/*: any*/)
],
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v25 = [
  (v20/*: any*/)
],
v26 = [
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
          (v9/*: any*/),
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
              (v7/*: any*/)
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
          (v7/*: any*/),
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
          (v8/*: any*/),
          (v10/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "subject",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v14/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "advisory",
                    "plural": false,
                    "selections": [
                      (v11/*: any*/),
                      (v15/*: any*/),
                      (v7/*: any*/)
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
                  (v7/*: any*/),
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
                "selections": (v18/*: any*/),
                "type": "Discussion",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
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
                  (v7/*: any*/),
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
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v8/*: any*/)
                ],
                "type": "Issue",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": "prState",
                    "args": null,
                    "kind": "ScalarField",
                    "name": "state",
                    "storageKey": null
                  },
                  (v16/*: any*/),
                  (v17/*: any*/)
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
                  (v19/*: any*/)
                ],
                "type": "Release",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v14/*: any*/),
                  (v16/*: any*/)
                ],
                "type": "RepositoryAdvisory",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v12/*: any*/),
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
                      (v11/*: any*/),
                      (v19/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": (v12/*: any*/),
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
                    "selections": (v23/*: any*/),
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
                  (v14/*: any*/),
                  (v15/*: any*/)
                ],
                "type": "SecurityAdvisory",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v18/*: any*/),
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
                  (v16/*: any*/),
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
              (v22/*: any*/)
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
              (v11/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v19/*: any*/),
                  (v21/*: any*/)
                ],
                "type": "Repository",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v19/*: any*/),
                  (v24/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Organization",
                    "kind": "LinkedField",
                    "name": "organization",
                    "plural": false,
                    "selections": (v23/*: any*/),
                    "storageKey": null
                  }
                ],
                "type": "Team",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v25/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v25/*: any*/),
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v24/*: any*/)
                ],
                "type": "Enterprise",
                "abstractKey": null
              },
              (v22/*: any*/)
            ],
            "storageKey": null
          },
          (v11/*: any*/)
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
v27 = [
  "query"
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InboxDetailPageQuery",
    "selections": [
      {
        "args": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "Variable",
            "name": "useNewQueryField",
            "variableName": "useNewQueryField"
          }
        ],
        "kind": "FragmentSpread",
        "name": "InboxSidebar_notifications"
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "InboxDetail_details"
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v12/*: any*/),
                    "type": "Issue",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "NotificationThread",
            "abstractKey": null
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "InboxDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          {
            "condition": "useNewQueryField",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "alias": null,
                "args": (v13/*: any*/),
                "concreteType": "NotificationThreadConnection",
                "kind": "LinkedField",
                "name": "notifications",
                "plural": false,
                "selections": (v26/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v13/*: any*/),
                "filters": (v27/*: any*/),
                "handle": "connection",
                "key": "InboxSearch_notifications",
                "kind": "LinkedHandle",
                "name": "notifications"
              }
            ]
          },
          {
            "condition": "useNewQueryField",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              {
                "alias": null,
                "args": (v13/*: any*/),
                "concreteType": "NotificationThreadConnection",
                "kind": "LinkedField",
                "name": "notificationThreads",
                "plural": false,
                "selections": (v26/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v13/*: any*/),
                "filters": (v27/*: any*/),
                "handle": "connection",
                "key": "InboxSearch_notificationThreads",
                "kind": "LinkedHandle",
                "name": "notificationThreads"
              }
            ]
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v11/*: any*/),
          (v7/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v9/*: any*/),
              (v10/*: any*/),
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v7/*: any*/),
                      (v17/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v19/*: any*/),
                          (v21/*: any*/),
                          (v7/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v12/*: any*/),
                    "type": "Commit",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v12/*: any*/),
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v12/*: any*/),
                    "type": "Discussion",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v12/*: any*/),
                    "type": "TeamDiscussion",
                    "abstractKey": null
                  },
                  (v22/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "NotificationThread",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "18f0f21c2ac5f70ee32819731d14a589",
    "metadata": {},
    "name": "InboxDetailPageQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ecee9195009279d8d8b60b43908be31b";

export default node;
