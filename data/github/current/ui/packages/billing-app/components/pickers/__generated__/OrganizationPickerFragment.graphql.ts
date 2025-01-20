/**
 * @generated SignedSource<<40f9682c1f1cf83c3fa395940cda7166>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrganizationPickerFragment$data = {
  readonly avatarUrl: string;
  readonly id: string;
  readonly login: string;
  readonly " $fragmentType": "OrganizationPickerFragment";
};
export type OrganizationPickerFragment$key = {
  readonly " $data"?: OrganizationPickerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrganizationPickerFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "OrganizationPickerFragment"
};

(node as any).hash = "eef606d5a6edb9e1cf94083a514a0031";

export default node;
