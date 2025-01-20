/**
 * @generated SignedSource<<911deceadca8fcb819e32f8871b41472>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsBox_SelectedClassicProjectsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly __typename: "Project";
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBoxItem_ClassicFragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedClassicProjectsFragment">;
  readonly " $fragmentType": "ItemPickerProjectsBox_SelectedClassicProjectsFragment";
};
export type ItemPickerProjectsBox_SelectedClassicProjectsFragment$key = {
  readonly " $data"?: ItemPickerProjectsBox_SelectedClassicProjectsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBox_SelectedClassicProjectsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerProjectsBox_SelectedClassicProjectsFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ItemPickerProjects_SelectedClassicProjectsFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Project",
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
          "name": "ItemPickerProjectsBoxItem_ClassicFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectConnection",
  "abstractKey": null
};

(node as any).hash = "3bb0e3a21db9ca6fd04bac72baecc45b";

export default node;
