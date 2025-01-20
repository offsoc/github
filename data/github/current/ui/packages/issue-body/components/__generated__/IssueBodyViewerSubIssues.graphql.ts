/**
 * @generated SignedSource<<18268b358a9ceb4d73d784b2537b718f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyViewerSubIssues$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AddSubIssueButtonGroup" | "useCanEditSubIssues" | "useHasSubIssues">;
  readonly " $fragmentType": "IssueBodyViewerSubIssues";
};
export type IssueBodyViewerSubIssues$key = {
  readonly " $data"?: IssueBodyViewerSubIssues$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyViewerSubIssues">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyViewerSubIssues",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useCanEditSubIssues"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useHasSubIssues"
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "fetchSubIssues",
          "value": false
        }
      ],
      "kind": "FragmentSpread",
      "name": "AddSubIssueButtonGroup"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "ffe6c65fee4a26af6f1e00275849906c";

export default node;
