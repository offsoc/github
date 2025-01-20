/**
 * @generated SignedSource<<679cfec53fba8035bd9ad1027afc0269>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useSubIssuesSummary$data = {
  readonly subIssues?: {
    readonly nodes: ReadonlyArray<{
      readonly closed: boolean;
      readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary_issueState">;
    } | null | undefined> | null | undefined;
  };
  readonly subIssuesConnection: {
    readonly totalCount: number;
  };
  readonly subIssuesSummary?: {
    readonly completed: number;
  };
  readonly " $fragmentType": "useSubIssuesSummary";
};
export type useSubIssuesSummary$key = {
  readonly " $data"?: useSubIssuesSummary$data;
  readonly " $fragmentSpreads": FragmentRefs<"useSubIssuesSummary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "fetchSubIssues"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "useSubIssuesSummary",
  "selections": [
    {
      "condition": "fetchSubIssues",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "SubIssuesSummary",
          "kind": "LinkedField",
          "name": "subIssuesSummary",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "completed",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    },
    {
      "alias": "subIssuesConnection",
      "args": null,
      "concreteType": "IssueConnection",
      "kind": "LinkedField",
      "name": "subIssues",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "condition": "fetchSubIssues",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 50
            }
          ],
          "concreteType": "IssueConnection",
          "kind": "LinkedField",
          "name": "subIssues",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Issue",
              "kind": "LinkedField",
              "name": "nodes",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "closed",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "useSubIssuesSummary_issueState"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": "subIssues(first:50)"
        }
      ]
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "e79ba25b7b87f551496df778a680267e";

export default node;
