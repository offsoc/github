/**
 * @generated SignedSource<<7cf74382399f0d5c580a78900ade9f80>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueTimelinePaginated$data = {
  readonly author: {
    readonly login: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTimelineBackPaginated" | "IssueTimelineFrontPaginated">;
  readonly " $fragmentType": "IssueTimelinePaginated";
};
export type IssueTimelinePaginated$key = {
  readonly " $data"?: IssueTimelinePaginated$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTimelinePaginated">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "numberOfTimelineItems"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTimelinePaginated",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "numberOfTimelineItems",
          "variableName": "numberOfTimelineItems"
        }
      ],
      "kind": "FragmentSpread",
      "name": "IssueTimelineFrontPaginated"
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "last",
          "value": 0
        }
      ],
      "kind": "FragmentSpread",
      "name": "IssueTimelineBackPaginated"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "e5866dd5c0be5b3b7ad4bcee6f018ea3";

export default node;
