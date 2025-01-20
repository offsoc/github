/**
 * @generated SignedSource<<4e75eb2819a910cc4e241540db2b112b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ReactionButton_Reaction$data = {
  readonly content: ReactionContent;
  readonly reactors: {
    readonly nodes: ReadonlyArray<{
      readonly __typename: "Bot";
      readonly login: string;
    } | {
      readonly __typename: "Mannequin";
      readonly login: string;
    } | {
      readonly __typename: "Organization";
      readonly login: string;
    } | {
      readonly __typename: "User";
      readonly login: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
  readonly viewerHasReacted: boolean;
  readonly " $fragmentType": "ReactionButton_Reaction";
};
export type ReactionButton_Reaction$key = {
  readonly " $data"?: ReactionButton_Reaction$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReactionButton_Reaction">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactionButton_Reaction",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "content",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 5
        }
      ],
      "concreteType": "ReactorConnection",
      "kind": "LinkedField",
      "name": "reactors",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            {
              "kind": "InlineFragment",
              "selections": (v0/*: any*/),
              "type": "User",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v0/*: any*/),
              "type": "Bot",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v0/*: any*/),
              "type": "Organization",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v0/*: any*/),
              "type": "Mannequin",
              "abstractKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        }
      ],
      "storageKey": "reactors(first:5)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerHasReacted",
      "storageKey": null
    }
  ],
  "type": "ReactionGroup",
  "abstractKey": null
};
})();

(node as any).hash = "555f188e24b8830382c5b18cf0b0c729";

export default node;
