/**
 * @generated SignedSource<<84c1369de5d1cc2b6f4fcb3a53442f90>>
 * @relayHash e9246d95db0327e4805b70d6560bccf0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e9246d95db0327e4805b70d6560bccf0

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery$variables = {
  id: string;
};
export type GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerRepositoryIssueTemplates">;
  } | null | undefined;
};
export type GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery = {
  response: GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery$data;
  variables: GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery$variables;
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
  "name": "isSecurityPolicyEnabled",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "securityPolicyUrl",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isBlankIssuesEnabled",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateTreeUrl",
  "storageKey": null
},
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
  "name": "about",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "filename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
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
  "kind": "Literal",
  "name": "first",
  "value": 20
},
v13 = [
  (v12/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  }
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v18 = [
  (v14/*: any*/),
  (v15/*: any*/),
  (v8/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameHTML",
    "storageKey": null
  },
  (v16/*: any*/),
  (v17/*: any*/)
],
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": (v13/*: any*/),
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
            {
              "kind": "InlineDataFragmentSpread",
              "name": "LabelPickerLabel",
              "selections": (v18/*: any*/),
              "args": null,
              "argumentDefinitions": ([]/*: any*/)
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "labels(first:20,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
},
v21 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v22 = [
  (v14/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  },
  (v8/*: any*/),
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
v23 = {
  "alias": null,
  "args": (v21/*: any*/),
  "concreteType": "UserConnection",
  "kind": "LinkedField",
  "name": "assignees",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "kind": "InlineDataFragmentSpread",
              "name": "AssigneePickerAssignee",
              "selections": (v22/*: any*/),
              "args": null,
              "argumentDefinitions": ([]/*: any*/)
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "assignees(first:10)"
},
v24 = [
  (v14/*: any*/),
  (v8/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "isEnabled",
    "storageKey": null
  },
  (v16/*: any*/),
  (v15/*: any*/)
],
v25 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": [
    {
      "kind": "InlineDataFragmentSpread",
      "name": "IssueTypePickerIssueType",
      "selections": (v24/*: any*/),
      "args": null,
      "argumentDefinitions": ([]/*: any*/)
    }
  ],
  "storageKey": null
},
v26 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v27 = [
  (v12/*: any*/)
],
v28 = [
  (v14/*: any*/),
  (v11/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "closed",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
  (v17/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "viewerCanUpdate",
    "storageKey": null
  },
  (v6/*: any*/)
],
v29 = {
  "alias": null,
  "args": null,
  "concreteType": "RepositoryContactLink",
  "kind": "LinkedField",
  "name": "contactLinks",
  "plural": true,
  "selections": [
    (v8/*: any*/),
    (v7/*: any*/),
    (v17/*: any*/),
    (v6/*: any*/),
    (v26/*: any*/)
  ],
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": (v13/*: any*/),
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
          "selections": (v18/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "labels(first:20,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
},
v31 = {
  "alias": null,
  "args": (v21/*: any*/),
  "concreteType": "UserConnection",
  "kind": "LinkedField",
  "name": "assignees",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": (v22/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v19/*: any*/)
  ],
  "storageKey": "assignees(first:10)"
},
v32 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": (v24/*: any*/),
  "storageKey": null
},
v33 = {
  "alias": "itemId",
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "descriptionHTML",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "placeholder",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "required",
  "storageKey": null
},
v39 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v40 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v41 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v42 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v43 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v44 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UserConnection"
},
v45 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "UserEdge"
},
v46 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v47 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v48 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v49 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "LabelConnection"
},
v50 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "LabelEdge"
},
v51 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Label"
},
v52 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "IssueType"
},
v53 = {
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
  "type": "IssueTypeColor"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "InlineDataFragmentSpread",
                "name": "RepositoryPickerRepositoryIssueTemplates",
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTemplate",
                    "kind": "LinkedField",
                    "name": "issueTemplates",
                    "plural": true,
                    "selections": [
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v20/*: any*/),
                      (v23/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueForm",
                    "kind": "LinkedField",
                    "name": "issueForms",
                    "plural": true,
                    "selections": [
                      (v6/*: any*/),
                      (v8/*: any*/),
                      (v16/*: any*/),
                      (v9/*: any*/),
                      (v11/*: any*/),
                      {
                        "kind": "InlineDataFragmentSpread",
                        "name": "IssueFormElements_templateElements",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "elements",
                            "plural": true,
                            "selections": [
                              (v6/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "TextInputElement_input"
                                  }
                                ],
                                "type": "IssueFormElementInput",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "TextAreaElement_input"
                                  }
                                ],
                                "type": "IssueFormElementTextarea",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "MarkdownElement_input"
                                  }
                                ],
                                "type": "IssueFormElementMarkdown",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "DropdownElement_input"
                                  }
                                ],
                                "type": "IssueFormElementDropdown",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "args": null,
                                    "kind": "FragmentSpread",
                                    "name": "CheckboxesElement_input"
                                  }
                                ],
                                "type": "IssueFormElementCheckboxes",
                                "abstractKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "args": null,
                        "argumentDefinitions": []
                      },
                      (v20/*: any*/),
                      (v23/*: any*/),
                      {
                        "alias": null,
                        "args": (v27/*: any*/),
                        "concreteType": "ProjectV2Connection",
                        "kind": "LinkedField",
                        "name": "projects",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectV2Edge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ProjectV2",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "InlineDataFragmentSpread",
                                    "name": "ProjectPickerProject",
                                    "selections": (v28/*: any*/),
                                    "args": null,
                                    "argumentDefinitions": []
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "projects(first:20)"
                      },
                      (v25/*: any*/),
                      (v26/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v29/*: any*/)
                ],
                "args": null,
                "argumentDefinitions": []
              }
            ],
            "type": "Repository",
            "abstractKey": null
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
    "name": "GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueTemplate",
                "kind": "LinkedField",
                "name": "issueTemplates",
                "plural": true,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v30/*: any*/),
                  (v31/*: any*/),
                  (v32/*: any*/),
                  (v26/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueForm",
                "kind": "LinkedField",
                "name": "issueForms",
                "plural": true,
                "selections": [
                  (v6/*: any*/),
                  (v8/*: any*/),
                  (v16/*: any*/),
                  (v9/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "elements",
                    "plural": true,
                    "selections": [
                      (v6/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v33/*: any*/),
                          (v34/*: any*/),
                          (v35/*: any*/),
                          (v36/*: any*/),
                          (v37/*: any*/),
                          (v38/*: any*/),
                          (v26/*: any*/)
                        ],
                        "type": "IssueFormElementInput",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v33/*: any*/),
                          (v34/*: any*/),
                          (v35/*: any*/),
                          (v36/*: any*/),
                          (v37/*: any*/),
                          (v38/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "render",
                            "storageKey": null
                          },
                          (v26/*: any*/)
                        ],
                        "type": "IssueFormElementTextarea",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "contentHTML",
                            "storageKey": null
                          }
                        ],
                        "type": "IssueFormElementMarkdown",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v34/*: any*/),
                          (v35/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "options",
                            "storageKey": null
                          },
                          (v38/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "multiple",
                            "storageKey": null
                          },
                          {
                            "alias": "defaultOptionIndex",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "default",
                            "storageKey": null
                          },
                          (v26/*: any*/)
                        ],
                        "type": "IssueFormElementDropdown",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v34/*: any*/),
                          (v35/*: any*/),
                          {
                            "alias": "checkboxOptions",
                            "args": null,
                            "concreteType": "IssueFormElementCheckboxOption",
                            "kind": "LinkedField",
                            "name": "options",
                            "plural": true,
                            "selections": [
                              (v34/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "labelHTML",
                                "storageKey": null
                              },
                              (v38/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v26/*: any*/)
                        ],
                        "type": "IssueFormElementCheckboxes",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v30/*: any*/),
                  (v31/*: any*/),
                  {
                    "alias": null,
                    "args": (v27/*: any*/),
                    "concreteType": "ProjectV2Connection",
                    "kind": "LinkedField",
                    "name": "projects",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2Edge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectV2",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": (v28/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "projects(first:20)"
                  },
                  (v32/*: any*/),
                  (v26/*: any*/)
                ],
                "storageKey": null
              },
              (v29/*: any*/)
            ],
            "type": "Repository",
            "abstractKey": null
          },
          (v14/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "e9246d95db0327e4805b70d6560bccf0",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v39/*: any*/),
        "node.contactLinks": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "RepositoryContactLink"
        },
        "node.contactLinks.__id": (v40/*: any*/),
        "node.contactLinks.__typename": (v39/*: any*/),
        "node.contactLinks.about": (v39/*: any*/),
        "node.contactLinks.name": (v39/*: any*/),
        "node.contactLinks.url": (v41/*: any*/),
        "node.id": (v40/*: any*/),
        "node.isBlankIssuesEnabled": (v42/*: any*/),
        "node.isSecurityPolicyEnabled": (v43/*: any*/),
        "node.issueForms": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueForm"
        },
        "node.issueForms.__id": (v40/*: any*/),
        "node.issueForms.__typename": (v39/*: any*/),
        "node.issueForms.assignees": (v44/*: any*/),
        "node.issueForms.assignees.edges": (v45/*: any*/),
        "node.issueForms.assignees.edges.node": (v46/*: any*/),
        "node.issueForms.assignees.edges.node.avatarUrl": (v41/*: any*/),
        "node.issueForms.assignees.edges.node.id": (v40/*: any*/),
        "node.issueForms.assignees.edges.node.login": (v39/*: any*/),
        "node.issueForms.assignees.edges.node.name": (v47/*: any*/),
        "node.issueForms.assignees.totalCount": (v48/*: any*/),
        "node.issueForms.description": (v47/*: any*/),
        "node.issueForms.elements": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "IssueFormElements"
        },
        "node.issueForms.elements.__id": (v40/*: any*/),
        "node.issueForms.elements.__typename": (v39/*: any*/),
        "node.issueForms.elements.checkboxOptions": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "IssueFormElementCheckboxOption"
        },
        "node.issueForms.elements.checkboxOptions.label": (v39/*: any*/),
        "node.issueForms.elements.checkboxOptions.labelHTML": (v39/*: any*/),
        "node.issueForms.elements.checkboxOptions.required": (v43/*: any*/),
        "node.issueForms.elements.contentHTML": (v39/*: any*/),
        "node.issueForms.elements.defaultOptionIndex": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "node.issueForms.elements.descriptionHTML": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "HTML"
        },
        "node.issueForms.elements.itemId": (v47/*: any*/),
        "node.issueForms.elements.label": (v39/*: any*/),
        "node.issueForms.elements.multiple": (v43/*: any*/),
        "node.issueForms.elements.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "String"
        },
        "node.issueForms.elements.placeholder": (v47/*: any*/),
        "node.issueForms.elements.render": (v47/*: any*/),
        "node.issueForms.elements.required": (v43/*: any*/),
        "node.issueForms.elements.value": (v47/*: any*/),
        "node.issueForms.filename": (v39/*: any*/),
        "node.issueForms.labels": (v49/*: any*/),
        "node.issueForms.labels.edges": (v50/*: any*/),
        "node.issueForms.labels.edges.node": (v51/*: any*/),
        "node.issueForms.labels.edges.node.color": (v39/*: any*/),
        "node.issueForms.labels.edges.node.description": (v47/*: any*/),
        "node.issueForms.labels.edges.node.id": (v40/*: any*/),
        "node.issueForms.labels.edges.node.name": (v39/*: any*/),
        "node.issueForms.labels.edges.node.nameHTML": (v39/*: any*/),
        "node.issueForms.labels.edges.node.url": (v41/*: any*/),
        "node.issueForms.labels.totalCount": (v48/*: any*/),
        "node.issueForms.name": (v39/*: any*/),
        "node.issueForms.projects": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2Connection"
        },
        "node.issueForms.projects.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2Edge"
        },
        "node.issueForms.projects.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2"
        },
        "node.issueForms.projects.edges.node.__typename": (v39/*: any*/),
        "node.issueForms.projects.edges.node.closed": (v42/*: any*/),
        "node.issueForms.projects.edges.node.id": (v40/*: any*/),
        "node.issueForms.projects.edges.node.number": (v48/*: any*/),
        "node.issueForms.projects.edges.node.title": (v39/*: any*/),
        "node.issueForms.projects.edges.node.url": (v41/*: any*/),
        "node.issueForms.projects.edges.node.viewerCanUpdate": (v42/*: any*/),
        "node.issueForms.title": (v47/*: any*/),
        "node.issueForms.type": (v52/*: any*/),
        "node.issueForms.type.color": (v53/*: any*/),
        "node.issueForms.type.description": (v47/*: any*/),
        "node.issueForms.type.id": (v40/*: any*/),
        "node.issueForms.type.isEnabled": (v42/*: any*/),
        "node.issueForms.type.name": (v39/*: any*/),
        "node.issueTemplates": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueTemplate"
        },
        "node.issueTemplates.__id": (v40/*: any*/),
        "node.issueTemplates.__typename": (v39/*: any*/),
        "node.issueTemplates.about": (v47/*: any*/),
        "node.issueTemplates.assignees": (v44/*: any*/),
        "node.issueTemplates.assignees.edges": (v45/*: any*/),
        "node.issueTemplates.assignees.edges.node": (v46/*: any*/),
        "node.issueTemplates.assignees.edges.node.avatarUrl": (v41/*: any*/),
        "node.issueTemplates.assignees.edges.node.id": (v40/*: any*/),
        "node.issueTemplates.assignees.edges.node.login": (v39/*: any*/),
        "node.issueTemplates.assignees.edges.node.name": (v47/*: any*/),
        "node.issueTemplates.assignees.totalCount": (v48/*: any*/),
        "node.issueTemplates.body": (v47/*: any*/),
        "node.issueTemplates.filename": (v39/*: any*/),
        "node.issueTemplates.labels": (v49/*: any*/),
        "node.issueTemplates.labels.edges": (v50/*: any*/),
        "node.issueTemplates.labels.edges.node": (v51/*: any*/),
        "node.issueTemplates.labels.edges.node.color": (v39/*: any*/),
        "node.issueTemplates.labels.edges.node.description": (v47/*: any*/),
        "node.issueTemplates.labels.edges.node.id": (v40/*: any*/),
        "node.issueTemplates.labels.edges.node.name": (v39/*: any*/),
        "node.issueTemplates.labels.edges.node.nameHTML": (v39/*: any*/),
        "node.issueTemplates.labels.edges.node.url": (v41/*: any*/),
        "node.issueTemplates.labels.totalCount": (v48/*: any*/),
        "node.issueTemplates.name": (v39/*: any*/),
        "node.issueTemplates.title": (v47/*: any*/),
        "node.issueTemplates.type": (v52/*: any*/),
        "node.issueTemplates.type.color": (v53/*: any*/),
        "node.issueTemplates.type.description": (v47/*: any*/),
        "node.issueTemplates.type.id": (v40/*: any*/),
        "node.issueTemplates.type.isEnabled": (v42/*: any*/),
        "node.issueTemplates.type.name": (v39/*: any*/),
        "node.securityPolicyUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "node.templateTreeUrl": (v41/*: any*/)
      }
    },
    "name": "GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ca0f5e2bd2aa774561d5e6ab7723d258";

export default node;
