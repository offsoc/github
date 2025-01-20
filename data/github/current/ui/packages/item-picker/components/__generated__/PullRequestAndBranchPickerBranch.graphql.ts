/**
 * @generated SignedSource<<4a5243a5e8523672146465c0efae624d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestAndBranchPickerBranch$data = {
  readonly __typename: "PullRequest";
  readonly id: string;
  readonly isDraft: boolean;
  readonly number: number;
  readonly repository: {
    readonly id: string;
    readonly name: string;
    readonly nameWithOwner: string;
    readonly owner: {
      readonly __typename: string;
      readonly login: string;
    };
  };
  readonly state: PullRequestState;
  readonly title: string;
  readonly url: string;
  readonly " $fragmentType": "PullRequestAndBranchPickerBranch";
};
export type PullRequestAndBranchPickerBranch$key = {
  readonly " $data"?: PullRequestAndBranchPickerBranch$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestAndBranchPickerBranch">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "PullRequestAndBranchPickerBranch"
};

(node as any).hash = "2dab6e31da259e64d2403733a4562dcc";

export default node;
