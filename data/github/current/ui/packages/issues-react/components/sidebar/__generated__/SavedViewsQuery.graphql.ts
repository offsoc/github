/**
 * @generated SignedSource<<2561d7e6abca81a2c7e33ffb67a1e38e>>
 * @relayHash b63b92a4949aadd2031a13e896b5fea9
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b63b92a4949aadd2031a13e896b5fea9

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type SavedViewsQuery$variables = {
  searchTypes?: ReadonlyArray<SearchShortcutType> | null | undefined;
  selectedTeamsPageSize?: number | null | undefined;
  teamViewPageSize?: number | null | undefined;
  viewsPageSize?: number | null | undefined;
};
export type SavedViewsQuery$data = {
  readonly viewer: {
    readonly dashboard: {
      readonly " $fragmentSpreads": FragmentRefs<"SavedViewsPaginated" | "SharedViewTreeList">;
    } | null | undefined;
  };
};
export type SavedViewsQuery = {
  response: SavedViewsQuery$data;
  variables: SavedViewsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": [
    "ISSUES",
    "PULL_REQUESTS"
  ],
  "kind": "LocalArgument",
  "name": "searchTypes"
},
v1 = {
  "defaultValue": 25,
  "kind": "LocalArgument",
  "name": "selectedTeamsPageSize"
},
v2 = {
  "defaultValue": 25,
  "kind": "LocalArgument",
  "name": "teamViewPageSize"
},
v3 = {
  "defaultValue": 25,
  "kind": "LocalArgument",
  "name": "viewsPageSize"
},
v4 = {
  "kind": "Variable",
  "name": "searchTypes",
  "variableName": "searchTypes"
},
v5 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "viewsPageSize"
  },
  (v4/*: any*/)
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
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "query",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v13 = {
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
},
v14 = [
  "searchTypes"
],
v15 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "selectedTeamsPageSize"
  }
],
v16 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "teamViewPageSize"
  },
  (v4/*: any*/)
];
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
    "name": "SavedViewsQuery",
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
            "args": null,
            "concreteType": "UserDashboard",
            "kind": "LinkedField",
            "name": "dashboard",
            "plural": false,
            "selections": [
              {
                "args": [
                  (v4/*: any*/),
                  {
                    "kind": "Variable",
                    "name": "viewsPageSize",
                    "variableName": "viewsPageSize"
                  }
                ],
                "kind": "FragmentSpread",
                "name": "SavedViewsPaginated"
              },
              {
                "args": [
                  (v4/*: any*/),
                  {
                    "kind": "Variable",
                    "name": "selectedTeamsPageSize",
                    "variableName": "selectedTeamsPageSize"
                  },
                  {
                    "kind": "Variable",
                    "name": "teamViewPageSize",
                    "variableName": "teamViewPageSize"
                  }
                ],
                "kind": "FragmentSpread",
                "name": "SharedViewTreeList"
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
    "name": "SavedViewsQuery",
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
            "args": null,
            "concreteType": "UserDashboard",
            "kind": "LinkedField",
            "name": "dashboard",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "SearchShortcutConnection",
                "kind": "LinkedField",
                "name": "shortcuts",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SearchShortcutEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SearchShortcut",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v7/*: any*/),
                          (v8/*: any*/),
                          (v9/*: any*/),
                          (v10/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "description",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Repository",
                            "kind": "LinkedField",
                            "name": "scopingRepository",
                            "plural": false,
                            "selections": [
                              (v7/*: any*/),
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
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "login",
                                    "storageKey": null
                                  },
                                  (v6/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v11/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v13/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": (v14/*: any*/),
                "handle": "connection",
                "key": "Viewer_shortcuts",
                "kind": "LinkedHandle",
                "name": "shortcuts"
              },
              (v6/*: any*/),
              {
                "alias": null,
                "args": (v15/*: any*/),
                "concreteType": "TeamConnection",
                "kind": "LinkedField",
                "name": "selectedTeams",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TeamEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Team",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v7/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "avatarUrl",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Organization",
                            "kind": "LinkedField",
                            "name": "organization",
                            "plural": false,
                            "selections": [
                              (v7/*: any*/),
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isViewerMember",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "viewerCanAdminister",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TeamDashboard",
                            "kind": "LinkedField",
                            "name": "dashboard",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": (v16/*: any*/),
                                "concreteType": "TeamSearchShortcutConnection",
                                "kind": "LinkedField",
                                "name": "shortcuts",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "TeamSearchShortcutEdge",
                                    "kind": "LinkedField",
                                    "name": "edges",
                                    "plural": true,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "TeamSearchShortcut",
                                        "kind": "LinkedField",
                                        "name": "node",
                                        "plural": false,
                                        "selections": [
                                          (v6/*: any*/),
                                          (v9/*: any*/),
                                          (v7/*: any*/),
                                          (v8/*: any*/),
                                          (v10/*: any*/),
                                          (v11/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v12/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v13/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": (v16/*: any*/),
                                "filters": (v14/*: any*/),
                                "handle": "connection",
                                "key": "TeamDashboard_shortcuts",
                                "kind": "LinkedHandle",
                                "name": "shortcuts"
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v11/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v13/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v15/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Viewer_selectedTeams",
                "kind": "LinkedHandle",
                "name": "selectedTeams"
              }
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
    "id": "b63b92a4949aadd2031a13e896b5fea9",
    "metadata": {},
    "name": "SavedViewsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "280fcd7dcab94d31b0f75f8730cfaa78";

export default node;
