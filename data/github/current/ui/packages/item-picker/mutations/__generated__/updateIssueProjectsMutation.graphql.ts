/**
 * @generated SignedSource<<b33ed9c938d316a4e7c89c63c284d6d5>>
 * @relayHash f7b6e30ed3e6252cd4b14a496dd9864a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f7b6e30ed3e6252cd4b14a496dd9864a

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectV2SingleSelectFieldOptionColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
export type AddProjectV2ItemByIdInput = {
  clientMutationId?: string | null | undefined;
  contentId: string;
  projectId: string;
};
export type updateIssueProjectsMutation$variables = {
  connections: ReadonlyArray<string>;
  input: AddProjectV2ItemByIdInput;
};
export type updateIssueProjectsMutation$data = {
  readonly addProjectV2ItemById: {
    readonly projectEdge: {
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSection">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueProjectsMutation$rawResponse = {
  readonly addProjectV2ItemById: {
    readonly projectEdge: {
      readonly node: {
        readonly fieldValueByName: {
          readonly __typename: "ProjectV2ItemFieldSingleSelectValue";
          readonly __isNode: "ProjectV2ItemFieldSingleSelectValue";
          readonly color: ProjectV2SingleSelectFieldOptionColor;
          readonly id: string;
          readonly name: string | null | undefined;
          readonly nameHTML: string | null | undefined;
          readonly optionId: string | null | undefined;
        } | {
          readonly __typename: string;
          readonly __isNode: string;
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly isArchived: boolean;
        readonly project: {
          readonly field: {
            readonly __typename: "ProjectV2SingleSelectField";
            readonly __isNode: "ProjectV2SingleSelectField";
            readonly id: string;
            readonly name: string;
            readonly options: ReadonlyArray<{
              readonly color: ProjectV2SingleSelectFieldOptionColor;
              readonly description: string;
              readonly descriptionHTML: string;
              readonly id: string;
              readonly name: string;
              readonly nameHTML: string;
              readonly optionId: string;
            }>;
          } | {
            readonly __typename: string;
            readonly __isNode: string;
            readonly id: string;
          } | null | undefined;
          readonly id: string;
          readonly template: boolean;
          readonly title: string;
          readonly url: string;
          readonly viewerCanUpdate: boolean;
        };
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueProjectsMutation = {
  rawResponse: updateIssueProjectsMutation$rawResponse;
  response: updateIssueProjectsMutation$data;
  variables: updateIssueProjectsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
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
v3 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
  "name": "optionId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": [
    (v2/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateIssueProjectsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddProjectV2ItemByIdPayload",
        "kind": "LinkedField",
        "name": "addProjectV2ItemById",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2ItemEdge",
            "kind": "LinkedField",
            "name": "projectEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Item",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ProjectItemSection"
                  }
                ],
                "storageKey": null
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
    "name": "updateIssueProjectsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddProjectV2ItemByIdPayload",
        "kind": "LinkedField",
        "name": "addProjectV2ItemById",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2ItemEdge",
            "kind": "LinkedField",
            "name": "projectEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Item",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanUpdate",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "url",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v3/*: any*/),
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "field",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v5/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ProjectV2SingleSelectFieldOption",
                                "kind": "LinkedField",
                                "name": "options",
                                "plural": true,
                                "selections": [
                                  (v2/*: any*/),
                                  (v6/*: any*/),
                                  (v5/*: any*/),
                                  (v7/*: any*/),
                                  (v8/*: any*/),
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
                          (v9/*: any*/)
                        ],
                        "storageKey": "field(name:\"Status\")"
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "fieldValueByName",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v2/*: any*/),
                          (v6/*: any*/),
                          (v5/*: any*/),
                          (v7/*: any*/),
                          (v8/*: any*/)
                        ],
                        "type": "ProjectV2ItemFieldSingleSelectValue",
                        "abstractKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": "fieldValueByName(name:\"Status\")"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "projectEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f7b6e30ed3e6252cd4b14a496dd9864a",
    "metadata": {},
    "name": "updateIssueProjectsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0b2916dfea8b705b72e87a36fcffadb1";

export default node;
