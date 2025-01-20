/**
 * @generated SignedSource<<61c5e1d358168bf728c917a976fd06a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeletionConfirmationDialogIssueType$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "DeletionConfirmationDialogIssueType";
};
export type DeletionConfirmationDialogIssueType$key = {
  readonly " $data"?: DeletionConfirmationDialogIssueType$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeletionConfirmationDialogIssueType">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeletionConfirmationDialogIssueType",
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

(node as any).hash = "8595f18eccc3384ad8eb0872a1977801";

export default node;
