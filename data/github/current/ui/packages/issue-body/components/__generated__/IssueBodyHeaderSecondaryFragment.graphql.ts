/**
 * @generated SignedSource<<9f891732af87c80a2c7a2ad34738f03e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyHeaderSecondaryFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"MarkdownEditHistoryViewer_comment">;
  readonly " $fragmentType": "IssueBodyHeaderSecondaryFragment";
};
export type IssueBodyHeaderSecondaryFragment$key = {
  readonly " $data"?: IssueBodyHeaderSecondaryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderSecondaryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyHeaderSecondaryFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MarkdownEditHistoryViewer_comment"
    }
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
};

(node as any).hash = "faa0831b84ae48810a496ad9fd432bf1";

export default node;
