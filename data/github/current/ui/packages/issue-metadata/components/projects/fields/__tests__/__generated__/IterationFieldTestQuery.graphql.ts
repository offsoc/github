/**
 * @generated SignedSource<<64e93530d1549865d9ada4cf22cafe84>>
 * @relayHash 4df3dab434085862d6425c4fe5828d55
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4df3dab434085862d6425c4fe5828d55

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2FieldType = "ASSIGNEES" | "DATE" | "ISSUE_TYPE" | "ITERATION" | "LABELS" | "LINKED_PULL_REQUESTS" | "MILESTONE" | "NUMBER" | "PARENT_ISSUE" | "REPOSITORY" | "REVIEWERS" | "SINGLE_SELECT" | "SUB_ISSUES_PROGRESS" | "TEXT" | "TITLE" | "TRACKED_BY" | "TRACKS" | "%future added value";
export type IterationFieldTestQuery$variables = Record<PropertyKey, never>;
export type IterationFieldTestQuery$data = {
  readonly node: {
    readonly fieldValues?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly field?: {
            readonly id?: string;
          };
          readonly id?: string;
          readonly " $fragmentSpreads": FragmentRefs<"IterationFieldFragment">;
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
            readonly " $fragmentSpreads": FragmentRefs<"IterationFieldConfigFragment">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly url: string;
      readonly viewerCanUpdate: boolean;
    };
  } | null | undefined;
};
export type IterationFieldTestQuery = {
  response: IterationFieldTestQuery$data;
  variables: IterationFieldTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "abc"
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
  "name": "title",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titleHTML",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "duration",
  "storageKey": null
},
v13 = [
  (v3/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v11/*: any*/),
  (v12/*: any*/)
],
v14 = {
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
      "selections": (v13/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2IterationFieldIteration",
      "kind": "LinkedField",
      "name": "completedIterations",
      "plural": true,
      "selections": (v13/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v15 = {
  "kind": "InlineFragment",
  "selections": (v7/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v17 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v18 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ProjectV2IterationFieldConfiguration"
},
v19 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "ProjectV2IterationFieldIteration"
},
v20 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Date"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IterationFieldTestQuery",
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
                                    "name": "IterationFieldConfigFragment"
                                  }
                                ],
                                "type": "ProjectV2IterationField",
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
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v7/*: any*/),
                                    "type": "ProjectV2IterationField",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldIterationValue",
                            "abstractKey": null
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "IterationFieldFragment"
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
        "storageKey": "node(id:\"abc\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IterationFieldTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                              (v8/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v3/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  (v14/*: any*/)
                                ],
                                "type": "ProjectV2IterationField",
                                "abstractKey": null
                              },
                              (v15/*: any*/)
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
                          (v8/*: any*/),
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
                                  (v8/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v3/*: any*/),
                                      (v5/*: any*/),
                                      (v14/*: any*/)
                                    ],
                                    "type": "ProjectV2IterationField",
                                    "abstractKey": null
                                  },
                                  (v15/*: any*/)
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
                              (v9/*: any*/),
                              (v10/*: any*/),
                              (v11/*: any*/),
                              (v12/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldIterationValue",
                            "abstractKey": null
                          },
                          (v15/*: any*/)
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
        "storageKey": "node(id:\"abc\")"
      }
    ]
  },
  "params": {
    "id": "4df3dab434085862d6425c4fe5828d55",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v16/*: any*/),
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
        "node.fieldValues.edges.node.__isNode": (v16/*: any*/),
        "node.fieldValues.edges.node.__typename": (v16/*: any*/),
        "node.fieldValues.edges.node.duration": (v17/*: any*/),
        "node.fieldValues.edges.node.field": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.fieldValues.edges.node.field.__isNode": (v16/*: any*/),
        "node.fieldValues.edges.node.field.__typename": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration": (v18/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations": (v19/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.duration": (v17/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.id": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.startDate": (v20/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.title": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration.completedIterations.titleHTML": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations": (v19/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.duration": (v17/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.id": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.startDate": (v20/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.title": (v16/*: any*/),
        "node.fieldValues.edges.node.field.configuration.iterations.titleHTML": (v16/*: any*/),
        "node.fieldValues.edges.node.field.id": (v21/*: any*/),
        "node.fieldValues.edges.node.field.name": (v16/*: any*/),
        "node.fieldValues.edges.node.id": (v21/*: any*/),
        "node.fieldValues.edges.node.iterationId": (v16/*: any*/),
        "node.fieldValues.edges.node.startDate": (v20/*: any*/),
        "node.fieldValues.edges.node.title": (v16/*: any*/),
        "node.fieldValues.edges.node.titleHTML": (v16/*: any*/),
        "node.id": (v21/*: any*/),
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
        "node.project.fields.edges.node.__isNode": (v16/*: any*/),
        "node.project.fields.edges.node.__typename": (v16/*: any*/),
        "node.project.fields.edges.node.configuration": (v18/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations": (v19/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.duration": (v17/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.id": (v16/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.startDate": (v20/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.title": (v16/*: any*/),
        "node.project.fields.edges.node.configuration.completedIterations.titleHTML": (v16/*: any*/),
        "node.project.fields.edges.node.configuration.iterations": (v19/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.duration": (v17/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.id": (v16/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.startDate": (v20/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.title": (v16/*: any*/),
        "node.project.fields.edges.node.configuration.iterations.titleHTML": (v16/*: any*/),
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
        "node.project.fields.edges.node.id": (v21/*: any*/),
        "node.project.fields.edges.node.name": (v16/*: any*/),
        "node.project.id": (v21/*: any*/),
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
    "name": "IterationFieldTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e8af762a8ce72dc095d2e8e82dd3e430";

export default node;
