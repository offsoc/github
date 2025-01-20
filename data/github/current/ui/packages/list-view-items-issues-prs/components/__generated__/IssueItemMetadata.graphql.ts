/**
 * @generated SignedSource<<861c0c6534699c964033630a55125ea5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueItemMetadata$data = {
  readonly id: string;
  readonly reactionGroups?: ReadonlyArray<{
    readonly __typename: "ReactionGroup";
  }> | null | undefined;
  readonly totalCommentsCount: number | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"Assignees" | "ClosedByPullRequestsReferences" | "Reactions">;
  readonly " $fragmentType": "IssueItemMetadata";
};
export type IssueItemMetadata$key = {
  readonly " $data"?: IssueItemMetadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueItemMetadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "assigneePageSize"
    },
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "includeReactions"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueItemMetadata",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "includeReactions",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ReactionGroup",
          "kind": "LinkedField",
          "name": "reactionGroups",
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
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "condition": "includeReactions",
              "kind": "Condition",
              "passingValue": true,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "Reactions"
                }
              ]
            }
          ],
          "type": "Reactable",
          "abstractKey": "__isReactable"
        }
      ]
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCommentsCount",
      "storageKey": null
    },
    {
      "args": [
        {
          "kind": "Variable",
          "name": "assigneePageSize",
          "variableName": "assigneePageSize"
        }
      ],
      "kind": "FragmentSpread",
      "name": "Assignees"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ClosedByPullRequestsReferences"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "e467ac892519b4a48033b3aee52eefe7";

export default node;
