/**
 * @generated SignedSource<<2e034a2c9c7dd320ecc68e5afd35088d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewMenu_user$data = {
  readonly login: string;
  readonly " $fragmentType": "ReviewMenu_user";
};
export type ReviewMenu_user$key = {
  readonly " $data"?: ReviewMenu_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewMenu_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReviewMenu_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "d87d6ab10ea8b1db328c2aa694acc27d";

export default node;
