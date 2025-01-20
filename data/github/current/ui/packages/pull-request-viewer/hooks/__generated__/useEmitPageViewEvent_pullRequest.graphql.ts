/**
 * @generated SignedSource<<ed2f9d0dcf666c55a0bac1d9237bd66a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useEmitPageViewEvent_pullRequest$data = {
  readonly comparison: {
    readonly filesChanged: number;
    readonly linesChanged: number;
  } | null | undefined;
  readonly " $fragmentType": "useEmitPageViewEvent_pullRequest";
};
export type useEmitPageViewEvent_pullRequest$key = {
  readonly " $data"?: useEmitPageViewEvent_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"useEmitPageViewEvent_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "endOid"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "singleCommitOid"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "startOid"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "useEmitPageViewEvent_pullRequest",
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
          "kind": "ScalarField",
          "name": "filesChanged",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "linesChanged",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "5603244be15a99584defd87fe718f607";

export default node;
