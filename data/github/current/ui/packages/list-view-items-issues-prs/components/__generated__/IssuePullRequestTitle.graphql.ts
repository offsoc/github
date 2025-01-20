/**
 * @generated SignedSource<<506b9e1bf4548c0a6432cad95fc05c21>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuePullRequestTitle$data = {
  readonly __typename: "Issue";
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"Label">;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly number: number;
  readonly " $fragmentType": "IssuePullRequestTitle";
} | {
  readonly __typename: "PullRequest";
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"Label">;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly number: number;
  readonly " $fragmentType": "IssuePullRequestTitle";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "IssuePullRequestTitle";
};
export type IssuePullRequestTitle$key = {
  readonly " $data"?: IssuePullRequestTitle$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuePullRequestTitle">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "labelPageSize"
      },
      {
        "kind": "Literal",
        "name": "orderBy",
        "value": {
          "direction": "ASC",
          "field": "NAME"
        }
      }
    ],
    "concreteType": "LabelConnection",
    "kind": "LinkedField",
    "name": "labels",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Label",
        "kind": "LinkedField",
        "name": "nodes",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "Label"
          },
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
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "labelPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuePullRequestTitle",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "IssueOrPullRequest",
  "abstractKey": "__isIssueOrPullRequest"
};
})();

(node as any).hash = "d9eaf411aaf5ca8ea6c80d66344b11ae";

export default node;
