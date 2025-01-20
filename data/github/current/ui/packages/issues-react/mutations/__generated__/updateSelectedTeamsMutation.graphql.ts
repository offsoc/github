/**
 * @generated SignedSource<<202656c68c09b3f198cf9dc790859beb>>
 * @relayHash 9d182f4724c12aebdd96e805c4f3e470
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9d182f4724c12aebdd96e805c4f3e470

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "%future added value";
export type SearchShortcutIcon = "ALERT" | "BEAKER" | "BOOKMARK" | "BRIEFCASE" | "BUG" | "CALENDAR" | "CLOCK" | "CODESCAN" | "CODE_REVIEW" | "COMMENT_DISCUSSION" | "DEPENDABOT" | "EYE" | "FILE_DIFF" | "FLAME" | "GIT_PULL_REQUEST" | "HUBOT" | "ISSUE_OPENED" | "MENTION" | "METER" | "MOON" | "NORTH_STAR" | "ORGANIZATION" | "PEOPLE" | "ROCKET" | "SMILEY" | "SQUIRREL" | "SUN" | "TELESCOPE" | "TERMINAL" | "TOOLS" | "ZAP" | "%future added value";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type UpdateDashboardSelectedTeamsInput = {
  clientMutationId?: string | null | undefined;
  teamIds: ReadonlyArray<string>;
};
export type updateSelectedTeamsMutation$variables = {
  input: UpdateDashboardSelectedTeamsInput;
  searchTypes: ReadonlyArray<SearchShortcutType>;
  selectedTeamsConnections: ReadonlyArray<string>;
  teamViewPageSize: number;
};
export type updateSelectedTeamsMutation$data = {
  readonly updateDashboardSelectedTeams: {
    readonly dashboardTeamEdges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"RemoveTeamRow" | "SharedViewTreeRoot">;
      } | null | undefined;
    }> | null | undefined;
    readonly removedTeamIds: ReadonlyArray<string> | null | undefined;
  } | null | undefined;
};
export type updateSelectedTeamsMutation$rawResponse = {
  readonly updateDashboardSelectedTeams: {
    readonly dashboardTeamEdges: ReadonlyArray<{
      readonly node: {
        readonly avatarUrl: string | null | undefined;
        readonly dashboard: {
          readonly id: string;
          readonly shortcuts: {
            readonly edges: ReadonlyArray<{
              readonly cursor: string;
              readonly node: {
                readonly __typename: "TeamSearchShortcut";
                readonly color: SearchShortcutColor;
                readonly icon: SearchShortcutIcon;
                readonly id: string;
                readonly name: string;
                readonly query: string;
              } | null | undefined;
            } | null | undefined> | null | undefined;
            readonly pageInfo: {
              readonly endCursor: string | null | undefined;
              readonly hasNextPage: boolean;
            };
          };
        } | null | undefined;
        readonly id: string;
        readonly isViewerMember: boolean;
        readonly name: string;
        readonly organization: {
          readonly id: string;
          readonly name: string | null | undefined;
        };
        readonly viewerCanAdminister: boolean;
      } | null | undefined;
    }> | null | undefined;
    readonly removedTeamIds: ReadonlyArray<string> | null | undefined;
  } | null | undefined;
};
export type updateSelectedTeamsMutation = {
  rawResponse: updateSelectedTeamsMutation$rawResponse;
  response: updateSelectedTeamsMutation$data;
  variables: updateSelectedTeamsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "searchTypes"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedTeamsConnections"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "teamViewPageSize"
},
v4 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "removedTeamIds",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "kind": "Variable",
  "name": "searchTypes",
  "variableName": "searchTypes"
},
v8 = [
  {
    "kind": "Variable",
    "name": "connections",
    "variableName": "selectedTeamsConnections"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "teamViewPageSize"
  },
  (v7/*: any*/)
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
    "name": "updateSelectedTeamsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "UpdateDashboardSelectedTeamsPayload",
        "kind": "LinkedField",
        "name": "updateDashboardSelectedTeams",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamEdge",
            "kind": "LinkedField",
            "name": "dashboardTeamEdges",
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
                  {
                    "args": [
                      (v7/*: any*/),
                      {
                        "kind": "Variable",
                        "name": "teamViewPageSize",
                        "variableName": "teamViewPageSize"
                      }
                    ],
                    "kind": "FragmentSpread",
                    "name": "SharedViewTreeRoot"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RemoveTeamRow"
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "updateSelectedTeamsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "UpdateDashboardSelectedTeamsPayload",
        "kind": "LinkedField",
        "name": "updateDashboardSelectedTeams",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "removedTeamIds",
            "handleArgs": (v8/*: any*/)
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamEdge",
            "kind": "LinkedField",
            "name": "dashboardTeamEdges",
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
                  (v9/*: any*/),
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
                      (v9/*: any*/),
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
                        "args": (v10/*: any*/),
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
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "icon",
                                    "storageKey": null
                                  },
                                  (v9/*: any*/),
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
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "__typename",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "cursor",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
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
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v10/*: any*/),
                        "filters": [
                          "searchTypes"
                        ],
                        "handle": "connection",
                        "key": "TeamDashboard_shortcuts",
                        "kind": "LinkedHandle",
                        "name": "shortcuts"
                      },
                      (v6/*: any*/)
                    ],
                    "storageKey": null
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
            "name": "dashboardTeamEdges",
            "handleArgs": (v8/*: any*/)
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "9d182f4724c12aebdd96e805c4f3e470",
    "metadata": {},
    "name": "updateSelectedTeamsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "30aacd2b9c038bb2f8e32a242f8eec7c";

export default node;
