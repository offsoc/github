/**
 * @generated SignedSource<<89324d01a49da856042f5863a08e506a>>
 * @relayHash 7b9b837f8f120b20a48c13d983129e4c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7b9b837f8f120b20a48c13d983129e4c

import { ConcreteRequest, Query } from 'relay-runtime';
export type CommitVerificationStatus = "PARTIALLY_VERIFIED" | "UNSIGNED" | "UNVERIFIED" | "VERIFIED" | "%future added value";
export type GitSignatureState = "BAD_CERT" | "BAD_EMAIL" | "EXPIRED_KEY" | "GPGVERIFY_ERROR" | "GPGVERIFY_UNAVAILABLE" | "INVALID" | "MALFORMED_SIG" | "NOT_SIGNING_KEY" | "NO_USER" | "OCSP_ERROR" | "OCSP_PENDING" | "OCSP_REVOKED" | "UNKNOWN_KEY" | "UNKNOWN_SIG_TYPE" | "UNSIGNED" | "UNVERIFIED_EMAIL" | "VALID" | "%future added value";
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
export type DeferredCommitsDataLoaderQuery$variables = {
  number: number;
  owner: string;
  repo: string;
};
export type DeferredCommitsDataLoaderQuery$data = {
  readonly repository: {
    readonly pullRequest: {
      readonly commits: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly commit: {
              readonly hasSignature: boolean;
              readonly oid: any;
              readonly signature: {
                readonly __typename: "GpgSignature";
                readonly issuer?: {
                  readonly commonName: string | null | undefined;
                  readonly emailAddress: string | null | undefined;
                  readonly organization: string | null | undefined;
                  readonly organizationUnit: string | null | undefined;
                } | null | undefined;
                readonly keyFingerprint?: string | null | undefined;
                readonly keyId?: string | null | undefined;
                readonly signer: {
                  readonly avatarUrl: string;
                  readonly login: string;
                } | null | undefined;
                readonly state: GitSignatureState;
                readonly subject?: {
                  readonly commonName: string | null | undefined;
                  readonly emailAddress: string | null | undefined;
                  readonly organization: string | null | undefined;
                  readonly organizationUnit: string | null | undefined;
                } | null | undefined;
                readonly wasSignedByGitHub: boolean;
              } | null | undefined;
              readonly statusCheckRollup: {
                readonly shortText: string;
                readonly state: StatusState;
              } | null | undefined;
              readonly verificationStatus: CommitVerificationStatus | null | undefined;
            };
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
  readonly viewer: {
    readonly login: string;
  };
};
export type DeferredCommitsDataLoaderQuery = {
  response: DeferredCommitsDataLoaderQuery$data;
  variables: DeferredCommitsDataLoaderQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v5 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v6 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hasSignature",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "verificationStatus",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "wasSignedByGitHub",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "keyId",
  "storageKey": null
},
v15 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "commonName",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "emailAddress",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "organization",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "organizationUnit",
    "storageKey": null
  }
],
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "CertificateAttributes",
  "kind": "LinkedField",
  "name": "issuer",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "CertificateAttributes",
  "kind": "LinkedField",
  "name": "subject",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "keyFingerprint",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shortText",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeferredCommitsDataLoaderQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
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
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "signature",
                                "plural": false,
                                "selections": [
                                  (v10/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "User",
                                    "kind": "LinkedField",
                                    "name": "signer",
                                    "plural": false,
                                    "selections": [
                                      (v3/*: any*/),
                                      (v11/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v13/*: any*/),
                                      (v14/*: any*/)
                                    ],
                                    "type": "GpgSignature",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v13/*: any*/),
                                      (v16/*: any*/),
                                      (v17/*: any*/)
                                    ],
                                    "type": "SmimeSignature",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v13/*: any*/),
                                      (v18/*: any*/)
                                    ],
                                    "type": "SshSignature",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "StatusCheckRollup",
                                "kind": "LinkedField",
                                "name": "statusCheckRollup",
                                "plural": false,
                                "selections": [
                                  (v19/*: any*/),
                                  (v10/*: any*/)
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
                "storageKey": "commits(first:50)"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeferredCommitsDataLoaderQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v20/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
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
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "signature",
                                "plural": false,
                                "selections": [
                                  (v13/*: any*/),
                                  (v10/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "User",
                                    "kind": "LinkedField",
                                    "name": "signer",
                                    "plural": false,
                                    "selections": [
                                      (v3/*: any*/),
                                      (v11/*: any*/),
                                      (v20/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v14/*: any*/)
                                    ],
                                    "type": "GpgSignature",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v16/*: any*/),
                                      (v17/*: any*/)
                                    ],
                                    "type": "SmimeSignature",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v18/*: any*/)
                                    ],
                                    "type": "SshSignature",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "StatusCheckRollup",
                                "kind": "LinkedField",
                                "name": "statusCheckRollup",
                                "plural": false,
                                "selections": [
                                  (v19/*: any*/),
                                  (v10/*: any*/),
                                  (v20/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v20/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v20/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "commits(first:50)"
              },
              (v20/*: any*/)
            ],
            "storageKey": null
          },
          (v20/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "7b9b837f8f120b20a48c13d983129e4c",
    "metadata": {},
    "name": "DeferredCommitsDataLoaderQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "685fffc280dda2415a8695e9fe53e8d0";

export default node;
