/**
 * @generated SignedSource<<72fb2505df09d9dbf18a44b49bac236b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ThreadHeader_pullRequestThread$data = {
  readonly id: string;
  readonly isOutdated: boolean;
  readonly isResolved: boolean;
  readonly line: number | null | undefined;
  readonly path: string;
  readonly " $fragmentType": "ThreadHeader_pullRequestThread";
};
export type ThreadHeader_pullRequestThread$key = {
  readonly " $data"?: ThreadHeader_pullRequestThread$data;
  readonly " $fragmentSpreads": FragmentRefs<"ThreadHeader_pullRequestThread">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ThreadHeader_pullRequestThread",
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
      "name": "isOutdated",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isResolved",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "line",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    }
  ],
  "type": "PullRequestThread",
  "abstractKey": null
};

(node as any).hash = "b8904238af0f9cda11bc962203bc8234";

export default node;
