/**
 * @generated SignedSource<<bef8a3909f30732834530798a99a3973>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OptionsSectionSecondary$data = {
  readonly isTransferInProgress: boolean;
  readonly " $fragmentType": "OptionsSectionSecondary";
};
export type OptionsSectionSecondary$key = {
  readonly " $data"?: OptionsSectionSecondary$data;
  readonly " $fragmentSpreads": FragmentRefs<"OptionsSectionSecondary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OptionsSectionSecondary",
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

(node as any).hash = "37235901f5bd1b8bca0d6f9f465df52e";

export default node;
