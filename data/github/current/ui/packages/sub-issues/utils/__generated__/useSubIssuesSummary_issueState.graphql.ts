/**
 * @generated SignedSource<<ac366beb298ff9d7e55918580f0b4dec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useSubIssuesSummary_issueState$data = {
  readonly closed: boolean;
  readonly " $fragmentType": "useSubIssuesSummary_issueState";
};
export type useSubIssuesSummary_issueState$key = {
  readonly " $data"?: useSubIssuesSummary_issueState$data;
  readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary_issueState">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useSubIssuesSummary_issueState",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "closed",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "515e31dab563432fdb7cf114f8ecc2d8";

export default node;
