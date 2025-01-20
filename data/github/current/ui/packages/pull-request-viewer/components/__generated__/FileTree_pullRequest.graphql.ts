/**
 * @generated SignedSource<<a9061fc9dbcc520aa380108a95eec955>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type FileTree_pullRequest$data = {
  readonly comparison: {
    readonly summary: ReadonlyArray<{
      readonly changeType: PatchStatus;
      readonly path: string;
      readonly pathDigest: string;
      readonly totalAnnotationsCount: number;
      readonly totalCommentsCount: number;
    }> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "FileTree_pullRequest";
};
export type FileTree_pullRequest$key = {
  readonly " $data"?: FileTree_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"FileTree_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "endOid"
    },
    {
      "kind": "RootArgument",
      "name": "singleCommitOid"
    },
    {
      "kind": "RootArgument",
      "name": "startOid"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FileTree_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "endOid",
          "variableName": "endOid"
        },
        {
          "kind": "Variable",
          "name": "singleCommitOid",
          "variableName": "singleCommitOid"
        },
        {
          "kind": "Variable",
          "name": "startOid",
          "variableName": "startOid"
        }
      ],
      "concreteType": "PullRequestComparison",
      "kind": "LinkedField",
      "name": "comparison",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestSummaryDelta",
          "kind": "LinkedField",
          "name": "summary",
          "plural": true,
          "selections": [
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
              "name": "changeType",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalCommentsCount",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalAnnotationsCount",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "bd6cac69cde95a5c23d2eec0c01a1129";

export default node;
