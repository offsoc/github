/**
 * @generated SignedSource<<66b920fd00a53fc635e0e6b23f00dba9>>
 * @relayHash ea301060fafa1e671712a6222928e69d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ea301060fafa1e671712a6222928e69d

import { ConcreteRequest, Query } from 'relay-runtime';
export type AdvisoryCreditState = "ACCEPTED" | "DECLINED" | "PENDING" | "%future added value";
export type CheckStatusState = "COMPLETED" | "IN_PROGRESS" | "PENDING" | "QUEUED" | "REQUESTED" | "WAITING" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type RepositoryAdvisoryState = "CLOSED" | "OPEN" | "PUBLISHED" | "%future added value";
export type WorkflowState = "ACTIVE" | "DELETED" | "DISABLED_FORK" | "DISABLED_INACTIVITY" | "DISABLED_MANUALLY" | "%future added value";
export type InboxDefaultViewQuery$variables = {
  id: string;
};
export type InboxDefaultViewQuery$data = {
  readonly node: {
    readonly id?: string;
    readonly list?: {
      readonly __typename: "Enterprise";
      readonly avatarUrl: string;
      readonly slug: string;
    } | {
      readonly __typename: "Organization";
      readonly avatarUrl: string;
      readonly login: string;
    } | {
      readonly __typename: "Repository";
      readonly isPrivate: boolean;
      readonly name: string;
      readonly owner: {
        readonly avatarUrl: string;
        readonly login: string;
        readonly url: string;
      };
      readonly url: string;
    } | {
      readonly __typename: "Team";
      readonly name: string;
      readonly organization: {
        readonly avatarUrl: string;
        readonly login: string;
        readonly url: string;
      };
      readonly slug: string;
    } | {
      readonly __typename: "User";
      readonly avatarUrl: string;
      readonly login: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
    readonly subject?: {
      readonly __typename: "AdvisoryCredit";
      readonly advisory: {
        readonly description: string;
        readonly summary: string;
      };
      readonly advisoryCreditState: AdvisoryCreditState;
      readonly ghsaId: string;
    } | {
      readonly __typename: "CheckSuite";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly createdAt: string;
      readonly databaseId: number | null | undefined;
      readonly event: string | null | undefined;
      readonly name: string | null | undefined;
      readonly status: CheckStatusState;
    } | {
      readonly __typename: "Commit";
      readonly author: {
        readonly actor: {
          readonly login: string;
        } | null | undefined;
      } | null | undefined;
      readonly createdAt: string;
      readonly message: string;
      readonly messageBodyHTML: string;
      readonly oid: any;
    } | {
      readonly __typename: "Discussion";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly bodyHTML: string;
      readonly comments: {
        readonly nodes: ReadonlyArray<{
          readonly author: {
            readonly login: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly createdAt: string;
      readonly number: number;
      readonly title: string;
    } | {
      readonly __typename: "Gist";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly createdAt: string;
      readonly gistTitle: string | null | undefined;
    } | {
      readonly __typename: "MemberFeatureRequestNotification";
      readonly createdAt: string;
      readonly title: string;
    } | {
      readonly __typename: "PullRequest";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly body: string;
      readonly bodyHTML: string;
      readonly createdAt: string;
      readonly isDraft: boolean;
      readonly merged: boolean;
      readonly number: number;
      readonly state: PullRequestState;
      readonly titleHTML: string;
    } | {
      readonly __typename: "Release";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly createdAt: string;
      readonly descriptionHTML: string | null | undefined;
      readonly name: string | null | undefined;
      readonly tagName: string;
    } | {
      readonly __typename: "RepositoryAdvisory";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly createdAt: string;
      readonly repositoryAdvisoryState: RepositoryAdvisoryState;
      readonly repositoryAdvisoryTitle: string;
    } | {
      readonly __typename: "RepositoryDependabotAlertsThread";
      readonly repository: {
        readonly name: string;
        readonly owner: {
          readonly login: string;
        };
      };
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
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly createdAt: string;
      readonly number: number;
    } | {
      readonly __typename: "SecurityAdvisory";
      readonly createdAt: string;
      readonly ghsaId: string;
      readonly summary: string;
    } | {
      readonly __typename: "TeamDiscussion";
      readonly author: {
        readonly login: string;
      } | null | undefined;
      readonly bodyHTML: string;
      readonly createdAt: string;
      readonly number: number;
      readonly title: string;
    } | {
      readonly __typename: "WorkflowRun";
      readonly createdAt: string;
      readonly number: number;
      readonly workflow: {
        readonly state: WorkflowState;
      };
      readonly workflowTitle: string | null | undefined;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
    readonly summaryItemBody?: string | null | undefined;
    readonly url?: string;
  } | null | undefined;
};
export type InboxDefaultViewQuery = {
  response: InboxDefaultViewQuery$data;
  variables: InboxDefaultViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summaryItemBody",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v8 = [
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v12 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "merged",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titleHTML",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "event",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "messageBodyHTML",
  "storageKey": null
},
v26 = {
  "alias": "createdAt",
  "args": null,
  "kind": "ScalarField",
  "name": "committedDate",
  "storageKey": null
},
v27 = {
  "alias": "gistTitle",
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tagName",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "descriptionHTML",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ghsaId",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "summary",
  "storageKey": null
},
v33 = {
  "alias": "advisoryCreditState",
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v34 = {
  "alias": "repositoryAdvisoryTitle",
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v35 = {
  "alias": "repositoryAdvisoryState",
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v36 = [
  (v21/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "owner",
    "plural": false,
    "selections": (v8/*: any*/),
    "storageKey": null
  }
],
v37 = {
  "kind": "InlineFragment",
  "selections": [
    (v30/*: any*/),
    (v32/*: any*/),
    {
      "alias": "createdAt",
      "args": null,
      "kind": "ScalarField",
      "name": "publishedAt",
      "storageKey": null
    }
  ],
  "type": "SecurityAdvisory",
  "abstractKey": null
},
v38 = {
  "alias": "number",
  "args": null,
  "kind": "ScalarField",
  "name": "runNumber",
  "storageKey": null
},
v39 = {
  "alias": "workflowTitle",
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v40 = {
  "kind": "InlineFragment",
  "selections": [
    (v10/*: any*/),
    {
      "alias": "createdAt",
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    }
  ],
  "type": "MemberFeatureRequestNotification",
  "abstractKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v42 = [
  (v7/*: any*/),
  (v41/*: any*/),
  (v3/*: any*/)
],
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v45 = [
  (v7/*: any*/),
  (v41/*: any*/)
],
v46 = {
  "kind": "InlineFragment",
  "selections": (v45/*: any*/),
  "type": "User",
  "abstractKey": null
},
v47 = {
  "kind": "InlineFragment",
  "selections": (v45/*: any*/),
  "type": "Organization",
  "abstractKey": null
},
v48 = {
  "kind": "InlineFragment",
  "selections": [
    (v44/*: any*/),
    (v41/*: any*/)
  ],
  "type": "Enterprise",
  "abstractKey": null
},
v49 = [
  (v5/*: any*/),
  (v7/*: any*/),
  (v2/*: any*/)
],
v50 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": (v49/*: any*/),
  "storageKey": null
},
v51 = [
  (v7/*: any*/),
  (v2/*: any*/)
],
v52 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v49/*: any*/),
  "storageKey": null
},
v53 = [
  (v2/*: any*/)
],
v54 = {
  "kind": "InlineFragment",
  "selections": (v53/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InboxDefaultViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": (v12/*: any*/),
                        "concreteType": "DiscussionCommentConnection",
                        "kind": "LinkedField",
                        "name": "comments",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DiscussionComment",
                            "kind": "LinkedField",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              (v9/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "comments(first:1)"
                      },
                      (v13/*: any*/)
                    ],
                    "type": "Discussion",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v9/*: any*/),
                      (v14/*: any*/),
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      (v11/*: any*/),
                      (v18/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v19/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "creator",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v13/*: any*/),
                      (v20/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/)
                    ],
                    "type": "CheckSuite",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v23/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "GitActor",
                        "kind": "LinkedField",
                        "name": "committer",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "actor",
                            "plural": false,
                            "selections": (v8/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/)
                    ],
                    "type": "Commit",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v27/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "Gist",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "author",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v21/*: any*/),
                      (v28/*: any*/),
                      (v29/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "Release",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v30/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "advisory",
                        "plural": false,
                        "selections": [
                          (v31/*: any*/),
                          (v32/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v33/*: any*/)
                    ],
                    "type": "AdvisoryCredit",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v34/*: any*/),
                      (v35/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "publisher",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      },
                      (v13/*: any*/)
                    ],
                    "type": "RepositoryAdvisory",
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
                        "selections": (v36/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "inviter",
                        "plural": false,
                        "selections": (v8/*: any*/),
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
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": (v36/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "RepositoryDependabotAlertsThread",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "dismisser",
                        "plural": false,
                        "selections": (v8/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "RepositoryVulnerabilityAlert",
                    "abstractKey": null
                  },
                  (v37/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v9/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "TeamDiscussion",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v38/*: any*/),
                      (v39/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Workflow",
                        "kind": "LinkedField",
                        "name": "workflow",
                        "plural": false,
                        "selections": [
                          (v15/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v13/*: any*/)
                    ],
                    "type": "WorkflowRun",
                    "abstractKey": null
                  },
                  (v40/*: any*/)
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
                  (v5/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": (v42/*: any*/),
                        "storageKey": null
                      },
                      (v43/*: any*/),
                      (v3/*: any*/)
                    ],
                    "type": "Repository",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v21/*: any*/),
                      (v44/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Organization",
                        "kind": "LinkedField",
                        "name": "organization",
                        "plural": false,
                        "selections": (v42/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "Team",
                    "abstractKey": null
                  },
                  (v46/*: any*/),
                  (v47/*: any*/),
                  (v48/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InboxDefaultViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v50/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": (v12/*: any*/),
                        "concreteType": "DiscussionCommentConnection",
                        "kind": "LinkedField",
                        "name": "comments",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DiscussionComment",
                            "kind": "LinkedField",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              (v50/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "comments(first:1)"
                      },
                      (v13/*: any*/)
                    ],
                    "type": "Discussion",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v50/*: any*/),
                      (v14/*: any*/),
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      (v11/*: any*/),
                      (v18/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v19/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "creator",
                        "plural": false,
                        "selections": (v51/*: any*/),
                        "storageKey": null
                      },
                      (v13/*: any*/),
                      (v20/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/)
                    ],
                    "type": "CheckSuite",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v23/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "GitActor",
                        "kind": "LinkedField",
                        "name": "committer",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "actor",
                            "plural": false,
                            "selections": (v49/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/)
                    ],
                    "type": "Commit",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": (v49/*: any*/),
                        "storageKey": null
                      },
                      (v27/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "Gist",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "author",
                        "plural": false,
                        "selections": (v51/*: any*/),
                        "storageKey": null
                      },
                      (v21/*: any*/),
                      (v28/*: any*/),
                      (v29/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "Release",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v30/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "advisory",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v31/*: any*/),
                          (v32/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v33/*: any*/)
                    ],
                    "type": "AdvisoryCredit",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v34/*: any*/),
                      (v35/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "publisher",
                        "plural": false,
                        "selections": (v51/*: any*/),
                        "storageKey": null
                      },
                      (v13/*: any*/)
                    ],
                    "type": "RepositoryAdvisory",
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
                          (v5/*: any*/),
                          (v21/*: any*/),
                          (v52/*: any*/),
                          (v54/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": (v53/*: any*/),
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
                        "selections": (v51/*: any*/),
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
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v21/*: any*/),
                          (v52/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "RepositoryDependabotAlertsThread",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": "author",
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "dismisser",
                        "plural": false,
                        "selections": (v51/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "RepositoryVulnerabilityAlert",
                    "abstractKey": null
                  },
                  (v37/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v50/*: any*/),
                      (v13/*: any*/)
                    ],
                    "type": "TeamDiscussion",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v38/*: any*/),
                      (v39/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Workflow",
                        "kind": "LinkedField",
                        "name": "workflow",
                        "plural": false,
                        "selections": [
                          (v15/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v13/*: any*/)
                    ],
                    "type": "WorkflowRun",
                    "abstractKey": null
                  },
                  (v40/*: any*/),
                  (v54/*: any*/)
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
                  (v5/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v7/*: any*/),
                          (v41/*: any*/),
                          (v3/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v43/*: any*/),
                      (v3/*: any*/)
                    ],
                    "type": "Repository",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v21/*: any*/),
                      (v44/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Organization",
                        "kind": "LinkedField",
                        "name": "organization",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          (v41/*: any*/),
                          (v3/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "Team",
                    "abstractKey": null
                  },
                  (v46/*: any*/),
                  (v47/*: any*/),
                  (v48/*: any*/),
                  (v54/*: any*/)
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
    "id": "ea301060fafa1e671712a6222928e69d",
    "metadata": {},
    "name": "InboxDefaultViewQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "20bb3e8734800b6c638d10dc6b939deb";

export default node;
