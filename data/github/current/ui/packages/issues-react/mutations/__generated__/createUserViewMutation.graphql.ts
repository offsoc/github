/**
 * @generated SignedSource<<3628d58275fd1c49c362f92d84f03a12>>
 * @relayHash 23a5680e52f3631a2bae849a4eb88881
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 23a5680e52f3631a2bae849a4eb88881

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "%future added value";
export type SearchShortcutIcon = "ALERT" | "BEAKER" | "BOOKMARK" | "BRIEFCASE" | "BUG" | "CALENDAR" | "CLOCK" | "CODESCAN" | "CODE_REVIEW" | "COMMENT_DISCUSSION" | "DEPENDABOT" | "EYE" | "FILE_DIFF" | "FLAME" | "GIT_PULL_REQUEST" | "HUBOT" | "ISSUE_OPENED" | "MENTION" | "METER" | "MOON" | "NORTH_STAR" | "ORGANIZATION" | "PEOPLE" | "ROCKET" | "SMILEY" | "SQUIRREL" | "SUN" | "TELESCOPE" | "TERMINAL" | "TOOLS" | "ZAP" | "%future added value";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type CreateDashboardSearchShortcutInput = {
  clientMutationId?: string | null | undefined;
  color: SearchShortcutColor;
  description?: string | null | undefined;
  icon: SearchShortcutIcon;
  name: string;
  query?: string | null | undefined;
  scopingRepository?: RepositoryNameWithOwner | null | undefined;
  searchType: SearchShortcutType;
};
export type RepositoryNameWithOwner = {
  name: string;
  owner: string;
};
export type createUserViewMutation$variables = {
  connections: ReadonlyArray<string>;
  input: CreateDashboardSearchShortcutInput;
};
export type createUserViewMutation$data = {
  readonly createDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"EditViewButtonCurrentViewFragment" | "IssueDetailCurrentViewFragment" | "ListCurrentViewFragment">;
    } | null | undefined;
    readonly shortcutEdge: {
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"SavedViewRow">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createUserViewMutation$rawResponse = {
  readonly createDashboardSearchShortcut: {
    readonly shortcut: {
      readonly __isShortcutable: "SearchShortcut";
      readonly color: SearchShortcutColor;
      readonly description: string;
      readonly icon: SearchShortcutIcon;
      readonly id: string;
      readonly name: string;
      readonly query: string;
      readonly scopingRepository: {
        readonly id: string;
        readonly name: string;
        readonly owner: {
          readonly __typename: string;
          readonly id: string;
          readonly login: string;
        };
      } | null | undefined;
    } | null | undefined;
    readonly shortcutEdge: {
      readonly node: {
        readonly color: SearchShortcutColor;
        readonly description: string;
        readonly icon: SearchShortcutIcon;
        readonly id: string;
        readonly name: string;
        readonly query: string;
        readonly scopingRepository: {
          readonly id: string;
          readonly name: string;
          readonly owner: {
            readonly __typename: string;
            readonly id: string;
            readonly login: string;
          };
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createUserViewMutation = {
  rawResponse: createUserViewMutation$rawResponse;
  response: createUserViewMutation$data;
  variables: createUserViewMutation$variables;
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "icon",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "query",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "scopingRepository",
  "plural": false,
  "selections": [
    (v4/*: any*/),
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
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        },
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "createUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "createDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchShortcutEdge",
            "kind": "LinkedField",
            "name": "shortcutEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SearchShortcut",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "SavedViewRow"
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
            "concreteType": "SearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ListCurrentViewFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueDetailCurrentViewFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "EditViewButtonCurrentViewFragment"
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
    "name": "createUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "createDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchShortcutEdge",
            "kind": "LinkedField",
            "name": "shortcutEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SearchShortcut",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/)
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
            "name": "shortcutEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  (v6/*: any*/),
                  (v3/*: any*/),
                  (v5/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/)
                ],
                "type": "Shortcutable",
                "abstractKey": "__isShortcutable"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "23a5680e52f3631a2bae849a4eb88881",
    "metadata": {},
    "name": "createUserViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "bdf18162603ca5495cc157a7395e215c";

export default node;
