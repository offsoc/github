/**
 * @generated SignedSource<<4f3c6337aadaa91a3f173f729635b212>>
 * @relayHash d132dec069be1a67131a5e271bc909a6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d132dec069be1a67131a5e271bc909a6

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2ItemType = "DRAFT_ISSUE" | "ISSUE" | "PULL_REQUEST" | "REDACTED" | "%future added value";
export type ProjectV2SingleSelectFieldOptionColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
export type ClearProjectV2ItemFieldValueInput = {
  clientMutationId?: string | null | undefined;
  fieldId: string;
  itemId: string;
  projectId: string;
};
export type clearProjectItemFieldValueMutation$variables = {
  input: ClearProjectV2ItemFieldValueInput;
};
export type clearProjectItemFieldValueMutation$data = {
  readonly clearProjectV2ItemFieldValue: {
    readonly projectV2Item: {
      readonly fieldValueByName: {
        readonly name?: string | null | undefined;
      } | null | undefined;
      readonly id: string;
      readonly project: {
        readonly id: string;
      };
      readonly type: ProjectV2ItemType;
      readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFieldsValues">;
    } | null | undefined;
  } | null | undefined;
};
export type clearProjectItemFieldValueMutation$rawResponse = {
  readonly clearProjectV2ItemFieldValue: {
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
      readonly project: {
        readonly id: string;
      };
      readonly type: ProjectV2ItemType;
    } | null | undefined;
  } | null | undefined;
};
export type clearProjectItemFieldValueMutation = {
  rawResponse: clearProjectItemFieldValueMutation$rawResponse;
  response: clearProjectItemFieldValueMutation$data;
  variables: clearProjectItemFieldValueMutation$variables;
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
  "name": "type",
  "storageKey": null
},
v4 = [
  (v2/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v6 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    (v7/*: any*/)
  ],
  "type": "ProjectV2ItemFieldSingleSelectValue",
  "abstractKey": null
},
v9 = [
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
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = {
  "kind": "InlineFragment",
  "selections": (v4/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "field",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    {
      "kind": "InlineFragment",
      "selections": [
        (v2/*: any*/),
        (v7/*: any*/)
      ],
      "type": "ProjectV2Field",
      "abstractKey": null
    },
    (v11/*: any*/)
  ],
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titleHTML",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "duration",
  "storageKey": null
},
v17 = [
  (v2/*: any*/),
  (v13/*: any*/),
  (v14/*: any*/),
  (v15/*: any*/),
  (v16/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "clearProjectItemFieldValueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ClearProjectV2ItemFieldValuePayload",
        "kind": "LinkedField",
        "name": "clearProjectV2ItemFieldValue",
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ProjectItemSectionFieldsValues"
              },
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "fieldValueByName",
                "plural": false,
                "selections": [
                  (v8/*: any*/)
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
    "name": "clearProjectItemFieldValueMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ClearProjectV2ItemFieldValuePayload",
        "kind": "LinkedField",
        "name": "clearProjectV2ItemFieldValue",
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": (v9/*: any*/),
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
                          (v10/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v12/*: any*/),
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
                              (v12/*: any*/),
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
                              (v12/*: any*/),
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
                                  (v10/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v4/*: any*/),
                                    "type": "ProjectV2SingleSelectField",
                                    "abstractKey": null
                                  },
                                  (v11/*: any*/)
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
                              (v7/*: any*/),
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
                              (v2/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "field",
                                "plural": false,
                                "selections": [
                                  (v10/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v2/*: any*/),
                                      (v7/*: any*/),
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
                                            "selections": (v17/*: any*/),
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "ProjectV2IterationFieldIteration",
                                            "kind": "LinkedField",
                                            "name": "completedIterations",
                                            "plural": true,
                                            "selections": (v17/*: any*/),
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "ProjectV2IterationField",
                                    "abstractKey": null
                                  },
                                  (v11/*: any*/)
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
                              (v13/*: any*/),
                              (v14/*: any*/),
                              (v15/*: any*/),
                              (v16/*: any*/)
                            ],
                            "type": "ProjectV2ItemFieldIterationValue",
                            "abstractKey": null
                          },
                          (v11/*: any*/)
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
                "args": (v9/*: any*/),
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
                "args": (v6/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "fieldValueByName",
                "plural": false,
                "selections": [
                  (v10/*: any*/),
                  (v8/*: any*/),
                  (v11/*: any*/)
                ],
                "storageKey": "fieldValueByName(name:\"Status\")"
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
    "id": "d132dec069be1a67131a5e271bc909a6",
    "metadata": {},
    "name": "clearProjectItemFieldValueMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "1cc97421540c4997953175725e1f92c9";

export default node;
