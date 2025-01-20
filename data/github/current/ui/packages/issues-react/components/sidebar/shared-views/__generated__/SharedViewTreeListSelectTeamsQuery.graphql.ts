/**
 * @generated SignedSource<<397a83d3645da9bb68d282425137586b>>
 * @relayHash 6823f2ff50c6b4b77783108c57484509
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6823f2ff50c6b4b77783108c57484509

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type SharedViewTreeListSelectTeamsQuery$variables = {
  cursor?: string | null | undefined;
  id: string;
  searchTypes: ReadonlyArray<SearchShortcutType>;
  selectedTeamsPageSize?: number | null | undefined;
  teamViewPageSize?: number | null | undefined;
};
export type SharedViewTreeListSelectTeamsQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"SharedViewTreeList">;
  } | null | undefined;
};
export type SharedViewTreeListSelectTeamsQuery = {
  response: SharedViewTreeListSelectTeamsQuery$data;
  variables: SharedViewTreeListSelectTeamsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "searchTypes"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedTeamsPageSize"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "teamViewPageSize"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = {
  "kind": "Variable",
  "name": "searchTypes",
  "variableName": "searchTypes"
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "selectedTeamsPageSize"
  }
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "teamViewPageSize"
  },
  (v6/*: any*/)
],
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
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SharedViewTreeListSelectTeamsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "cursor",
                "variableName": "cursor"
              },
              (v6/*: any*/),
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "SharedViewTreeListSelectTeamsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v9/*: any*/),
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
                          (v8/*: any*/),
                          (v10/*: any*/),
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
                              (v10/*: any*/),
                              (v8/*: any*/)
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
                                "args": (v11/*: any*/),
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
                                          (v8/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "icon",
                                            "storageKey": null
                                          },
                                          (v10/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "query",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "color",
                                            "storageKey": null
                                          },
                                          (v7/*: any*/)
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
                                "args": (v11/*: any*/),
                                "filters": [
                                  "searchTypes"
                                ],
                                "handle": "connection",
                                "key": "TeamDashboard_shortcuts",
                                "kind": "LinkedHandle",
                                "name": "shortcuts"
                              },
                              (v8/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v7/*: any*/)
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
                "args": (v9/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Viewer_selectedTeams",
                "kind": "LinkedHandle",
                "name": "selectedTeams"
              }
            ],
            "type": "UserDashboard",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "6823f2ff50c6b4b77783108c57484509",
    "metadata": {},
    "name": "SharedViewTreeListSelectTeamsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "2a33ec7c1e43c8028aa887ba00366511";

export default node;
