/**
 * @generated SignedSource<<fb6b57942e4149ece030dda8964564bc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BlobActionsMenu_diffEntry$data = {
  readonly id: string;
  readonly isBinary: boolean;
  readonly isLfsPointer: boolean;
  readonly isSubmodule: boolean;
  readonly oid: string;
  readonly path: string;
  readonly status: PatchStatus;
  readonly " $fragmentType": "BlobActionsMenu_diffEntry";
};
export type BlobActionsMenu_diffEntry$key = {
  readonly " $data"?: BlobActionsMenu_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlobActionsMenu_diffEntry">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlobActionsMenu_diffEntry",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "oid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isSubmodule",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isBinary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isLfsPointer",
      "storageKey": null
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};

(node as any).hash = "cd9b1bc39bd37af0692857819292464c";

export default node;
