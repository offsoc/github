/**
 * @generated SignedSource<<04e5dea62cbea88cfc9382d3229140f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffLines_viewer$data = {
  readonly avatarUrl: string;
  readonly isSiteAdmin: boolean;
  readonly login: string;
  readonly pullRequestUserPreferences: {
    readonly diffView: string;
    readonly tabSize: number;
  };
  readonly " $fragmentType": "DiffLines_viewer";
};
export type DiffLines_viewer$key = {
  readonly " $data"?: DiffLines_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffLines_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffLines_viewer",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 48
        }
      ],
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": "avatarUrl(size:48)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isSiteAdmin",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tabSize",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "c6dd7a731df3e695ee2c28cfca16628d";

export default node;
