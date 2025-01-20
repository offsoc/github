/**
 * @generated SignedSource<<e688d99f938fa91f9413b8fabfe73d3c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsItem_ClassicProjectFragment$data = {
  readonly __typename: "Project";
  readonly closed: boolean;
  readonly columns: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "ItemPickerProjectsItem_ClassicProjectFragment";
};
export type ItemPickerProjectsItem_ClassicProjectFragment$key = {
  readonly " $data"?: ItemPickerProjectsItem_ClassicProjectFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ClassicProjectFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerProjectsItem_ClassicProjectFragment"
};

(node as any).hash = "76fc66fb43efc2959fb921a5be37f9ca";

export default node;
