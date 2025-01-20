/**
 * @generated SignedSource<<408a4069b3af3eae16c99cb61b9b50e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueTimelineSecondary$data = {
  readonly isTransferInProgress: boolean;
  readonly " $fragmentType": "IssueTimelineSecondary";
};
export type IssueTimelineSecondary$key = {
  readonly " $data"?: IssueTimelineSecondary$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTimelineSecondary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTimelineSecondary",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isTransferInProgress",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "4fde3787162ec8f1fd60c73d217127c7";

export default node;
