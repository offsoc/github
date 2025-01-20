/**
 * @generated SignedSource<<960bfe12ecddfe70c9f4ac92654e0d8a>>
 * @relayHash 6b2eafb48bb2923465442543aa12df82
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6b2eafb48bb2923465442543aa12df82

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchShortcutColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "%future added value";
export type SearchShortcutIcon = "ALERT" | "BEAKER" | "BOOKMARK" | "BRIEFCASE" | "BUG" | "CALENDAR" | "CLOCK" | "CODESCAN" | "CODE_REVIEW" | "COMMENT_DISCUSSION" | "DEPENDABOT" | "EYE" | "FILE_DIFF" | "FLAME" | "GIT_PULL_REQUEST" | "HUBOT" | "ISSUE_OPENED" | "MENTION" | "METER" | "MOON" | "NORTH_STAR" | "ORGANIZATION" | "PEOPLE" | "ROCKET" | "SMILEY" | "SQUIRREL" | "SUN" | "TELESCOPE" | "TERMINAL" | "TOOLS" | "ZAP" | "%future added value";
export type SearchShortcutType = "DISCUSSIONS" | "ISSUES" | "PULL_REQUESTS" | "%future added value";
export type UpdateDashboardSearchShortcutInput = {
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
export type updateUserViewMutation$variables = {
  input: UpdateDashboardSearchShortcutInput;
};
export type updateUserViewMutation$data = {
  readonly updateDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"EditViewButtonCurrentViewFragment" | "IssueDetailCurrentViewFragment" | "ListCurrentViewFragment" | "SavedViewRow">;
    } | null | undefined;
  } | null | undefined;
};
export type updateUserViewMutation$rawResponse = {
  readonly updateDashboardSearchShortcut: {
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
  } | null | undefined;
};
export type updateUserViewMutation = {
  rawResponse: updateUserViewMutation$rawResponse;
  response: updateUserViewMutation$data;
  variables: updateUserViewMutation$variables;
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
    "name": "updateUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "updateDashboardSearchShortcut",
        "plural": false,
        "selections": [
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
                "name": "SavedViewRow"
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
    "name": "updateUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "updateDashboardSearchShortcut",
        "plural": false,
        "selections": [
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
                "name": "color",
                "storageKey": null
              },
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
                "kind": "ScalarField",
                "name": "query",
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
              },
              {
                "kind": "TypeDiscriminator",
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
    "id": "6b2eafb48bb2923465442543aa12df82",
    "metadata": {},
    "name": "updateUserViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "590fbe9cfce158fa8f3cfdedee376a4b";

export default node;
