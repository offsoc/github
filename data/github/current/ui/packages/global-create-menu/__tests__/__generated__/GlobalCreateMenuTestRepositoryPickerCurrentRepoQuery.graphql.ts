/**
 * @generated SignedSource<<53179cb6329ef235ae4bd3cfc335c92c>>
 * @relayHash 71405b7df2282bb6c451b0e7ab353980
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 71405b7df2282bb6c451b0e7ab353980

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery$variables = {
  includeTemplates?: boolean | null | undefined;
  name: string;
  owner: string;
};
export type GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery$data = {
  readonly repository: {
    readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerRepository" | "RepositoryPickerRepositoryIssueTemplates">;
  } | null | undefined;
};
export type GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery = {
  response: GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery$data;
  variables: GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "includeTemplates"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v3 = [
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
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
  "name": "nameWithOwner",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v9 = {
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
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInOrganization",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hasIssuesEnabled",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slashCommandsEnabled",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanPush",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueCreationPermissions",
  "kind": "LinkedField",
  "name": "viewerIssueCreationPermissions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "labelable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "milestoneable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "assignable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "triageable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "typeable",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "securityPolicyUrl",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "contributingFileUrl",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "codeOfConductFileUrl",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shortDescriptionHTML",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "concreteType": "RepositoryPlanFeatures",
  "kind": "LinkedField",
  "name": "planFeatures",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maximumAssignees",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isSecurityPolicyEnabled",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isBlankIssuesEnabled",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateTreeUrl",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "about",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "filename",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v30 = {
  "kind": "Literal",
  "name": "first",
  "value": 20
},
v31 = [
  (v30/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  }
],
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v35 = [
  (v4/*: any*/),
  (v32/*: any*/),
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameHTML",
    "storageKey": null
  },
  (v33/*: any*/),
  (v34/*: any*/)
],
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": (v31/*: any*/),
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
              "selections": (v35/*: any*/),
              "args": null,
              "argumentDefinitions": ([]/*: any*/)
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v36/*: any*/)
  ],
  "storageKey": "labels(first:20,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
},
v38 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v39 = [
  (v4/*: any*/),
  (v8/*: any*/),
  (v6/*: any*/),
  (v9/*: any*/)
],
v40 = {
  "alias": null,
  "args": (v38/*: any*/),
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
              "selections": (v39/*: any*/),
              "args": null,
              "argumentDefinitions": ([]/*: any*/)
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v36/*: any*/)
  ],
  "storageKey": "assignees(first:10)"
},
v41 = [
  (v4/*: any*/),
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "isEnabled",
    "storageKey": null
  },
  (v33/*: any*/),
  (v32/*: any*/)
],
v42 = {
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
      "selections": (v41/*: any*/),
      "args": null,
      "argumentDefinitions": ([]/*: any*/)
    }
  ],
  "storageKey": null
},
v43 = {
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
v44 = [
  (v30/*: any*/)
],
v45 = [
  (v4/*: any*/),
  (v29/*: any*/),
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
  (v34/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "viewerCanUpdate",
    "storageKey": null
  },
  (v25/*: any*/)
],
v46 = {
  "alias": null,
  "args": null,
  "concreteType": "RepositoryContactLink",
  "kind": "LinkedField",
  "name": "contactLinks",
  "plural": true,
  "selections": [
    (v6/*: any*/),
    (v26/*: any*/),
    (v34/*: any*/),
    (v25/*: any*/),
    (v43/*: any*/)
  ],
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": (v31/*: any*/),
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
          "selections": (v35/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v36/*: any*/)
  ],
  "storageKey": "labels(first:20,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
},
v48 = {
  "alias": null,
  "args": (v38/*: any*/),
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
          "selections": (v39/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v36/*: any*/)
  ],
  "storageKey": "assignees(first:10)"
},
v49 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "type",
  "plural": false,
  "selections": (v41/*: any*/),
  "storageKey": null
},
v50 = {
  "alias": "itemId",
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "descriptionHTML",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "placeholder",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "required",
  "storageKey": null
},
v56 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v57 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v58 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v59 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v60 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v61 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v62 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v63 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UserConnection"
},
v64 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "UserEdge"
},
v65 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v66 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v67 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v68 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "LabelConnection"
},
v69 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "LabelEdge"
},
v70 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Label"
},
v71 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "IssueType"
},
v72 = {
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "kind": "InlineDataFragmentSpread",
            "name": "RepositoryPickerRepository",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "owner",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "storageKey": null
              },
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/)
            ],
            "args": null,
            "argumentDefinitions": []
          },
          {
            "condition": "includeTemplates",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "kind": "InlineDataFragmentSpread",
                "name": "RepositoryPickerRepositoryIssueTemplates",
                "selections": [
                  (v22/*: any*/),
                  (v17/*: any*/),
                  (v23/*: any*/),
                  (v24/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTemplate",
                    "kind": "LinkedField",
                    "name": "issueTemplates",
                    "plural": true,
                    "selections": [
                      (v25/*: any*/),
                      (v26/*: any*/),
                      (v6/*: any*/),
                      (v27/*: any*/),
                      (v28/*: any*/),
                      (v29/*: any*/),
                      (v37/*: any*/),
                      (v40/*: any*/),
                      (v42/*: any*/),
                      (v43/*: any*/)
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
                      (v25/*: any*/),
                      (v6/*: any*/),
                      (v33/*: any*/),
                      (v27/*: any*/),
                      (v29/*: any*/),
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
                              (v25/*: any*/),
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
                      (v37/*: any*/),
                      (v40/*: any*/),
                      {
                        "alias": null,
                        "args": (v44/*: any*/),
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
                                    "selections": (v45/*: any*/),
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
                      (v42/*: any*/),
                      (v43/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v46/*: any*/)
                ],
                "args": null,
                "argumentDefinitions": []
              }
            ]
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v25/*: any*/),
              (v5/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v10/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/),
          (v20/*: any*/),
          (v21/*: any*/),
          {
            "condition": "includeTemplates",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              (v22/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueTemplate",
                "kind": "LinkedField",
                "name": "issueTemplates",
                "plural": true,
                "selections": [
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v6/*: any*/),
                  (v27/*: any*/),
                  (v28/*: any*/),
                  (v29/*: any*/),
                  (v47/*: any*/),
                  (v48/*: any*/),
                  (v49/*: any*/),
                  (v43/*: any*/)
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
                  (v25/*: any*/),
                  (v6/*: any*/),
                  (v33/*: any*/),
                  (v27/*: any*/),
                  (v29/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "elements",
                    "plural": true,
                    "selections": [
                      (v25/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v50/*: any*/),
                          (v51/*: any*/),
                          (v52/*: any*/),
                          (v53/*: any*/),
                          (v54/*: any*/),
                          (v55/*: any*/),
                          (v43/*: any*/)
                        ],
                        "type": "IssueFormElementInput",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v50/*: any*/),
                          (v51/*: any*/),
                          (v52/*: any*/),
                          (v53/*: any*/),
                          (v54/*: any*/),
                          (v55/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "render",
                            "storageKey": null
                          },
                          (v43/*: any*/)
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
                          (v51/*: any*/),
                          (v52/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "options",
                            "storageKey": null
                          },
                          (v55/*: any*/),
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
                          (v43/*: any*/)
                        ],
                        "type": "IssueFormElementDropdown",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v51/*: any*/),
                          (v52/*: any*/),
                          {
                            "alias": "checkboxOptions",
                            "args": null,
                            "concreteType": "IssueFormElementCheckboxOption",
                            "kind": "LinkedField",
                            "name": "options",
                            "plural": true,
                            "selections": [
                              (v51/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "labelHTML",
                                "storageKey": null
                              },
                              (v55/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v43/*: any*/)
                        ],
                        "type": "IssueFormElementCheckboxes",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v47/*: any*/),
                  (v48/*: any*/),
                  {
                    "alias": null,
                    "args": (v44/*: any*/),
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
                            "selections": (v45/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "projects(first:20)"
                  },
                  (v49/*: any*/),
                  (v43/*: any*/)
                ],
                "storageKey": null
              },
              (v46/*: any*/)
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "71405b7df2282bb6c451b0e7ab353980",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.codeOfConductFileUrl": (v56/*: any*/),
        "repository.contactLinks": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "RepositoryContactLink"
        },
        "repository.contactLinks.__id": (v57/*: any*/),
        "repository.contactLinks.__typename": (v58/*: any*/),
        "repository.contactLinks.about": (v58/*: any*/),
        "repository.contactLinks.name": (v58/*: any*/),
        "repository.contactLinks.url": (v59/*: any*/),
        "repository.contributingFileUrl": (v56/*: any*/),
        "repository.databaseId": (v60/*: any*/),
        "repository.hasIssuesEnabled": (v61/*: any*/),
        "repository.id": (v57/*: any*/),
        "repository.isArchived": (v61/*: any*/),
        "repository.isBlankIssuesEnabled": (v61/*: any*/),
        "repository.isInOrganization": (v61/*: any*/),
        "repository.isPrivate": (v61/*: any*/),
        "repository.isSecurityPolicyEnabled": (v62/*: any*/),
        "repository.issueForms": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueForm"
        },
        "repository.issueForms.__id": (v57/*: any*/),
        "repository.issueForms.__typename": (v58/*: any*/),
        "repository.issueForms.assignees": (v63/*: any*/),
        "repository.issueForms.assignees.edges": (v64/*: any*/),
        "repository.issueForms.assignees.edges.node": (v65/*: any*/),
        "repository.issueForms.assignees.edges.node.avatarUrl": (v59/*: any*/),
        "repository.issueForms.assignees.edges.node.id": (v57/*: any*/),
        "repository.issueForms.assignees.edges.node.login": (v58/*: any*/),
        "repository.issueForms.assignees.edges.node.name": (v66/*: any*/),
        "repository.issueForms.assignees.totalCount": (v67/*: any*/),
        "repository.issueForms.description": (v66/*: any*/),
        "repository.issueForms.elements": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "IssueFormElements"
        },
        "repository.issueForms.elements.__id": (v57/*: any*/),
        "repository.issueForms.elements.__typename": (v58/*: any*/),
        "repository.issueForms.elements.checkboxOptions": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "IssueFormElementCheckboxOption"
        },
        "repository.issueForms.elements.checkboxOptions.label": (v58/*: any*/),
        "repository.issueForms.elements.checkboxOptions.labelHTML": (v58/*: any*/),
        "repository.issueForms.elements.checkboxOptions.required": (v62/*: any*/),
        "repository.issueForms.elements.contentHTML": (v58/*: any*/),
        "repository.issueForms.elements.defaultOptionIndex": (v60/*: any*/),
        "repository.issueForms.elements.descriptionHTML": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "HTML"
        },
        "repository.issueForms.elements.itemId": (v66/*: any*/),
        "repository.issueForms.elements.label": (v58/*: any*/),
        "repository.issueForms.elements.multiple": (v62/*: any*/),
        "repository.issueForms.elements.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "String"
        },
        "repository.issueForms.elements.placeholder": (v66/*: any*/),
        "repository.issueForms.elements.render": (v66/*: any*/),
        "repository.issueForms.elements.required": (v62/*: any*/),
        "repository.issueForms.elements.value": (v66/*: any*/),
        "repository.issueForms.filename": (v58/*: any*/),
        "repository.issueForms.labels": (v68/*: any*/),
        "repository.issueForms.labels.edges": (v69/*: any*/),
        "repository.issueForms.labels.edges.node": (v70/*: any*/),
        "repository.issueForms.labels.edges.node.color": (v58/*: any*/),
        "repository.issueForms.labels.edges.node.description": (v66/*: any*/),
        "repository.issueForms.labels.edges.node.id": (v57/*: any*/),
        "repository.issueForms.labels.edges.node.name": (v58/*: any*/),
        "repository.issueForms.labels.edges.node.nameHTML": (v58/*: any*/),
        "repository.issueForms.labels.edges.node.url": (v59/*: any*/),
        "repository.issueForms.labels.totalCount": (v67/*: any*/),
        "repository.issueForms.name": (v58/*: any*/),
        "repository.issueForms.projects": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2Connection"
        },
        "repository.issueForms.projects.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2Edge"
        },
        "repository.issueForms.projects.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2"
        },
        "repository.issueForms.projects.edges.node.__typename": (v58/*: any*/),
        "repository.issueForms.projects.edges.node.closed": (v61/*: any*/),
        "repository.issueForms.projects.edges.node.id": (v57/*: any*/),
        "repository.issueForms.projects.edges.node.number": (v67/*: any*/),
        "repository.issueForms.projects.edges.node.title": (v58/*: any*/),
        "repository.issueForms.projects.edges.node.url": (v59/*: any*/),
        "repository.issueForms.projects.edges.node.viewerCanUpdate": (v61/*: any*/),
        "repository.issueForms.title": (v66/*: any*/),
        "repository.issueForms.type": (v71/*: any*/),
        "repository.issueForms.type.color": (v72/*: any*/),
        "repository.issueForms.type.description": (v66/*: any*/),
        "repository.issueForms.type.id": (v57/*: any*/),
        "repository.issueForms.type.isEnabled": (v61/*: any*/),
        "repository.issueForms.type.name": (v58/*: any*/),
        "repository.issueTemplates": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueTemplate"
        },
        "repository.issueTemplates.__id": (v57/*: any*/),
        "repository.issueTemplates.__typename": (v58/*: any*/),
        "repository.issueTemplates.about": (v66/*: any*/),
        "repository.issueTemplates.assignees": (v63/*: any*/),
        "repository.issueTemplates.assignees.edges": (v64/*: any*/),
        "repository.issueTemplates.assignees.edges.node": (v65/*: any*/),
        "repository.issueTemplates.assignees.edges.node.avatarUrl": (v59/*: any*/),
        "repository.issueTemplates.assignees.edges.node.id": (v57/*: any*/),
        "repository.issueTemplates.assignees.edges.node.login": (v58/*: any*/),
        "repository.issueTemplates.assignees.edges.node.name": (v66/*: any*/),
        "repository.issueTemplates.assignees.totalCount": (v67/*: any*/),
        "repository.issueTemplates.body": (v66/*: any*/),
        "repository.issueTemplates.filename": (v58/*: any*/),
        "repository.issueTemplates.labels": (v68/*: any*/),
        "repository.issueTemplates.labels.edges": (v69/*: any*/),
        "repository.issueTemplates.labels.edges.node": (v70/*: any*/),
        "repository.issueTemplates.labels.edges.node.color": (v58/*: any*/),
        "repository.issueTemplates.labels.edges.node.description": (v66/*: any*/),
        "repository.issueTemplates.labels.edges.node.id": (v57/*: any*/),
        "repository.issueTemplates.labels.edges.node.name": (v58/*: any*/),
        "repository.issueTemplates.labels.edges.node.nameHTML": (v58/*: any*/),
        "repository.issueTemplates.labels.edges.node.url": (v59/*: any*/),
        "repository.issueTemplates.labels.totalCount": (v67/*: any*/),
        "repository.issueTemplates.name": (v58/*: any*/),
        "repository.issueTemplates.title": (v66/*: any*/),
        "repository.issueTemplates.type": (v71/*: any*/),
        "repository.issueTemplates.type.color": (v72/*: any*/),
        "repository.issueTemplates.type.description": (v66/*: any*/),
        "repository.issueTemplates.type.id": (v57/*: any*/),
        "repository.issueTemplates.type.isEnabled": (v61/*: any*/),
        "repository.issueTemplates.type.name": (v58/*: any*/),
        "repository.name": (v58/*: any*/),
        "repository.nameWithOwner": (v58/*: any*/),
        "repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "repository.owner.__typename": (v58/*: any*/),
        "repository.owner.avatarUrl": (v59/*: any*/),
        "repository.owner.databaseId": (v60/*: any*/),
        "repository.owner.id": (v57/*: any*/),
        "repository.owner.login": (v58/*: any*/),
        "repository.planFeatures": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryPlanFeatures"
        },
        "repository.planFeatures.maximumAssignees": (v67/*: any*/),
        "repository.securityPolicyUrl": (v56/*: any*/),
        "repository.shortDescriptionHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "repository.slashCommandsEnabled": (v61/*: any*/),
        "repository.templateTreeUrl": (v59/*: any*/),
        "repository.viewerCanPush": (v61/*: any*/),
        "repository.viewerIssueCreationPermissions": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueCreationPermissions"
        },
        "repository.viewerIssueCreationPermissions.assignable": (v61/*: any*/),
        "repository.viewerIssueCreationPermissions.labelable": (v61/*: any*/),
        "repository.viewerIssueCreationPermissions.milestoneable": (v61/*: any*/),
        "repository.viewerIssueCreationPermissions.triageable": (v61/*: any*/),
        "repository.viewerIssueCreationPermissions.typeable": (v61/*: any*/)
      }
    },
    "name": "GlobalCreateMenuTestRepositoryPickerCurrentRepoQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1fd652d50d4ac13f868eb709259c230a";

export default node;
