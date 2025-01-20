/**
 * @generated SignedSource<<cc923a73872f679bd6b82f2a54638ba7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueItem$data = {
  readonly __typename: "Issue";
  readonly id: string;
  readonly title: string;
  readonly titleHtml: string;
  readonly " $fragmentSpreads": FragmentRefs<"IssuePullRequestDescription" | "IssuePullRequestStateIcon" | "IssuePullRequestTitle" | "IssueTypeIndicator">;
  readonly " $fragmentType": "IssueItem";
};
export type IssueItem$key = {
  readonly " $data"?: IssueItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueItem">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "labelPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueItem",
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
      "name": "__typename",
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
      "alias": "titleHtml",
      "args": null,
      "kind": "ScalarField",
      "name": "titleHTML",
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "labelPageSize",
          "variableName": "labelPageSize"
        }
      ],
      "kind": "FragmentSpread",
      "name": "IssuePullRequestTitle"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssuePullRequestDescription"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssuePullRequestStateIcon"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueTypeIndicator"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "207e9d0d7182999002abb99e24fe296e";

export default node;
