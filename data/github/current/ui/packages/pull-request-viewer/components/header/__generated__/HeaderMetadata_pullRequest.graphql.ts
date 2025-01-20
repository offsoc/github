/**
 * @generated SignedSource<<acad6072dbaad66d19bf40b956e40315>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type HeaderMetadata_pullRequest$data = {
  readonly isDraft: boolean;
  readonly isInMergeQueue: boolean;
  readonly number: number;
  readonly repository: {
    readonly nameWithOwner: string;
  };
  readonly state: PullRequestState;
  readonly title: string;
  readonly titleHTML: string;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderBranchInfo_pullRequest">;
  readonly " $fragmentType": "HeaderMetadata_pullRequest";
};
export type HeaderMetadata_pullRequest$key = {
  readonly " $data"?: HeaderMetadata_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderMetadata_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderMetadata_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderBranchInfo_pullRequest"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "titleHTML",
      "storageKey": null
    },
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
      "name": "isDraft",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "number",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isInMergeQueue",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nameWithOwner",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "8b5af3f05ff4bc236093089e496ff243";

export default node;
