/**
 * @generated SignedSource<<f533936d13b813c5bd21eb35c98142a6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderMetadata$data = {
  readonly url: string;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderIssueType" | "HeaderMenu" | "HeaderState" | "HeaderSubIssueSummaryWithPrimary" | "LinkedPullRequests" | "RepositoryPill" | "StickyHeaderTitle">;
  readonly " $fragmentType": "HeaderMetadata";
};
export type HeaderMetadata$key = {
  readonly " $data"?: HeaderMetadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderMetadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderMetadata",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderIssueType"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderMenu"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderState"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "StickyHeaderTitle"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RepositoryPill"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "LinkedPullRequests"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderSubIssueSummaryWithPrimary"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "18ca04b10a9625a614ddcfad993a10bb";

export default node;
