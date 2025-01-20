/**
 * @generated SignedSource<<9ad24639182d862e759c6331269866a1>>
 * @relayHash 506455c4d9fa2cd9289b4a2714f82d41
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 506455c4d9fa2cd9289b4a2714f82d41

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsTestQuery$variables = {
  number: number;
  owner: string;
  repo: string;
};
export type ItemPickerProjectsTestQuery$data = {
  readonly repository: {
    readonly issue: {
      readonly projectCards: {
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedClassicProjectCardsFragment">;
      };
      readonly projectsV2: {
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedProjectsV2Fragment">;
      };
    } | null | undefined;
  } | null | undefined;
};
export type ItemPickerProjectsTestQuery = {
  response: ItemPickerProjectsTestQuery$data;
  variables: ItemPickerProjectsTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v4 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
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
  "type": "Boolean"
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
    "name": "ItemPickerProjectsTestQuery",
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
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "ProjectV2Connection",
                "kind": "LinkedField",
                "name": "projectsV2",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ItemPickerProjects_SelectedProjectsV2Fragment"
                  }
                ],
                "storageKey": "projectsV2(first:10)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "ProjectCardConnection",
                "kind": "LinkedField",
                "name": "projectCards",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ItemPickerProjects_SelectedClassicProjectCardsFragment"
                  }
                ],
                "storageKey": "projectCards(first:10)"
              }
            ],
            "storageKey": null
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ItemPickerProjectsTestQuery",
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
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "ProjectV2Connection",
                "kind": "LinkedField",
                "name": "projectsV2",
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
                      (v6/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "title",
                        "storageKey": null
                      },
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "projectsV2(first:10)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "ProjectCardConnection",
                "kind": "LinkedField",
                "name": "projectCards",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectCard",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Project",
                        "kind": "LinkedField",
                        "name": "project",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v7/*: any*/),
                          {
                            "alias": "title",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": (v5/*: any*/),
                            "concreteType": "ProjectColumnConnection",
                            "kind": "LinkedField",
                            "name": "columns",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ProjectColumnEdge",
                                "kind": "LinkedField",
                                "name": "edges",
                                "plural": true,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ProjectColumn",
                                    "kind": "LinkedField",
                                    "name": "node",
                                    "plural": false,
                                    "selections": [
                                      (v7/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "columns(first:10)"
                          }
                        ],
                        "storageKey": null
                      },
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "projectCards(first:10)"
              },
              (v7/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "506455c4d9fa2cd9289b4a2714f82d41",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.id": (v9/*: any*/),
        "repository.issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.id": (v9/*: any*/),
        "repository.issue.projectCards": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectCardConnection"
        },
        "repository.issue.projectCards.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectCard"
        },
        "repository.issue.projectCards.nodes.id": (v9/*: any*/),
        "repository.issue.projectCards.nodes.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "repository.issue.projectCards.nodes.project.__typename": (v10/*: any*/),
        "repository.issue.projectCards.nodes.project.closed": (v11/*: any*/),
        "repository.issue.projectCards.nodes.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "repository.issue.projectCards.nodes.project.columns.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumnEdge"
        },
        "repository.issue.projectCards.nodes.project.columns.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "repository.issue.projectCards.nodes.project.columns.edges.node.id": (v9/*: any*/),
        "repository.issue.projectCards.nodes.project.id": (v9/*: any*/),
        "repository.issue.projectCards.nodes.project.title": (v10/*: any*/),
        "repository.issue.projectsV2": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2Connection"
        },
        "repository.issue.projectsV2.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2"
        },
        "repository.issue.projectsV2.nodes.__typename": (v10/*: any*/),
        "repository.issue.projectsV2.nodes.closed": (v11/*: any*/),
        "repository.issue.projectsV2.nodes.id": (v9/*: any*/),
        "repository.issue.projectsV2.nodes.title": (v10/*: any*/)
      }
    },
    "name": "ItemPickerProjectsTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "cf366b4b439d6bf06ea691425ed61b95";

export default node;
