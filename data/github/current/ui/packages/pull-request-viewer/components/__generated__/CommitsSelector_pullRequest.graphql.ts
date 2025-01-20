/**
 * @generated SignedSource<<6cfdccf35faebbd93c8f3974d3a5ff34>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitsSelector_pullRequest$data = {
  readonly baseRefOid: any;
  readonly commits: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly commit: {
          readonly abbreviatedOid: string;
          readonly author: {
            readonly actor: {
              readonly login: string;
            } | null | undefined;
          } | null | undefined;
          readonly committedDate: string;
          readonly messageHeadline: string;
          readonly oid: any;
        };
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "CommitsSelector_pullRequest";
};
export type CommitsSelector_pullRequest$key = {
  readonly " $data"?: CommitsSelector_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommitsSelector_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommitsSelector_pullRequest",
  "selections": [
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
                      "name": "abbreviatedOid",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "committedDate",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "messageHeadline",
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
                      "concreteType": "GitActor",
                      "kind": "LinkedField",
                      "name": "author",
                      "plural": false,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": null,
                          "kind": "LinkedField",
                          "name": "actor",
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

(node as any).hash = "631b590da3702a701016d314c6fa30f2";

export default node;
