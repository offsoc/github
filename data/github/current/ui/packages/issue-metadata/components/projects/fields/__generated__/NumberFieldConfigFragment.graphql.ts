/**
 * @generated SignedSource<<2f7a725610fc61b81ed4ebfdb14e393f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NumberFieldConfigFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "NumberFieldConfigFragment";
};
export type NumberFieldConfigFragment$key = {
  readonly " $data"?: NumberFieldConfigFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"NumberFieldConfigFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NumberFieldConfigFragment",
  "selections": [
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "ProjectV2Field",
  "abstractKey": null
};

(node as any).hash = "aa7c72083a9ec843850d1089ba1ddda3";

export default node;
