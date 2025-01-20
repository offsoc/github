/**
 * @generated SignedSource<<5ff02b8a4fc5738f5f5a0b0ff2edc83d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueTypesListItem$data = {
  readonly color: IssueTypeColor;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly isEnabled: boolean;
  readonly isPrivate: boolean;
  readonly name: string;
  readonly " $fragmentSpreads": FragmentRefs<"DeletionConfirmationDialogIssueType" | "DisableOrganizationConfirmationDialogIssueType" | "IssueTypeItemMenuItem">;
  readonly " $fragmentType": "IssueTypesListItem";
};
export type IssueTypesListItem$key = {
  readonly " $data"?: IssueTypesListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypesListItem">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypesListItem",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEnabled",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "color",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DisableOrganizationConfirmationDialogIssueType"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeletionConfirmationDialogIssueType"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueTypeItemMenuItem"
    }
  ],
  "type": "IssueType",
  "abstractKey": null
};

(node as any).hash = "af31e17ee789d88af1b215762b568d43";

export default node;
