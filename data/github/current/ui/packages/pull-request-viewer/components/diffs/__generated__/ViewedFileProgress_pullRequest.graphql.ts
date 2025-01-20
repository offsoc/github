/**
 * @generated SignedSource<<3bbc93982c9cbf6e8aae55ac298b1f82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ViewedFileProgress_pullRequest$data = {
  readonly comparison: {
    readonly summary: ReadonlyArray<{
      readonly __typename: "PullRequestSummaryDelta";
    }> | null | undefined;
  } | null | undefined;
  readonly viewerViewedFiles: number;
  readonly " $fragmentType": "ViewedFileProgress_pullRequest";
};
export type ViewedFileProgress_pullRequest$key = {
  readonly " $data"?: ViewedFileProgress_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ViewedFileProgress_pullRequest">;
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
  "name": "ViewedFileProgress_pullRequest",
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
              "name": "__typename",
              "storageKey": null
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
      "name": "viewerViewedFiles",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "af1ba26c2bade365e863d9ae2b020996";

export default node;
