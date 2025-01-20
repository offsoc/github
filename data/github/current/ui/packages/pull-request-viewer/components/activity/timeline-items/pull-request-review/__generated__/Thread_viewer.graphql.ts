/**
 * @generated SignedSource<<67aeb7ef8874d3aa62740657e78777a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Thread_viewer$data = {
  readonly avatarUrl: string;
  readonly isSiteAdmin: boolean;
  readonly login: string;
  readonly pullRequestUserPreferences: {
    readonly diffView: string;
    readonly tabSize: number;
  };
  readonly " $fragmentType": "Thread_viewer";
};
export type Thread_viewer$key = {
  readonly " $data"?: Thread_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"Thread_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Thread_viewer",
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
      "concreteType": "PullRequestUserPreferences",
      "kind": "LinkedField",
      "name": "pullRequestUserPreferences",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tabSize",
          "storageKey": null
        },
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

(node as any).hash = "50969ca3ab62a204b03118e0f4624724";

export default node;
