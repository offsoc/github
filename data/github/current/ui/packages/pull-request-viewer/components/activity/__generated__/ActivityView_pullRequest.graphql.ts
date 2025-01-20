/**
 * @generated SignedSource<<1be6fe41bc99ba775711650926364630>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ActivityView_pullRequest$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ActivityView_PullRequestTimeline_pullRequest" | "ActivityView_pullRequest_backwardPagination" | "ActivityView_pullRequest_forwardPagination" | "PullRequestCommentComposer_pullRequest">;
  readonly " $fragmentType": "ActivityView_pullRequest";
};
export type ActivityView_pullRequest$key = {
  readonly " $data"?: ActivityView_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ActivityView_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "timelinePageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ActivityView_pullRequest",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "timelinePageSize"
        }
      ],
      "kind": "FragmentSpread",
      "name": "ActivityView_pullRequest_forwardPagination"
    },
    {
      "args": [
        {
          "kind": "Literal",
          "name": "last",
          "value": 0
        }
      ],
      "kind": "FragmentSpread",
      "name": "ActivityView_pullRequest_backwardPagination"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "PullRequestCommentComposer_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ActivityView_PullRequestTimeline_pullRequest"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "afb57c50c0cde59a6ab7f1539392b2e7";

export default node;
