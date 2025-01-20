/**
 * @generated SignedSource<<c97b0f7a465254a5b7a628612a459813>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderRightSideContent_user$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ReviewMenu_user">;
  readonly " $fragmentType": "HeaderRightSideContent_user";
};
export type HeaderRightSideContent_user$key = {
  readonly " $data"?: HeaderRightSideContent_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderRightSideContent_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderRightSideContent_user",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ReviewMenu_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "86ffb0e4ac07a7812f63c5180f08e923";

export default node;
