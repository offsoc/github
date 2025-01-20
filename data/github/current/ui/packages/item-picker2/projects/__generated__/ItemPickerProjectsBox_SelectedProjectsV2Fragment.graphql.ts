/**
 * @generated SignedSource<<54e3e1569d1681c6634ecc1f14c3912e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsBox_SelectedProjectsV2Fragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly __typename: "ProjectV2";
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBoxItem_V2Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedProjectsV2Fragment">;
  readonly " $fragmentType": "ItemPickerProjectsBox_SelectedProjectsV2Fragment";
};
export type ItemPickerProjectsBox_SelectedProjectsV2Fragment$key = {
  readonly " $data"?: ItemPickerProjectsBox_SelectedProjectsV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBox_SelectedProjectsV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerProjectsBox_SelectedProjectsV2Fragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ItemPickerProjects_SelectedProjectsV2Fragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ItemPickerProjectsBoxItem_V2Fragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectV2Connection",
  "abstractKey": null
};

(node as any).hash = "012233a170390b40f8831d37c87ff573";

export default node;
