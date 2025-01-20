/**
 * @generated SignedSource<<2034ae13a7a501757bd6974b956bfaf8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TaskListStatusFragment$data = {
  readonly taskListSummary: {
    readonly completeCount: number;
    readonly itemCount: number;
  } | null | undefined;
  readonly tasklistBlocksCompletion: {
    readonly completed: number;
    readonly total: number;
  } | null | undefined;
  readonly " $fragmentType": "TaskListStatusFragment";
};
export type TaskListStatusFragment$key = {
  readonly " $data"?: TaskListStatusFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TaskListStatusFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TaskListStatusFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "TaskListSummary",
      "kind": "LinkedField",
      "name": "taskListSummary",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "itemCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "completeCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TrackedIssueCompletion",
      "kind": "LinkedField",
      "name": "tasklistBlocksCompletion",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "completed",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "total",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "a8879b45d4595d292dd7a1aa1921d5d7";

export default node;
