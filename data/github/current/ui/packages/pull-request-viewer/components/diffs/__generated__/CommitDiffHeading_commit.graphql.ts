/**
 * @generated SignedSource<<915088f790e98cc0618c4795132a2401>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CommitVerificationStatus = "PARTIALLY_VERIFIED" | "UNSIGNED" | "UNVERIFIED" | "VERIFIED" | "%future added value";
export type GitSignatureState = "BAD_CERT" | "BAD_EMAIL" | "EXPIRED_KEY" | "GPGVERIFY_ERROR" | "GPGVERIFY_UNAVAILABLE" | "INVALID" | "MALFORMED_SIG" | "NOT_SIGNING_KEY" | "NO_USER" | "OCSP_ERROR" | "OCSP_PENDING" | "OCSP_REVOKED" | "UNKNOWN_KEY" | "UNKNOWN_SIG_TYPE" | "UNSIGNED" | "UNVERIFIED_EMAIL" | "VALID" | "%future added value";
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type CommitDiffHeading_commit$data = {
  readonly abbreviatedOid: string;
  readonly authoredByCommitter: boolean;
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
  readonly hasSignature: boolean;
  readonly messageBodyHTML: string;
  readonly messageHeadlineHTML: string;
  readonly oid: any;
  readonly repository: {
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
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
  readonly " $fragmentType": "CommitDiffHeading_commit";
};
export type CommitDiffHeading_commit$key = {
  readonly " $data"?: CommitDiffHeading_commit$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommitDiffHeading_commit">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
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
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommitDiffHeading_commit",
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
              "selections": (v3/*: any*/),
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
      "selections": (v3/*: any*/),
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
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        (v2/*: any*/)
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
        (v4/*: any*/)
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
        (v4/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "signer",
          "plural": false,
          "selections": [
            (v1/*: any*/),
            (v0/*: any*/)
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
            (v5/*: any*/),
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
            (v5/*: any*/),
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
            (v5/*: any*/),
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
};
})();

(node as any).hash = "4cdea60c8747358c2e7bf60ab918a623";

export default node;
