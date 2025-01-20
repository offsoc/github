/**
 * @generated SignedSource<<023e0d4f192259db3c243240563bf724>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type FilesChangedRow_pullRequestSummaryDelta$data = {
  readonly additions: number;
  readonly changeType: PatchStatus;
  readonly deletions: number;
  readonly path: string;
  readonly pathDigest: string;
  readonly unresolvedCommentCount: number;
  readonly " $fragmentType": "FilesChangedRow_pullRequestSummaryDelta";
};
export type FilesChangedRow_pullRequestSummaryDelta$key = {
  readonly " $data"?: FilesChangedRow_pullRequestSummaryDelta$data;
  readonly " $fragmentSpreads": FragmentRefs<"FilesChangedRow_pullRequestSummaryDelta">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FilesChangedRow_pullRequestSummaryDelta",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "additions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "changeType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "deletions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pathDigest",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unresolvedCommentCount",
      "storageKey": null
    }
  ],
  "type": "PullRequestSummaryDelta",
  "abstractKey": null
};

(node as any).hash = "0c2e4de33c62129a5c56f6d08f8b3bc9";

export default node;
