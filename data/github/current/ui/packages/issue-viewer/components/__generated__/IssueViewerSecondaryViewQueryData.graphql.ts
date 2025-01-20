/**
 * @generated SignedSource<<557c133eaa0206373c189442939be981>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerSecondaryViewQueryData$data = {
  readonly issue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueViewerSecondaryIssueData">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"IssueViewerSecondaryViewQueryRepoData">;
  readonly " $fragmentType": "IssueViewerSecondaryViewQueryData";
};
export type IssueViewerSecondaryViewQueryData$key = {
  readonly " $data"?: IssueViewerSecondaryViewQueryData$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueViewerSecondaryViewQueryData">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "markAsRead"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "number"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueViewerSecondaryViewQueryData",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "markAsRead",
          "variableName": "markAsRead"
        },
        {
          "kind": "Variable",
          "name": "number",
          "variableName": "number"
        }
      ],
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "issue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueViewerSecondaryIssueData"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueViewerSecondaryViewQueryRepoData"
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "7742c3247121039dc8f0e5218d4a97f7";

export default node;
