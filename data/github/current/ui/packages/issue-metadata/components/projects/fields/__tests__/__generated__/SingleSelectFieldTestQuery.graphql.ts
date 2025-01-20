/**
 * @generated SignedSource<<10ad53f0e1d9688734d7b05b0c4e0ea5>>
 * @relayHash 08e96b84a065e8cf73a59dfcd6a22610
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 08e96b84a065e8cf73a59dfcd6a22610

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2FieldType = "ASSIGNEES" | "DATE" | "ISSUE_TYPE" | "ITERATION" | "LABELS" | "LINKED_PULL_REQUESTS" | "MILESTONE" | "NUMBER" | "PARENT_ISSUE" | "REPOSITORY" | "REVIEWERS" | "SINGLE_SELECT" | "SUB_ISSUES_PROGRESS" | "TEXT" | "TITLE" | "TRACKED_BY" | "TRACKS" | "%future added value";
export type SingleSelectFieldTestQuery$variables = Record<PropertyKey, never>;
export type SingleSelectFieldTestQuery$data = {
  readonly node: {
    readonly fieldValues?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly field?: {
            readonly id?: string;
          };
          readonly id?: string;
          readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldFragment">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly project?: {
      readonly fields: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly dataType?: ProjectV2FieldType;
            readonly id?: string;
            readonly name?: string;
            readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldConfigFragment">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly url: string;
      readonly viewerCanUpdate: boolean;
    };
  } | null | undefined;
};
export type SingleSelectFieldTestQuery = {
  response: SingleSelectFieldTestQuery$data;
  variables: SingleSelectFieldTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "node-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
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
  "name": "id",
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
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dataType",
  "storageKey": null
},
v7 = [
  (v3/*: any*/)
],
v8 = {
  "kind": "InlineFragment",
  "selections": (v7/*: any*/),
  "type": "ProjectV2Field",
  "abstractKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v13 = {
  "kind": "InlineFragment",
  "selections": (v7/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v15 = {
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
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v17 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SingleSelectFieldTestQuery",
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
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v3/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "SingleSelectFieldConfigFragment"
                                  }
                                ],
                                "type": "ProjectV2SingleSelectField",
                                "abstractKey": null
                              }
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
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v8/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldSingleSelectValue",
                            "abstractKey": null
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "SingleSelectFieldFragment"
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "fieldValues(first:50,orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
              }
            ],
            "type": "ProjectV2Item",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"node-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SingleSelectFieldTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                              (v9/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v3/*: any*/),
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
                                      (v3/*: any*/),
                                      (v10/*: any*/),
                                      (v5/*: any*/),
                                      (v11/*: any*/),
                                      (v12/*: any*/),
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
                              (v13/*: any*/)
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
                          (v9/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v9/*: any*/),
                                  (v8/*: any*/),
                                  (v13/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v10/*: any*/),
                              (v5/*: any*/),
                              (v11/*: any*/),
                              (v12/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldSingleSelectValue",
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
                "storageKey": "fieldValues(first:50,orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
              }
            ],
            "type": "ProjectV2Item",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": "node(id:\"node-id\")"
      }
    ]
  },
  "params": {
    "id": "08e96b84a065e8cf73a59dfcd6a22610",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v14/*: any*/),
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
        "node.fieldValues.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "node.fieldValues.edges.node.__isNode": (v14/*: any*/),
        "node.fieldValues.edges.node.__typename": (v14/*: any*/),
        "node.fieldValues.edges.node.color": (v15/*: any*/),
        "node.fieldValues.edges.node.field": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.fieldValues.edges.node.field.__isNode": (v14/*: any*/),
        "node.fieldValues.edges.node.field.__typename": (v14/*: any*/),
        "node.fieldValues.edges.node.field.id": (v16/*: any*/),
        "node.fieldValues.edges.node.id": (v16/*: any*/),
        "node.fieldValues.edges.node.name": (v17/*: any*/),
        "node.fieldValues.edges.node.nameHTML": (v17/*: any*/),
        "node.fieldValues.edges.node.optionId": (v17/*: any*/),
        "node.id": (v16/*: any*/),
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
        "node.project.fields.edges.node.__isNode": (v14/*: any*/),
        "node.project.fields.edges.node.__typename": (v14/*: any*/),
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
        "node.project.fields.edges.node.id": (v16/*: any*/),
        "node.project.fields.edges.node.name": (v14/*: any*/),
        "node.project.fields.edges.node.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "node.project.fields.edges.node.options.color": (v15/*: any*/),
        "node.project.fields.edges.node.options.description": (v14/*: any*/),
        "node.project.fields.edges.node.options.descriptionHTML": (v14/*: any*/),
        "node.project.fields.edges.node.options.id": (v14/*: any*/),
        "node.project.fields.edges.node.options.name": (v14/*: any*/),
        "node.project.fields.edges.node.options.nameHTML": (v14/*: any*/),
        "node.project.fields.edges.node.options.optionId": (v14/*: any*/),
        "node.project.id": (v16/*: any*/),
        "node.project.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "node.project.viewerCanUpdate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        }
      }
    },
    "name": "SingleSelectFieldTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "dfe09b6d2b739c8cfa6258cd8bf2d795";

export default node;
