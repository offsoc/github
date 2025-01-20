/**
 * @generated SignedSource<<05beb59e780e528b9ad7df4ea7436f48>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerAssignees_SelectedAssigneesFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly avatarUrl: string;
    readonly id: string;
    readonly login: string;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssigneesItem_Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerAssignees_SelectedAssigneesFragment";
};
export type ItemPickerAssignees_SelectedAssigneesFragment$key = {
  readonly " $data"?: ItemPickerAssignees_SelectedAssigneesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerAssignees_SelectedAssigneesFragment">;
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
},
v3 = {
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerAssignees_SelectedAssigneesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        (v2/*: any*/),
        (v3/*: any*/),
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ItemPickerAssigneesItem_Fragment",
          "selections": [
            (v0/*: any*/),
            (v2/*: any*/),
            (v1/*: any*/),
            (v3/*: any*/)
          ],
          "args": null,
          "argumentDefinitions": []
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserConnection",
  "abstractKey": null
};
})();

(node as any).hash = "cde7475b98203c8d3d382eee83f18542";

export default node;
