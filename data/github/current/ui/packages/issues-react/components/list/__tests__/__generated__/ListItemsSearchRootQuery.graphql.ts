/**
 * @generated SignedSource<<e576c07cdc1f9180bf54f3ea05c30b6b>>
 * @relayHash 3593fb15d2d2c8ddef6f0de16955708c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3593fb15d2d2c8ddef6f0de16955708c

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListItemsSearchRootQuery$variables = {
  first?: number | null | undefined;
  labelPageSize?: number | null | undefined;
  query?: string | null | undefined;
  skip?: number | null | undefined;
};
export type ListItemsSearchRootQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ListItemsPaginated_results">;
};
export type ListItemsSearchRootQuery = {
  response: ListItemsSearchRootQuery$data;
  variables: ListItemsSearchRootQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": 25,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": 20,
  "kind": "LocalArgument",
  "name": "labelPageSize"
},
v2 = {
  "defaultValue": "state:open archived:false assignee:@me sort:updated-desc",
  "kind": "LocalArgument",
  "name": "query"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
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
v6 = {
  "kind": "Variable",
  "name": "skip",
  "variableName": "skip"
},
v7 = [
  (v4/*: any*/),
  (v5/*: any*/),
  (v6/*: any*/),
  {
    "kind": "Literal",
    "name": "type",
    "value": "ISSUE"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v12/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        (v8/*: any*/),
        (v14/*: any*/),
        (v9/*: any*/)
      ],
      "storageKey": null
    },
    (v9/*: any*/)
  ],
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "first",
      "variableName": "labelPageSize"
    },
    {
      "kind": "Literal",
      "name": "orderBy",
      "value": {
        "direction": "ASC",
        "field": "NAME"
      }
    }
  ],
  "concreteType": "LabelConnection",
  "kind": "LinkedField",
  "name": "labels",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Label",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v9/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nameHTML",
          "storageKey": null
        },
        (v13/*: any*/),
        (v12/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": null
    },
    (v9/*: any*/)
  ],
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v21 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Milestone",
    "kind": "LinkedField",
    "name": "milestone",
    "plural": false,
    "selections": [
      (v11/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "url",
        "storageKey": null
      },
      (v9/*: any*/)
    ],
    "storageKey": null
  }
],
v22 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": (v21/*: any*/),
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v21/*: any*/),
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "IssueOrPullRequest",
  "abstractKey": "__isIssueOrPullRequest"
},
v23 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        (v16/*: any*/),
        (v17/*: any*/),
        (v18/*: any*/),
        (v19/*: any*/),
        (v20/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "stateReason",
          "storageKey": null
        },
        (v22/*: any*/)
      ],
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v16/*: any*/),
        (v17/*: any*/),
        (v18/*: any*/),
        (v19/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "reviewDecision",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isDraft",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isInMergeQueue",
          "storageKey": null
        },
        {
          "alias": "pullRequestState",
          "args": null,
          "kind": "ScalarField",
          "name": "state",
          "storageKey": null
        },
        (v22/*: any*/)
      ],
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "IssueOrPullRequest",
  "abstractKey": "__isIssueOrPullRequest"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v30 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
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
    "name": "ListItemsSearchRootQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Literal",
            "name": "fetchRepository",
            "value": true
          },
          (v4/*: any*/),
          {
            "kind": "Variable",
            "name": "labelPageSize",
            "variableName": "labelPageSize"
          },
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "ListItemsPaginated_results"
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
    "name": "ListItemsSearchRootQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchResultItemEdge",
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
                  (v8/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      {
                        "alias": "titleHtml",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titleHTML",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "IssueType",
                        "kind": "LinkedField",
                        "name": "issueType",
                        "plural": false,
                        "selections": [
                          (v9/*: any*/),
                          (v12/*: any*/),
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v15/*: any*/),
                      (v23/*: any*/)
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v15/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestCommit",
                        "kind": "LinkedField",
                        "name": "headCommit",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Commit",
                            "kind": "LinkedField",
                            "name": "commit",
                            "plural": false,
                            "selections": [
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "StatusCheckRollup",
                                "kind": "LinkedField",
                                "name": "statusCheckRollup",
                                "plural": false,
                                "selections": [
                                  (v20/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "StatusCheckRollupContextConnection",
                                    "kind": "LinkedField",
                                    "name": "contexts",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "checkRunCount",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "CheckRunStateCount",
                                        "kind": "LinkedField",
                                        "name": "checkRunCountsByState",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "count",
                                            "storageKey": null
                                          },
                                          (v20/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v9/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v11/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titleHTML",
                        "storageKey": null
                      },
                      (v23/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v9/*: any*/)
                    ],
                    "type": "Node",
                    "abstractKey": "__isNode"
                  }
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
                "name": "startCursor",
                "storageKey": null
              },
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
                "name": "hasPreviousPage",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "issueCount",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v7/*: any*/),
        "filters": [
          "query",
          "type",
          "skip"
        ],
        "handle": "connection",
        "key": "Query_search",
        "kind": "LinkedHandle",
        "name": "search"
      }
    ]
  },
  "params": {
    "id": "3593fb15d2d2c8ddef6f0de16955708c",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "search": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "SearchResultItemConnection"
        },
        "search.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "SearchResultItemEdge"
        },
        "search.edges.cursor": (v24/*: any*/),
        "search.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "SearchResultItem"
        },
        "search.edges.node.__isIssueOrPullRequest": (v24/*: any*/),
        "search.edges.node.__isNode": (v24/*: any*/),
        "search.edges.node.__typename": (v24/*: any*/),
        "search.edges.node.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "search.edges.node.author.__typename": (v24/*: any*/),
        "search.edges.node.author.avatarUrl": (v25/*: any*/),
        "search.edges.node.author.id": (v26/*: any*/),
        "search.edges.node.author.login": (v24/*: any*/),
        "search.edges.node.createdAt": (v27/*: any*/),
        "search.edges.node.headCommit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestCommit"
        },
        "search.edges.node.headCommit.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "search.edges.node.headCommit.commit.id": (v26/*: any*/),
        "search.edges.node.headCommit.commit.statusCheckRollup": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "StatusCheckRollup"
        },
        "search.edges.node.headCommit.commit.statusCheckRollup.contexts": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "StatusCheckRollupContextConnection"
        },
        "search.edges.node.headCommit.commit.statusCheckRollup.contexts.checkRunCount": (v28/*: any*/),
        "search.edges.node.headCommit.commit.statusCheckRollup.contexts.checkRunCountsByState": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "CheckRunStateCount"
        },
        "search.edges.node.headCommit.commit.statusCheckRollup.contexts.checkRunCountsByState.count": (v28/*: any*/),
        "search.edges.node.headCommit.commit.statusCheckRollup.contexts.checkRunCountsByState.state": {
          "enumValues": [
            "ACTION_REQUIRED",
            "CANCELLED",
            "COMPLETED",
            "FAILURE",
            "IN_PROGRESS",
            "NEUTRAL",
            "PENDING",
            "QUEUED",
            "SKIPPED",
            "STALE",
            "STARTUP_FAILURE",
            "SUCCESS",
            "TIMED_OUT",
            "WAITING"
          ],
          "nullable": false,
          "plural": false,
          "type": "CheckRunState"
        },
        "search.edges.node.headCommit.commit.statusCheckRollup.id": (v26/*: any*/),
        "search.edges.node.headCommit.commit.statusCheckRollup.state": {
          "enumValues": [
            "ERROR",
            "EXPECTED",
            "FAILURE",
            "PENDING",
            "SUCCESS"
          ],
          "nullable": false,
          "plural": false,
          "type": "StatusState"
        },
        "search.edges.node.headCommit.id": (v26/*: any*/),
        "search.edges.node.id": (v26/*: any*/),
        "search.edges.node.isDraft": (v29/*: any*/),
        "search.edges.node.isInMergeQueue": (v29/*: any*/),
        "search.edges.node.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "search.edges.node.issueType.color": {
          "enumValues": [
            "BLUE",
            "GRAY",
            "GREEN",
            "ORANGE",
            "PINK",
            "PURPLE",
            "RED",
            "YELLOW"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueTypeColor"
        },
        "search.edges.node.issueType.id": (v26/*: any*/),
        "search.edges.node.issueType.name": (v24/*: any*/),
        "search.edges.node.labels": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "LabelConnection"
        },
        "search.edges.node.labels.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Label"
        },
        "search.edges.node.labels.nodes.color": (v24/*: any*/),
        "search.edges.node.labels.nodes.description": (v30/*: any*/),
        "search.edges.node.labels.nodes.id": (v26/*: any*/),
        "search.edges.node.labels.nodes.name": (v24/*: any*/),
        "search.edges.node.labels.nodes.nameHTML": (v24/*: any*/),
        "search.edges.node.milestone": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Milestone"
        },
        "search.edges.node.milestone.id": (v26/*: any*/),
        "search.edges.node.milestone.title": (v24/*: any*/),
        "search.edges.node.milestone.url": (v25/*: any*/),
        "search.edges.node.number": (v28/*: any*/),
        "search.edges.node.pullRequestState": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "search.edges.node.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "search.edges.node.repository.id": (v26/*: any*/),
        "search.edges.node.repository.name": (v24/*: any*/),
        "search.edges.node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "search.edges.node.repository.owner.__typename": (v24/*: any*/),
        "search.edges.node.repository.owner.id": (v26/*: any*/),
        "search.edges.node.repository.owner.login": (v24/*: any*/),
        "search.edges.node.reviewDecision": {
          "enumValues": [
            "APPROVED",
            "CHANGES_REQUESTED",
            "REVIEW_REQUIRED"
          ],
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewDecision"
        },
        "search.edges.node.state": {
          "enumValues": [
            "CLOSED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueState"
        },
        "search.edges.node.stateReason": {
          "enumValues": [
            "COMPLETED",
            "NOT_PLANNED",
            "REOPENED"
          ],
          "nullable": true,
          "plural": false,
          "type": "IssueStateReason"
        },
        "search.edges.node.title": (v24/*: any*/),
        "search.edges.node.titleHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "search.edges.node.titleHtml": (v24/*: any*/),
        "search.edges.node.updatedAt": (v27/*: any*/),
        "search.issueCount": (v28/*: any*/),
        "search.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "search.pageInfo.endCursor": (v30/*: any*/),
        "search.pageInfo.hasNextPage": (v29/*: any*/),
        "search.pageInfo.hasPreviousPage": (v29/*: any*/),
        "search.pageInfo.startCursor": (v30/*: any*/)
      }
    },
    "name": "ListItemsSearchRootQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "67691a8ee59f2fcc175b86812de740d1";

export default node;
