/**
 * @generated SignedSource<<8102e812b664617621bbbfa6722c702a>>
 * @relayHash 38cdebb1a1bd1bdf6098d3d08e09844d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 38cdebb1a1bd1bdf6098d3d08e09844d

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectsSectionStoriesTestQuery$variables = {
  id: string;
};
export type ProjectsSectionStoriesTestQuery$data = {
  readonly issue: {
    readonly " $fragmentSpreads": FragmentRefs<"ProjectsSectionFragment">;
  } | null | undefined;
};
export type ProjectsSectionStoriesTestQuery = {
  response: ProjectsSectionStoriesTestQuery$data;
  variables: ProjectsSectionStoriesTestQuery$variables;
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
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
  "name": "isArchived",
  "storageKey": null
},
v7 = {
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
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    (v6/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v15 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v18 = {
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
v19 = {
  "alias": null,
  "args": (v8/*: any*/),
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
            (v3/*: any*/),
            (v6/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v3/*: any*/),
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
                (v9/*: any*/),
                (v10/*: any*/),
                {
                  "alias": null,
                  "args": (v11/*: any*/),
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "field",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v3/*: any*/),
                        (v5/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ProjectV2SingleSelectFieldOption",
                          "kind": "LinkedField",
                          "name": "options",
                          "plural": true,
                          "selections": [
                            (v3/*: any*/),
                            (v12/*: any*/),
                            (v5/*: any*/),
                            (v13/*: any*/),
                            (v14/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "descriptionHTML",
                              "storageKey": null
                            },
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
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    },
                    (v15/*: any*/)
                  ],
                  "storageKey": "field(name:\"Status\")"
                },
                (v16/*: any*/),
                (v4/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": (v11/*: any*/),
              "concreteType": null,
              "kind": "LinkedField",
              "name": "fieldValueByName",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v3/*: any*/),
                    (v12/*: any*/),
                    (v5/*: any*/),
                    (v13/*: any*/),
                    (v14/*: any*/)
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                (v15/*: any*/)
              ],
              "storageKey": "fieldValueByName(name:\"Status\")"
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        },
        (v17/*: any*/)
      ],
      "storageKey": null
    },
    (v18/*: any*/)
  ],
  "storageKey": "projectItemsNext(first:10)"
},
v20 = {
  "alias": null,
  "args": (v8/*: any*/),
  "filters": [
    "allowedOwner"
  ],
  "handle": "connection",
  "key": "ProjectSection_projectItemsNext",
  "kind": "LinkedHandle",
  "name": "projectItemsNext"
},
v21 = [
  (v3/*: any*/),
  (v5/*: any*/)
],
v22 = {
  "alias": null,
  "args": (v8/*: any*/),
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
            (v3/*: any*/),
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
                (v3/*: any*/),
                {
                  "alias": null,
                  "args": (v8/*: any*/),
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
                      "selections": (v21/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": "columns(first:10)"
                },
                (v16/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v4/*: any*/),
                (v9/*: any*/),
                (v2/*: any*/)
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
              "selections": (v21/*: any*/),
              "storageKey": null
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        },
        (v17/*: any*/)
      ],
      "storageKey": null
    },
    (v18/*: any*/)
  ],
  "storageKey": "projectCards(first:10)"
},
v23 = {
  "alias": null,
  "args": (v8/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "ProjectSection_projectCards",
  "kind": "LinkedHandle",
  "name": "projectCards"
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
  "type": "ID"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v27 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v28 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v29 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PageInfo"
},
v30 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v31 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectsSectionStoriesTestQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ProjectsSectionFragment"
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
    "name": "ProjectsSectionStoriesTestQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  (v7/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
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
                  (v4/*: any*/),
                  (v7/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
                  (v9/*: any*/)
                ],
                "type": "PullRequest",
                "abstractKey": null
              }
            ],
            "type": "IssueOrPullRequest",
            "abstractKey": "__isIssueOrPullRequest"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "38cdebb1a1bd1bdf6098d3d08e09844d",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "issue.__isIssueOrPullRequest": (v24/*: any*/),
        "issue.__typename": (v24/*: any*/),
        "issue.id": (v25/*: any*/),
        "issue.number": (v26/*: any*/),
        "issue.projectCards": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectCardConnection"
        },
        "issue.projectCards.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectCardEdge"
        },
        "issue.projectCards.edges.cursor": (v24/*: any*/),
        "issue.projectCards.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectCard"
        },
        "issue.projectCards.edges.node.__typename": (v24/*: any*/),
        "issue.projectCards.edges.node.column": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "issue.projectCards.edges.node.column.id": (v25/*: any*/),
        "issue.projectCards.edges.node.column.name": (v24/*: any*/),
        "issue.projectCards.edges.node.id": (v25/*: any*/),
        "issue.projectCards.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "issue.projectCards.edges.node.project.__typename": (v24/*: any*/),
        "issue.projectCards.edges.node.project.closed": (v27/*: any*/),
        "issue.projectCards.edges.node.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "issue.projectCards.edges.node.project.columns.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumn"
        },
        "issue.projectCards.edges.node.project.columns.nodes.id": (v25/*: any*/),
        "issue.projectCards.edges.node.project.columns.nodes.name": (v24/*: any*/),
        "issue.projectCards.edges.node.project.id": (v25/*: any*/),
        "issue.projectCards.edges.node.project.name": (v24/*: any*/),
        "issue.projectCards.edges.node.project.number": (v26/*: any*/),
        "issue.projectCards.edges.node.project.title": (v24/*: any*/),
        "issue.projectCards.edges.node.project.url": (v28/*: any*/),
        "issue.projectCards.edges.node.project.viewerCanUpdate": (v27/*: any*/),
        "issue.projectCards.pageInfo": (v29/*: any*/),
        "issue.projectCards.pageInfo.endCursor": (v30/*: any*/),
        "issue.projectCards.pageInfo.hasNextPage": (v27/*: any*/),
        "issue.projectItemsNext": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemConnection"
        },
        "issue.projectItemsNext.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2ItemEdge"
        },
        "issue.projectItemsNext.edges.cursor": (v24/*: any*/),
        "issue.projectItemsNext.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2Item"
        },
        "issue.projectItemsNext.edges.node.__typename": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "issue.projectItemsNext.edges.node.fieldValueByName.__isNode": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.__typename": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.color": (v31/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.id": (v25/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.name": (v30/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.nameHTML": (v30/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.optionId": (v30/*: any*/),
        "issue.projectItemsNext.edges.node.id": (v25/*: any*/),
        "issue.projectItemsNext.edges.node.isArchived": (v27/*: any*/),
        "issue.projectItemsNext.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "issue.projectItemsNext.edges.node.project.__typename": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.closed": (v27/*: any*/),
        "issue.projectItemsNext.edges.node.project.field": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "issue.projectItemsNext.edges.node.project.field.__isNode": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.__typename": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.id": (v25/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.name": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "issue.projectItemsNext.edges.node.project.field.options.color": (v31/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.description": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.descriptionHTML": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.id": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.name": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.nameHTML": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.optionId": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.id": (v25/*: any*/),
        "issue.projectItemsNext.edges.node.project.number": (v26/*: any*/),
        "issue.projectItemsNext.edges.node.project.template": (v27/*: any*/),
        "issue.projectItemsNext.edges.node.project.title": (v24/*: any*/),
        "issue.projectItemsNext.edges.node.project.url": (v28/*: any*/),
        "issue.projectItemsNext.edges.node.project.viewerCanUpdate": (v27/*: any*/),
        "issue.projectItemsNext.pageInfo": (v29/*: any*/),
        "issue.projectItemsNext.pageInfo.endCursor": (v30/*: any*/),
        "issue.projectItemsNext.pageInfo.hasNextPage": (v27/*: any*/),
        "issue.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "issue.repository.id": (v25/*: any*/),
        "issue.repository.isArchived": (v27/*: any*/),
        "issue.repository.name": (v24/*: any*/),
        "issue.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "issue.repository.owner.__typename": (v24/*: any*/),
        "issue.repository.owner.id": (v25/*: any*/),
        "issue.repository.owner.login": (v24/*: any*/),
        "issue.viewerCanUpdate": (v27/*: any*/),
        "issue.viewerCanUpdateMetadata": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        }
      }
    },
    "name": "ProjectsSectionStoriesTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "62460842665ea1b78cb43c173ccd0883";

export default node;
