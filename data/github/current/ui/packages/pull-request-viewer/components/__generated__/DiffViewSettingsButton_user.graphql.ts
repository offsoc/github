/**
 * @generated SignedSource<<53f4617b01b965491c5b87e37d016fc1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffViewSettingsButton_user$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DiffViewToggle_user">;
  readonly " $fragmentType": "DiffViewSettingsButton_user";
};
export type DiffViewSettingsButton_user$key = {
  readonly " $data"?: DiffViewSettingsButton_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffViewSettingsButton_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffViewSettingsButton_user",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffViewToggle_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "cc0fdd1d63353d2271fcbf8d09846f1d";

export default node;
