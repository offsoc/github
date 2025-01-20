/**
 * @generated SignedSource<<c8a2e07937de420e760effd790d77440>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type MilestoneState = "CLOSED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ItemPickerMilestonesItem_Fragment$data = {
  readonly id: string;
  readonly state: MilestoneState;
  readonly title: string;
  readonly " $fragmentType": "ItemPickerMilestonesItem_Fragment";
};
export type ItemPickerMilestonesItem_Fragment$key = {
  readonly " $data"?: ItemPickerMilestonesItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerMilestonesItem_Fragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerMilestonesItem_Fragment"
};

(node as any).hash = "80b367104e3de87dca4cbad523f13f0e";

export default node;
