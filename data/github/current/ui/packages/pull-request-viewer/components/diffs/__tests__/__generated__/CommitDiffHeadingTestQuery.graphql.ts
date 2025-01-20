/**
 * @generated SignedSource<<98f13e8b71876c14941327cffd4c29ea>>
 * @relayHash bd71f79d8bf315bc000626d1bfa4a953
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID bd71f79d8bf315bc000626d1bfa4a953

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitDiffHeadingTestQuery$variables = {
  commitId: string;
};
export type CommitDiffHeadingTestQuery$data = {
  readonly commit: {
    readonly " $fragmentSpreads": FragmentRefs<"CommitDiffHeading_commit">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"CommitDiffHeading_viewer">;
  };
};
export type CommitDiffHeadingTestQuery = {
  response: CommitDiffHeadingTestQuery$data;
  variables: CommitDiffHeadingTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "commitId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "commitId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourcePath",
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v9 = [
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
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "GitActor"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v16 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v17 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "CertificateAttributes"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CommitDiffHeadingTestQuery",
    "selections": [
      {
        "alias": "commit",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CommitDiffHeading_commit"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CommitDiffHeading_viewer"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CommitDiffHeadingTestQuery",
    "selections": [
      {
        "alias": "commit",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
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
                "name": "authoredByCommitter",
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
                "name": "committedViaWeb",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasSignature",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "messageHeadlineHTML",
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
                "name": "oid",
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
                        "selections": (v7/*: any*/),
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
                "selections": (v7/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  (v3/*: any*/)
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "shortText",
                    "storageKey": null
                  },
                  (v8/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "signature",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "signer",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v4/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "wasSignedByGitHub",
                    "storageKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "keyId",
                        "storageKey": null
                      }
                    ],
                    "type": "GpgSignature",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "CertificateAttributes",
                        "kind": "LinkedField",
                        "name": "issuer",
                        "plural": false,
                        "selections": (v9/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "CertificateAttributes",
                        "kind": "LinkedField",
                        "name": "subject",
                        "plural": false,
                        "selections": (v9/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "SmimeSignature",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "keyFingerprint",
                        "storageKey": null
                      }
                    ],
                    "type": "SshSignature",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Commit",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "bd71f79d8bf315bc000626d1bfa4a953",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "commit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "commit.__typename": (v10/*: any*/),
        "commit.abbreviatedOid": (v10/*: any*/),
        "commit.authoredByCommitter": (v11/*: any*/),
        "commit.authors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitActorConnection"
        },
        "commit.authors.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "GitActorEdge"
        },
        "commit.authors.edges.node": (v12/*: any*/),
        "commit.authors.edges.node.user": (v13/*: any*/),
        "commit.authors.edges.node.user.avatarUrl": (v14/*: any*/),
        "commit.authors.edges.node.user.id": (v15/*: any*/),
        "commit.authors.edges.node.user.login": (v10/*: any*/),
        "commit.authors.edges.node.user.name": (v16/*: any*/),
        "commit.authors.edges.node.user.resourcePath": (v14/*: any*/),
        "commit.committedDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "commit.committedViaWeb": (v11/*: any*/),
        "commit.committer": (v12/*: any*/),
        "commit.committer.user": (v13/*: any*/),
        "commit.committer.user.avatarUrl": (v14/*: any*/),
        "commit.committer.user.id": (v15/*: any*/),
        "commit.committer.user.login": (v10/*: any*/),
        "commit.committer.user.name": (v16/*: any*/),
        "commit.committer.user.resourcePath": (v14/*: any*/),
        "commit.hasSignature": (v11/*: any*/),
        "commit.id": (v15/*: any*/),
        "commit.messageBodyHTML": (v17/*: any*/),
        "commit.messageHeadlineHTML": (v17/*: any*/),
        "commit.oid": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitObjectID"
        },
        "commit.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "commit.repository.id": (v15/*: any*/),
        "commit.repository.name": (v10/*: any*/),
        "commit.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "commit.repository.owner.__typename": (v10/*: any*/),
        "commit.repository.owner.id": (v15/*: any*/),
        "commit.repository.owner.login": (v10/*: any*/),
        "commit.signature": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitSignature"
        },
        "commit.signature.__typename": (v10/*: any*/),
        "commit.signature.issuer": (v18/*: any*/),
        "commit.signature.issuer.commonName": (v16/*: any*/),
        "commit.signature.issuer.emailAddress": (v16/*: any*/),
        "commit.signature.issuer.organization": (v16/*: any*/),
        "commit.signature.issuer.organizationUnit": (v16/*: any*/),
        "commit.signature.keyFingerprint": (v16/*: any*/),
        "commit.signature.keyId": (v16/*: any*/),
        "commit.signature.signer": (v13/*: any*/),
        "commit.signature.signer.avatarUrl": (v14/*: any*/),
        "commit.signature.signer.id": (v15/*: any*/),
        "commit.signature.signer.login": (v10/*: any*/),
        "commit.signature.state": {
          "enumValues": [
            "BAD_CERT",
            "BAD_EMAIL",
            "EXPIRED_KEY",
            "GPGVERIFY_ERROR",
            "GPGVERIFY_UNAVAILABLE",
            "INVALID",
            "MALFORMED_SIG",
            "NOT_SIGNING_KEY",
            "NO_USER",
            "OCSP_ERROR",
            "OCSP_PENDING",
            "OCSP_REVOKED",
            "UNKNOWN_KEY",
            "UNKNOWN_SIG_TYPE",
            "UNSIGNED",
            "UNVERIFIED_EMAIL",
            "VALID"
          ],
          "nullable": false,
          "plural": false,
          "type": "GitSignatureState"
        },
        "commit.signature.subject": (v18/*: any*/),
        "commit.signature.subject.commonName": (v16/*: any*/),
        "commit.signature.subject.emailAddress": (v16/*: any*/),
        "commit.signature.subject.organization": (v16/*: any*/),
        "commit.signature.subject.organizationUnit": (v16/*: any*/),
        "commit.signature.wasSignedByGitHub": (v11/*: any*/),
        "commit.statusCheckRollup": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "StatusCheckRollup"
        },
        "commit.statusCheckRollup.id": (v15/*: any*/),
        "commit.statusCheckRollup.shortText": (v10/*: any*/),
        "commit.statusCheckRollup.state": {
          "enumValues": [
            "ERROR",
            "EXPECTED",
            "FAILURE",
            "PENDING",
            "SUCCESS"
          ],
          "nullable": false,
          "plural": false,
          "type": "StatusState"
        },
        "commit.verificationStatus": {
          "enumValues": [
            "PARTIALLY_VERIFIED",
            "UNSIGNED",
            "UNVERIFIED",
            "VERIFIED"
          ],
          "nullable": true,
          "plural": false,
          "type": "CommitVerificationStatus"
        },
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v15/*: any*/),
        "viewer.login": (v10/*: any*/)
      }
    },
    "name": "CommitDiffHeadingTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "7a6c239648b3a7b7663edf210451fe61";

export default node;
