/**
 * @generated SignedSource<<79740c1f43926969daf4a9b446d38c1b>>
 * @relayHash e92ae864ba92a505074377689fd3393d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e92ae864ba92a505074377689fd3393d

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DetailsPaneTestQuery$variables = Record<PropertyKey, never>;
export type DetailsPaneTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"DetailsPane_pullRequest">;
  } | null | undefined;
};
export type DetailsPaneTestQuery = {
  response: DetailsPaneTestQuery$data;
  variables: DetailsPaneTestQuery$variables;
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
  "kind": "Literal",
  "name": "first",
  "value": 100
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "asCodeOwner",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = [
  (v2/*: any*/),
  (v5/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    (v2/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "combinedSlug",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v15 = [
  (v1/*: any*/),
  (v7/*: any*/),
  (v2/*: any*/)
],
v16 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v17 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      (v2/*: any*/),
      (v7/*: any*/),
      (v5/*: any*/),
      {
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
      }
    ],
    "storageKey": null
  }
],
v18 = [
  (v3/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  }
],
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v23 = {
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
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v5/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": (v15/*: any*/),
      "storageKey": null
    },
    (v24/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v26 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v27 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": (v26/*: any*/),
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
            (v24/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v2/*: any*/),
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
                  "name": "template",
                  "storageKey": null
                },
                (v13/*: any*/),
                (v10/*: any*/),
                {
                  "alias": null,
                  "args": (v27/*: any*/),
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
                        (v5/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ProjectV2SingleSelectFieldOption",
                          "kind": "LinkedField",
                          "name": "options",
                          "plural": true,
                          "selections": [
                            (v2/*: any*/),
                            (v28/*: any*/),
                            (v5/*: any*/),
                            (v20/*: any*/),
                            (v19/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "descriptionHTML",
                              "storageKey": null
                            },
                            (v21/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    },
                    (v8/*: any*/)
                  ],
                  "storageKey": "field(name:\"Status\")"
                },
                (v29/*: any*/),
                (v14/*: any*/),
                (v1/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": (v27/*: any*/),
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
                    (v28/*: any*/),
                    (v5/*: any*/),
                    (v20/*: any*/),
                    (v19/*: any*/)
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                (v8/*: any*/)
              ],
              "storageKey": "fieldValueByName(name:\"Status\")"
            },
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        (v22/*: any*/)
      ],
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "storageKey": "projectItemsNext(first:10)"
},
v31 = {
  "alias": null,
  "args": (v26/*: any*/),
  "filters": [
    "allowedOwner"
  ],
  "handle": "connection",
  "key": "ProjectSection_projectItemsNext",
  "kind": "LinkedHandle",
  "name": "projectItemsNext"
},
v32 = {
  "alias": null,
  "args": (v26/*: any*/),
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
                (v5/*: any*/),
                (v10/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": (v26/*: any*/),
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
                      "selections": (v6/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": "columns(first:10)"
                },
                (v29/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v14/*: any*/),
                (v13/*: any*/),
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
              "selections": (v6/*: any*/),
              "storageKey": null
            },
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        (v22/*: any*/)
      ],
      "storageKey": null
    },
    (v23/*: any*/)
  ],
  "storageKey": "projectCards(first:10)"
},
v33 = {
  "alias": null,
  "args": (v26/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "ProjectSection_projectCards",
  "kind": "LinkedHandle",
  "name": "projectCards"
},
v34 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v35 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UserConnection"
},
v36 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "User"
},
v37 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v38 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v39 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v40 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v41 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PageInfo"
},
v42 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "RequestedReviewer"
},
v43 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v44 = {
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
  "type": "ProjectV2SingleSelectFieldOptionColor"
},
v45 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ReviewRequest"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DetailsPaneTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
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
                "name": "DetailsPane_pullRequest"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DetailsPaneTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
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
              {
                "alias": null,
                "args": [
                  (v3/*: any*/)
                ],
                "concreteType": "ReviewRequestConnection",
                "kind": "LinkedField",
                "name": "reviewRequests",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ReviewRequestEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ReviewRequest",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ReviewRequest",
                            "kind": "LinkedField",
                            "name": "assignedFromReviewRequest",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "requestedReviewer",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v6/*: any*/),
                                    "type": "Team",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v2/*: any*/),
                                      (v7/*: any*/)
                                    ],
                                    "type": "User",
                                    "abstractKey": null
                                  },
                                  (v8/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v4/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "requestedReviewer",
                            "plural": false,
                            "selections": [
                              (v1/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  (v9/*: any*/),
                                  (v7/*: any*/),
                                  (v10/*: any*/)
                                ],
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v11/*: any*/),
                                  (v2/*: any*/),
                                  {
                                    "alias": "teamAvatarUrl",
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "avatarUrl",
                                    "storageKey": null
                                  },
                                  (v5/*: any*/),
                                  (v10/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Organization",
                                    "kind": "LinkedField",
                                    "name": "organization",
                                    "plural": false,
                                    "selections": [
                                      (v5/*: any*/),
                                      (v2/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "type": "Team",
                                "abstractKey": null
                              },
                              (v8/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "reviewRequests(first:100)"
              },
              {
                "alias": null,
                "args": [
                  (v3/*: any*/),
                  {
                    "kind": "Literal",
                    "name": "preferOpinionatedReviews",
                    "value": true
                  }
                ],
                "concreteType": "PullRequestReviewConnection",
                "kind": "LinkedField",
                "name": "latestReviews",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReview",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "OnBehalfOfReviewer",
                            "kind": "LinkedField",
                            "name": "onBehalfOfReviewers",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "asCodeowner",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "reviewer",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v11/*: any*/)
                                    ],
                                    "type": "Team",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v7/*: any*/)
                                    ],
                                    "type": "User",
                                    "abstractKey": null
                                  },
                                  (v8/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "author",
                            "plural": false,
                            "selections": [
                              (v1/*: any*/),
                              (v9/*: any*/),
                              (v7/*: any*/),
                              (v10/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v12/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "latestReviews(first:100,preferOpinionatedReviews:true)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isDraft",
                "storageKey": null
              },
              (v12/*: any*/),
              (v13/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "codeowners",
                "plural": true,
                "selections": [
                  (v1/*: any*/),
                  (v8/*: any*/)
                ],
                "storageKey": null
              },
              (v14/*: any*/),
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "baseRepository",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": "planSupportsDraftPullRequests",
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "feature",
                        "value": "DRAFT_PRS"
                      }
                    ],
                    "kind": "ScalarField",
                    "name": "planSupports",
                    "storageKey": "planSupports(feature:\"DRAFT_PRS\")"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "baseRepositoryOwner",
                "plural": false,
                "selections": (v15/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v16/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": (v17/*: any*/),
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": (v16/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "suggestedAssignees",
                "plural": false,
                "selections": (v17/*: any*/),
                "storageKey": "suggestedAssignees(first:20)"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v18/*: any*/),
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
                              (v19/*: any*/),
                              (v5/*: any*/),
                              (v20/*: any*/),
                              (v21/*: any*/),
                              (v10/*: any*/),
                              (v1/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v22/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v23/*: any*/)
                    ],
                    "storageKey": "labels(first:100,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
                  },
                  {
                    "alias": null,
                    "args": (v18/*: any*/),
                    "filters": [
                      "orderBy"
                    ],
                    "handle": "connection",
                    "key": "LabelPicker_labels",
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
                      (v25/*: any*/),
                      (v30/*: any*/),
                      (v31/*: any*/),
                      (v32/*: any*/),
                      (v33/*: any*/),
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
                      (v25/*: any*/),
                      (v30/*: any*/),
                      (v31/*: any*/),
                      (v32/*: any*/),
                      (v33/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  }
                ],
                "type": "IssueOrPullRequest",
                "abstractKey": "__isIssueOrPullRequest"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "id": "e92ae864ba92a505074377689fd3393d",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__isIssueOrPullRequest": (v34/*: any*/),
        "pullRequest.__isLabelable": (v34/*: any*/),
        "pullRequest.__isNode": (v34/*: any*/),
        "pullRequest.__typename": (v34/*: any*/),
        "pullRequest.assignees": (v35/*: any*/),
        "pullRequest.assignees.nodes": (v36/*: any*/),
        "pullRequest.assignees.nodes.avatarUrl": (v37/*: any*/),
        "pullRequest.assignees.nodes.id": (v38/*: any*/),
        "pullRequest.assignees.nodes.login": (v34/*: any*/),
        "pullRequest.assignees.nodes.name": (v39/*: any*/),
        "pullRequest.baseRepository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.baseRepository.id": (v38/*: any*/),
        "pullRequest.baseRepository.name": (v34/*: any*/),
        "pullRequest.baseRepository.planSupportsDraftPullRequests": (v40/*: any*/),
        "pullRequest.baseRepositoryOwner": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequest.baseRepositoryOwner.__typename": (v34/*: any*/),
        "pullRequest.baseRepositoryOwner.id": (v38/*: any*/),
        "pullRequest.baseRepositoryOwner.login": (v34/*: any*/),
        "pullRequest.codeowners": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Codeowners"
        },
        "pullRequest.codeowners.__isNode": (v34/*: any*/),
        "pullRequest.codeowners.__typename": (v34/*: any*/),
        "pullRequest.codeowners.id": (v38/*: any*/),
        "pullRequest.id": (v38/*: any*/),
        "pullRequest.isDraft": (v40/*: any*/),
        "pullRequest.labels": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "LabelConnection"
        },
        "pullRequest.labels.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "LabelEdge"
        },
        "pullRequest.labels.edges.cursor": (v34/*: any*/),
        "pullRequest.labels.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Label"
        },
        "pullRequest.labels.edges.node.__typename": (v34/*: any*/),
        "pullRequest.labels.edges.node.color": (v34/*: any*/),
        "pullRequest.labels.edges.node.description": (v39/*: any*/),
        "pullRequest.labels.edges.node.id": (v38/*: any*/),
        "pullRequest.labels.edges.node.name": (v34/*: any*/),
        "pullRequest.labels.edges.node.nameHTML": (v34/*: any*/),
        "pullRequest.labels.edges.node.url": (v37/*: any*/),
        "pullRequest.labels.pageInfo": (v41/*: any*/),
        "pullRequest.labels.pageInfo.endCursor": (v39/*: any*/),
        "pullRequest.labels.pageInfo.hasNextPage": (v40/*: any*/),
        "pullRequest.latestReviews": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewConnection"
        },
        "pullRequest.latestReviews.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestReviewEdge"
        },
        "pullRequest.latestReviews.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReview"
        },
        "pullRequest.latestReviews.edges.node.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.latestReviews.edges.node.author.__typename": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.author.avatarUrl": (v37/*: any*/),
        "pullRequest.latestReviews.edges.node.author.id": (v38/*: any*/),
        "pullRequest.latestReviews.edges.node.author.login": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.author.url": (v37/*: any*/),
        "pullRequest.latestReviews.edges.node.id": (v38/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "OnBehalfOfReviewer"
        },
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.asCodeowner": (v40/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer": (v42/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.__isNode": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.__typename": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.combinedSlug": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.id": (v38/*: any*/),
        "pullRequest.latestReviews.edges.node.onBehalfOfReviewers.reviewer.login": (v34/*: any*/),
        "pullRequest.latestReviews.edges.node.state": {
          "enumValues": [
            "APPROVED",
            "CHANGES_REQUESTED",
            "COMMENTED",
            "DISMISSED",
            "PENDING"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequest.number": (v43/*: any*/),
        "pullRequest.projectCards": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectCardConnection"
        },
        "pullRequest.projectCards.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectCardEdge"
        },
        "pullRequest.projectCards.edges.cursor": (v34/*: any*/),
        "pullRequest.projectCards.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectCard"
        },
        "pullRequest.projectCards.edges.node.__typename": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.column": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "pullRequest.projectCards.edges.node.column.id": (v38/*: any*/),
        "pullRequest.projectCards.edges.node.column.name": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.id": (v38/*: any*/),
        "pullRequest.projectCards.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "pullRequest.projectCards.edges.node.project.__typename": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.project.closed": (v40/*: any*/),
        "pullRequest.projectCards.edges.node.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "pullRequest.projectCards.edges.node.project.columns.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumn"
        },
        "pullRequest.projectCards.edges.node.project.columns.nodes.id": (v38/*: any*/),
        "pullRequest.projectCards.edges.node.project.columns.nodes.name": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.project.id": (v38/*: any*/),
        "pullRequest.projectCards.edges.node.project.name": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.project.number": (v43/*: any*/),
        "pullRequest.projectCards.edges.node.project.title": (v34/*: any*/),
        "pullRequest.projectCards.edges.node.project.url": (v37/*: any*/),
        "pullRequest.projectCards.edges.node.project.viewerCanUpdate": (v40/*: any*/),
        "pullRequest.projectCards.pageInfo": (v41/*: any*/),
        "pullRequest.projectCards.pageInfo.endCursor": (v39/*: any*/),
        "pullRequest.projectCards.pageInfo.hasNextPage": (v40/*: any*/),
        "pullRequest.projectItemsNext": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemConnection"
        },
        "pullRequest.projectItemsNext.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2ItemEdge"
        },
        "pullRequest.projectItemsNext.edges.cursor": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2Item"
        },
        "pullRequest.projectItemsNext.edges.node.__typename": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.__isNode": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.__typename": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.color": (v44/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.id": (v38/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.name": (v39/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.nameHTML": (v39/*: any*/),
        "pullRequest.projectItemsNext.edges.node.fieldValueByName.optionId": (v39/*: any*/),
        "pullRequest.projectItemsNext.edges.node.id": (v38/*: any*/),
        "pullRequest.projectItemsNext.edges.node.isArchived": (v40/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "pullRequest.projectItemsNext.edges.node.project.__typename": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.closed": (v40/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "pullRequest.projectItemsNext.edges.node.project.field.__isNode": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.__typename": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.id": (v38/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.name": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "pullRequest.projectItemsNext.edges.node.project.field.options.color": (v44/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.description": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.descriptionHTML": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.id": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.name": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.nameHTML": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.field.options.optionId": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.id": (v38/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.number": (v43/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.template": (v40/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.title": (v34/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.url": (v37/*: any*/),
        "pullRequest.projectItemsNext.edges.node.project.viewerCanUpdate": (v40/*: any*/),
        "pullRequest.projectItemsNext.pageInfo": (v41/*: any*/),
        "pullRequest.projectItemsNext.pageInfo.endCursor": (v39/*: any*/),
        "pullRequest.projectItemsNext.pageInfo.hasNextPage": (v40/*: any*/),
        "pullRequest.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.repository.id": (v38/*: any*/),
        "pullRequest.repository.isArchived": (v40/*: any*/),
        "pullRequest.repository.name": (v34/*: any*/),
        "pullRequest.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequest.repository.owner.__typename": (v34/*: any*/),
        "pullRequest.repository.owner.id": (v38/*: any*/),
        "pullRequest.repository.owner.login": (v34/*: any*/),
        "pullRequest.reviewRequests": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ReviewRequestConnection"
        },
        "pullRequest.reviewRequests.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReviewRequestEdge"
        },
        "pullRequest.reviewRequests.edges.node": (v45/*: any*/),
        "pullRequest.reviewRequests.edges.node.asCodeOwner": (v40/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest": (v45/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.asCodeOwner": (v40/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.id": (v38/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer": (v42/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.__isNode": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.__typename": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.id": (v38/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.login": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.assignedFromReviewRequest.requestedReviewer.name": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.id": (v38/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer": (v42/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.__isNode": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.__typename": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.avatarUrl": (v37/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.combinedSlug": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.id": (v38/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.login": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.name": (v34/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Organization"
        },
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization.id": (v38/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.organization.name": (v39/*: any*/),
        "pullRequest.reviewRequests.edges.node.requestedReviewer.teamAvatarUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "pullRequest.reviewRequests.edges.node.requestedReviewer.url": (v37/*: any*/),
        "pullRequest.state": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "pullRequest.suggestedAssignees": (v35/*: any*/),
        "pullRequest.suggestedAssignees.nodes": (v36/*: any*/),
        "pullRequest.suggestedAssignees.nodes.avatarUrl": (v37/*: any*/),
        "pullRequest.suggestedAssignees.nodes.id": (v38/*: any*/),
        "pullRequest.suggestedAssignees.nodes.login": (v34/*: any*/),
        "pullRequest.suggestedAssignees.nodes.name": (v39/*: any*/),
        "pullRequest.viewerCanAssign": (v40/*: any*/),
        "pullRequest.viewerCanUpdate": (v40/*: any*/),
        "pullRequest.viewerCanUpdateMetadata": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        }
      }
    },
    "name": "DetailsPaneTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e5a525988bf4c033f6b16a936d04006e";

export default node;
