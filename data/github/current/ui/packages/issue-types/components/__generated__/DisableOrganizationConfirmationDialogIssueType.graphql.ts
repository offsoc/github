/**
 * @generated SignedSource<<fe3c2faa2c6924acf006bc430094168e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DisableOrganizationConfirmationDialogIssueType$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "DisableOrganizationConfirmationDialogIssueType";
};
export type DisableOrganizationConfirmationDialogIssueType$key = {
  readonly " $data"?: DisableOrganizationConfirmationDialogIssueType$data;
  readonly " $fragmentSpreads": FragmentRefs<"DisableOrganizationConfirmationDialogIssueType">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DisableOrganizationConfirmationDialogIssueType",
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
  "type": "IssueType",
  "abstractKey": null
};

(node as any).hash = "56fb5c3668aba5427262642896139415";

export default node;
