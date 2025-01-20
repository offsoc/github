/**
 * @generated SignedSource<<285fc36618be6936feafdce42d4ac9a4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerProjectsBox_SelectedClassicProjectCardsFragment$data = {
  readonly nodes: ReadonlyArray<{
    readonly project: {
      readonly __typename: "Project";
      readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBoxItem_ClassicFragment">;
    };
  } | null | undefined> | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjects_SelectedClassicProjectCardsFragment">;
  readonly " $fragmentType": "ItemPickerProjectsBox_SelectedClassicProjectCardsFragment";
};
export type ItemPickerProjectsBox_SelectedClassicProjectCardsFragment$key = {
  readonly " $data"?: ItemPickerProjectsBox_SelectedClassicProjectCardsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerProjectsBox_SelectedClassicProjectCardsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemPickerProjectsBox_SelectedClassicProjectCardsFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ItemPickerProjects_SelectedClassicProjectCardsFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCard",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Project",
          "kind": "LinkedField",
          "name": "project",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ItemPickerProjectsBoxItem_ClassicFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectCardConnection",
  "abstractKey": null
};

(node as any).hash = "4be0fd5e42f01105dc814c05dc422212";

export default node;
