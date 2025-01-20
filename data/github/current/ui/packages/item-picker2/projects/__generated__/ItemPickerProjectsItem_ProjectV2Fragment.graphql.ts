/**
 * @generated SignedSource<<97c466d57307f8f6182c04166a321070>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsItem_ProjectV2Fragment$data = {
  readonly __typename: "ProjectV2";
  readonly closed: boolean;
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "ItemPickerProjectsItem_ProjectV2Fragment";
};
export type ItemPickerProjectsItem_ProjectV2Fragment$key = {
  readonly " $data"?: ItemPickerProjectsItem_ProjectV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ProjectV2Fragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerProjectsItem_ProjectV2Fragment"
};

(node as any).hash = "fea46d46c637ebce2d592c7813ca3d79";

export default node;
