/**
 * @generated SignedSource<<b9a1006d5400b998a115de6f9ca610b2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderSubIssueSummary$data = {
  readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary">;
  readonly " $fragmentType": "HeaderSubIssueSummary";
};
export type HeaderSubIssueSummary$key = {
  readonly " $data"?: HeaderSubIssueSummary$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderSubIssueSummary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderSubIssueSummary",
  "selections": [
    {
      "args": [
        {
          "kind": "Literal",
          "name": "fetchSubIssues",
          "value": true
        }
      ],
      "kind": "FragmentSpread",
      "name": "useSubIssuesSummary"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "b9b7b99a1b6a2105fe98f1aff59803e4";

export default node;
