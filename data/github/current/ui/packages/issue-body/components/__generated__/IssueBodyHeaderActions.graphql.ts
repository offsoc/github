/**
 * @generated SignedSource<<e39e2c1ec66d5569c83cd1ea145e225a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyHeaderActions$data = {
  readonly id: string;
  readonly login: string;
  readonly " $fragmentType": "IssueBodyHeaderActions";
};
export type IssueBodyHeaderActions$key = {
  readonly " $data"?: IssueBodyHeaderActions$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderActions">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyHeaderActions",
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
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

(node as any).hash = "af464fc5623314887f9e8cdfaf758d94";

export default node;
