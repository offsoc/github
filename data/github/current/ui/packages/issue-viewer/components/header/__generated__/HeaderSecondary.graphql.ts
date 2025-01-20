/**
 * @generated SignedSource<<930a081286e164739e9f0b9eddb8e765>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderSecondary$data = {
  readonly isTransferInProgress: boolean;
  readonly " $fragmentType": "HeaderSecondary";
};
export type HeaderSecondary$key = {
  readonly " $data"?: HeaderSecondary$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderSecondary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderSecondary",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isTransferInProgress",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "58a7f4c970dd56751203ee21d03734e9";

export default node;
