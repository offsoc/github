/**
 * @generated SignedSource<<6b539c960b5b42bd5b54d1279bf92a66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerPullRequestsAndBranches_SelectedBranchesFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly ref: {
      readonly __typename: "Ref";
      readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranchesItem_BranchFragment">;
    } | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerPullRequestsAndBranches_SelectedBranchesFragment";
};
export type ItemPickerPullRequestsAndBranches_SelectedBranchesFragment$key = {
  readonly " $data"?: ItemPickerPullRequestsAndBranches_SelectedBranchesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranches_SelectedBranchesFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerPullRequestsAndBranches_SelectedBranchesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "LinkedBranch",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Ref",
          "kind": "LinkedField",
          "name": "ref",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "kind": "InlineDataFragmentSpread",
              "name": "ItemPickerPullRequestsAndBranchesItem_BranchFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                (v0/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "args": null,
              "argumentDefinitions": []
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LinkedBranchConnection",
  "abstractKey": null
};
})();

(node as any).hash = "e5a30c82bcf0298c6d0d91907ef31275";

export default node;
