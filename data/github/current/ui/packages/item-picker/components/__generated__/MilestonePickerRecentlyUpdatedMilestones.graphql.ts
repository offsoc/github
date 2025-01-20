/**
 * @generated SignedSource<<bec3b240a0ab15413cd6698fa55b75f3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MilestonePickerRecentlyUpdatedMilestones$data = {
  readonly id: string;
  readonly milestones: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"MilestonePickerMilestone">;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "MilestonePickerRecentlyUpdatedMilestones";
};
export type MilestonePickerRecentlyUpdatedMilestones$key = {
  readonly " $data"?: MilestonePickerRecentlyUpdatedMilestones$data;
  readonly " $fragmentSpreads": FragmentRefs<"MilestonePickerRecentlyUpdatedMilestones">;
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
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "count"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./RecentlyUpdatedMilestoneQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "MilestonePickerRecentlyUpdatedMilestones",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "count"
        },
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": {
            "direction": "DESC",
            "field": "UPDATED_AT"
          }
        },
        {
          "kind": "Literal",
          "name": "orderByStates",
          "value": [
            "OPEN",
            "CLOSED"
          ]
        }
      ],
      "concreteType": "MilestoneConnection",
      "kind": "LinkedField",
      "name": "milestones",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Milestone",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            {
              "kind": "InlineDataFragmentSpread",
              "name": "MilestonePickerMilestone",
              "selections": [
                (v0/*: any*/),
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
                  "name": "closed",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "dueOn",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "progressPercentage",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "url",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "closedAt",
                  "storageKey": null
                }
              ],
              "args": null,
              "argumentDefinitions": []
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v0/*: any*/)
  ],
  "type": "Repository",
  "abstractKey": null
};
})();

(node as any).hash = "750733cfc93d7d534bcc98c859ee988e";

export default node;
