/**
 * @generated SignedSource<<745560c07340a58d4610b58afcfb07c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CommitVerificationStatus = "PARTIALLY_VERIFIED" | "UNSIGNED" | "UNVERIFIED" | "VERIFIED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestCommit_pullRequestCommit$data = {
  readonly commit: {
    readonly abbreviatedOid: string;
    readonly authoredDate: string;
    readonly authors: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly user: {
            readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
          } | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly message: string;
    readonly oid: any;
    readonly verificationStatus: CommitVerificationStatus | null | undefined;
  };
  readonly " $fragmentType": "PullRequestCommit_pullRequestCommit";
};
export type PullRequestCommit_pullRequestCommit$key = {
  readonly " $data"?: PullRequestCommit_pullRequestCommit$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestCommit_pullRequestCommit">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestCommit_pullRequestCommit",
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
          "name": "abbreviatedOid",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "oid",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "message",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "authoredDate",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "verificationStatus",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 1
            }
          ],
          "concreteType": "GitActorConnection",
          "kind": "LinkedField",
          "name": "authors",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "GitActorEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "GitActor",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "User",
                      "kind": "LinkedField",
                      "name": "user",
                      "plural": false,
                      "selections": [
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "TimelineRowEventActor"
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
          "storageKey": "authors(first:1)"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequestCommit",
  "abstractKey": null
};

(node as any).hash = "ccf078fc5194a344b8f8722c946e322b";

export default node;
