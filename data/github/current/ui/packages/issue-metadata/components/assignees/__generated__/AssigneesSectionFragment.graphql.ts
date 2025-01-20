/**
 * @generated SignedSource<<4855b7fa92ba7d68b723fe7537375f4e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AssigneesSectionFragment$data = {
  readonly id: string;
  readonly number: number;
  readonly repository: {
    readonly isArchived: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
    readonly planFeatures: {
      readonly maximumAssignees: number;
    };
  };
  readonly viewerCanAssign: boolean;
  readonly viewerCanUpdateNext: boolean | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AssigneesSectionAssignees">;
  readonly " $fragmentType": "AssigneesSectionFragment";
};
export type AssigneesSectionFragment$key = {
  readonly " $data"?: AssigneesSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AssigneesSectionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AssigneesSectionFragment",
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
      "name": "number",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
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
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isArchived",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "RepositoryPlanFeatures",
          "kind": "LinkedField",
          "name": "planFeatures",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "maximumAssignees",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AssigneesSectionAssignees"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUpdateNext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanAssign",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "f0941787e3a0595d3f1cde06af4d2e01";

export default node;
