/**
 * @generated SignedSource<<708c9f81ef237ae7d775ced0352b7143>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuesShowFragment$data = {
  readonly number: number;
  readonly title: string;
  readonly " $fragmentType": "IssuesShowFragment";
};
export type IssuesShowFragment$key = {
  readonly " $data"?: IssuesShowFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuesShowFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuesShowFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "number",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "49197d74e9d1f0906438af2e79557dd9";

export default node;
