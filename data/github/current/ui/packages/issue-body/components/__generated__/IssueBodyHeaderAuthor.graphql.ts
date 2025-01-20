/**
 * @generated SignedSource<<a77b42f64b02372d583971dd1e44bd5c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyHeaderAuthor$data = {
  readonly avatarUrl: string;
  readonly login: string;
  readonly profileUrl: string | null | undefined;
  readonly " $fragmentType": "IssueBodyHeaderAuthor";
};
export type IssueBodyHeaderAuthor$key = {
  readonly " $data"?: IssueBodyHeaderAuthor$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderAuthor">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyHeaderAuthor",
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
      "name": "avatarUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "profileUrl",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

(node as any).hash = "9235766949b11a26729ebc473df98aea";

export default node;
