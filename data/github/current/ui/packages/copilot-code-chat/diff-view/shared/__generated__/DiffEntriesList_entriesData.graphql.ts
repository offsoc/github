/**
 * @generated SignedSource<<28d0ff66b00e3035b1064eb757c20a29>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiffEntriesList_entriesData$data = {
  readonly comparison: {
    readonly diffEntries: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly path: string;
          readonly " $fragmentSpreads": FragmentRefs<"DiffEntriesList_EntryItem_entry">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_Comparison">;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "DiffEntriesList_entriesData";
};
export type DiffEntriesList_entriesData$key = {
  readonly " $data"?: DiffEntriesList_entriesData$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffEntriesList_entriesData">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "comparison",
  "diffEntries"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "kind": "RootArgument",
      "name": "endOid"
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
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./DiffEntriesList_entriesData_refetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "DiffEntriesList_entriesData",
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "useFileDiffReference_Comparison"
        },
        {
          "alias": "diffEntries",
          "args": null,
          "concreteType": "PullRequestDiffEntryConnection",
          "kind": "LinkedField",
          "name": "__DiffEntriesList_entriesData_diffEntries_connection",
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
                      "name": "path",
                      "storageKey": null
                    },
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "DiffEntriesList_EntryItem_entry"
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "__typename",
                      "storageKey": null
                    }
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

(node as any).hash = "8f4d08ab4a59d5f9437e9c5f5341ab1b";

export default node;
