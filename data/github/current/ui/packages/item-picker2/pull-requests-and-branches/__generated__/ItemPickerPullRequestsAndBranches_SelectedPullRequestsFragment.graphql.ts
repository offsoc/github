/**
 * @generated SignedSource<<65535cf8a8e1d118e7399c07de818744>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly __typename: "PullRequest";
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranchesItem_PullRequestFragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment";
};
export type ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment$key = {
  readonly " $data"?: ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment">;
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
  "name": "ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequest",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ItemPickerPullRequestsAndBranchesItem_PullRequestFragment",
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
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "title",
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
  "type": "PullRequestConnection",
  "abstractKey": null
};
})();

(node as any).hash = "5472c3f8aa4f6deaf3f51f1f9df1e5b0";

export default node;
