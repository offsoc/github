/**
 * @generated SignedSource<<04657467a3e999fab58a29e6bdc386a3>>
 * @relayHash 186f7c2325aa1ae9055d92f0ee1fc894
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 186f7c2325aa1ae9055d92f0ee1fc894

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesSubscription_IssueViewerSubscription$variables = {
  issueId: string;
};
export type SubIssuesSubscription_IssueViewerSubscription$data = {
  readonly issueUpdated: {
    readonly subIssuesUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesList">;
    } | null | undefined;
  };
};
export type SubIssuesSubscription_IssueViewerSubscription = {
  response: SubIssuesSubscription_IssueViewerSubscription$data;
  variables: SubIssuesSubscription_IssueViewerSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "issueId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "issueId"
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
  "name": "totalCount",
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
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    (v4/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v7 = [
  (v3/*: any*/)
],
v8 = {
  "alias": "subIssuesConnection",
  "args": null,
  "concreteType": "IssueConnection",
  "kind": "LinkedField",
  "name": "subIssues",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Issue"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "IssueConnection"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SubIssuesSubscription_IssueViewerSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "SubIssuesList"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SubIssuesSubscription_IssueViewerSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 50
                  }
                ],
                "concreteType": "IssueConnection",
                "kind": "LinkedField",
                "name": "subIssues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
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
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 10
                          }
                        ],
                        "concreteType": "UserConnection",
                        "kind": "LinkedField",
                        "name": "assignees",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v2/*: any*/),
                                  (v4/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "assignees(first:10)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "url",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
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
                        "kind": "ScalarField",
                        "name": "number",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "title",
                        "storageKey": null
                      },
                      {
                        "alias": null,
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
                          (v2/*: any*/),
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "color",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SubIssuesSummary",
                        "kind": "LinkedField",
                        "name": "subIssuesSummary",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "completed",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v8/*: any*/),
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 0
                          },
                          {
                            "kind": "Literal",
                            "name": "includeClosedPrs",
                            "value": true
                          }
                        ],
                        "concreteType": "PullRequestConnection",
                        "kind": "LinkedField",
                        "name": "closedByPullRequestsReferences",
                        "plural": false,
                        "selections": (v7/*: any*/),
                        "storageKey": "closedByPullRequestsReferences(first:0,includeClosedPrs:true)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "closed",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "subIssues(first:50)"
              },
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "nameWithOwner",
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "186f7c2325aa1ae9055d92f0ee1fc894",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "issueUpdated": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueUpdatedPayload"
        },
        "issueUpdated.subIssuesUpdated": (v9/*: any*/),
        "issueUpdated.subIssuesUpdated.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.parent": (v9/*: any*/),
        "issueUpdated.subIssuesUpdated.parent.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.repository": (v11/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.nameWithOwner": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner": (v13/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.__typename": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.login": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Issue"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserConnection"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "UserEdge"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.edges.node.avatarUrl": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.edges.node.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.edges.node.login": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.assignees.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.closed": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.closedByPullRequestsReferences": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestConnection"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.closedByPullRequestsReferences.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.issueType.color": {
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
        "issueUpdated.subIssuesUpdated.subIssues.nodes.issueType.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.issueType.name": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.number": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository": (v11/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.name": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.owner": (v13/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.owner.__typename": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.owner.id": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.repository.owner.login": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.state": {
          "enumValues": [
            "CLOSED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueState"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.stateReason": {
          "enumValues": [
            "COMPLETED",
            "NOT_PLANNED",
            "REOPENED"
          ],
          "nullable": true,
          "plural": false,
          "type": "IssueStateReason"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.subIssuesConnection": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.subIssuesConnection.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.subIssuesSummary": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "SubIssuesSummary"
        },
        "issueUpdated.subIssuesUpdated.subIssues.nodes.subIssuesSummary.completed": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.title": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.titleHTML": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssues.nodes.url": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesConnection": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesConnection.totalCount": (v16/*: any*/)
      }
    },
    "name": "SubIssuesSubscription_IssueViewerSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "c6109d909ad88cecb13468b972ec7f74";

export default node;
