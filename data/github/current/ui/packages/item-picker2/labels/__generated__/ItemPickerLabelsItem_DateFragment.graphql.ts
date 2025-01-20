/**
 * @generated SignedSource<<762c4388714d8b2032d7913873a5282a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsItem_DateFragment$data = {
  readonly createdAt: string | null | undefined;
  readonly updatedAt: string | null | undefined;
  readonly " $fragmentType": "ItemPickerLabelsItem_DateFragment";
};
export type ItemPickerLabelsItem_DateFragment$key = {
  readonly " $data"?: ItemPickerLabelsItem_DateFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsItem_DateFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerLabelsItem_DateFragment"
};

(node as any).hash = "ec507e7912c2c65370822f9c813f2da8";

export default node;
