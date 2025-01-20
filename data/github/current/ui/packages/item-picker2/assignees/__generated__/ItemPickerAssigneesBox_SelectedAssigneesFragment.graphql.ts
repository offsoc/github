/**
 * @generated SignedSource<<8bd1b8a6529460d6986db025cedf2a3b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerAssigneesBox_SelectedAssigneesFragment$data = {
  readonly assignees: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssigneesBoxItem_Fragment">;
    } | null | undefined> | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssignees_SelectedAssigneesFragment">;
  };
  readonly " $fragmentType": "ItemPickerAssigneesBox_SelectedAssigneesFragment";
};
export type ItemPickerAssigneesBox_SelectedAssigneesFragment$key = {
  readonly " $data"?: ItemPickerAssigneesBox_SelectedAssigneesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssigneesBox_SelectedAssigneesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerAssigneesBox_SelectedAssigneesFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 20
        }
      ],
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "assignees",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ItemPickerAssignees_SelectedAssigneesFragment"
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
              "name": "ItemPickerAssigneesBoxItem_Fragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "assignees(first:20)"
    }
  ],
  "type": "Assignable",
  "abstractKey": "__isAssignable"
};

(node as any).hash = "2e77064097a088a10686c539f4667365";

export default node;
