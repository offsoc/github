/**
 * @generated SignedSource<<0c6961c3898301a25e7312f58486b23f>>
 * @relayHash b4546dc8031218dfe32ab9d75142ca60
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b4546dc8031218dfe32ab9d75142ca60

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsList_Query$variables = {
  count: number;
  owner: string;
  query?: string | null | undefined;
  repo: string;
};
export type ItemPickerProjectsList_Query$data = {
  readonly repository: {
    readonly owner: {
      readonly projects?: {
        readonly nodes: ReadonlyArray<{
          readonly updatedAt: string;
          readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ClassicProjectFragment">;
        } | null | undefined> | null | undefined;
      };
      readonly projectsV2?: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly items: {
              readonly totalCount: number;
            };
            readonly updatedAt: string;
            readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ProjectV2Fragment">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    };
    readonly projects: {
      readonly nodes: ReadonlyArray<{
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ClassicProjectFragment">;
      } | null | undefined> | null | undefined;
    };
    readonly projectsV2: {
      readonly nodes: ReadonlyArray<{
        readonly items: {
          readonly totalCount: number;
        };
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ProjectV2Fragment">;
      } | null | undefined> | null | undefined;
    };
  } | null | undefined;
};
export type ItemPickerProjectsList_Query = {
  response: ItemPickerProjectsList_Query$data;
  variables: ItemPickerProjectsList_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v4 = [
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
v5 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "count"
},
v6 = {
  "kind": "Literal",
  "name": "orderBy",
  "value": {
    "direction": "DESC",
    "field": "UPDATED_AT"
  }
},
v7 = [
  (v5/*: any*/),
  (v6/*: any*/),
  {
    "kind": "Variable",
    "name": "search",
    "variableName": "query"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": "title",
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "first",
      "value": 10
    }
  ],
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
            (v10/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "columns(first:10)"
},
v14 = [
  (v9/*: any*/),
  (v10/*: any*/),
  (v11/*: any*/),
  (v12/*: any*/),
  (v13/*: any*/)
],
v15 = {
  "kind": "InlineDataFragmentSpread",
  "name": "ItemPickerProjectsItem_ClassicProjectFragment",
  "selections": (v14/*: any*/),
  "args": null,
  "argumentDefinitions": ([]/*: any*/)
},
v16 = {
  "alias": null,
  "args": (v7/*: any*/),
  "concreteType": "ProjectConnection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Project",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v8/*: any*/),
        (v15/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v17 = [
  (v5/*: any*/),
  (v6/*: any*/),
  {
    "kind": "Variable",
    "name": "query",
    "variableName": "query"
  }
],
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2ItemConnection",
  "kind": "LinkedField",
  "name": "items",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v20 = [
  (v18/*: any*/),
  (v8/*: any*/),
  {
    "kind": "InlineDataFragmentSpread",
    "name": "ItemPickerProjectsItem_ProjectV2Fragment",
    "selections": [
      (v9/*: any*/),
      (v10/*: any*/),
      (v19/*: any*/),
      (v12/*: any*/)
    ],
    "args": null,
    "argumentDefinitions": ([]/*: any*/)
  }
],
v21 = {
  "alias": null,
  "args": (v17/*: any*/),
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projectsV2",
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
          "selections": (v20/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": (v7/*: any*/),
  "concreteType": "ProjectConnection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Project",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v8/*: any*/),
        (v9/*: any*/),
        (v10/*: any*/),
        (v11/*: any*/),
        (v12/*: any*/),
        (v13/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v23 = [
  (v18/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v19/*: any*/),
  (v12/*: any*/)
],
v24 = {
  "alias": null,
  "args": (v17/*: any*/),
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projectsV2",
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
          "selections": (v23/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemPickerProjectsList_Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          (v16/*: any*/),
          {
            "alias": null,
            "args": (v17/*: any*/),
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
                "selections": (v20/*: any*/),
                "storageKey": null
              }
            ],
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
                "kind": "InlineFragment",
                "selections": [
                  (v16/*: any*/),
                  (v21/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v7/*: any*/),
                    "concreteType": "ProjectConnection",
                    "kind": "LinkedField",
                    "name": "projects",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Project",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          (v15/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v21/*: any*/)
                ],
                "type": "User",
                "abstractKey": null
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
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ItemPickerProjectsList_Query",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          (v22/*: any*/),
          {
            "alias": null,
            "args": (v17/*: any*/),
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
                "selections": (v23/*: any*/),
                "storageKey": null
              }
            ],
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
              (v9/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v22/*: any*/),
                  (v24/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v7/*: any*/),
                    "concreteType": "ProjectConnection",
                    "kind": "LinkedField",
                    "name": "projects",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Project",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v14/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v24/*: any*/)
                ],
                "type": "User",
                "abstractKey": null
              },
              (v10/*: any*/)
            ],
            "storageKey": null
          },
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "b4546dc8031218dfe32ab9d75142ca60",
    "metadata": {},
    "name": "ItemPickerProjectsList_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "fbda60efded6f189817099a0cb433c53";

export default node;
