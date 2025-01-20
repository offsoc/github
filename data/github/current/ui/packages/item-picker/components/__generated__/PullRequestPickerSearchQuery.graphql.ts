/**
 * @generated SignedSource<<e208ddc54053fa0035c91c14ce43630e>>
 * @relayHash f5839127717c71099ada0c934056544c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f5839127717c71099ada0c934056544c

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestPickerSearchQuery$variables = {
  assignee: string;
  author: string;
  commenters: string;
  first?: number | null | undefined;
  mentions: string;
  open: string;
};
export type PullRequestPickerSearchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerQuery">;
};
export type PullRequestPickerSearchQuery = {
  response: PullRequestPickerSearchQuery$data;
  variables: PullRequestPickerSearchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "assignee"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "author"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "commenters"
},
v3 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "first"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mentions"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "open"
},
v6 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v7 = {
  "kind": "Literal",
  "name": "type",
  "value": "ISSUE"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = [
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      (v8/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "url",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "number",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isDraft",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isInMergeQueue",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Repository",
            "kind": "LinkedField",
            "name": "repository",
            "plural": false,
            "selections": [
              (v9/*: any*/),
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
                    "name": "login",
                    "storageKey": null
                  },
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "type": "PullRequest",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          (v9/*: any*/)
        ],
        "type": "Node",
        "abstractKey": "__isNode"
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestPickerSearchQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "PullRequestPickerQuery"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "PullRequestPickerSearchQuery",
    "selections": [
      {
        "alias": "commenters",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "commenters"
          },
          (v7/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      {
        "alias": "mentions",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "mentions"
          },
          (v7/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      {
        "alias": "assignee",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "assignee"
          },
          (v7/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      {
        "alias": "author",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "author"
          },
          (v7/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      },
      {
        "alias": "open",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "open"
          },
          (v7/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v10/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f5839127717c71099ada0c934056544c",
    "metadata": {},
    "name": "PullRequestPickerSearchQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "a547573799e4da6c378af01603f7fc41";

export default node;
