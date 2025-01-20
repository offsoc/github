/**
 * @generated SignedSource<<a20d3c3ee11bfa953f2ecf67ba72fd04>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Navigation_pullRequest$data = {
  readonly comparison: {
    readonly summary: ReadonlyArray<{
      readonly __typename: "PullRequestSummaryDelta";
    }> | null | undefined;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"CommitsDropdown_pullRequest" | "FileTree_pullRequest">;
  readonly " $fragmentType": "Navigation_pullRequest";
};
export type Navigation_pullRequest$key = {
  readonly " $data"?: Navigation_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"Navigation_pullRequest">;
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
  "name": "Navigation_pullRequest",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "FileTree_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CommitsDropdown_pullRequest"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "f1fbc3575ee57144d4f5cbd80ec02814";

export default node;
