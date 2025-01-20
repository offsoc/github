/**
 * @generated SignedSource<<41094326766f4aeff9ba70c831715b89>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerSecondaryIssueData$data = {
  readonly " $fragmentSpreads": FragmentRefs<"HeaderParentTitle" | "HeaderSecondary" | "HeaderSubIssueSummary" | "IssueBodyHeaderSecondaryFragment" | "IssueBodySecondaryFragment" | "IssueCommentComposerSecondary" | "IssueSidebarLazySections" | "IssueSidebarSecondary" | "IssueTimelineSecondary" | "SubIssuesCreateDialog" | "SubIssuesList" | "TaskListStatusFragment" | "TrackedByFragment">;
  readonly " $fragmentType": "IssueViewerSecondaryIssueData";
};
export type IssueViewerSecondaryIssueData$key = {
  readonly " $data"?: IssueViewerSecondaryIssueData$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueViewerSecondaryIssueData">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueViewerSecondaryIssueData",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderSecondary"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderParentTitle"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentComposerSecondary"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueTimelineSecondary"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueSidebarLazySections"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueSidebarSecondary"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TaskListStatusFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TrackedByFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyHeaderSecondaryFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodySecondaryFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SubIssuesList"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SubIssuesCreateDialog"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "HeaderSubIssueSummary"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "096d59c0c4e059cf26f26908ab9ba183";

export default node;
