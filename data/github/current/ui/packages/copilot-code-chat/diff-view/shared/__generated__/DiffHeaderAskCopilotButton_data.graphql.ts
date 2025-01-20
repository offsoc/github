/**
 * @generated SignedSource<<f00817bb95058e63d43bb0e18081f9f4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffHeaderAskCopilotButton_data$data = {
  readonly comparison: {
    readonly diffEntriesMetadata: {
      readonly totalCount: number;
    };
    readonly " $fragmentSpreads": FragmentRefs<"DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AskCopilotDiffEntriesSelectPanel_data">;
  readonly " $fragmentType": "DiffHeaderAskCopilotButton_data";
};
export type DiffHeaderAskCopilotButton_data$key = {
  readonly " $data"?: DiffHeaderAskCopilotButton_data$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffHeaderAskCopilotButton_data">;
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
  "name": "DiffHeaderAskCopilotButton_data",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AskCopilotDiffEntriesSelectPanel_data"
    },
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data"
        },
        {
          "alias": "diffEntriesMetadata",
          "args": null,
          "concreteType": "PullRequestDiffEntryConnection",
          "kind": "LinkedField",
          "name": "diffEntries",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalCount",
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

(node as any).hash = "139f7ee7a7166dc06fca372f0a595c24";

export default node;
