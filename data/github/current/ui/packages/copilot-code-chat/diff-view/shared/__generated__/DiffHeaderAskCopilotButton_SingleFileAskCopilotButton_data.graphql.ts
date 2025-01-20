/**
 * @generated SignedSource<<3a6f681b563b5a08c57df9fcf5b93814>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data$data = {
  readonly firstDiffEntry: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_DiffEntry">;
      };
    } | null | undefined>;
  };
  readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_Comparison">;
  readonly " $fragmentType": "DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data";
};
export type DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data$key = {
  readonly " $data"?: DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffHeaderAskCopilotButton_SingleFileAskCopilotButton_data",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useFileDiffReference_Comparison"
    },
    {
      "alias": "firstDiffEntry",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
        }
      ],
      "concreteType": "PullRequestDiffEntryConnection",
      "kind": "LinkedField",
      "name": "diffEntries",
      "plural": false,
      "selections": [
        {
          "kind": "RequiredField",
          "field": {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestDiffEntryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "kind": "RequiredField",
                "field": {
                  "alias": null,
                  "args": null,
                  "concreteType": "PullRequestDiffEntry",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "useFileDiffReference_DiffEntry"
                    }
                  ],
                  "storageKey": null
                },
                "action": "THROW",
                "path": "firstDiffEntry.edges.node"
              }
            ],
            "storageKey": null
          },
          "action": "THROW",
          "path": "firstDiffEntry.edges"
        }
      ],
      "storageKey": "diffEntries(first:1)"
    }
  ],
  "type": "PullRequestComparison",
  "abstractKey": null
};

(node as any).hash = "df2dc0094e0be2b849b51a29547f1d99";

export default node;
