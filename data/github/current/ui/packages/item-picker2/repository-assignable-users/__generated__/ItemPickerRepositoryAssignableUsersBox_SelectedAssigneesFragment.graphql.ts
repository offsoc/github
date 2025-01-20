/**
 * @generated SignedSource<<6c735b0af6ea691d77aea969e8ed01be>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsersBoxItem_Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment">;
  readonly " $fragmentType": "ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment";
};
export type ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment$key = {
  readonly " $data"?: ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerRepositoryAssignableUsersBox_SelectedAssigneesFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ItemPickerRepositoryAssignableUsersBoxItem_Fragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserConnection",
  "abstractKey": null
};

(node as any).hash = "258488d6daecd5ada1b18c59211ab928";

export default node;
