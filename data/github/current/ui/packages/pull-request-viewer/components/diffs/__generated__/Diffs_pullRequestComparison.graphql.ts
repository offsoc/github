/**
 * @generated SignedSource<<54f9d580b1ef307a5794dd0b3fd58fca>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type Diffs_pullRequestComparison$data = {
  readonly comparison: {
    readonly diffEntries: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly diffLines: ReadonlyArray<{
            readonly __typename: "DiffLine";
          } | null | undefined> | null | undefined;
          readonly isCollapsed: boolean | null | undefined;
          readonly isTooBig: boolean;
          readonly path: string;
          readonly pathDigest: string;
          readonly viewerViewedState: FileViewedState | null | undefined;
          readonly " $fragmentSpreads": FragmentRefs<"Diff_diffEntry">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "Diffs_pullRequestComparison";
};
export type Diffs_pullRequestComparison$key = {
  readonly " $data"?: Diffs_pullRequestComparison$data;
  readonly " $fragmentSpreads": FragmentRefs<"Diffs_pullRequestComparison">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "comparison",
  "diffEntries"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "diffEntryCount"
    },
    {
      "kind": "RootArgument",
      "name": "diffEntryCursor"
    },
    {
      "kind": "RootArgument",
      "name": "endOid"
    },
    {
      "kind": "RootArgument",
      "name": "injectedContextLines"
    },
    {
      "kind": "RootArgument",
      "name": "inlineThreadCount"
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
  "metadata": {
    "connection": [
      {
        "count": "diffEntryCount",
        "cursor": "diffEntryCursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "diffEntryCount",
          "cursor": "diffEntryCursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./DiffsPaginationQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "Diffs_pullRequestComparison",
  "selections": [
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
          "alias": "diffEntries",
          "args": null,
          "concreteType": "PullRequestDiffEntryConnection",
          "kind": "LinkedField",
          "name": "__Diffs_pullRequest_diffEntries_connection",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestDiffEntryEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "PullRequestDiffEntry",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "pathDigest",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "path",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "isTooBig",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "viewerViewedState",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": [
                        {
                          "kind": "Variable",
                          "name": "injectedContextLines",
                          "variableName": "injectedContextLines"
                        }
                      ],
                      "concreteType": "DiffLine",
                      "kind": "LinkedField",
                      "name": "diffLines",
                      "plural": true,
                      "selections": [
                        (v1/*: any*/)
                      ],
                      "storageKey": null
                    },
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "Diff_diffEntry"
                    },
                    {
                      "kind": "ClientExtension",
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "isCollapsed",
                          "storageKey": null
                        }
                      ]
                    },
                    (v1/*: any*/)
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "cursor",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "PageInfo",
              "kind": "LinkedField",
              "name": "pageInfo",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "endCursor",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "hasNextPage",
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
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "d3f7fd852462d19fc5a3bdcd2e9146d2";

export default node;
