/**
 * @generated SignedSource<<3eda6276acd4f4170a4fe3ebd69c3252>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssueTitle_TitleValue$data = {
  readonly title: string;
  readonly titleHTML: string;
  readonly " $fragmentType": "SubIssueTitle_TitleValue";
};
export type SubIssueTitle_TitleValue$key = {
  readonly " $data"?: SubIssueTitle_TitleValue$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubIssueTitle_TitleValue">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubIssueTitle_TitleValue",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "titleHTML",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "e376c37263bb0bff11cb5ab377b21c80";

export default node;
