/**
 * @generated SignedSource<<c93a34504ab0ad795b9ab609cd4c2d9b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditHistoryDialogHeaderFragment$data = {
  readonly deletedAt: string | null | undefined;
  readonly editedAt: string;
  readonly editor: {
    readonly avatarUrl: string;
    readonly login: string;
  } | null | undefined;
  readonly firstEdit: boolean;
  readonly newest: boolean;
  readonly viewerCanDelete: boolean;
  readonly " $fragmentType": "EditHistoryDialogHeaderFragment";
};
export type EditHistoryDialogHeaderFragment$key = {
  readonly " $data"?: EditHistoryDialogHeaderFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditHistoryDialogHeaderFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditHistoryDialogHeaderFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "editor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "avatarUrl",
          "storageKey": null
        },
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
      "name": "deletedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "editedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "newest",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstEdit",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanDelete",
      "storageKey": null
    }
  ],
  "type": "UserContentEdit",
  "abstractKey": null
};

(node as any).hash = "173b0fbf2e248d6057ccd670ace2eea7";

export default node;
