/**
 * @generated SignedSource<<957f8d4f47145af393005ef7b40008b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssuePickerQuery$data = {
  readonly assignee: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Issue";
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly title: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
  };
  readonly author: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Issue";
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly title: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
  };
  readonly commenters: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Issue";
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly title: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
  };
  readonly mentions: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Issue";
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly title: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
  };
  readonly open: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Issue";
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly nameWithOwner: string;
      };
      readonly state: IssueState;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly title: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
  };
  readonly resource?: {
    readonly __typename: "Issue";
    readonly databaseId: number | null | undefined;
    readonly id: string;
    readonly number: number;
    readonly repository: {
      readonly nameWithOwner: string;
    };
    readonly state: IssueState;
    readonly stateReason: IssueStateReason | null | undefined;
    readonly title: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly " $fragmentType": "IssuePickerQuery";
};
export type IssuePickerQuery$key = {
  readonly " $data"?: IssuePickerQuery$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuePickerQuery">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v1 = {
  "kind": "Literal",
  "name": "type",
  "value": "ISSUE"
},
v2 = [
  {
    "kind": "InlineFragment",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
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
          }
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      }
    ],
    "type": "Issue",
    "abstractKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": (v2/*: any*/),
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "assignee"
    },
    {
      "kind": "RootArgument",
      "name": "author"
    },
    {
      "kind": "RootArgument",
      "name": "commenters"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "mentions"
    },
    {
      "kind": "RootArgument",
      "name": "open"
    },
    {
      "kind": "RootArgument",
      "name": "queryIsUrl"
    },
    {
      "kind": "RootArgument",
      "name": "resource"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuePickerQuery",
  "selections": [
    {
      "alias": "commenters",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "commenters"
        },
        (v1/*: any*/)
      ],
      "concreteType": "SearchResultItemConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": (v3/*: any*/),
      "storageKey": null
    },
    {
      "alias": "mentions",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "mentions"
        },
        (v1/*: any*/)
      ],
      "concreteType": "SearchResultItemConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": (v3/*: any*/),
      "storageKey": null
    },
    {
      "alias": "assignee",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "assignee"
        },
        (v1/*: any*/)
      ],
      "concreteType": "SearchResultItemConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": (v3/*: any*/),
      "storageKey": null
    },
    {
      "alias": "author",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "author"
        },
        (v1/*: any*/)
      ],
      "concreteType": "SearchResultItemConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": (v3/*: any*/),
      "storageKey": null
    },
    {
      "alias": "open",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "open"
        },
        (v1/*: any*/)
      ],
      "concreteType": "SearchResultItemConnection",
      "kind": "LinkedField",
      "name": "search",
      "plural": false,
      "selections": (v3/*: any*/),
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
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "2991fde1f27b5ed6916118fea8475baf";

export default node;
