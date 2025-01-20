/**
 * @generated SignedSource<<fc1eaaca913304361df30b3da75c9303>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerIssue$data = {
  readonly id: string;
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"Header" | "HeaderSubIssueSummary" | "IssueBody" | "IssueCommentComposer" | "IssueSidebarPrimaryQuery" | "IssueTimelinePaginated" | "useCanEditSubIssues" | "useHasSubIssues">;
  readonly " $fragmentType": "IssueViewerIssue";
};
export type IssueViewerIssue$key = {
  readonly " $data"?: IssueViewerIssue$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueViewerIssue">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "allowedOwner"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueViewerIssue",
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
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useHasSubIssues"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useCanEditSubIssues"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "Header"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBody"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentComposer"
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "allowedOwner",
          "variableName": "allowedOwner"
        }
      ],
      "kind": "FragmentSpread",
      "name": "IssueSidebarPrimaryQuery"
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "numberOfTimelineItems",
          "value": 15
        }
      ],
      "kind": "FragmentSpread",
      "name": "IssueTimelinePaginated"
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

(node as any).hash = "abbd217433f22bd8ac5423cdc0d71cbc";

export default node;
