/**
 * @generated SignedSource<<a104230cc5a050eec3645a20cf97028a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesCompletionPill$data = {
  readonly url: string;
  readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary">;
  readonly " $fragmentType": "SubIssuesCompletionPill";
};
export type SubIssuesCompletionPill$key = {
  readonly " $data"?: SubIssuesCompletionPill$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubIssuesCompletionPill">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "fetchSubIssues"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubIssuesCompletionPill",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "fetchSubIssues",
          "variableName": "fetchSubIssues"
        }
      ],
      "kind": "FragmentSpread",
      "name": "useSubIssuesSummary"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "a66950424aa6b94142e27c70813c0183";

export default node;
