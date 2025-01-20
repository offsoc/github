/**
 * @generated SignedSource<<58cffa400c2e90555908c377491ef475>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerRepositoryItem_Fragment$data = {
  readonly id: string;
  readonly nameWithOwner: string;
  readonly owner: {
    readonly avatarUrl: string;
  };
  readonly " $fragmentType": "ItemPickerRepositoryItem_Fragment";
};
export type ItemPickerRepositoryItem_Fragment$key = {
  readonly " $data"?: ItemPickerRepositoryItem_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryItem_Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerRepositoryItem_Fragment",
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
      "name": "nameWithOwner",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
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
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "b69b2c403c8effa0974b7776df770117";

export default node;
