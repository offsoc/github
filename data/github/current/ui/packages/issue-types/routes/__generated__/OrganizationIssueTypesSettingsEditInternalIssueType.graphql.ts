/**
 * @generated SignedSource<<644aab88ca08470faff27a43cd6e9018>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OrganizationIssueTypesSettingsEditInternalIssueType$data = {
  readonly color: IssueTypeColor;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly isEnabled: boolean;
  readonly isPrivate: boolean;
  readonly name: string;
  readonly " $fragmentSpreads": FragmentRefs<"DangerZoneIssueType">;
  readonly " $fragmentType": "OrganizationIssueTypesSettingsEditInternalIssueType";
};
export type OrganizationIssueTypesSettingsEditInternalIssueType$key = {
  readonly " $data"?: OrganizationIssueTypesSettingsEditInternalIssueType$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrganizationIssueTypesSettingsEditInternalIssueType">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OrganizationIssueTypesSettingsEditInternalIssueType",
  "selections": [
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
      "name": "id",
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
      "name": "isEnabled",
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
      "name": "color",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DangerZoneIssueType"
    }
  ],
  "type": "IssueType",
  "abstractKey": null
};

(node as any).hash = "a3aa72733453ddbf2e67386d4a060f6a";

export default node;
