/**
 * @generated SignedSource<<35f84c4072ed2be080e93c7dbd399a78>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueSidebarPrimaryQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AssigneesSectionFragment" | "LabelsSectionFragment" | "MilestonesSectionFragment" | "OptionsSectionFragment" | "ProjectsSectionFragment">;
  readonly " $fragmentType": "IssueSidebarPrimaryQuery";
};
export type IssueSidebarPrimaryQuery$key = {
  readonly " $data"?: IssueSidebarPrimaryQuery$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSidebarPrimaryQuery">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "allowedOwner"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSidebarPrimaryQuery",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AssigneesSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "LabelsSectionFragment"
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "allowedOwner",
          "variableName": "allowedOwner"
        }
      ],
      "kind": "FragmentSpread",
      "name": "ProjectsSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MilestonesSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "OptionsSectionFragment"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "da68c5b89ed93eb3b51ee364a02883a8";

export default node;
