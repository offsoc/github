/**
 * @generated SignedSource<<34ae45acfa208974689068c807edbd0c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsBoxItem_V2Fragment$data = {
  readonly title: string;
  readonly url: string;
  readonly " $fragmentType": "ItemPickerProjectsBoxItem_V2Fragment";
};
export type ItemPickerProjectsBoxItem_V2Fragment$key = {
  readonly " $data"?: ItemPickerProjectsBoxItem_V2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBoxItem_V2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerProjectsBoxItem_V2Fragment",
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
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "ProjectV2",
  "abstractKey": null
};

(node as any).hash = "f81574920cb4539dcab5ba92b4d1679c";

export default node;
