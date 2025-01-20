/**
 * @generated SignedSource<<d7775fb25c5f091704634edb9101bdd2>>
 * @relayHash 4d6c22735c5d43ac786d6ac084604fff
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4d6c22735c5d43ac786d6ac084604fff

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery$variables = Record<PropertyKey, never>;
export type GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery$data = {
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerTopRepositories">;
  };
};
export type GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery = {
  response: GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery$data;
  variables: GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "Literal",
  "name": "hasIssuesEnabled",
  "value": true
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery",
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
              (v0/*: any*/),
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery",
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
              (v0/*: any*/),
              {
                "kind": "Literal",
                "name": "orderBy",
                "value": {
                  "direction": "DESC",
                  "field": "UPDATED_AT"
                }
              }
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
                      (v1/*: any*/),
                      (v2/*: any*/),
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
                          (v2/*: any*/),
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
                          (v1/*: any*/)
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
            "storageKey": "topRepositories(first:5,hasIssuesEnabled:true,orderBy:{\"direction\":\"DESC\",\"field\":\"UPDATED_AT\"})"
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "4d6c22735c5d43ac786d6ac084604fff",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v3/*: any*/),
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
        "viewer.topRepositories.edges.node.codeOfConductFileUrl": (v4/*: any*/),
        "viewer.topRepositories.edges.node.contributingFileUrl": (v4/*: any*/),
        "viewer.topRepositories.edges.node.databaseId": (v5/*: any*/),
        "viewer.topRepositories.edges.node.hasIssuesEnabled": (v6/*: any*/),
        "viewer.topRepositories.edges.node.id": (v3/*: any*/),
        "viewer.topRepositories.edges.node.isArchived": (v6/*: any*/),
        "viewer.topRepositories.edges.node.isInOrganization": (v6/*: any*/),
        "viewer.topRepositories.edges.node.isPrivate": (v6/*: any*/),
        "viewer.topRepositories.edges.node.name": (v7/*: any*/),
        "viewer.topRepositories.edges.node.nameWithOwner": (v7/*: any*/),
        "viewer.topRepositories.edges.node.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "viewer.topRepositories.edges.node.owner.__typename": (v7/*: any*/),
        "viewer.topRepositories.edges.node.owner.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "viewer.topRepositories.edges.node.owner.databaseId": (v5/*: any*/),
        "viewer.topRepositories.edges.node.owner.id": (v3/*: any*/),
        "viewer.topRepositories.edges.node.owner.login": (v7/*: any*/),
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
        "viewer.topRepositories.edges.node.securityPolicyUrl": (v4/*: any*/),
        "viewer.topRepositories.edges.node.shortDescriptionHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "viewer.topRepositories.edges.node.slashCommandsEnabled": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerCanPush": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueCreationPermissions"
        },
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.assignable": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.labelable": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.milestoneable": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.triageable": (v6/*: any*/),
        "viewer.topRepositories.edges.node.viewerIssueCreationPermissions.typeable": (v6/*: any*/)
      }
    },
    "name": "GlobalCreateMenuTestRepositoryPickerTopRepositoriesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "c1638750503cb1fa65fa1ab04d5c272a";

export default node;
