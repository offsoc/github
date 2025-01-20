/**
 * @generated SignedSource<<6a3ee532c1a5399a8d916aa773780acc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderCurrentViewFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly query: string;
  readonly " $fragmentType": "HeaderCurrentViewFragment";
};
export type HeaderCurrentViewFragment$key = {
  readonly " $data"?: HeaderCurrentViewFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderCurrentViewFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderCurrentViewFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "query",
      "storageKey": null
    }
  ],
  "type": "Shortcutable",
  "abstractKey": "__isShortcutable"
};

(node as any).hash = "81fd3029bfb0852e4de00e2dadea8ed2";

export default node;
