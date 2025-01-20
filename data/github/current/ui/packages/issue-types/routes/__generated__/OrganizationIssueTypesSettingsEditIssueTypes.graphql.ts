/**
 * @generated SignedSource<<dccf07525b5065d56cf8e130269104a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrganizationIssueTypesSettingsEditIssueTypes$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "OrganizationIssueTypesSettingsEditIssueTypes";
};
export type OrganizationIssueTypesSettingsEditIssueTypes$key = {
  readonly " $data"?: OrganizationIssueTypesSettingsEditIssueTypes$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrganizationIssueTypesSettingsEditIssueTypes">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OrganizationIssueTypesSettingsEditIssueTypes",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueTypeEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "IssueType",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
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
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "IssueTypeConnection",
  "abstractKey": null
};

(node as any).hash = "aad3f3c3a5280834349ec8ee699957fc";

export default node;
