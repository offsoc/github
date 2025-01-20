/**
 * @generated SignedSource<<3aa37f335a5f51f4d06b4110377bb816>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuesShowFragmentViewer$data = {
  readonly name: string | null | undefined;
  readonly " $fragmentType": "IssuesShowFragmentViewer";
};
export type IssuesShowFragmentViewer$key = {
  readonly " $data"?: IssuesShowFragmentViewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuesShowFragmentViewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuesShowFragmentViewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "1a805346918ee092ed8887e292701e99";

export default node;
