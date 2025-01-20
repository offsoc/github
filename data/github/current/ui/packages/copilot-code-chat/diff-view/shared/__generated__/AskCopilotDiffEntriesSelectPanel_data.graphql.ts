/**
 * @generated SignedSource<<d628904df9f7355fa090601d446aad3f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AskCopilotDiffEntriesSelectPanel_data$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DiffEntriesList_entriesData">;
  readonly " $fragmentType": "AskCopilotDiffEntriesSelectPanel_data";
};
export type AskCopilotDiffEntriesSelectPanel_data$key = {
  readonly " $data"?: AskCopilotDiffEntriesSelectPanel_data$data;
  readonly " $fragmentSpreads": FragmentRefs<"AskCopilotDiffEntriesSelectPanel_data">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AskCopilotDiffEntriesSelectPanel_data",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffEntriesList_entriesData"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "bf02812b64fb6441cda370bf2156e54f";

export default node;
