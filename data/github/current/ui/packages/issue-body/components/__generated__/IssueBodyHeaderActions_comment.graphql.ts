/**
 * @generated SignedSource<<9062eb19cc13593023a8b2c5032b1f66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyHeaderActions_comment$data = {
  readonly body: string;
  readonly " $fragmentType": "IssueBodyHeaderActions_comment";
};
export type IssueBodyHeaderActions_comment$key = {
  readonly " $data"?: IssueBodyHeaderActions_comment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderActions_comment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyHeaderActions_comment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
};

(node as any).hash = "e65d1b4543dae8f62c447cba44e163f1";

export default node;
