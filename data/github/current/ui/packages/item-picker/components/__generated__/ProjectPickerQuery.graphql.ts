/**
 * @generated SignedSource<<3907d034479e2338e4e9844d9e6718dc>>
 * @relayHash 9f6c5221285a1989cb5c1d2950bf0b02
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9f6c5221285a1989cb5c1d2950bf0b02

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectPickerQuery$variables = {
  owner: string;
  query?: string | null | undefined;
  repo: string;
};
export type ProjectPickerQuery$data = {
  readonly repository: {
    readonly owner: {
      readonly projects?: {
        readonly nodes: ReadonlyArray<{
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerClassicProject">;
        } | null | undefined> | null | undefined;
      };
      readonly projectsV2?: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly recentProjects?: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    };
    readonly projects: {
      readonly nodes: ReadonlyArray<{
        readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerClassicProject">;
      } | null | undefined> | null | undefined;
    };
    readonly projectsV2: {
      readonly nodes: ReadonlyArray<{
        readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
      } | null | undefined> | null | undefined;
    };
    readonly recentProjects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
  } | null | undefined;
};
export type ProjectPickerQuery = {
  response: ProjectPickerQuery$data;
  variables: ProjectPickerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
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
v4 = {
  "kind": "Literal",
  "name": "first",
  "value": 5
},
v5 = [
  (v4/*: any*/),
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "DESC",
      "field": "RELEVANCE"
    }
  },
  {
    "kind": "Variable",
    "name": "query",
    "variableName": "query"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v12 = [
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "title",
    "storageKey": null
  },
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v11/*: any*/)
],
v13 = [
  {
    "kind": "InlineDataFragmentSpread",
    "name": "ProjectPickerProject",
    "selections": (v12/*: any*/),
    "args": null,
    "argumentDefinitions": ([]/*: any*/)
  }
],
v14 = [
  (v4/*: any*/)
],
v15 = [
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
        "selections": (v13/*: any*/),
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v16 = {
  "alias": null,
  "args": (v14/*: any*/),
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "recentProjects",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": "recentProjects(first:5)"
},
v17 = [
  (v4/*: any*/),
  {
    "kind": "Variable",
    "name": "search",
    "variableName": "query"
  }
],
v18 = [
  (v6/*: any*/),
  {
    "alias": "title",
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  },
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  {
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
        "concreteType": "ProjectColumn",
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "columns(first:10)"
  },
  (v11/*: any*/)
],
v19 = {
  "alias": null,
  "args": (v17/*: any*/),
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
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ProjectPickerClassicProject",
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
v20 = [
  {
    "alias": null,
    "args": (v5/*: any*/),
    "concreteType": "ProjectV2Connection",
    "kind": "LinkedField",
    "name": "projectsV2",
    "plural": false,
    "selections": (v15/*: any*/),
    "storageKey": null
  },
  (v16/*: any*/),
  (v19/*: any*/)
],
v21 = [
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
        "selections": (v12/*: any*/),
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v22 = {
  "alias": null,
  "args": (v14/*: any*/),
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "recentProjects",
  "plural": false,
  "selections": (v21/*: any*/),
  "storageKey": "recentProjects(first:5)"
},
v23 = {
  "alias": null,
  "args": (v17/*: any*/),
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
      "selections": (v18/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v24 = [
  {
    "alias": null,
    "args": (v5/*: any*/),
    "concreteType": "ProjectV2Connection",
    "kind": "LinkedField",
    "name": "projectsV2",
    "plural": false,
    "selections": (v21/*: any*/),
    "storageKey": null
  },
  (v22/*: any*/),
  (v23/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectPickerQuery",
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
                "selections": (v13/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v16/*: any*/),
          (v19/*: any*/),
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
                "selections": (v20/*: any*/),
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v20/*: any*/),
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
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectPickerQuery",
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
                "selections": (v12/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v22/*: any*/),
          (v23/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v11/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": (v24/*: any*/),
                "type": "Organization",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v24/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "9f6c5221285a1989cb5c1d2950bf0b02",
    "metadata": {},
    "name": "ProjectPickerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6ef0bdf183e10caeda87a97aae30fab2";

export default node;
