/**
 * @generated SignedSource<<e6226d54d33b281ddf7e37699cc6b6ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestHeaderWrapper_repository$data = {
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly isWritable: boolean;
  readonly nameWithOwner: string;
  readonly pullRequest: {
    readonly author: {
      readonly login: string;
    } | null | undefined;
    readonly baseRefName: string;
    readonly comparison: {
      readonly summary: ReadonlyArray<{
        readonly __typename: "PullRequestSummaryDelta";
      }> | null | undefined;
    } | null | undefined;
    readonly fullDatabaseId: any | null | undefined;
    readonly headRefOid: any;
    readonly id: string;
    readonly isInMergeQueue: boolean;
    readonly number: number;
    readonly state: PullRequestState;
    readonly title: string;
    readonly titleHTML: string;
    readonly viewerCanUpdate: boolean;
    readonly " $fragmentSpreads": FragmentRefs<"HeaderMetadata_pullRequest" | "HeaderRightSideContent_pullRequest">;
  } | null | undefined;
  readonly slashCommandsEnabled: boolean;
  readonly " $fragmentType": "PullRequestHeaderWrapper_repository";
};
export type PullRequestHeaderWrapper_repository$key = {
  readonly " $data"?: PullRequestHeaderWrapper_repository$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestHeaderWrapper_repository">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "endOid"
    },
    {
      "kind": "RootArgument",
      "name": "number"
    },
    {
      "kind": "RootArgument",
      "name": "singleCommitOid"
    },
    {
      "kind": "RootArgument",
      "name": "startOid"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestHeaderWrapper_repository",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameWithOwner",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isWritable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slashCommandsEnabled",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "number",
          "variableName": "number"
        }
      ],
      "concreteType": "PullRequest",
      "kind": "LinkedField",
      "name": "pullRequest",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "headRefOid",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fullDatabaseId",
          "storageKey": null
        },
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "baseRefName",
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
          "concreteType": null,
          "kind": "LinkedField",
          "name": "author",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "endOid",
              "variableName": "endOid"
            },
            {
              "kind": "Variable",
              "name": "singleCommitOid",
              "variableName": "singleCommitOid"
            },
            {
              "kind": "Variable",
              "name": "startOid",
              "variableName": "startOid"
            }
          ],
          "concreteType": "PullRequestComparison",
          "kind": "LinkedField",
          "name": "comparison",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestSummaryDelta",
              "kind": "LinkedField",
              "name": "summary",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
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
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
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
          "name": "viewerCanUpdate",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "HeaderMetadata_pullRequest"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "HeaderRightSideContent_pullRequest"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};
})();

(node as any).hash = "851bf935490cc4d0680538ad6626584e";

export default node;
