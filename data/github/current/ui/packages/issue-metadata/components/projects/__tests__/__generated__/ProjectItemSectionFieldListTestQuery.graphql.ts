/**
 * @generated SignedSource<<9a38d9ae7cc4c8ebb746731e1ab774ef>>
 * @relayHash fd33caabe502263c3e5238fe7d1ae28e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID fd33caabe502263c3e5238fe7d1ae28e

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSectionFieldListTestQuery$variables = Record<PropertyKey, never>;
export type ProjectItemSectionFieldListTestQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFields">;
  } | null | undefined;
};
export type ProjectItemSectionFieldListTestQuery = {
  response: ProjectItemSectionFieldListTestQuery$data;
  variables: ProjectItemSectionFieldListTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 1
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
  "name": "title",
  "storageKey": null
},
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "POSITION"
    }
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dataType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titleHTML",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "duration",
  "storageKey": null
},
v10 = [
  (v2/*: any*/),
  (v3/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2IterationFieldConfiguration",
  "kind": "LinkedField",
  "name": "configuration",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2IterationFieldIteration",
      "kind": "LinkedField",
      "name": "iterations",
      "plural": true,
      "selections": (v10/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2IterationFieldIteration",
      "kind": "LinkedField",
      "name": "completedIterations",
      "plural": true,
      "selections": (v10/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
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
v15 = [
  (v2/*: any*/)
],
v16 = {
  "kind": "InlineFragment",
  "selections": (v15/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v17 = {
  "alias": null,
  "args": null,
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
        (v6/*: any*/)
      ],
      "type": "ProjectV2Field",
      "abstractKey": null
    },
    (v16/*: any*/)
  ],
  "storageKey": null
},
v18 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v19 = {
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
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ProjectV2IterationFieldConfiguration"
},
v22 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "ProjectV2IterationFieldIteration"
},
v23 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Date"
},
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v25 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectItemSectionFieldListTestQuery",
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
                "name": "ProjectItemSectionFields"
              }
            ],
            "type": "ProjectV2Item",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:1)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProjectItemSectionFieldListTestQuery",
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isArchived",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                    "kind": "ScalarField",
                    "name": "viewerCanUpdate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v4/*: any*/),
                    "concreteType": "ProjectV2FieldConfigurationConnection",
                    "kind": "LinkedField",
                    "name": "fields",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2FieldConfigurationEdge",
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
                              (v1/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/)
                                ],
                                "type": "ProjectV2Field",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  (v11/*: any*/)
                                ],
                                "type": "ProjectV2IterationField",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ProjectV2SingleSelectFieldOption",
                                    "kind": "LinkedField",
                                    "name": "options",
                                    "plural": true,
                                    "selections": [
                                      (v2/*: any*/),
                                      (v12/*: any*/),
                                      (v6/*: any*/),
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
                              (v16/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "fields(first:50,orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "concreteType": "ProjectV2ItemFieldValueConnection",
                "kind": "LinkedField",
                "name": "fieldValues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2ItemFieldValueEdge",
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
                          (v1/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v17/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "text",
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldTextValue",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v17/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "number",
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldNumberValue",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v17/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "date",
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldDateValue",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v1/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v15/*: any*/),
                                    "type": "ProjectV2SingleSelectField",
                                    "abstractKey": null
                                  },
                                  (v16/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v12/*: any*/),
                              (v6/*: any*/),
                              (v13/*: any*/),
                              (v14/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldSingleSelectValue",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              {
                                "alias": null,
                                "args": null,
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
                                      (v6/*: any*/),
                                      (v11/*: any*/)
                                    ],
                                    "type": "ProjectV2IterationField",
                                    "abstractKey": null
                                  },
                                  (v16/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "iterationId",
                                "storageKey": null
                              },
                              (v3/*: any*/),
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v9/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldIterationValue",
                            "abstractKey": null
                          },
                          (v16/*: any*/)
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
                "storageKey": "fieldValues(first:50,orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "filters": [
                  "orderBy"
                ],
                "handle": "connection",
                "key": "ProjectItemSection_fieldValues",
                "kind": "LinkedHandle",
                "name": "fieldValues"
              }
            ],
            "type": "ProjectV2Item",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:1)"
      }
    ]
  },
  "params": {
    "id": "fd33caabe502263c3e5238fe7d1ae28e",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v18/*: any*/),
        "node.fieldValues": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2ItemFieldValueConnection"
        },
        "node.fieldValues.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2ItemFieldValueEdge"
        },
        "node.fieldValues.edges.cursor": (v18/*: any*/),
        "node.fieldValues.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "node.fieldValues.edges.node.__isNode": (v18/*: any*/),
        "node.fieldValues.edges.node.__typename": (v18/*: any*/),
        "node.fieldValues.edges.node.color": (v19/*: any*/),
        "node.fieldValues.edges.node.date": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Date"
        },
        "node.fieldValues.edges.node.duration": (v20/*: any*/),
        "node.fieldValues.edges.node.field": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.fieldValues.edges.node.field.__isNode": (v18/*: any*/),
        "node.fieldValues.edges.node.field.__typename": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration": (v21/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations": (v22/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.duration": (v20/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.id": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.startDate": (v23/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.title": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.titleHTML": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations": (v22/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.duration": (v20/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.id": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.startDate": (v23/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.title": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.titleHTML": (v18/*: any*/),
        "node.fieldValues.edges.node.field.id": (v24/*: any*/),
        "node.fieldValues.edges.node.field.name": (v18/*: any*/),
        "node.fieldValues.edges.node.id": (v24/*: any*/),
        "node.fieldValues.edges.node.iterationId": (v18/*: any*/),
        "node.fieldValues.edges.node.name": (v25/*: any*/),
        "node.fieldValues.edges.node.nameHTML": (v25/*: any*/),
        "node.fieldValues.edges.node.number": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Float"
        },
        "node.fieldValues.edges.node.optionId": (v25/*: any*/),
        "node.fieldValues.edges.node.startDate": (v23/*: any*/),
        "node.fieldValues.edges.node.text": (v25/*: any*/),
        "node.fieldValues.edges.node.title": (v18/*: any*/),
        "node.fieldValues.edges.node.titleHTML": (v18/*: any*/),
        "node.fieldValues.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "node.fieldValues.pageInfo.endCursor": (v25/*: any*/),
        "node.fieldValues.pageInfo.hasNextPage": (v26/*: any*/),
        "node.id": (v24/*: any*/),
        "node.isArchived": (v26/*: any*/),
        "node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "node.project.fields": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldConfigurationConnection"
        },
        "node.project.fields.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2FieldConfigurationEdge"
        },
        "node.project.fields.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.project.fields.edges.node.__isNode": (v18/*: any*/),
        "node.project.fields.edges.node.__typename": (v18/*: any*/),
        "node.project.fields.edges.node.configuration": (v21/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations": (v22/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.duration": (v20/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.id": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.startDate": (v23/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.title": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.titleHTML": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.iterations": (v22/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.duration": (v20/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.id": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.startDate": (v23/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.title": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.titleHTML": (v18/*: any*/),
        "node.project.fields.edges.node.dataType": {
          "enumValues": [
            "ASSIGNEES",
            "DATE",
            "ISSUE_TYPE",
            "ITERATION",
            "LABELS",
            "LINKED_PULL_REQUESTS",
            "MILESTONE",
            "NUMBER",
            "PARENT_ISSUE",
            "REPOSITORY",
            "REVIEWERS",
            "SINGLE_SELECT",
            "SUB_ISSUES_PROGRESS",
            "TEXT",
            "TITLE",
            "TRACKED_BY",
            "TRACKS"
          ],
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldType"
        },
        "node.project.fields.edges.node.id": (v24/*: any*/),
        "node.project.fields.edges.node.name": (v18/*: any*/),
        "node.project.fields.edges.node.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "node.project.fields.edges.node.options.color": (v19/*: any*/),
        "node.project.fields.edges.node.options.description": (v18/*: any*/),
        "node.project.fields.edges.node.options.descriptionHTML": (v18/*: any*/),
        "node.project.fields.edges.node.options.id": (v18/*: any*/),
        "node.project.fields.edges.node.options.name": (v18/*: any*/),
        "node.project.fields.edges.node.options.nameHTML": (v18/*: any*/),
        "node.project.fields.edges.node.options.optionId": (v18/*: any*/),
        "node.project.id": (v24/*: any*/),
        "node.project.title": (v18/*: any*/),
        "node.project.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "node.project.viewerCanUpdate": (v26/*: any*/)
      }
    },
    "name": "ProjectItemSectionFieldListTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0e16395555bfcae32354cd59c2c8e6ae";

export default node;
