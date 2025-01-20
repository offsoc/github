/**
 * @generated SignedSource<<b33a37478e4378de64e014f85c93f561>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CheckRunState = "ACTION_REQUIRED" | "CANCELLED" | "COMPLETED" | "FAILURE" | "IN_PROGRESS" | "NEUTRAL" | "PENDING" | "QUEUED" | "SKIPPED" | "STALE" | "STARTUP_FAILURE" | "SUCCESS" | "TIMED_OUT" | "WAITING" | "%future added value";
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestItem$data = {
  readonly __typename: "PullRequest";
  readonly headCommit: {
    readonly commit: {
      readonly id: string;
      readonly statusCheckRollup: {
        readonly contexts: {
          readonly checkRunCount: number;
          readonly checkRunCountsByState: ReadonlyArray<{
            readonly count: number;
            readonly state: CheckRunState;
          }> | null | undefined;
        };
        readonly state: StatusState;
      } | null | undefined;
    };
  } | null | undefined;
  readonly id: string;
  readonly repository: {
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly title: string;
  readonly titleHTML: string;
  readonly " $fragmentSpreads": FragmentRefs<"IssuePullRequestDescription" | "IssuePullRequestStateIcon" | "IssuePullRequestTitle">;
  readonly " $fragmentType": "PullRequestItem";
};
export type PullRequestItem$key = {
  readonly " $data"?: PullRequestItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestItem">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "labelPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestItem",
  "selections": [
    (v0/*: any*/),
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
      "concreteType": "PullRequestCommit",
      "kind": "LinkedField",
      "name": "headCommit",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Commit",
          "kind": "LinkedField",
          "name": "commit",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "StatusCheckRollup",
              "kind": "LinkedField",
              "name": "statusCheckRollup",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "StatusCheckRollupContextConnection",
                  "kind": "LinkedField",
                  "name": "contexts",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "checkRunCount",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "CheckRunStateCount",
                      "kind": "LinkedField",
                      "name": "checkRunCountsByState",
                      "plural": true,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "count",
                          "storageKey": null
                        },
                        (v1/*: any*/)
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
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
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
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
        }
      ],
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
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "c446f7699e4d19d5773172c58276da4a";

export default node;
