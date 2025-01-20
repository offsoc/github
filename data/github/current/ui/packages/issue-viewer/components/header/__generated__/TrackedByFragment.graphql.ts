/**
 * @generated SignedSource<<e0cdf7021e96a6e673aa2414ca44cf18>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type TrackedByFragment$data = {
  readonly trackedInIssues: {
    readonly nodes: ReadonlyArray<{
      readonly number: number;
      readonly stateReason: IssueStateReason | null | undefined;
      readonly url: string;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
  readonly " $fragmentType": "TrackedByFragment";
};
export type TrackedByFragment$key = {
  readonly " $data"?: TrackedByFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TrackedByFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TrackedByFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 10
        }
      ],
      "concreteType": "IssueConnection",
      "kind": "LinkedField",
      "name": "trackedInIssues",
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
              "name": "number",
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
              "name": "stateReason",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        }
      ],
      "storageKey": "trackedInIssues(first:10)"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "85d7e05c6822546f03500dc2828ef942";

export default node;
