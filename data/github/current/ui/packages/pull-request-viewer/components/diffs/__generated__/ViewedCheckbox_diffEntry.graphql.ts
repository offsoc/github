/**
 * @generated SignedSource<<b8898801c876f618d7edcf008052cd9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ViewedCheckbox_diffEntry$data = {
  readonly id: string;
  readonly path: string;
  readonly viewerViewedState: FileViewedState | null | undefined;
  readonly " $fragmentType": "ViewedCheckbox_diffEntry";
};
export type ViewedCheckbox_diffEntry$key = {
  readonly " $data"?: ViewedCheckbox_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"ViewedCheckbox_diffEntry">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ViewedCheckbox_diffEntry",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerViewedState",
      "storageKey": null
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};

(node as any).hash = "0be454588856f44a7ec2e34398e7d051";

export default node;
