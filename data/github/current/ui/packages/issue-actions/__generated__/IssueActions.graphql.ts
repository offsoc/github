/**
 * @generated SignedSource<<279552feb97dcbbbeec5567390a66873>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueActions$data = {
  readonly " $fragmentSpreads": FragmentRefs<"IssueActionsState">;
  readonly " $fragmentType": "IssueActions";
};
export type IssueActions$key = {
  readonly " $data"?: IssueActions$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueActions">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueActions",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueActionsState"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "2d5dba4e9b26988ef6d02616663b6de0";

export default node;
