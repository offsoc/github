/**
 * @generated SignedSource<<b4fb001bf38899555ed5834a83989474>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$data = {
  readonly __typename: "PullRequest";
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "ItemPickerPullRequestsAndBranchesItem_PullRequestFragment";
};
export type ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key = {
  readonly " $data"?: ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranchesItem_PullRequestFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ItemPickerPullRequestsAndBranchesItem_PullRequestFragment"
};

(node as any).hash = "7282a81b7e55d52bec6580f93fc95ab6";

export default node;
