/**
 * @generated SignedSource<<450413911411d57b152c35a75c073306>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjects_SelectedProjectsV2Fragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly __typename: "ProjectV2";
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ProjectV2Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerProjects_SelectedProjectsV2Fragment";
};
export type ItemPickerProjects_SelectedProjectsV2Fragment$key = {
  readonly " $data"?: ItemPickerProjects_SelectedProjectsV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedProjectsV2Fragment">;
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
  "name": "ItemPickerProjects_SelectedProjectsV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ItemPickerProjectsItem_ProjectV2Fragment",
          "selections": [
            (v0/*: any*/),
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
              "name": "title",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "closed",
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
  "type": "ProjectV2Connection",
  "abstractKey": null
};
})();

(node as any).hash = "322db47e2e0db978d35db247832f93a3";

export default node;
