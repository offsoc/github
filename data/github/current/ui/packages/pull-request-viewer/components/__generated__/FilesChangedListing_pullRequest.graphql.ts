/**
 * @generated SignedSource<<76143bcc45d3e001ab49c13b7d5cdc3b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FilesChangedListing_pullRequest$data = {
  readonly comparison: {
    readonly linesAdded: number;
    readonly linesDeleted: number;
    readonly summary: ReadonlyArray<{
      readonly path: string;
      readonly " $fragmentSpreads": FragmentRefs<"FilesChangedRow_pullRequestSummaryDelta">;
    }> | null | undefined;
  } | null | undefined;
  readonly resourcePath: string;
  readonly " $fragmentType": "FilesChangedListing_pullRequest";
};
export type FilesChangedListing_pullRequest$key = {
  readonly " $data"?: FilesChangedListing_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"FilesChangedListing_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "endOid"
    },
    {
      "kind": "RootArgument",
      "name": "startOid"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FilesChangedListing_pullRequest",
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
          "kind": "ScalarField",
          "name": "linesAdded",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "linesDeleted",
          "storageKey": null
        },
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
              "args": null,
              "kind": "FragmentSpread",
              "name": "FilesChangedRow_pullRequestSummaryDelta"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resourcePath",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "5e0b74caf2ed14c1aac7b53d2f84628b";

export default node;
