/**
 * @generated SignedSource<<31df280b1c4415cc08addd395c7e4666>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BranchPickerRef$data = {
  readonly __typename: "Ref";
  readonly associatedPullRequests: {
    readonly totalCount: number;
  };
  readonly id: string;
  readonly name: string;
  readonly repository: {
    readonly defaultBranchRef: {
      readonly associatedPullRequests: {
        readonly totalCount: number;
      };
      readonly id: string;
      readonly name: string;
      readonly repository: {
        readonly id: string;
      };
      readonly target: {
        readonly __typename: string;
        readonly id: string;
        readonly oid: any;
      } | null | undefined;
    } | null | undefined;
    readonly id: string;
    readonly nameWithOwner: string;
  };
  readonly target: {
    readonly __typename: string;
    readonly id: string;
    readonly oid: any;
  } | null | undefined;
  readonly " $fragmentType": "BranchPickerRef";
};
export type BranchPickerRef$key = {
  readonly " $data"?: BranchPickerRef$data;
  readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRef">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "BranchPickerRef"
};

(node as any).hash = "98ea8dab9ebd07b2e3330c4f789fa7b3";

export default node;
