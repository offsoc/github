/**
 * @generated SignedSource<<3c7f8247f73fdd286e586860f6645b3e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerRepositoryAssignableUsersBoxItem_Fragment$data = {
  readonly avatarUrl: string;
  readonly login: string;
  readonly " $fragmentType": "ItemPickerRepositoryAssignableUsersBoxItem_Fragment";
};
export type ItemPickerRepositoryAssignableUsersBoxItem_Fragment$key = {
  readonly " $data"?: ItemPickerRepositoryAssignableUsersBoxItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsersBoxItem_Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerRepositoryAssignableUsersBoxItem_Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 64
        }
      ],
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": "avatarUrl(size:64)"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "07907f8a811a0ee36a80d643e161ea8a";

export default node;
