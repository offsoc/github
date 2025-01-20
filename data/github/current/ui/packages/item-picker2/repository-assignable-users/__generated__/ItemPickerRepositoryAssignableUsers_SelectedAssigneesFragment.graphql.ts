/**
 * @generated SignedSource<<0a28ab8dea283f9dd6331cd8951c92f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly avatarUrl: string;
    readonly id: string;
    readonly login: string;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsersItem_Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment";
};
export type ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment$key = {
  readonly " $data"?: ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment">;
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
  "name": "ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment",
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
          "name": "ItemPickerRepositoryAssignableUsersItem_Fragment",
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

(node as any).hash = "8407854728e9ad1f14f437f47034aafa";

export default node;
