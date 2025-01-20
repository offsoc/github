/**
 * @generated SignedSource<<b29114eb9e18fee58b018d600559b966>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileConversationsButton_viewer$data = {
  readonly avatarUrl: string;
  readonly login: string;
  readonly " $fragmentType": "FileConversationsButton_viewer";
};
export type FileConversationsButton_viewer$key = {
  readonly " $data"?: FileConversationsButton_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"FileConversationsButton_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FileConversationsButton_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    },
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "aa429cd53af8016d4064521c3d199532";

export default node;
