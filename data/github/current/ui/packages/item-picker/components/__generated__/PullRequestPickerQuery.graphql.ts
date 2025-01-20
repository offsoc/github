/**
 * @generated SignedSource<<7501ab3e67fc34cfae71637bdab77f8b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestPickerQuery$data = {
  readonly assignee: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
    } | null | undefined> | null | undefined;
  };
  readonly author: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
    } | null | undefined> | null | undefined;
  };
  readonly commenters: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
    } | null | undefined> | null | undefined;
  };
  readonly mentions: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
    } | null | undefined> | null | undefined;
  };
  readonly open: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "PullRequestPickerQuery";
};
export type PullRequestPickerQuery$key = {
  readonly " $data"?: PullRequestPickerQuery$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerQuery">;
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
  "name": "__typename",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      {
        "kind": "InlineDataFragmentSpread",
        "name": "PullRequestPickerPullRequest",
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
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
                  (v2/*: any*/),
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
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "args": null,
        "argumentDefinitions": ([]/*: any*/)
      }
    ],
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
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestPickerQuery",
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
      "selections": (v4/*: any*/),
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
      "selections": (v4/*: any*/),
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
      "selections": (v4/*: any*/),
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
      "selections": (v4/*: any*/),
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
      "selections": (v4/*: any*/),
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "a38666c3d059c9d2a20d807ac84b6afd";

export default node;
