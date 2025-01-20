/**
 * @generated SignedSource<<c6cfc58aee5dca55d6a7c9a26241b846>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuePullRequestStateIconViewed$data = {
  readonly __typename: "Issue";
  readonly isReadByViewer: boolean | null | undefined;
  readonly " $fragmentType": "IssuePullRequestStateIconViewed";
} | {
  readonly __typename: "PullRequest";
  readonly isReadByViewer: boolean | null | undefined;
  readonly " $fragmentType": "IssuePullRequestStateIconViewed";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "IssuePullRequestStateIconViewed";
};
export type IssuePullRequestStateIconViewed$key = {
  readonly " $data"?: IssuePullRequestStateIconViewed$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuePullRequestStateIconViewed">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "isReadByViewer",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuePullRequestStateIconViewed",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "IssueOrPullRequest",
  "abstractKey": "__isIssueOrPullRequest"
};
})();

(node as any).hash = "cb8f7c5e1f3d32f1be1c68ad80564d52";

export default node;
