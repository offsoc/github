/**
 * @generated SignedSource<<ff52c5a9365f4dbda983436a24fc4415>>
 * @relayHash a3a55f038dcb1f435004c142f4f79b66
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a3a55f038dcb1f435004c142f4f79b66

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InternalIssueNewPageUrlArgumentsMetadataQuery$variables = {
  assigneeLogins?: string | null | undefined;
  labelNames?: string | null | undefined;
  milestoneTitle?: string | null | undefined;
  name: string;
  owner: string;
  projectNumbers?: ReadonlyArray<number> | null | undefined;
  type?: string | null | undefined;
  withAnyMetadata?: boolean | null | undefined;
  withAssignees?: boolean | null | undefined;
  withLabels?: boolean | null | undefined;
  withMilestone?: boolean | null | undefined;
  withProjects?: boolean | null | undefined;
  withTriagePermission?: boolean | null | undefined;
  withType?: boolean | null | undefined;
};
export type InternalIssueNewPageUrlArgumentsMetadataQuery$data = {
  readonly repository?: {
    readonly assignableUsers?: {
      readonly nodes: ReadonlyArray<{
        readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
      } | null | undefined> | null | undefined;
    };
    readonly issueType?: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypePickerIssueType">;
    } | null | undefined;
    readonly labels?: {
      readonly nodes: ReadonlyArray<{
        readonly " $fragmentSpreads": FragmentRefs<"LabelPickerLabel">;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly milestoneByTitle?: {
      readonly " $fragmentSpreads": FragmentRefs<"MilestonePickerMilestone">;
    } | null | undefined;
    readonly owner: {
      readonly projectsV2ByNumber?: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
        } | null | undefined> | null | undefined;
      };
    };
    readonly viewerIssueCreationPermissions: {
      readonly assignable?: boolean;
      readonly labelable?: boolean;
      readonly milestoneable?: boolean;
      readonly triageable?: boolean;
      readonly typeable?: boolean;
    };
  } | null | undefined;
};
export type InternalIssueNewPageUrlArgumentsMetadataQuery = {
  response: InternalIssueNewPageUrlArgumentsMetadataQuery$data;
  variables: InternalIssueNewPageUrlArgumentsMetadataQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": "",
  "kind": "LocalArgument",
  "name": "assigneeLogins"
},
v1 = {
  "defaultValue": "",
  "kind": "LocalArgument",
  "name": "labelNames"
},
v2 = {
  "defaultValue": "",
  "kind": "LocalArgument",
  "name": "milestoneTitle"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v5 = {
  "defaultValue": ([]/*: any*/),
  "kind": "LocalArgument",
  "name": "projectNumbers"
},
v6 = {
  "defaultValue": "",
  "kind": "LocalArgument",
  "name": "type"
},
v7 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withAnyMetadata"
},
v8 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withAssignees"
},
v9 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withLabels"
},
v10 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withMilestone"
},
v11 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withProjects"
},
v12 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withTriagePermission"
},
v13 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withType"
},
v14 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueCreationPermissions",
  "kind": "LinkedField",
  "name": "viewerIssueCreationPermissions",
  "plural": false,
  "selections": [
    {
      "condition": "withAssignees",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "assignable",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "withLabels",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "labelable",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "withMilestone",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "milestoneable",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "withTriagePermission",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "triageable",
          "storageKey": null
        }
      ]
    },
    {
      "condition": "withType",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "typeable",
          "storageKey": null
        }
      ]
    }
  ],
  "storageKey": null
},
v16 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  },
  {
    "kind": "Variable",
    "name": "loginNames",
    "variableName": "assigneeLogins"
  }
],
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v19 = [
  (v17/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  },
  (v18/*: any*/),
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
v20 = {
  "kind": "Literal",
  "name": "first",
  "value": 20
},
v21 = [
  (v20/*: any*/),
  {
    "kind": "Variable",
    "name": "names",
    "variableName": "labelNames"
  }
],
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v25 = [
  (v17/*: any*/),
  (v22/*: any*/),
  (v18/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameHTML",
    "storageKey": null
  },
  (v23/*: any*/),
  (v24/*: any*/)
],
v26 = [
  {
    "kind": "Variable",
    "name": "title",
    "variableName": "milestoneTitle"
  }
],
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v29 = [
  (v17/*: any*/),
  (v27/*: any*/),
  (v28/*: any*/),
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
  (v24/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "closedAt",
    "storageKey": null
  }
],
v30 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "type"
  }
],
v31 = [
  (v17/*: any*/),
  (v18/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "isEnabled",
    "storageKey": null
  },
  (v23/*: any*/),
  (v22/*: any*/)
],
v32 = [
  (v20/*: any*/),
  {
    "kind": "Variable",
    "name": "numbers",
    "variableName": "projectNumbers"
  }
],
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v34 = [
  (v17/*: any*/),
  (v27/*: any*/),
  (v28/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
  (v24/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "viewerCanUpdate",
    "storageKey": null
  },
  (v33/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InternalIssueNewPageUrlArgumentsMetadataQuery",
    "selections": [
      {
        "condition": "withAnyMetadata",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "Repository",
            "kind": "LinkedField",
            "name": "repository",
            "plural": false,
            "selections": [
              (v15/*: any*/),
              {
                "condition": "withAssignees",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v16/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "assignableUsers",
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
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "AssigneePickerAssignee",
                            "selections": (v19/*: any*/),
                            "args": null,
                            "argumentDefinitions": []
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withLabels",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v21/*: any*/),
                    "concreteType": "LabelConnection",
                    "kind": "LinkedField",
                    "name": "labels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Label",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "LabelPickerLabel",
                            "selections": (v25/*: any*/),
                            "args": null,
                            "argumentDefinitions": []
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withMilestone",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v26/*: any*/),
                    "concreteType": "Milestone",
                    "kind": "LinkedField",
                    "name": "milestoneByTitle",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "InlineDataFragmentSpread",
                        "name": "MilestonePickerMilestone",
                        "selections": (v29/*: any*/),
                        "args": null,
                        "argumentDefinitions": []
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withType",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v30/*: any*/),
                    "concreteType": "IssueType",
                    "kind": "LinkedField",
                    "name": "issueType",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "InlineDataFragmentSpread",
                        "name": "IssueTypePickerIssueType",
                        "selections": (v31/*: any*/),
                        "args": null,
                        "argumentDefinitions": []
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "owner",
                "plural": false,
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "condition": "withProjects",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": (v32/*: any*/),
                            "concreteType": "ProjectV2Connection",
                            "kind": "LinkedField",
                            "name": "projectsV2ByNumber",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ProjectV2",
                                "kind": "LinkedField",
                                "name": "nodes",
                                "plural": true,
                                "selections": [
                                  {
                                    "kind": "InlineDataFragmentSpread",
                                    "name": "ProjectPickerProject",
                                    "selections": (v34/*: any*/),
                                    "args": null,
                                    "argumentDefinitions": []
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "type": "ProjectV2Owner",
                    "abstractKey": "__isProjectV2Owner"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v3/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v0/*: any*/),
      (v9/*: any*/),
      (v1/*: any*/),
      (v10/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v13/*: any*/),
      (v11/*: any*/),
      (v5/*: any*/),
      (v12/*: any*/)
    ],
    "kind": "Operation",
    "name": "InternalIssueNewPageUrlArgumentsMetadataQuery",
    "selections": [
      {
        "condition": "withAnyMetadata",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "Repository",
            "kind": "LinkedField",
            "name": "repository",
            "plural": false,
            "selections": [
              (v15/*: any*/),
              {
                "condition": "withAssignees",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v16/*: any*/),
                    "concreteType": "UserConnection",
                    "kind": "LinkedField",
                    "name": "assignableUsers",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v19/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withLabels",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v21/*: any*/),
                    "concreteType": "LabelConnection",
                    "kind": "LinkedField",
                    "name": "labels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Label",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v25/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withMilestone",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v26/*: any*/),
                    "concreteType": "Milestone",
                    "kind": "LinkedField",
                    "name": "milestoneByTitle",
                    "plural": false,
                    "selections": (v29/*: any*/),
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "withType",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": (v30/*: any*/),
                    "concreteType": "IssueType",
                    "kind": "LinkedField",
                    "name": "issueType",
                    "plural": false,
                    "selections": (v31/*: any*/),
                    "storageKey": null
                  }
                ]
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "owner",
                "plural": false,
                "selections": [
                  (v33/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "condition": "withProjects",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": (v32/*: any*/),
                            "concreteType": "ProjectV2Connection",
                            "kind": "LinkedField",
                            "name": "projectsV2ByNumber",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ProjectV2",
                                "kind": "LinkedField",
                                "name": "nodes",
                                "plural": true,
                                "selections": (v34/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "type": "ProjectV2Owner",
                    "abstractKey": "__isProjectV2Owner"
                  },
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              (v17/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "id": "a3a55f038dcb1f435004c142f4f79b66",
    "metadata": {},
    "name": "InternalIssueNewPageUrlArgumentsMetadataQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "86072ac72e3bbd1cd37b4d604048140d";

export default node;
