/**
 * @generated SignedSource<<cba3c795797533e4f163235d129598bd>>
 * @relayHash 939afe7294aa8bf7920ff5b9360e9a0f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 939afe7294aa8bf7920ff5b9360e9a0f

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuePickerSearchQuery$variables = {
  assignee: string;
  author: string;
  commenters: string;
  first?: number | null | undefined;
  mentions: string;
  open: string;
  queryIsUrl: boolean;
  resource: string;
};
export type IssuePickerSearchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"IssuePickerQuery">;
};
export type IssuePickerSearchQuery = {
  response: IssuePickerSearchQuery$data;
  variables: IssuePickerSearchQuery$variables;
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
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "queryIsUrl"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resource"
},
v8 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v9 = {
  "kind": "Literal",
  "name": "type",
  "value": "ISSUE"
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": [
      (v10/*: any*/),
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
        "name": "stateReason",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nameWithOwner",
            "storageKey": null
          },
          (v10/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "databaseId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "number",
        "storageKey": null
      }
    ],
    "type": "Issue",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": [
      (v10/*: any*/)
    ],
    "type": "Node",
    "abstractKey": "__isNode"
  }
],
v12 = [
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": (v11/*: any*/),
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
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssuePickerSearchQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "IssuePickerQuery"
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
      (v3/*: any*/),
      (v7/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Operation",
    "name": "IssuePickerSearchQuery",
    "selections": [
      {
        "alias": "commenters",
        "args": [
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "commenters"
          },
          (v9/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": "mentions",
        "args": [
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "mentions"
          },
          (v9/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": "assignee",
        "args": [
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "assignee"
          },
          (v9/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": "author",
        "args": [
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "author"
          },
          (v9/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "alias": "open",
        "args": [
          (v8/*: any*/),
          {
            "kind": "Variable",
            "name": "query",
            "variableName": "open"
          },
          (v9/*: any*/)
        ],
        "concreteType": "SearchResultItemConnection",
        "kind": "LinkedField",
        "name": "search",
        "plural": false,
        "selections": (v12/*: any*/),
        "storageKey": null
      },
      {
        "condition": "queryIsUrl",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Variable",
                "name": "url",
                "variableName": "resource"
              }
            ],
            "concreteType": null,
            "kind": "LinkedField",
            "name": "resource",
            "plural": false,
            "selections": (v11/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "id": "939afe7294aa8bf7920ff5b9360e9a0f",
    "metadata": {},
    "name": "IssuePickerSearchQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "295f393c29808e17e79d88974a192308";

export default node;
