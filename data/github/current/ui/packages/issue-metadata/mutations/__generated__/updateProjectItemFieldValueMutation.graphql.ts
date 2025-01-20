/**
 * @generated SignedSource<<c03afbe28da6875ededb663900b0f61f>>
 * @relayHash 8b296fae9f2499af49f72d6df68d6b5c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8b296fae9f2499af49f72d6df68d6b5c

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2SingleSelectFieldOptionColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
export type UpdateProjectV2ItemFieldValueInput = {
  clientMutationId?: string | null | undefined;
  fieldId: string;
  itemId: string;
  projectId: string;
  value: ProjectV2FieldValue;
};
export type ProjectV2FieldValue = {
  date?: any | null | undefined;
  iterationId?: string | null | undefined;
  number?: number | null | undefined;
  singleSelectOptionId?: string | null | undefined;
  text?: string | null | undefined;
};
export type updateProjectItemFieldValueMutation$variables = {
  input: UpdateProjectV2ItemFieldValueInput;
};
export type updateProjectItemFieldValueMutation$data = {
  readonly updateProjectV2ItemFieldValue: {
    readonly projectV2Item: {
      readonly fieldValueByName: {
        readonly name?: string | null | undefined;
      } | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFieldsValues">;
    } | null | undefined;
  } | null | undefined;
};
export type updateProjectItemFieldValueMutation$rawResponse = {
  readonly updateProjectV2ItemFieldValue: {
    readonly projectV2Item: {
      readonly fieldValueByName: {
        readonly __typename: "ProjectV2ItemFieldSingleSelectValue";
        readonly __isNode: "ProjectV2ItemFieldSingleSelectValue";
        readonly id: string;
        readonly name: string | null | undefined;
      } | {
        readonly __typename: string;
        readonly __isNode: string;
        readonly id: string;
      } | null | undefined;
      readonly fieldValues: {
        readonly edges: ReadonlyArray<{
          readonly cursor: string;
          readonly node: {
            readonly __typename: "ProjectV2ItemFieldDateValue";
            readonly __isNode: "ProjectV2ItemFieldDateValue";
            readonly date: any | null | undefined;
            readonly field: {
              readonly __typename: "ProjectV2Field";
              readonly __isNode: "ProjectV2Field";
              readonly id: string;
              readonly name: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            };
            readonly id: string;
          } | {
            readonly __typename: "ProjectV2ItemFieldIterationValue";
            readonly __isNode: "ProjectV2ItemFieldIterationValue";
            readonly duration: number;
            readonly field: {
              readonly __typename: "ProjectV2IterationField";
              readonly __isNode: "ProjectV2IterationField";
              readonly configuration: {
                readonly completedIterations: ReadonlyArray<{
                  readonly duration: number;
                  readonly id: string;
                  readonly startDate: any;
                  readonly title: string;
                  readonly titleHTML: string;
                }>;
                readonly iterations: ReadonlyArray<{
                  readonly duration: number;
                  readonly id: string;
                  readonly startDate: any;
                  readonly title: string;
                  readonly titleHTML: string;
                }>;
              };
              readonly id: string;
              readonly name: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            };
            readonly id: string;
            readonly iterationId: string;
            readonly startDate: any;
            readonly title: string;
            readonly titleHTML: string;
          } | {
            readonly __typename: "ProjectV2ItemFieldNumberValue";
            readonly __isNode: "ProjectV2ItemFieldNumberValue";
            readonly field: {
              readonly __typename: "ProjectV2Field";
              readonly __isNode: "ProjectV2Field";
              readonly id: string;
              readonly name: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            };
            readonly id: string;
            readonly number: number | null | undefined;
          } | {
            readonly __typename: "ProjectV2ItemFieldSingleSelectValue";
            readonly __isNode: "ProjectV2ItemFieldSingleSelectValue";
            readonly color: ProjectV2SingleSelectFieldOptionColor;
            readonly field: {
              readonly __typename: "ProjectV2SingleSelectField";
              readonly __isNode: "ProjectV2SingleSelectField";
              readonly id: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            };
            readonly id: string;
            readonly name: string | null | undefined;
            readonly nameHTML: string | null | undefined;
            readonly optionId: string | null | undefined;
          } | {
            readonly __typename: "ProjectV2ItemFieldTextValue";
            readonly __isNode: "ProjectV2ItemFieldTextValue";
            readonly field: {
              readonly __typename: "ProjectV2Field";
              readonly __isNode: "ProjectV2Field";
              readonly id: string;
              readonly name: string;
            } | {
              readonly __typename: string;
              readonly __isNode: string;
              readonly id: string;
            };
            readonly id: string;
            readonly text: string | null | undefined;
          } | {
            readonly __typename: string;
            readonly __isNode: string;
            readonly id: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
        readonly pageInfo: {
          readonly endCursor: string | null | undefined;
          readonly hasNextPage: boolean;
        };
      };
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type updateProjectItemFieldValueMutation = {
  rawResponse: updateProjectItemFieldValueMutation$rawResponse;
  response: updateProjectItemFieldValueMutation$data;
  variables: updateProjectItemFieldValueMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/)
  ],
  "type": "ProjectV2ItemFieldSingleSelectValue",
  "abstractKey": null
},
v5 = [
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  (v7/*: any*/)
],
v9 = {
  "kind": "InlineFragment",
  "selections": (v8/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "field",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    {
      "kind": "InlineFragment",
      "selections": [
        (v7/*: any*/),
        (v3/*: any*/)
      ],
      "type": "ProjectV2Field",
      "abstractKey": null
    },
    (v9/*: any*/)
  ],
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
  "name": "titleHTML",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "duration",
  "storageKey": null
},
v15 = [
  (v7/*: any*/),
  (v11/*: any*/),
  (v12/*: any*/),
  (v13/*: any*/),
  (v14/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateProjectItemFieldValueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateProjectV2ItemFieldValuePayload",
        "kind": "LinkedField",
        "name": "updateProjectV2ItemFieldValue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2Item",
            "kind": "LinkedField",
            "name": "projectV2Item",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ProjectItemSectionFieldsValues"
              },
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "fieldValueByName",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": "fieldValueByName(name:\"Status\")"
              }
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateProjectItemFieldValueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateProjectV2ItemFieldValuePayload",
        "kind": "LinkedField",
        "name": "updateProjectV2ItemFieldValue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2Item",
            "kind": "LinkedField",
            "name": "projectV2Item",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
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
                          (v6/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v7/*: any*/),
                              (v10/*: any*/),
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
                              (v7/*: any*/),
                              (v10/*: any*/),
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
                              (v7/*: any*/),
                              (v10/*: any*/),
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
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v6/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v8/*: any*/),
                                    "type": "ProjectV2SingleSelectField",
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
                                "name": "optionId",
                                "storageKey": null
                              },
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "nameHTML",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "color",
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemFieldSingleSelectValue",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v6/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v7/*: any*/),
                                      (v3/*: any*/),
                                      {
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
                                            "selections": (v15/*: any*/),
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "ProjectV2IterationFieldIteration",
                                            "kind": "LinkedField",
                                            "name": "completedIterations",
                                            "plural": true,
                                            "selections": (v15/*: any*/),
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "ProjectV2IterationField",
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
                                "name": "iterationId",
                                "storageKey": null
                              },
                              (v11/*: any*/),
                              (v12/*: any*/),
                              (v13/*: any*/),
                              (v14/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldIterationValue",
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
                "args": (v5/*: any*/),
                "filters": [
                  "orderBy"
                ],
                "handle": "connection",
                "key": "ProjectItemSection_fieldValues",
                "kind": "LinkedHandle",
                "name": "fieldValues"
              },
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "fieldValueByName",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v4/*: any*/),
                  (v9/*: any*/)
                ],
                "storageKey": "fieldValueByName(name:\"Status\")"
              },
              (v7/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "8b296fae9f2499af49f72d6df68d6b5c",
    "metadata": {},
    "name": "updateProjectItemFieldValueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "de3a39d4584b64ead2a58f140d26d900";

export default node;
