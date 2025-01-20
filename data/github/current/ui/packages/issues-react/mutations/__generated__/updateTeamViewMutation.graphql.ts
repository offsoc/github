/**
 * @generated SignedSource<<0c4e7648e324d756f56d1324de58a088>>
 * @relayHash 09ac819b9813828c8f78952663c12fac
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 09ac819b9813828c8f78952663c12fac

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "%future added value";
export type SearchShortcutIcon = "ALERT" | "BEAKER" | "BOOKMARK" | "BRIEFCASE" | "BUG" | "CALENDAR" | "CLOCK" | "CODESCAN" | "CODE_REVIEW" | "COMMENT_DISCUSSION" | "DEPENDABOT" | "EYE" | "FILE_DIFF" | "FLAME" | "GIT_PULL_REQUEST" | "HUBOT" | "ISSUE_OPENED" | "MENTION" | "METER" | "MOON" | "NORTH_STAR" | "ORGANIZATION" | "PEOPLE" | "ROCKET" | "SMILEY" | "SQUIRREL" | "SUN" | "TELESCOPE" | "TERMINAL" | "TOOLS" | "ZAP" | "%future added value";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type UpdateTeamDashboardSearchShortcutInput = {
  clientMutationId?: string | null | undefined;
  color?: SearchShortcutColor | null | undefined;
  description?: string | null | undefined;
  icon?: SearchShortcutIcon | null | undefined;
  name?: string | null | undefined;
  query?: string | null | undefined;
  scopingRepository?: RepositoryNameWithOwner | null | undefined;
  searchType?: SearchShortcutType | null | undefined;
  shortcutId: string;
};
export type RepositoryNameWithOwner = {
  name: string;
  owner: string;
};
export type updateTeamViewMutation$variables = {
  input: UpdateTeamDashboardSearchShortcutInput;
};
export type updateTeamViewMutation$data = {
  readonly updateTeamDashboardSearchShortcut: {
    readonly shortcut: {
      readonly " $fragmentSpreads": FragmentRefs<"EditViewButtonCurrentViewFragment" | "IssueDetailCurrentViewFragment" | "ListCurrentViewFragment" | "SharedViewTreeItem">;
    } | null | undefined;
  } | null | undefined;
};
export type updateTeamViewMutation$rawResponse = {
  readonly updateTeamDashboardSearchShortcut: {
    readonly shortcut: {
      readonly __isShortcutable: "TeamSearchShortcut";
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
};
export type updateTeamViewMutation = {
  rawResponse: updateTeamViewMutation$rawResponse;
  response: updateTeamViewMutation$data;
  variables: updateTeamViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateTeamViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateTeamDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "updateTeamDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamSearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "SharedViewTreeItem"
              },
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
    "name": "updateTeamViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateTeamDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "updateTeamDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamSearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "icon",
                "storageKey": null
              },
              (v3/*: any*/),
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
                "kind": "InlineFragment",
                "selections": [
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
                      (v3/*: any*/),
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
                  }
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
    "id": "09ac819b9813828c8f78952663c12fac",
    "metadata": {},
    "name": "updateTeamViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2f6dc7dc4de68178a3be7ab7fc090f6e";

export default node;
