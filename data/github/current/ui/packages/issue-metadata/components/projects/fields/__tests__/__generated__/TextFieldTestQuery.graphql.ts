/**
 * @generated SignedSource<<a8145dfe31bba86fad1c380c699a75d1>>
 * @relayHash b1f373ae532cec7573afcf98210296ba
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b1f373ae532cec7573afcf98210296ba

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2FieldType = "ASSIGNEES" | "DATE" | "ISSUE_TYPE" | "ITERATION" | "LABELS" | "LINKED_PULL_REQUESTS" | "MILESTONE" | "NUMBER" | "PARENT_ISSUE" | "REPOSITORY" | "REVIEWERS" | "SINGLE_SELECT" | "SUB_ISSUES_PROGRESS" | "TEXT" | "TITLE" | "TRACKED_BY" | "TRACKS" | "%future added value";
export type TextFieldTestQuery$variables = Record<PropertyKey, never>;
export type TextFieldTestQuery$data = {
  readonly node: {
    readonly fieldValues?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly field?: {
            readonly id?: string;
          };
          readonly id?: string;
          readonly " $fragmentSpreads": FragmentRefs<"TextFieldFragment">;
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
            readonly " $fragmentSpreads": FragmentRefs<"TextFieldConfigFragment">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly url: string;
      readonly viewerCanUpdate: boolean;
    };
  } | null | undefined;
};
export type TextFieldTestQuery = {
  response: TextFieldTestQuery$data;
  variables: TextFieldTestQuery$variables;
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": (v7/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v11 = {
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
    "name": "TextFieldTestQuery",
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
                                    "name": "TextFieldConfigFragment"
                                  }
                                ],
                                "type": "ProjectV2Field",
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
                                    "type": "ProjectV2Field",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldTextValue",
                            "abstractKey": null
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "TextFieldFragment"
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
    "name": "TextFieldTestQuery",
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
                                  (v6/*: any*/)
                                ],
                                "type": "ProjectV2Field",
                                "abstractKey": null
                              },
                              (v9/*: any*/)
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
                                      (v5/*: any*/)
                                    ],
                                    "type": "ProjectV2Field",
                                    "abstractKey": null
                                  },
                                  (v9/*: any*/)
                                ],
                                "storageKey": null
                              },
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
                          (v9/*: any*/)
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
    "id": "b1f373ae532cec7573afcf98210296ba",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v10/*: any*/),
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
        "node.fieldValues.edges.node.__isNode": (v10/*: any*/),
        "node.fieldValues.edges.node.__typename": (v10/*: any*/),
        "node.fieldValues.edges.node.field": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.fieldValues.edges.node.field.__isNode": (v10/*: any*/),
        "node.fieldValues.edges.node.field.__typename": (v10/*: any*/),
        "node.fieldValues.edges.node.field.id": (v11/*: any*/),
        "node.fieldValues.edges.node.field.name": (v10/*: any*/),
        "node.fieldValues.edges.node.id": (v11/*: any*/),
        "node.fieldValues.edges.node.text": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "node.id": (v11/*: any*/),
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
        "node.project.fields.edges.node.__isNode": (v10/*: any*/),
        "node.project.fields.edges.node.__typename": (v10/*: any*/),
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
        "node.project.fields.edges.node.id": (v11/*: any*/),
        "node.project.fields.edges.node.name": (v10/*: any*/),
        "node.project.id": (v11/*: any*/),
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
    "name": "TextFieldTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "917469857d9031cf823739ba949b6fce";

export default node;
