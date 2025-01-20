/**
 * @generated SignedSource<<8c2b7e1175be5559dc78f0bb81889884>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitDiffHeading_viewer$data = {
  readonly login: string;
  readonly " $fragmentType": "CommitDiffHeading_viewer";
};
export type CommitDiffHeading_viewer$key = {
  readonly " $data"?: CommitDiffHeading_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommitDiffHeading_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommitDiffHeading_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "1244df7fb214171f6ab2a9961a8cd136";

export default node;
