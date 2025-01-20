/**
 * @generated SignedSource<<1a6147810b74d7648ae424f00a63de10>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsBoxItem_Fragment$data = {
  readonly color: string;
  readonly nameHTML: string;
  readonly url: string;
  readonly " $fragmentType": "ItemPickerLabelsBoxItem_Fragment";
};
export type ItemPickerLabelsBoxItem_Fragment$key = {
  readonly " $data"?: ItemPickerLabelsBoxItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsBoxItem_Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerLabelsBoxItem_Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameHTML",
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
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "Label",
  "abstractKey": null
};

(node as any).hash = "6ed4a5bcff060188c087dd42c91e8301";

export default node;
