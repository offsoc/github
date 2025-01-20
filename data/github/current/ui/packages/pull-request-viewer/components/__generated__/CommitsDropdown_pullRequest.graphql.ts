/**
 * @generated SignedSource<<128ee3bd11d164ddd8274485634e6612>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitsDropdown_pullRequest$data = {
  readonly baseRefOid: any;
  readonly commits: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly commit: {
          readonly oid: any;
        };
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"CommitsSelector_pullRequest">;
  readonly " $fragmentType": "CommitsDropdown_pullRequest";
};
export type CommitsDropdown_pullRequest$key = {
  readonly " $data"?: CommitsDropdown_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommitsDropdown_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommitsDropdown_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CommitsSelector_pullRequest"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "baseRefOid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 100
        }
      ],
      "concreteType": "PullRequestCommitConnection",
      "kind": "LinkedField",
      "name": "commits",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestCommitEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestCommit",
              "kind": "LinkedField",
              "name": "node",
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
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "oid",
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
      "storageKey": "commits(first:100)"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "7f5bebd9ddd353811f0c0b07592ac072";

export default node;
