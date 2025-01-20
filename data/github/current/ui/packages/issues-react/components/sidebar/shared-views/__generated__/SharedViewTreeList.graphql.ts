/**
 * @generated SignedSource<<f1d2fd797f5a55cf23f2ab00dba8197b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SharedViewTreeList$data = {
  readonly id: string;
  readonly selectedTeams: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly organization: {
          readonly name: string | null | undefined;
        };
        readonly " $fragmentSpreads": FragmentRefs<"RemoveTeamRow" | "SharedViewTreeRoot">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "SharedViewTreeList";
};
export type SharedViewTreeList$key = {
  readonly " $data"?: SharedViewTreeList$data;
  readonly " $fragmentSpreads": FragmentRefs<"SharedViewTreeList">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "selectedTeams"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "searchTypes"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "selectedTeamsPageSize"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "teamViewPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "selectedTeamsPageSize",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "selectedTeamsPageSize",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./SharedViewTreeListSelectTeamsQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "SharedViewTreeList",
  "selections": [
    {
      "alias": "selectedTeams",
      "args": null,
      "concreteType": "TeamConnection",
      "kind": "LinkedField",
      "name": "__Viewer_selectedTeams_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TeamEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Team",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "args": [
                    {
                      "kind": "Variable",
                      "name": "searchTypes",
                      "variableName": "searchTypes"
                    },
                    {
                      "kind": "Variable",
                      "name": "teamViewPageSize",
                      "variableName": "teamViewPageSize"
                    }
                  ],
                  "kind": "FragmentSpread",
                  "name": "SharedViewTreeRoot"
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "RemoveTeamRow"
                },
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Organization",
                  "kind": "LinkedField",
                  "name": "organization",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "name",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
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
    },
    (v1/*: any*/)
  ],
  "type": "UserDashboard",
  "abstractKey": null
};
})();

(node as any).hash = "2a33ec7c1e43c8028aa887ba00366511";

export default node;
