/**
 * @generated SignedSource<<ec371aab7eb12eba884cedcc107b8da2>>
 * @relayHash e5100929963f9aad2575a55f3ee3f374
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e5100929963f9aad2575a55f3ee3f374

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery$variables = {
  owner?: string | null | undefined;
};
export type GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery$data = {
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerTopRepositories">;
  };
};
export type GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery = {
  response: GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery$data;
  variables: GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "owner"
  }
],
v1 = {
  "kind": "Literal",
  "name": "hasIssuesEnabled",
  "value": true
},
v2 = {
  "kind": "Variable",
  "name": "owner",
  "variableName": "owner"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": [
              (v1/*: any*/),
              (v2/*: any*/),
              {
                "kind": "Literal",
                "name": "topRepositoriesFirst",
                "value": 5
              }
            ],
            "kind": "FragmentSpread",
            "name": "RepositoryPickerTopRepositories"
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
    "name": "GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 5
              },
              (v1/*: any*/),
              {
                "kind": "Literal",
                "name": "orderBy",
                "value": {
                  "direction": "DESC",
                  "field": "UPDATED_AT"
                }
              },
              (v2/*: any*/)
            ],
            "concreteType": "RepositoryConnection",
            "kind": "LinkedField",
            "name": "topRepositories",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RepositoryEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "nameWithOwner",
                        "storageKey": null
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
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "__typename",
                            "storageKey": null
                          },
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "login",
                            "storageKey": null
                          },
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
                          },
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isPrivate",
                        "storageKey": null
                      },
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
                        "kind": "ScalarField",
                        "name": "isInOrganization",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasIssuesEnabled",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "slashCommandsEnabled",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanPush",
                        "storageKey": null
                      },
                      {
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "securityPolicyUrl",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "contributingFileUrl",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "codeOfConductFileUrl",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "shortDescriptionHTML",
                        "storageKey": null
                      },
                      {
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
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "e5100929963f9aad2575a55f3ee3f374",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v5/*: any*/),
        "viewer.topRepositories": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryConnection"
        },
        "viewer.topRepositories.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "RepositoryEdge"
        },
        "viewer.topRepositories.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "viewer.topRepositories.edges.node.codeOfConductFileUrl": (v6/*: any*/),
        "viewer.topRepositories.edges.node.contributingFileUrl": (v6/*: any*/),
        "viewer.topRepositories.edges.node.databaseId": (v7/*: any*/),
        "viewer.topRepositories.edges.node.hasIssuesEnabled": (v8/*: any*/),
        "viewer.topRepositories.edges.node.id": (v5/*: any*/),
        "viewer.topRepositories.edges.node.isArchived": (v8/*: any*/),
        "viewer.topRepositories.edges.node.isInOrganization": (v8/*: any*/),
        "viewer.topRepositories.edges.node.isPrivate": (v8/*: any*/),
        "viewer.topRepositories.edges.node.name": (v9/*: any*/),
        "viewer.topRepositories.edges.node.nameWithOwner": (v9/*: any*/),
        "viewer.topRepositories.edges.node.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "viewer.topRepositories.edges.node.owner.__typename": (v9/*: any*/),
        "viewer.topRepositories.edges.node.owner.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "viewer.topRepositories.edges.node.owner.databaseId": (v7/*: any*/),
        "viewer.topRepositories.edges.node.owner.id": (v5/*: any*/),
        "viewer.topRepositories.edges.node.owner.login": (v9/*: any*/),
        "viewer.topRepositories.edges.node.planFeatures": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryPlanFeatures"
        },
        "viewer.topRepositories.edges.node.planFeatures.maximumAssignees": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "viewer.topRepositories.edges.node.securityPolicyUrl": (v6/*: any*/),
        "viewer.topRepositories.edges.node.shortDescriptionHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "viewer.topRepositories.edges.node.slashCommandsEnabled": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerCanPush": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueCreationPermissions"
        },
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.assignable": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.labelable": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.milestoneable": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.triageable": (v8/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.typeable": (v8/*: any*/)
      }
    },
    "name": "GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "2743038f18023d4b5350e8017055488d";

export default node;
