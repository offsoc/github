/**
 * @generated SignedSource<<e6debdb4324a57e16f15fd2ec67d159f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerAssigneesItem_Fragment$data = {
  readonly avatarUrl: string;
  readonly id: string;
  readonly login: string;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ItemPickerAssigneesItem_Fragment";
};
export type ItemPickerAssigneesItem_Fragment$key = {
  readonly " $data"?: ItemPickerAssigneesItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssigneesItem_Fragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerAssigneesItem_Fragment"
};

(node as any).hash = "c8e7f005336a5ea15e06c2f0c2ae61a5";

export default node;
