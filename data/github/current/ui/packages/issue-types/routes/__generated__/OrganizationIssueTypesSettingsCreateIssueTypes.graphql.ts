/**
 * @generated SignedSource<<dcb197e5266876c8e4dba566abcf3cf8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrganizationIssueTypesSettingsCreateIssueTypes$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly name: string;
    } | null | undefined;
  } | null | undefined> | null | undefined;
  readonly totalCount: number;
  readonly " $fragmentType": "OrganizationIssueTypesSettingsCreateIssueTypes";
};
export type OrganizationIssueTypesSettingsCreateIssueTypes$key = {
  readonly " $data"?: OrganizationIssueTypesSettingsCreateIssueTypes$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrganizationIssueTypesSettingsCreateIssueTypes">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OrganizationIssueTypesSettingsCreateIssueTypes",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    },
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

(node as any).hash = "cf0fc0eb075756bdc468aeae2fe1e956";

export default node;
