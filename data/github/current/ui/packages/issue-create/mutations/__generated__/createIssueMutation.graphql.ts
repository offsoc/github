/**
 * @generated SignedSource<<b9e705bd8096ca24cbe100ea7aeccb08>>
 * @relayHash 1b60066c55f48afb1363a2c618ea4556
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1b60066c55f48afb1363a2c618ea4556

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
export type CreateIssueInput = {
  assigneeIds?: ReadonlyArray<string> | null | undefined;
  body?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  issueTemplate?: string | null | undefined;
  issueTypeId?: string | null | undefined;
  labelIds?: ReadonlyArray<string> | null | undefined;
  milestoneId?: string | null | undefined;
  parentIssueId?: string | null | undefined;
  position?: ReadonlyArray<number> | null | undefined;
  projectIds?: ReadonlyArray<string> | null | undefined;
  repositoryId: string;
  title: string;
};
export type createIssueMutation$variables = {
  fetchParent?: boolean | null | undefined;
  input: CreateIssueInput;
};
export type createIssueMutation$data = {
  readonly createIssue: {
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
    readonly issue: {
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly parent?: {
        readonly id: string;
        readonly subIssues: {
          readonly totalCount: number;
        };
        readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListView">;
      } | null | undefined;
      readonly repository: {
        readonly databaseId: number | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly owner: {
          readonly login: string;
        };
      };
      readonly title: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueMutation$rawResponse = {
  readonly createIssue: {
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
    readonly issue: {
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly parent: {
        readonly id: string;
        readonly subIssues: {
          readonly nodes: ReadonlyArray<{
            readonly assignees: {
              readonly edges: ReadonlyArray<{
                readonly node: {
                  readonly avatarUrl: string;
                  readonly id: string;
                  readonly login: string;
                } | null | undefined;
              } | null | undefined> | null | undefined;
              readonly totalCount: number;
            };
            readonly closed: boolean;
            readonly closedByPullRequestsReferences: {
              readonly totalCount: number;
            } | null | undefined;
            readonly databaseId: number | null | undefined;
            readonly id: string;
            readonly issueType: {
              readonly color: IssueTypeColor;
              readonly id: string;
              readonly name: string;
            } | null | undefined;
            readonly number: number;
            readonly repository: {
              readonly id: string;
              readonly name: string;
              readonly owner: {
                readonly __typename: string;
                readonly id: string;
                readonly login: string;
              };
            };
            readonly state: IssueState;
            readonly stateReason: IssueStateReason | null | undefined;
            readonly subIssuesConnection: {
              readonly totalCount: number;
            };
            readonly subIssuesSummary: {
              readonly completed: number;
            };
            readonly title: string;
            readonly titleHTML: string;
            readonly url: string;
          } | null | undefined> | null | undefined;
          readonly totalCount: number;
        };
        readonly subIssuesConnection: {
          readonly totalCount: number;
        };
      } | null | undefined;
      readonly repository: {
        readonly databaseId: number | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly owner: {
          readonly __typename: string;
          readonly id: string;
          readonly login: string;
        };
      };
      readonly title: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueMutation = {
  rawResponse: createIssueMutation$rawResponse;
  response: createIssueMutation$data;
  variables: createIssueMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "fetchParent"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v10 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  }
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v12 = [
  (v11/*: any*/)
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v14/*: any*/),
    (v6/*: any*/),
    (v4/*: any*/)
  ],
  "storageKey": null
},
v16 = {
  "alias": "subIssuesConnection",
  "args": null,
  "concreteType": "IssueConnection",
  "kind": "LinkedField",
  "name": "subIssues",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "createIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateIssuePayload",
        "kind": "LinkedField",
        "name": "createIssue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v4/*: any*/),
              (v9/*: any*/),
              {
                "condition": "fetchParent",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "parent",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": (v10/*: any*/),
                        "concreteType": "IssueConnection",
                        "kind": "LinkedField",
                        "name": "subIssues",
                        "plural": false,
                        "selections": (v12/*: any*/),
                        "storageKey": "subIssues(first:50)"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "SubIssuesListView"
                      }
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v13/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "createIssueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateIssuePayload",
        "kind": "LinkedField",
        "name": "createIssue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v15/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v4/*: any*/),
              (v9/*: any*/),
              {
                "condition": "fetchParent",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "parent",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": (v10/*: any*/),
                        "concreteType": "IssueConnection",
                        "kind": "LinkedField",
                        "name": "subIssues",
                        "plural": false,
                        "selections": [
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Issue",
                            "kind": "LinkedField",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              (v4/*: any*/),
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
                                  (v11/*: any*/),
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
                                          (v4/*: any*/),
                                          (v6/*: any*/),
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
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Repository",
                                "kind": "LinkedField",
                                "name": "repository",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
                                  (v15/*: any*/),
                                  (v4/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v3/*: any*/),
                              (v7/*: any*/),
                              (v8/*: any*/),
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
                                  (v4/*: any*/),
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
                              (v16/*: any*/),
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
                                "selections": (v12/*: any*/),
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
                      (v16/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v14/*: any*/),
              (v13/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1b60066c55f48afb1363a2c618ea4556",
    "metadata": {},
    "name": "createIssueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "e3bf60f204c96055eb291551d5ae9d46";

export default node;
