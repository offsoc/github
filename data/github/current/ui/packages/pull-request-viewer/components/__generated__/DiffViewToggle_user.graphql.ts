/**
 * @generated SignedSource<<f5025941ef33d0240a726d0c81c073c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffViewToggle_user$data = {
  readonly id: string;
  readonly pullRequestUserPreferences: {
    readonly diffView: string;
  };
  readonly " $fragmentType": "DiffViewToggle_user";
};
export type DiffViewToggle_user$key = {
  readonly " $data"?: DiffViewToggle_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffViewToggle_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffViewToggle_user",
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
      "concreteType": "PullRequestUserPreferences",
      "kind": "LinkedField",
      "name": "pullRequestUserPreferences",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "diffView",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "f5a99c38d552211e795f84734c0fc5c0";

export default node;
