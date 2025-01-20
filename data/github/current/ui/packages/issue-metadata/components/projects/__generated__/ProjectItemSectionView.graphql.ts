/**
 * @generated SignedSource<<94f8593842326a8d73d132f1cd97c3da>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSectionView$data = {
  readonly fieldValueByName: {
    readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldFragment">;
  } | null | undefined;
  readonly id: string;
  readonly isArchived: boolean;
  readonly project: {
    readonly field: {
      readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldConfigFragment">;
    } | null | undefined;
    readonly id: string;
    readonly template: boolean;
    readonly title: string;
    readonly url: string;
    readonly viewerCanUpdate: boolean;
  };
  readonly " $fragmentType": "ProjectItemSectionView";
};
export type ProjectItemSectionView$key = {
  readonly " $data"?: ProjectItemSectionView$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionView">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectItemSectionView",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isArchived",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
          "name": "template",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerCanUpdate",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": null,
          "kind": "LinkedField",
          "name": "field",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "SingleSelectFieldConfigFragment"
            }
          ],
          "storageKey": "field(name:\"Status\")"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v1/*: any*/),
      "concreteType": null,
      "kind": "LinkedField",
      "name": "fieldValueByName",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "SingleSelectFieldFragment"
        }
      ],
      "storageKey": "fieldValueByName(name:\"Status\")"
    }
  ],
  "type": "ProjectV2Item",
  "abstractKey": null
};
})();

(node as any).hash = "005be940f57508283adca42ec12256ba";

export default node;
