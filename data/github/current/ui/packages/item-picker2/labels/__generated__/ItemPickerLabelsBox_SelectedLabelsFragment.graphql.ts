/**
 * @generated SignedSource<<1b53cd6dd67eb2b9586a28114b4c3bae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsBox_SelectedLabelsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsBoxItem_Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabels_SelectedLabelsFragment">;
  readonly " $fragmentType": "ItemPickerLabelsBox_SelectedLabelsFragment";
};
export type ItemPickerLabelsBox_SelectedLabelsFragment$key = {
  readonly " $data"?: ItemPickerLabelsBox_SelectedLabelsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsBox_SelectedLabelsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "withDate"
    },
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "withPath"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerLabelsBox_SelectedLabelsFragment",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "withDate",
          "variableName": "withDate"
        },
        {
          "kind": "Variable",
          "name": "withPath",
          "variableName": "withPath"
        }
      ],
      "kind": "FragmentSpread",
      "name": "ItemPickerLabels_SelectedLabelsFragment"
    },
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
          "name": "ItemPickerLabelsBoxItem_Fragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LabelConnection",
  "abstractKey": null
};

(node as any).hash = "ca69943a4a7f14e96a1987d7d58a6f67";

export default node;
