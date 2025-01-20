/**
 * @generated SignedSource<<9acd519371db72cf4cd8b6faf4a86298>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffViewSettingsButton_pullRequest$data = {
  readonly " $fragmentSpreads": FragmentRefs<"HideWhitespace_pullRequest">;
  readonly " $fragmentType": "DiffViewSettingsButton_pullRequest";
};
export type DiffViewSettingsButton_pullRequest$key = {
  readonly " $data"?: DiffViewSettingsButton_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffViewSettingsButton_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffViewSettingsButton_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HideWhitespace_pullRequest"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "1181c88b69f08f25539e2ccfa8c27f70";

export default node;
