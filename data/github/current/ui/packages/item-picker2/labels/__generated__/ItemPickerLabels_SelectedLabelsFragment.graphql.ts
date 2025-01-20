/**
 * @generated SignedSource<<ad77339fae3ad32a05489f746c2c9922>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabels_SelectedLabelsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsItem_Fragment">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "ItemPickerLabels_SelectedLabelsFragment";
};
export type ItemPickerLabels_SelectedLabelsFragment$key = {
  readonly " $data"?: ItemPickerLabels_SelectedLabelsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabels_SelectedLabelsFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "defaultValue": false,
    "kind": "LocalArgument",
    "name": "withDate"
  },
  {
    "defaultValue": false,
    "kind": "LocalArgument",
    "name": "withPath"
  }
];
return {
  "argumentDefinitions": (v0/*: any*/),
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerLabels_SelectedLabelsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Label",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "kind": "InlineDataFragmentSpread",
          "name": "ItemPickerLabelsItem_Fragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nameHTML",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "color",
              "storageKey": null
            },
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
              "name": "description",
              "storageKey": null
            },
            {
              "condition": "withPath",
              "kind": "Condition",
              "passingValue": true,
              "selections": [
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "ItemPickerLabelsItem_PathFragment",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "url",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "resourcePath",
                      "storageKey": null
                    }
                  ],
                  "args": null,
                  "argumentDefinitions": []
                }
              ]
            },
            {
              "condition": "withDate",
              "kind": "Condition",
              "passingValue": true,
              "selections": [
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "ItemPickerLabelsItem_DateFragment",
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "createdAt",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "updatedAt",
                      "storageKey": null
                    }
                  ],
                  "args": null,
                  "argumentDefinitions": []
                }
              ]
            }
          ],
          "args": [
            {
              "kind": "Variable",
              "name": "withDate",
              "variableName": "withDate"
            },
            {
              "kind": "Variable",
              "name": "withPath",
              "variableName": "withPath"
            }
          ],
          "argumentDefinitions": (v0/*: any*/)
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LabelConnection",
  "abstractKey": null
};
})();

(node as any).hash = "1cbd81688b83a8972ea83304088dab1e";

export default node;
