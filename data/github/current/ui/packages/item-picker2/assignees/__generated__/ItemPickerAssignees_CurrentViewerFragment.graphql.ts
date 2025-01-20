/**
 * @generated SignedSource<<6616c605b7e885d2062d1f0df8793a13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerAssignees_CurrentViewerFragment$data = {
  readonly id: string;
  readonly login: string;
  readonly name: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssigneesItem_Fragment">;
  readonly " $fragmentType": "ItemPickerAssignees_CurrentViewerFragment";
};
export type ItemPickerAssignees_CurrentViewerFragment$key = {
  readonly " $data"?: ItemPickerAssignees_CurrentViewerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssignees_CurrentViewerFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerAssignees_CurrentViewerFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
    {
      "kind": "InlineDataFragmentSpread",
      "name": "ItemPickerAssigneesItem_Fragment",
      "selections": [
        (v0/*: any*/),
        (v2/*: any*/),
        (v1/*: any*/),
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
      "args": null,
      "argumentDefinitions": []
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

(node as any).hash = "2daca8375a2203e37cccbd072d8bc597";

export default node;
