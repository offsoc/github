/**
 * @generated SignedSource<<1f180208ff4d282bccedc9d7de7c55f8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjects_SelectedClassicProjectsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly __typename: "Project";
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ClassicProjectFragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerProjects_SelectedClassicProjectsFragment";
};
export type ItemPickerProjects_SelectedClassicProjectsFragment$key = {
  readonly " $data"?: ItemPickerProjects_SelectedClassicProjectsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedClassicProjectsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerProjects_SelectedClassicProjectsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Project",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ItemPickerProjectsItem_ClassicProjectFragment",
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "alias": "title",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "closed",
              "storageKey": null
            },
            {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "first",
                  "value": 10
                }
              ],
              "concreteType": "ProjectColumnConnection",
              "kind": "LinkedField",
              "name": "columns",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ProjectColumnEdge",
                  "kind": "LinkedField",
                  "name": "edges",
                  "plural": true,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "ProjectColumn",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v1/*: any*/)
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": "columns(first:10)"
            }
          ],
          "args": null,
          "argumentDefinitions": []
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectConnection",
  "abstractKey": null
};
})();

(node as any).hash = "83245aafdd32a4c8557a12cd283ba445";

export default node;
