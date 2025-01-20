/**
 * @generated SignedSource<<24d78e3bb45bced66642baa3b1a02121>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjects_SelectedClassicProjectCardsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly project: {
      readonly __typename: "Project";
      readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsItem_ClassicProjectFragment">;
    };
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerProjects_SelectedClassicProjectCardsFragment";
};
export type ItemPickerProjects_SelectedClassicProjectCardsFragment$key = {
  readonly " $data"?: ItemPickerProjects_SelectedClassicProjectCardsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedClassicProjectCardsFragment">;
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
  "name": "ItemPickerProjects_SelectedClassicProjectCardsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCard",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Project",
          "kind": "LinkedField",
          "name": "project",
          "plural": false,
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
      "storageKey": null
    }
  ],
  "type": "ProjectCardConnection",
  "abstractKey": null
};
})();

(node as any).hash = "c1524cfa78dcc09732ca2ed617acf889";

export default node;
