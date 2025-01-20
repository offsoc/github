/**
 * @generated SignedSource<<2c266c78701e1f1907561d90eed2f9b0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeownersBadge_viewer$data = {
  readonly login: string;
  readonly " $fragmentType": "CodeownersBadge_viewer";
};
export type CodeownersBadge_viewer$key = {
  readonly " $data"?: CodeownersBadge_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeownersBadge_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CodeownersBadge_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "ca3d578e55dc933169bee6a1a902a574";

export default node;
