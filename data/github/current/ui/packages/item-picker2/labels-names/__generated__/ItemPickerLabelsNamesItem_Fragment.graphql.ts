/**
 * @generated SignedSource<<dd1244eefa6b8d5e08cd73330c9d74ea>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsNamesItem_Fragment$data = {
  readonly color: string;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly nameHTML: string;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesItem_DateFragment" | "ItemPickerLabelsNamesItem_PathFragment">;
  readonly " $fragmentType": "ItemPickerLabelsNamesItem_Fragment";
};
export type ItemPickerLabelsNamesItem_Fragment$key = {
  readonly " $data"?: ItemPickerLabelsNamesItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesItem_Fragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerLabelsNamesItem_Fragment"
};

(node as any).hash = "9b32f52c3c9764127558090e78243db9";

export default node;
