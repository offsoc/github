/**
 * @generated SignedSource<<44867f7b55739a397f478bb6f95f5ffb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestPickerPullRequest$data = {
  readonly __typename: "PullRequest";
  readonly createdAt: string;
  readonly id: string;
  readonly isDraft: boolean;
  readonly isInMergeQueue: boolean;
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
  readonly " $fragmentType": "PullRequestPickerPullRequest";
};
export type PullRequestPickerPullRequest$key = {
  readonly " $data"?: PullRequestPickerPullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestPickerPullRequest">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "PullRequestPickerPullRequest"
};

(node as any).hash = "14535df753a3408896cf861b01319c58";

export default node;
