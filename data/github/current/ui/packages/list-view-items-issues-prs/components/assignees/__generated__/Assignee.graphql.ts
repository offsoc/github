/**
 * @generated SignedSource<<18b4f85e6baf37cab359d1b2967e4d0e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Assignee$data = {
  readonly avatarUrl: string;
  readonly login: string;
  readonly " $fragmentType": "Assignee";
};
export type Assignee$key = {
  readonly " $data"?: Assignee$data;
  readonly " $fragmentSpreads": FragmentRefs<"Assignee">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Assignee",
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
          "value": 64
        }
      ],
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": "avatarUrl(size:64)"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "5d99c7ac83be582f444afc5c42c23070";

export default node;
