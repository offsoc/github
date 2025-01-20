/**
 * @generated SignedSource<<655e4a2d5b82aaf901aa1b0008e23e35>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BranchPickerRepositoryBranches$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRef">;
    } | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "BranchPickerRepositoryBranches";
};
export type BranchPickerRepositoryBranches$key = {
  readonly " $data"?: BranchPickerRepositoryBranches$data;
  readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRepositoryBranches">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "BranchPickerRepositoryBranches"
};

(node as any).hash = "fc20fd3ed00706559cd5314915dda570";

export default node;
