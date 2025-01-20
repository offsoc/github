/**
 * @generated SignedSource<<66a58c726e608a1b542f36fb71feb4d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestMarkers_pullRequestThread$data = {
  readonly firstComment: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly databaseId: number | null | undefined;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly isResolved: boolean;
  readonly line: number | null | undefined;
  readonly path: string;
  readonly pathDigest: string;
  readonly " $fragmentType": "PullRequestMarkers_pullRequestThread";
};
export type PullRequestMarkers_pullRequestThread$key = {
  readonly " $data"?: PullRequestMarkers_pullRequestThread$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkers_pullRequestThread">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "PullRequestMarkers_pullRequestThread"
};

(node as any).hash = "4b3192813566c68f56e8280255f1d1f5";

export default node;
