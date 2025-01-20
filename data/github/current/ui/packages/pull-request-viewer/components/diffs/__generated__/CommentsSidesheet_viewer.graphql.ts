/**
 * @generated SignedSource<<87e5c862bc89239a386ad2338b0afea7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentsSidesheet_viewer$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ThreadPreview_viewer">;
  readonly " $fragmentType": "CommentsSidesheet_viewer";
};
export type CommentsSidesheet_viewer$key = {
  readonly " $data"?: CommentsSidesheet_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommentsSidesheet_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommentsSidesheet_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ThreadPreview_viewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "282e5e14e2f286f43e40b1f6d8607b72";

export default node;
