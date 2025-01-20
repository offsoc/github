/**
 * @generated SignedSource<<6dce1772745340fdef0458c9af6c4ff0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitsView_repository$data = {
  readonly name: string;
  readonly owner: {
    readonly login: string;
  };
  readonly pullRequest: {
    readonly commits: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly commit: {
            readonly authoredByCommitter: boolean;
            readonly authoredDate: string;
            readonly authors: {
              readonly edges: ReadonlyArray<{
                readonly node: {
                  readonly user: {
                    readonly avatarUrl: string;
                    readonly login: string;
                    readonly name: string | null | undefined;
                    readonly resourcePath: string;
                  } | null | undefined;
                } | null | undefined;
              } | null | undefined> | null | undefined;
            };
            readonly committedDate: string;
            readonly committedViaWeb: boolean;
            readonly committer: {
              readonly user: {
                readonly avatarUrl: string;
                readonly login: string;
                readonly name: string | null | undefined;
                readonly resourcePath: string;
              } | null | undefined;
            } | null | undefined;
            readonly messageBodyHTML: string;
            readonly messageHeadline: string;
            readonly oid: any;
          };
          readonly messageHeadlineHTMLLink: string;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly number: number;
  } | null | undefined;
  readonly " $fragmentType": "CommitsView_repository";
};
export type CommitsView_repository$key = {
  readonly " $data"?: CommitsView_repository$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommitsView_repository">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avatarUrl",
        "storageKey": null
      },
      (v1/*: any*/),
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourcePath",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "number"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommitsView_repository",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "number",
          "variableName": "number"
        }
      ],
      "concreteType": "PullRequest",
      "kind": "LinkedField",
      "name": "pullRequest",
      "plural": false,
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
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 50
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
                      "kind": "ScalarField",
                      "name": "messageHeadlineHTMLLink",
                      "storageKey": null
                    },
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
                          "name": "committedViaWeb",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "authoredByCommitter",
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
                          "name": "committedDate",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "messageBodyHTML",
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
                          "args": [
                            {
                              "kind": "Literal",
                              "name": "first",
                              "value": 3
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
                                  "selections": (v2/*: any*/),
                                  "storageKey": null
                                }
                              ],
                              "storageKey": null
                            }
                          ],
                          "storageKey": "authors(first:3)"
                        },
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "GitActor",
                          "kind": "LinkedField",
                          "name": "committer",
                          "plural": false,
                          "selections": (v2/*: any*/),
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
          "storageKey": "commits(first:50)"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};
})();

(node as any).hash = "8b7b3ad130dfeca739ecba284f6a5563";

export default node;
