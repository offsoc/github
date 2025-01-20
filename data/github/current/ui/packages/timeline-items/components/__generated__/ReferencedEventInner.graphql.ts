/**
 * @generated SignedSource<<5ca497c9ca66bbc5988a29e34226f9e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type CommitVerificationStatus = "PARTIALLY_VERIFIED" | "UNSIGNED" | "UNVERIFIED" | "VERIFIED" | "%future added value";
export type GitSignatureState = "BAD_CERT" | "BAD_EMAIL" | "EXPIRED_KEY" | "GPGVERIFY_ERROR" | "GPGVERIFY_UNAVAILABLE" | "INVALID" | "MALFORMED_SIG" | "NOT_SIGNING_KEY" | "NO_USER" | "OCSP_ERROR" | "OCSP_PENDING" | "OCSP_REVOKED" | "UNKNOWN_KEY" | "UNKNOWN_SIG_TYPE" | "UNSIGNED" | "UNVERIFIED_EMAIL" | "VALID" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ReferencedEventInner$data = {
  readonly abbreviatedOid: string;
  readonly hasSignature: boolean;
  readonly message: string;
  readonly messageBodyHTML: string;
  readonly messageHeadlineHTML: string;
  readonly repository: {
    readonly defaultBranch: string;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly signature: {
    readonly __typename: string;
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
  readonly url: string;
  readonly verificationStatus: CommitVerificationStatus | null | undefined;
  readonly " $fragmentType": "ReferencedEventInner";
};
export type ReferencedEventInner$key = {
  readonly " $data"?: ReferencedEventInner$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReferencedEventInner">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v1 = [
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
  "name": "ReferencedEventInner",
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
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "signer",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "avatarUrl",
              "storageKey": null
            }
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
              "selections": (v1/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "CertificateAttributes",
              "kind": "LinkedField",
              "name": "subject",
              "plural": false,
              "selections": (v1/*: any*/),
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
            (v0/*: any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "defaultBranch",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Commit",
  "abstractKey": null
};
})();

(node as any).hash = "f43951d54ca90802561c9d61be7af7a9";

export default node;
