/**
 * @generated SignedSource<<715c15db69ccdd5520d3c586d1b7e594>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSection$data = {
  readonly id: string;
  readonly isArchived: boolean;
  readonly project: {
    readonly id: string;
  };
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionView">;
  readonly " $fragmentType": "ProjectItemSection";
};
export type ProjectItemSection$key = {
  readonly " $data"?: ProjectItemSection$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSection">;
};

const node: ReaderFragment = (function(){
var v0 = {
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
  "name": "ProjectItemSection",
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
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectItemSectionView"
    }
  ],
  "type": "ProjectV2Item",
  "abstractKey": null
};
})();

(node as any).hash = "d514f44f54887c87d0f242aa077953b2";

export default node;
