/**
 * @generated SignedSource<<d6d65b48abf129a2a055565d6fb54f24>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyViewer$data = {
  readonly id: string;
  readonly " $fragmentType": "IssueBodyViewer";
};
export type IssueBodyViewer$key = {
  readonly " $data"?: IssueBodyViewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyViewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyViewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
};

(node as any).hash = "91411b299197489bc0f55410e29d8f97";

export default node;
