/**
 * @generated SignedSource<<978fb0bc307992f4c52962dc4b132a2e>>
 * @relayHash b92bef8bf0e68483274bbf804df73796
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b92bef8bf0e68483274bbf804df73796

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueSidebarTestQuery$variables = Record<PropertyKey, never>;
export type IssueSidebarTestQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueSidebarPrimaryQuery">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueViewerViewer">;
  };
};
export type IssueSidebarTestQuery = {
  response: IssueSidebarTestQuery$data;
  variables: IssueSidebarTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
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
  "name": "number",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
},
v7 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v11 = {
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v15 = [
  (v2/*: any*/)
],
v16 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
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
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v19 = {
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
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v21 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v23 = {
  "kind": "InlineFragment",
  "selections": (v15/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v24 = {
  "alias": null,
  "args": (v7/*: any*/),
  "concreteType": "ProjectV2ItemConnection",
  "kind": "LinkedField",
  "name": "projectItemsNext",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2ItemEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2Item",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            (v6/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                (v12/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "template",
                  "storageKey": null
                },
                (v20/*: any*/),
                (v14/*: any*/),
                {
                  "alias": null,
                  "args": (v21/*: any*/),
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "field",
                  "plural": false,
                  "selections": [
                    (v1/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v2/*: any*/),
                        (v4/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ProjectV2SingleSelectFieldOption",
                          "kind": "LinkedField",
                          "name": "options",
                          "plural": true,
                          "selections": [
                            (v2/*: any*/),
                            (v22/*: any*/),
                            (v4/*: any*/),
                            (v17/*: any*/),
                            (v8/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "descriptionHTML",
                              "storageKey": null
                            },
                            (v9/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    },
                    (v23/*: any*/)
                  ],
                  "storageKey": "field(name:\"Status\")"
                },
                (v13/*: any*/),
                (v3/*: any*/),
                (v1/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": (v21/*: any*/),
              "concreteType": null,
              "kind": "LinkedField",
              "name": "fieldValueByName",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v2/*: any*/),
                    (v22/*: any*/),
                    (v4/*: any*/),
                    (v17/*: any*/),
                    (v8/*: any*/)
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                (v23/*: any*/)
              ],
              "storageKey": "fieldValueByName(name:\"Status\")"
            },
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        (v18/*: any*/)
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "projectItemsNext(first:10)"
},
v25 = {
  "alias": null,
  "args": (v7/*: any*/),
  "filters": [
    "allowedOwner"
  ],
  "handle": "connection",
  "key": "ProjectSection_projectItemsNext",
  "kind": "LinkedHandle",
  "name": "projectItemsNext"
},
v26 = [
  (v2/*: any*/),
  (v4/*: any*/)
],
v27 = {
  "alias": null,
  "args": (v7/*: any*/),
  "concreteType": "ProjectCardConnection",
  "kind": "LinkedField",
  "name": "projectCards",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCardEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectCard",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Project",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v4/*: any*/),
                (v14/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": (v7/*: any*/),
                  "concreteType": "ProjectColumnConnection",
                  "kind": "LinkedField",
                  "name": "columns",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "ProjectColumn",
                      "kind": "LinkedField",
                      "name": "nodes",
                      "plural": true,
                      "selections": (v26/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": "columns(first:10)"
                },
                (v13/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v3/*: any*/),
                (v20/*: any*/),
                (v1/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectColumn",
              "kind": "LinkedField",
              "name": "column",
              "plural": false,
              "selections": (v26/*: any*/),
              "storageKey": null
            },
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        (v18/*: any*/)
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "projectCards(first:10)"
},
v28 = {
  "alias": null,
  "args": (v7/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "ProjectSection_projectCards",
  "kind": "LinkedHandle",
  "name": "projectCards"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v30 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v31 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v32 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v33 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v34 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PageInfo"
},
v35 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v36 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v37 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v38 = [
  "BLUE",
  "GRAY",
  "GREEN",
  "ORANGE",
  "PINK",
  "PURPLE",
  "RED",
  "YELLOW"
],
v39 = {
  "enumValues": (v38/*: any*/),
  "nullable": false,
  "plural": false,
  "type": "ProjectV2SingleSelectFieldOptionColor"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueSidebarTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                "name": "IssueSidebarPrimaryQuery"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "IssueViewerViewer"
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
    "name": "IssueSidebarTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
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
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      (v5/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RepositoryPlanFeatures",
                    "kind": "LinkedField",
                    "name": "planFeatures",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "maximumAssignees",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isPrivate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v7/*: any*/),
                    "concreteType": "IssueTypeConnection",
                    "kind": "LinkedField",
                    "name": "issueTypes",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "IssueType",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          (v2/*: any*/),
                          (v4/*: any*/),
                          (v8/*: any*/),
                          (v9/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isEnabled",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v10/*: any*/)
                    ],
                    "storageKey": "issueTypes(first:10)"
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 3
                      }
                    ],
                    "concreteType": "PinnedIssueConnection",
                    "kind": "LinkedField",
                    "name": "pinnedIssues",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/)
                    ],
                    "storageKey": "pinnedIssues(first:3)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanPinIssues",
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
                    "value": 20
                  }
                ],
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v4/*: any*/),
                      (v11/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateNext",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanAssign",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Milestone",
                "kind": "LinkedField",
                "name": "milestone",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dueOn",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressPercentage",
                    "storageKey": null
                  },
                  (v14/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "closedAt",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanSetMilestone",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isPinned",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "locked",
                "storageKey": null
              },
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
                "name": "viewerCanTransfer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanConvertToDiscussion",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueType",
                "kind": "LinkedField",
                "name": "issueType",
                "plural": false,
                "selections": (v15/*: any*/),
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v16/*: any*/),
                    "concreteType": "LabelConnection",
                    "kind": "LinkedField",
                    "name": "labels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "LabelEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Label",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              (v8/*: any*/),
                              (v4/*: any*/),
                              (v17/*: any*/),
                              (v9/*: any*/),
                              (v14/*: any*/),
                              (v1/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v18/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v19/*: any*/)
                    ],
                    "storageKey": "labels(first:100,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
                  },
                  {
                    "alias": null,
                    "args": (v16/*: any*/),
                    "filters": [
                      "orderBy"
                    ],
                    "handle": "connection",
                    "key": "MetadataSectionAssignedLabels_labels",
                    "kind": "LinkedHandle",
                    "name": "labels"
                  },
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isNode"
                  }
                ],
                "type": "Labelable",
                "abstractKey": "__isLabelable"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v27/*: any*/),
                      (v28/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanUpdateMetadata",
                        "storageKey": null
                      }
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v27/*: any*/),
                      (v28/*: any*/),
                      (v20/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  }
                ],
                "type": "IssueOrPullRequest",
                "abstractKey": "__isIssueOrPullRequest"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "enterpriseManagedEnterpriseId",
            "storageKey": null
          },
          (v5/*: any*/),
          (v2/*: any*/),
          (v11/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isEmployee",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "b92bef8bf0e68483274bbf804df73796",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isIssueOrPullRequest": (v29/*: any*/),
        "node.__isLabelable": (v29/*: any*/),
        "node.__isNode": (v29/*: any*/),
        "node.__typename": (v29/*: any*/),
        "node.assignees": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserConnection"
        },
        "node.assignees.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "User"
        },
        "node.assignees.nodes.avatarUrl": (v30/*: any*/),
        "node.assignees.nodes.id": (v31/*: any*/),
        "node.assignees.nodes.login": (v29/*: any*/),
        "node.assignees.nodes.name": (v32/*: any*/),
        "node.id": (v31/*: any*/),
        "node.isPinned": (v33/*: any*/),
        "node.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "node.issueType.id": (v31/*: any*/),
        "node.labels": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "LabelConnection"
        },
        "node.labels.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "LabelEdge"
        },
        "node.labels.edges.cursor": (v29/*: any*/),
        "node.labels.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Label"
        },
        "node.labels.edges.node.__typename": (v29/*: any*/),
        "node.labels.edges.node.color": (v29/*: any*/),
        "node.labels.edges.node.description": (v32/*: any*/),
        "node.labels.edges.node.id": (v31/*: any*/),
        "node.labels.edges.node.name": (v29/*: any*/),
        "node.labels.edges.node.nameHTML": (v29/*: any*/),
        "node.labels.edges.node.url": (v30/*: any*/),
        "node.labels.pageInfo": (v34/*: any*/),
        "node.labels.pageInfo.endCursor": (v32/*: any*/),
        "node.labels.pageInfo.hasNextPage": (v35/*: any*/),
        "node.locked": (v35/*: any*/),
        "node.milestone": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Milestone"
        },
        "node.milestone.closed": (v35/*: any*/),
        "node.milestone.closedAt": (v36/*: any*/),
        "node.milestone.dueOn": (v36/*: any*/),
        "node.milestone.id": (v31/*: any*/),
        "node.milestone.progressPercentage": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Float"
        },
        "node.milestone.title": (v29/*: any*/),
        "node.milestone.url": (v30/*: any*/),
        "node.number": (v37/*: any*/),
        "node.projectCards": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectCardConnection"
        },
        "node.projectCards.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectCardEdge"
        },
        "node.projectCards.edges.cursor": (v29/*: any*/),
        "node.projectCards.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectCard"
        },
        "node.projectCards.edges.node.__typename": (v29/*: any*/),
        "node.projectCards.edges.node.column": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "node.projectCards.edges.node.column.id": (v31/*: any*/),
        "node.projectCards.edges.node.column.name": (v29/*: any*/),
        "node.projectCards.edges.node.id": (v31/*: any*/),
        "node.projectCards.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "node.projectCards.edges.node.project.__typename": (v29/*: any*/),
        "node.projectCards.edges.node.project.closed": (v35/*: any*/),
        "node.projectCards.edges.node.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "node.projectCards.edges.node.project.columns.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumn"
        },
        "node.projectCards.edges.node.project.columns.nodes.id": (v31/*: any*/),
        "node.projectCards.edges.node.project.columns.nodes.name": (v29/*: any*/),
        "node.projectCards.edges.node.project.id": (v31/*: any*/),
        "node.projectCards.edges.node.project.name": (v29/*: any*/),
        "node.projectCards.edges.node.project.number": (v37/*: any*/),
        "node.projectCards.edges.node.project.title": (v29/*: any*/),
        "node.projectCards.edges.node.project.url": (v30/*: any*/),
        "node.projectCards.edges.node.project.viewerCanUpdate": (v35/*: any*/),
        "node.projectCards.pageInfo": (v34/*: any*/),
        "node.projectCards.pageInfo.endCursor": (v32/*: any*/),
        "node.projectCards.pageInfo.hasNextPage": (v35/*: any*/),
        "node.projectItemsNext": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemConnection"
        },
        "node.projectItemsNext.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2ItemEdge"
        },
        "node.projectItemsNext.edges.cursor": (v29/*: any*/),
        "node.projectItemsNext.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2Item"
        },
        "node.projectItemsNext.edges.node.__typename": (v29/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "node.projectItemsNext.edges.node.fieldValueByName.__isNode": (v29/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.__typename": (v29/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.color": (v39/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.id": (v31/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.name": (v32/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.nameHTML": (v32/*: any*/),
        "node.projectItemsNext.edges.node.fieldValueByName.optionId": (v32/*: any*/),
        "node.projectItemsNext.edges.node.id": (v31/*: any*/),
        "node.projectItemsNext.edges.node.isArchived": (v35/*: any*/),
        "node.projectItemsNext.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "node.projectItemsNext.edges.node.project.__typename": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.closed": (v35/*: any*/),
        "node.projectItemsNext.edges.node.project.field": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.projectItemsNext.edges.node.project.field.__isNode": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.__typename": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.id": (v31/*: any*/),
        "node.projectItemsNext.edges.node.project.field.name": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "node.projectItemsNext.edges.node.project.field.options.color": (v39/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.description": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.descriptionHTML": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.id": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.name": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.nameHTML": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.field.options.optionId": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.id": (v31/*: any*/),
        "node.projectItemsNext.edges.node.project.number": (v37/*: any*/),
        "node.projectItemsNext.edges.node.project.template": (v35/*: any*/),
        "node.projectItemsNext.edges.node.project.title": (v29/*: any*/),
        "node.projectItemsNext.edges.node.project.url": (v30/*: any*/),
        "node.projectItemsNext.edges.node.project.viewerCanUpdate": (v35/*: any*/),
        "node.projectItemsNext.pageInfo": (v34/*: any*/),
        "node.projectItemsNext.pageInfo.endCursor": (v32/*: any*/),
        "node.projectItemsNext.pageInfo.hasNextPage": (v35/*: any*/),
        "node.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "node.repository.id": (v31/*: any*/),
        "node.repository.isArchived": (v35/*: any*/),
        "node.repository.isPrivate": (v35/*: any*/),
        "node.repository.issueTypes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueTypeConnection"
        },
        "node.repository.issueTypes.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueType"
        },
        "node.repository.issueTypes.nodes.color": {
          "enumValues": (v38/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "IssueTypeColor"
        },
        "node.repository.issueTypes.nodes.description": (v32/*: any*/),
        "node.repository.issueTypes.nodes.id": (v31/*: any*/),
        "node.repository.issueTypes.nodes.isEnabled": (v35/*: any*/),
        "node.repository.issueTypes.nodes.name": (v29/*: any*/),
        "node.repository.issueTypes.totalCount": (v37/*: any*/),
        "node.repository.name": (v29/*: any*/),
        "node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "node.repository.owner.__typename": (v29/*: any*/),
        "node.repository.owner.id": (v31/*: any*/),
        "node.repository.owner.login": (v29/*: any*/),
        "node.repository.pinnedIssues": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PinnedIssueConnection"
        },
        "node.repository.pinnedIssues.totalCount": (v37/*: any*/),
        "node.repository.planFeatures": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryPlanFeatures"
        },
        "node.repository.planFeatures.maximumAssignees": (v37/*: any*/),
        "node.repository.viewerCanPinIssues": (v35/*: any*/),
        "node.viewerCanAssign": (v35/*: any*/),
        "node.viewerCanConvertToDiscussion": (v33/*: any*/),
        "node.viewerCanDelete": (v35/*: any*/),
        "node.viewerCanLabel": (v35/*: any*/),
        "node.viewerCanSetMilestone": (v35/*: any*/),
        "node.viewerCanTransfer": (v35/*: any*/),
        "node.viewerCanType": (v33/*: any*/),
        "node.viewerCanUpdate": (v35/*: any*/),
        "node.viewerCanUpdateMetadata": (v33/*: any*/),
        "node.viewerCanUpdateNext": (v33/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.avatarUrl": (v30/*: any*/),
        "viewer.enterpriseManagedEnterpriseId": (v32/*: any*/),
        "viewer.id": (v31/*: any*/),
        "viewer.isEmployee": (v35/*: any*/),
        "viewer.login": (v29/*: any*/),
        "viewer.name": (v32/*: any*/)
      }
    },
    "name": "IssueSidebarTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "85f15083026e42df551edf7e947bc136";

export default node;
