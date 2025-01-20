/**
 * @generated SignedSource<<e16bb10aaa88eaabbb6070e3a221af93>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderSubIssueSummaryWithPrimary$data = {
  readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary">;
  readonly " $fragmentType": "HeaderSubIssueSummaryWithPrimary";
};
export type HeaderSubIssueSummaryWithPrimary$key = {
  readonly " $data"?: HeaderSubIssueSummaryWithPrimary$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderSubIssueSummaryWithPrimary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderSubIssueSummaryWithPrimary",
  "selections": [
    {
      "args": [
        {
          "kind": "Literal",
          "name": "fetchSubIssues",
          "value": false
        }
      ],
      "kind": "FragmentSpread",
      "name": "useSubIssuesSummary"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "02a4f342f6c913a3e3f1bba2edd8295d";

export default node;
