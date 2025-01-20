/**
 * @generated SignedSource<<a642110ad965d9bca3d79bfb34e8477d>>
 * @relayHash b808e1556facb76762e7f4a5b19d34cc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b808e1556facb76762e7f4a5b19d34cc

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReferencedEventTestTwoNodesQuery$variables = Record<PropertyKey, never>;
export type ReferencedEventTestTwoNodesQuery$data = {
  readonly node1: {
    readonly " $fragmentSpreads": FragmentRefs<"ReferencedEvent">;
  } | null | undefined;
  readonly node2: {
    readonly " $fragmentSpreads": FragmentRefs<"ReferencedEvent">;
  } | null | undefined;
};
export type ReferencedEventTestTwoNodesQuery = {
  response: ReferencedEventTestTwoNodesQuery$data;
  variables: ReferencedEventTestTwoNodesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "node-id1"
  }
],
v1 = [
  {
    "kind": "InlineFragment",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ReferencedEvent"
      }
    ],
    "type": "ReferencedEvent",
    "abstractKey": null
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "node-id2"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = [
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
v7 = [
  (v3/*: any*/),
  {
    "kind": "InlineFragment",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "databaseId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "willCloseSubject",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "subject",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/)
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "actor",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isActor"
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "size",
                "value": 64
              }
            ],
            "kind": "ScalarField",
            "name": "avatarUrl",
            "storageKey": "avatarUrl(size:64)"
          },
          (v5/*: any*/),
          (v4/*: any*/)
        ],
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
            "name": "message",
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
            "name": "url",
            "storageKey": null
          },
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "signature",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "signer",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "avatarUrl",
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "state",
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
                    "concreteType": "CertificateAttributes",
                    "kind": "LinkedField",
                    "name": "issuer",
                    "plural": false,
                    "selections": (v6/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CertificateAttributes",
                    "kind": "LinkedField",
                    "name": "subject",
                    "plural": false,
                    "selections": (v6/*: any*/),
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
            "args": null,
            "kind": "ScalarField",
            "name": "hasSignature",
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
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "owner",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v5/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "defaultBranch",
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      }
    ],
    "type": "ReferencedEvent",
    "abstractKey": null
  },
  (v4/*: any*/)
],
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Node"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Commit"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v17 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "GitSignature"
},
v19 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "CertificateAttributes"
},
v20 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v21 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v22 = {
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
v23 = {
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
v24 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v25 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReferencedSubject"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReferencedEventTestTwoNodesQuery",
    "selections": [
      {
        "alias": "node1",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v1/*: any*/),
        "storageKey": "node(id:\"node-id1\")"
      },
      {
        "alias": "node2",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v1/*: any*/),
        "storageKey": "node(id:\"node-id2\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ReferencedEventTestTwoNodesQuery",
    "selections": [
      {
        "alias": "node1",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": "node(id:\"node-id1\")"
      },
      {
        "alias": "node2",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": "node(id:\"node-id2\")"
      }
    ]
  },
  "params": {
    "id": "b808e1556facb76762e7f4a5b19d34cc",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node1": (v8/*: any*/),
        "node1.__typename": (v9/*: any*/),
        "node1.actor": (v10/*: any*/),
        "node1.actor.__isActor": (v9/*: any*/),
        "node1.actor.__typename": (v9/*: any*/),
        "node1.actor.avatarUrl": (v11/*: any*/),
        "node1.actor.id": (v12/*: any*/),
        "node1.actor.login": (v9/*: any*/),
        "node1.commit": (v13/*: any*/),
        "node1.commit.abbreviatedOid": (v9/*: any*/),
        "node1.commit.hasSignature": (v14/*: any*/),
        "node1.commit.id": (v12/*: any*/),
        "node1.commit.message": (v9/*: any*/),
        "node1.commit.messageBodyHTML": (v15/*: any*/),
        "node1.commit.messageHeadlineHTML": (v15/*: any*/),
        "node1.commit.repository": (v16/*: any*/),
        "node1.commit.repository.defaultBranch": (v9/*: any*/),
        "node1.commit.repository.id": (v12/*: any*/),
        "node1.commit.repository.name": (v9/*: any*/),
        "node1.commit.repository.owner": (v17/*: any*/),
        "node1.commit.repository.owner.__typename": (v9/*: any*/),
        "node1.commit.repository.owner.id": (v12/*: any*/),
        "node1.commit.repository.owner.login": (v9/*: any*/),
        "node1.commit.signature": (v18/*: any*/),
        "node1.commit.signature.__typename": (v9/*: any*/),
        "node1.commit.signature.issuer": (v19/*: any*/),
        "node1.commit.signature.issuer.commonName": (v20/*: any*/),
        "node1.commit.signature.issuer.emailAddress": (v20/*: any*/),
        "node1.commit.signature.issuer.organization": (v20/*: any*/),
        "node1.commit.signature.issuer.organizationUnit": (v20/*: any*/),
        "node1.commit.signature.keyFingerprint": (v20/*: any*/),
        "node1.commit.signature.keyId": (v20/*: any*/),
        "node1.commit.signature.signer": (v21/*: any*/),
        "node1.commit.signature.signer.avatarUrl": (v11/*: any*/),
        "node1.commit.signature.signer.id": (v12/*: any*/),
        "node1.commit.signature.signer.login": (v9/*: any*/),
        "node1.commit.signature.state": (v22/*: any*/),
        "node1.commit.signature.subject": (v19/*: any*/),
        "node1.commit.signature.subject.commonName": (v20/*: any*/),
        "node1.commit.signature.subject.emailAddress": (v20/*: any*/),
        "node1.commit.signature.subject.organization": (v20/*: any*/),
        "node1.commit.signature.subject.organizationUnit": (v20/*: any*/),
        "node1.commit.signature.wasSignedByGitHub": (v14/*: any*/),
        "node1.commit.url": (v11/*: any*/),
        "node1.commit.verificationStatus": (v23/*: any*/),
        "node1.createdAt": (v24/*: any*/),
        "node1.databaseId": (v25/*: any*/),
        "node1.id": (v12/*: any*/),
        "node1.subject": (v26/*: any*/),
        "node1.subject.__isNode": (v9/*: any*/),
        "node1.subject.__typename": (v9/*: any*/),
        "node1.subject.id": (v12/*: any*/),
        "node1.willCloseSubject": (v14/*: any*/),
        "node2": (v8/*: any*/),
        "node2.__typename": (v9/*: any*/),
        "node2.actor": (v10/*: any*/),
        "node2.actor.__isActor": (v9/*: any*/),
        "node2.actor.__typename": (v9/*: any*/),
        "node2.actor.avatarUrl": (v11/*: any*/),
        "node2.actor.id": (v12/*: any*/),
        "node2.actor.login": (v9/*: any*/),
        "node2.commit": (v13/*: any*/),
        "node2.commit.abbreviatedOid": (v9/*: any*/),
        "node2.commit.hasSignature": (v14/*: any*/),
        "node2.commit.id": (v12/*: any*/),
        "node2.commit.message": (v9/*: any*/),
        "node2.commit.messageBodyHTML": (v15/*: any*/),
        "node2.commit.messageHeadlineHTML": (v15/*: any*/),
        "node2.commit.repository": (v16/*: any*/),
        "node2.commit.repository.defaultBranch": (v9/*: any*/),
        "node2.commit.repository.id": (v12/*: any*/),
        "node2.commit.repository.name": (v9/*: any*/),
        "node2.commit.repository.owner": (v17/*: any*/),
        "node2.commit.repository.owner.__typename": (v9/*: any*/),
        "node2.commit.repository.owner.id": (v12/*: any*/),
        "node2.commit.repository.owner.login": (v9/*: any*/),
        "node2.commit.signature": (v18/*: any*/),
        "node2.commit.signature.__typename": (v9/*: any*/),
        "node2.commit.signature.issuer": (v19/*: any*/),
        "node2.commit.signature.issuer.commonName": (v20/*: any*/),
        "node2.commit.signature.issuer.emailAddress": (v20/*: any*/),
        "node2.commit.signature.issuer.organization": (v20/*: any*/),
        "node2.commit.signature.issuer.organizationUnit": (v20/*: any*/),
        "node2.commit.signature.keyFingerprint": (v20/*: any*/),
        "node2.commit.signature.keyId": (v20/*: any*/),
        "node2.commit.signature.signer": (v21/*: any*/),
        "node2.commit.signature.signer.avatarUrl": (v11/*: any*/),
        "node2.commit.signature.signer.id": (v12/*: any*/),
        "node2.commit.signature.signer.login": (v9/*: any*/),
        "node2.commit.signature.state": (v22/*: any*/),
        "node2.commit.signature.subject": (v19/*: any*/),
        "node2.commit.signature.subject.commonName": (v20/*: any*/),
        "node2.commit.signature.subject.emailAddress": (v20/*: any*/),
        "node2.commit.signature.subject.organization": (v20/*: any*/),
        "node2.commit.signature.subject.organizationUnit": (v20/*: any*/),
        "node2.commit.signature.wasSignedByGitHub": (v14/*: any*/),
        "node2.commit.url": (v11/*: any*/),
        "node2.commit.verificationStatus": (v23/*: any*/),
        "node2.createdAt": (v24/*: any*/),
        "node2.databaseId": (v25/*: any*/),
        "node2.id": (v12/*: any*/),
        "node2.subject": (v26/*: any*/),
        "node2.subject.__isNode": (v9/*: any*/),
        "node2.subject.__typename": (v9/*: any*/),
        "node2.subject.id": (v12/*: any*/),
        "node2.willCloseSubject": (v14/*: any*/)
      }
    },
    "name": "ReferencedEventTestTwoNodesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "739c1e3f20a8dacf4432e7a1a9e8943e";

export default node;
