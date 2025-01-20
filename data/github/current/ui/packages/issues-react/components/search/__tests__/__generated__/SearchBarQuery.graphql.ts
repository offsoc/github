/**
 * @generated SignedSource<<074a2faf01092287e1fe36dbf8db98a2>>
 * @relayHash c4692a09b796be46dd128912d7d1cbd6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c4692a09b796be46dd128912d7d1cbd6

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchBarQuery$variables = Record<PropertyKey, never>;
export type SearchBarQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"SearchBarCurrentViewFragment">;
  } | null | undefined;
};
export type SearchBarQuery = {
  response: SearchBarQuery$data;
  variables: SearchBarQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "SSC_asdkasd"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
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
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SearchBarQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SearchBarCurrentViewFragment"
          }
        ],
        "storageKey": "node(id:\"SSC_asdkasd\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SearchBarQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
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
                "name": "icon",
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
                      (v1/*: any*/),
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
        "storageKey": "node(id:\"SSC_asdkasd\")"
      }
    ]
  },
  "params": {
    "id": "c4692a09b796be46dd128912d7d1cbd6",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isShortcutable": (v4/*: any*/),
        "node.__typename": (v4/*: any*/),
        "node.color": {
          "enumValues": [
            "BLUE",
            "GRAY",
            "GREEN",
            "ORANGE",
            "PINK",
            "PURPLE",
            "RED"
          ],
          "nullable": false,
          "plural": false,
          "type": "SearchShortcutColor"
        },
        "node.description": (v4/*: any*/),
        "node.icon": {
          "enumValues": [
            "ALERT",
            "BEAKER",
            "BOOKMARK",
            "BRIEFCASE",
            "BUG",
            "CALENDAR",
            "CLOCK",
            "CODESCAN",
            "CODE_REVIEW",
            "COMMENT_DISCUSSION",
            "DEPENDABOT",
            "EYE",
            "FILE_DIFF",
            "FLAME",
            "GIT_PULL_REQUEST",
            "HUBOT",
            "ISSUE_OPENED",
            "MENTION",
            "METER",
            "MOON",
            "NORTH_STAR",
            "ORGANIZATION",
            "PEOPLE",
            "ROCKET",
            "SMILEY",
            "SQUIRREL",
            "SUN",
            "TELESCOPE",
            "TERMINAL",
            "TOOLS",
            "ZAP"
          ],
          "nullable": false,
          "plural": false,
          "type": "SearchShortcutIcon"
        },
        "node.id": (v5/*: any*/),
        "node.name": (v4/*: any*/),
        "node.query": (v4/*: any*/),
        "node.scopingRepository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "node.scopingRepository.id": (v5/*: any*/),
        "node.scopingRepository.name": (v4/*: any*/),
        "node.scopingRepository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "node.scopingRepository.owner.__typename": (v4/*: any*/),
        "node.scopingRepository.owner.id": (v5/*: any*/),
        "node.scopingRepository.owner.login": (v4/*: any*/)
      }
    },
    "name": "SearchBarQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b34d1b94777171a3e35971b7e76e7fbc";

export default node;
