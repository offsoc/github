/**
 * @generated SignedSource<<f12c31263aaee74742e1d94eda13c0f4>>
 * @relayHash e8df2ecef95b839e26dd1915df419f88
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e8df2ecef95b839e26dd1915df419f88

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitVerificationStatus = "PARTIALLY_VERIFIED" | "UNSIGNED" | "UNVERIFIED" | "VERIFIED" | "%future added value";
export type DiffLineType = "ADDITION" | "CONTEXT" | "DELETION" | "HUNK" | "INJECTED_CONTEXT" | "%future added value";
export type DiffSide = "LEFT" | "RIGHT" | "%future added value";
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
export type GitSignatureState = "BAD_CERT" | "BAD_EMAIL" | "EXPIRED_KEY" | "GPGVERIFY_ERROR" | "GPGVERIFY_UNAVAILABLE" | "INVALID" | "MALFORMED_SIG" | "NOT_SIGNING_KEY" | "NO_USER" | "OCSP_ERROR" | "OCSP_PENDING" | "OCSP_REVOKED" | "UNKNOWN_KEY" | "UNKNOWN_SIG_TYPE" | "UNSIGNED" | "UNVERIFIED_EMAIL" | "VALID" | "%future added value";
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
export type DiffLineRange = {
  end: number;
  start: number;
};
export type updateTitleAndBaseBranchMutation$variables = {
  baseBranchChanged: boolean;
  diffEntryCount?: number | null | undefined;
  diffEntryCursor?: string | null | undefined;
  endOid?: string | null | undefined;
  id: string;
  injectedContextLines?: ReadonlyArray<DiffLineRange> | null | undefined;
  inlineThreadCount?: number | null | undefined;
  isSingleCommit?: boolean | null | undefined;
  newBaseBranch?: string | null | undefined;
  newTitle: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
  titleChanged: boolean;
};
export type updateTitleAndBaseBranchMutation$data = {
  readonly updatePullRequest: {
    readonly pullRequest: {
      readonly baseRefName?: string;
      readonly id: string;
      readonly title?: string;
      readonly titleHTML?: string;
      readonly " $fragmentSpreads": FragmentRefs<"DiffsWithComments_pullRequest" | "FileTree_pullRequest">;
    } | null | undefined;
  } | null | undefined;
};
export type updateTitleAndBaseBranchMutation$rawResponse = {
  readonly updatePullRequest: {
    readonly pullRequest: {
      readonly allThreads: {
        readonly totalCommentsCount: number;
      };
      readonly baseRefName: string;
      readonly baseRepository: {
        readonly id: string;
        readonly nameWithOwner: string;
      } | null | undefined;
      readonly comparison: {
        readonly diffEntries: {
          readonly edges: ReadonlyArray<{
            readonly cursor: string;
            readonly node: {
              readonly __typename: "PullRequestDiffEntry";
              readonly diffEntryId: string;
              readonly diffLines: ReadonlyArray<{
                readonly __typename: "DiffLine";
                readonly __id?: string;
                readonly blobLineNumber: number;
                readonly html: string;
                readonly left: number | null | undefined;
                readonly right: number | null | undefined;
                readonly text: string;
                readonly threads: {
                  readonly __id?: string;
                  readonly edges: ReadonlyArray<{
                    readonly node: {
                      readonly comments: {
                        readonly __id?: string;
                        readonly edges: ReadonlyArray<{
                          readonly node: {
                            readonly author: {
                              readonly __typename: string;
                              readonly avatarUrl: string;
                              readonly id: string;
                              readonly login: string;
                            } | null | undefined;
                            readonly id: string;
                          } | null | undefined;
                        } | null | undefined> | null | undefined;
                        readonly totalCount: number;
                      };
                      readonly diffSide: DiffSide;
                      readonly id: string;
                      readonly isOutdated: boolean;
                      readonly line: number | null | undefined;
                      readonly startDiffSide: DiffSide | null | undefined;
                      readonly startLine: number | null | undefined;
                    } | null | undefined;
                  } | null | undefined> | null | undefined;
                  readonly totalCommentsCount: number;
                  readonly totalCount: number;
                } | null | undefined;
                readonly type: DiffLineType;
              } | null | undefined> | null | undefined;
              readonly diffLinesManuallyExpandedListDiffView?: boolean | null | undefined;
              readonly diffLinesManuallyUnhidden?: boolean | null | undefined;
              readonly hasInjectedContextLinesListDiffView?: boolean | null | undefined;
              readonly id: string;
              readonly injectedContextLinesListDiffView?: ReadonlyArray<{
                readonly end: number;
                readonly start: number;
              }> | null | undefined;
              readonly isBinary: boolean;
              readonly isCollapsed?: boolean | null | undefined;
              readonly isLfsPointer: boolean;
              readonly isSubmodule: boolean;
              readonly isTooBig: boolean;
              readonly linesAdded: number;
              readonly linesChanged: number;
              readonly linesDeleted: number;
              readonly newTreeEntry: {
                readonly isGenerated: boolean;
                readonly lineCount: number | null | undefined;
                readonly mode: number;
                readonly path: string | null | undefined;
              } | null | undefined;
              readonly objectId?: string;
              readonly oid: string;
              readonly oldTreeEntry: {
                readonly lineCount: number | null | undefined;
                readonly mode: number;
                readonly path: string | null | undefined;
              } | null | undefined;
              readonly outdatedThreads: {
                readonly __id?: string;
                readonly edges: ReadonlyArray<{
                  readonly node: {
                    readonly comments: {
                      readonly __id?: string;
                      readonly edges: ReadonlyArray<{
                        readonly node: {
                          readonly author: {
                            readonly __typename: string;
                            readonly avatarUrl: string;
                            readonly id: string;
                            readonly login: string;
                          } | null | undefined;
                          readonly id: string;
                        } | null | undefined;
                      } | null | undefined> | null | undefined;
                      readonly totalCount: number;
                    };
                    readonly id: string;
                    readonly isOutdated: boolean;
                  } | null | undefined;
                } | null | undefined> | null | undefined;
                readonly totalCommentsCount: number;
                readonly totalCount: number;
              };
              readonly path: string;
              readonly pathDigest: string;
              readonly pathOwnership: {
                readonly isOwnedByViewer: boolean;
                readonly pathOwners: ReadonlyArray<{
                  readonly name: string;
                }>;
                readonly ruleLineNumber: number | null | undefined;
                readonly ruleUrl: string | null | undefined;
              };
              readonly status: PatchStatus;
              readonly threads: {
                readonly __id?: string;
                readonly edges: ReadonlyArray<{
                  readonly cursor: string;
                  readonly node: {
                    readonly __typename: "PullRequestThread";
                    readonly comments: {
                      readonly __id?: string;
                      readonly edges: ReadonlyArray<{
                        readonly node: {
                          readonly author: {
                            readonly __typename: string;
                            readonly avatarUrl: string;
                            readonly id: string;
                            readonly login: string;
                          } | null | undefined;
                          readonly id: string;
                        } | null | undefined;
                      } | null | undefined> | null | undefined;
                      readonly totalCount: number;
                    };
                    readonly id: string;
                    readonly isOutdated: boolean;
                  } | null | undefined;
                } | null | undefined> | null | undefined;
                readonly pageInfo: {
                  readonly endCursor: string | null | undefined;
                  readonly hasNextPage: boolean;
                };
                readonly totalCommentsCount: number;
                readonly totalCount: number;
              };
              readonly truncatedReason: string | null | undefined;
              readonly viewerViewedState: FileViewedState | null | undefined;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly pageInfo: {
            readonly endCursor: string | null | undefined;
            readonly hasNextPage: boolean;
          };
        };
        readonly linesAdded: number;
        readonly linesDeleted: number;
        readonly newCommit: {
          readonly abbreviatedOid?: string;
          readonly authoredByCommitter?: boolean;
          readonly authors?: {
            readonly edges: ReadonlyArray<{
              readonly node: {
                readonly user: {
                  readonly avatarUrl: string;
                  readonly id: string;
                  readonly login: string;
                  readonly name: string | null | undefined;
                  readonly resourcePath: string;
                } | null | undefined;
              } | null | undefined;
            } | null | undefined> | null | undefined;
          };
          readonly committedDate?: string;
          readonly committedViaWeb?: boolean;
          readonly committer?: {
            readonly user: {
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
              readonly name: string | null | undefined;
              readonly resourcePath: string;
            } | null | undefined;
          } | null | undefined;
          readonly hasSignature?: boolean;
          readonly id: string;
          readonly messageBodyHTML?: string;
          readonly messageHeadlineHTML?: string;
          readonly oid: any;
          readonly repository?: {
            readonly id: string;
            readonly name: string;
            readonly owner: {
              readonly __typename: string;
              readonly id: string;
              readonly login: string;
            };
          };
          readonly signature?: {
            readonly __typename: "GpgSignature";
            readonly keyId: string | null | undefined;
            readonly signer: {
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly state: GitSignatureState;
            readonly wasSignedByGitHub: boolean;
          } | {
            readonly __typename: "SmimeSignature";
            readonly issuer: {
              readonly commonName: string | null | undefined;
              readonly emailAddress: string | null | undefined;
              readonly organization: string | null | undefined;
              readonly organizationUnit: string | null | undefined;
            } | null | undefined;
            readonly signer: {
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly state: GitSignatureState;
            readonly subject: {
              readonly commonName: string | null | undefined;
              readonly emailAddress: string | null | undefined;
              readonly organization: string | null | undefined;
              readonly organizationUnit: string | null | undefined;
            } | null | undefined;
            readonly wasSignedByGitHub: boolean;
          } | {
            readonly __typename: "SshSignature";
            readonly keyFingerprint: string | null | undefined;
            readonly signer: {
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly state: GitSignatureState;
            readonly wasSignedByGitHub: boolean;
          } | {
            readonly __typename: string;
            readonly signer: {
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly state: GitSignatureState;
            readonly wasSignedByGitHub: boolean;
          } | null | undefined;
          readonly statusCheckRollup?: {
            readonly id: string;
            readonly shortText: string;
            readonly state: StatusState;
          } | null | undefined;
          readonly verificationStatus?: CommitVerificationStatus | null | undefined;
        };
        readonly oldCommit: {
          readonly id: string;
          readonly oid: any;
        };
        readonly summary: ReadonlyArray<{
          readonly __typename: "PullRequestSummaryDelta";
          readonly changeType: PatchStatus;
          readonly path: string;
          readonly pathDigest: string;
          readonly totalAnnotationsCount: number;
          readonly totalCommentsCount: number;
        }> | null | undefined;
      } | null | undefined;
      readonly headRefName: string;
      readonly headRepository: {
        readonly id: string;
        readonly nameWithOwner: string;
      } | null | undefined;
      readonly id: string;
      readonly number: number;
      readonly repository: {
        readonly id: string;
        readonly name: string;
        readonly owner: {
          readonly __typename: string;
          readonly id: string;
          readonly login: string;
        };
      };
      readonly title: string;
      readonly titleHTML: string;
      readonly viewerCanEditFiles: boolean;
      readonly viewerPreferences: {
        readonly ignoreWhitespace: boolean | null | undefined;
      };
      readonly viewerViewedFiles: number;
    } | null | undefined;
  } | null | undefined;
};
export type updateTitleAndBaseBranchMutation = {
  rawResponse: updateTitleAndBaseBranchMutation$rawResponse;
  response: updateTitleAndBaseBranchMutation$data;
  variables: updateTitleAndBaseBranchMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "baseBranchChanged"
},
v1 = {
  "defaultValue": 5,
  "kind": "LocalArgument",
  "name": "diffEntryCount"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "diffEntryCursor"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "injectedContextLines"
},
v6 = {
  "defaultValue": 20,
  "kind": "LocalArgument",
  "name": "inlineThreadCount"
},
v7 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "isSingleCommit"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "newBaseBranch"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "newTitle"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "titleChanged"
},
v13 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "baseRefName",
        "variableName": "newBaseBranch"
      },
      {
        "kind": "Variable",
        "name": "pullRequestId",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "title",
        "variableName": "newTitle"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "baseRefName",
  "storageKey": null
},
v16 = {
  "condition": "titleChanged",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "titleHTML",
      "storageKey": null
    }
  ]
},
v17 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "nameWithOwner",
    "storageKey": null
  },
  (v14/*: any*/)
],
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v19 = [
  (v18/*: any*/),
  (v14/*: any*/)
],
v20 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "diffEntryCursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "diffEntryCount"
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pathDigest",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v27 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v29 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v30 = {
  "alias": null,
  "args": [
    (v27/*: any*/)
  ],
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v24/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestReviewCommentEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestReviewComment",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "author",
              "plural": false,
              "selections": [
                (v23/*: any*/),
                {
                  "alias": null,
                  "args": [
                    {
                      "kind": "Literal",
                      "name": "size",
                      "value": 48
                    }
                  ],
                  "kind": "ScalarField",
                  "name": "avatarUrl",
                  "storageKey": "avatarUrl(size:48)"
                },
                (v28/*: any*/),
                (v14/*: any*/)
              ],
              "storageKey": null
            },
            (v14/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v29/*: any*/)
  ],
  "storageKey": "comments(first:50)"
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mode",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lineCount",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "linesAdded",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "linesDeleted",
  "storageKey": null
},
v36 = [
  (v27/*: any*/),
  {
    "kind": "Literal",
    "name": "subjectType",
    "value": "FILE"
  }
],
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v40 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      (v39/*: any*/),
      (v28/*: any*/),
      (v33/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourcePath",
        "storageKey": null
      },
      (v14/*: any*/)
    ],
    "storageKey": null
  }
],
v41 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v23/*: any*/),
    (v28/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v43 = [
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
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "updateTitleAndBaseBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v13/*: any*/),
        "concreteType": "UpdatePullRequestPayload",
        "kind": "LinkedField",
        "name": "updatePullRequest",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              {
                "condition": "baseBranchChanged",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v15/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DiffsWithComments_pullRequest"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "FileTree_pullRequest"
                  }
                ]
              },
              (v16/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v9/*: any*/),
      (v8/*: any*/),
      (v10/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v0/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "updateTitleAndBaseBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v13/*: any*/),
        "concreteType": "UpdatePullRequestPayload",
        "kind": "LinkedField",
        "name": "updatePullRequest",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              {
                "condition": "baseBranchChanged",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  (v15/*: any*/),
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
                    "name": "headRefName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "headRepository",
                    "plural": false,
                    "selections": (v17/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "baseRepository",
                    "plural": false,
                    "selections": (v17/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanEditFiles",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Variable",
                        "name": "endOid",
                        "variableName": "endOid"
                      },
                      {
                        "kind": "Variable",
                        "name": "singleCommitOid",
                        "variableName": "singleCommitOid"
                      },
                      {
                        "kind": "Variable",
                        "name": "startOid",
                        "variableName": "startOid"
                      }
                    ],
                    "concreteType": "PullRequestComparison",
                    "kind": "LinkedField",
                    "name": "comparison",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Commit",
                        "kind": "LinkedField",
                        "name": "oldCommit",
                        "plural": false,
                        "selections": (v19/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Commit",
                        "kind": "LinkedField",
                        "name": "newCommit",
                        "plural": false,
                        "selections": (v19/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v20/*: any*/),
                        "concreteType": "PullRequestDiffEntryConnection",
                        "kind": "LinkedField",
                        "name": "diffEntries",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestDiffEntryEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestDiffEntry",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v21/*: any*/),
                                  (v22/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isTooBig",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "viewerViewedState",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": [
                                      {
                                        "kind": "Variable",
                                        "name": "injectedContextLines",
                                        "variableName": "injectedContextLines"
                                      }
                                    ],
                                    "concreteType": "DiffLine",
                                    "kind": "LinkedField",
                                    "name": "diffLines",
                                    "plural": true,
                                    "selections": [
                                      (v23/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "blobLineNumber",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "left",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "right",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "html",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "type",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "text",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": [
                                          {
                                            "kind": "Variable",
                                            "name": "first",
                                            "variableName": "inlineThreadCount"
                                          }
                                        ],
                                        "concreteType": "PullRequestThreadConnection",
                                        "kind": "LinkedField",
                                        "name": "threads",
                                        "plural": false,
                                        "selections": [
                                          (v24/*: any*/),
                                          (v25/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "PullRequestThreadEdge",
                                            "kind": "LinkedField",
                                            "name": "edges",
                                            "plural": true,
                                            "selections": [
                                              {
                                                "alias": null,
                                                "args": null,
                                                "concreteType": "PullRequestThread",
                                                "kind": "LinkedField",
                                                "name": "node",
                                                "plural": false,
                                                "selections": [
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "kind": "ScalarField",
                                                    "name": "diffSide",
                                                    "storageKey": null
                                                  },
                                                  (v14/*: any*/),
                                                  (v26/*: any*/),
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "kind": "ScalarField",
                                                    "name": "line",
                                                    "storageKey": null
                                                  },
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "kind": "ScalarField",
                                                    "name": "startDiffSide",
                                                    "storageKey": null
                                                  },
                                                  {
                                                    "alias": null,
                                                    "args": null,
                                                    "kind": "ScalarField",
                                                    "name": "startLine",
                                                    "storageKey": null
                                                  },
                                                  (v30/*: any*/)
                                                ],
                                                "storageKey": null
                                              }
                                            ],
                                            "storageKey": null
                                          },
                                          (v29/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v29/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": "diffEntryId",
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "id",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isBinary",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "linesChanged",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "status",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "truncatedReason",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "TreeEntry",
                                    "kind": "LinkedField",
                                    "name": "oldTreeEntry",
                                    "plural": false,
                                    "selections": [
                                      (v31/*: any*/),
                                      (v32/*: any*/),
                                      (v22/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "TreeEntry",
                                    "kind": "LinkedField",
                                    "name": "newTreeEntry",
                                    "plural": false,
                                    "selections": [
                                      (v31/*: any*/),
                                      (v32/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "isGenerated",
                                        "storageKey": null
                                      },
                                      (v22/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "PathOwnership",
                                    "kind": "LinkedField",
                                    "name": "pathOwnership",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "PathOwner",
                                        "kind": "LinkedField",
                                        "name": "pathOwners",
                                        "plural": true,
                                        "selections": [
                                          (v33/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "ruleLineNumber",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "ruleUrl",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "isOwnedByViewer",
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v34/*: any*/),
                                  (v35/*: any*/),
                                  (v14/*: any*/),
                                  (v18/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isSubmodule",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isLfsPointer",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": "outdatedThreads",
                                    "args": [
                                      (v27/*: any*/),
                                      {
                                        "kind": "Literal",
                                        "name": "outdatedFilter",
                                        "value": "ONLY_OUTDATED"
                                      },
                                      {
                                        "kind": "Literal",
                                        "name": "subjectType",
                                        "value": "LINE"
                                      }
                                    ],
                                    "concreteType": "PullRequestThreadConnection",
                                    "kind": "LinkedField",
                                    "name": "threads",
                                    "plural": false,
                                    "selections": [
                                      (v24/*: any*/),
                                      (v25/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "PullRequestThreadEdge",
                                        "kind": "LinkedField",
                                        "name": "edges",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "PullRequestThread",
                                            "kind": "LinkedField",
                                            "name": "node",
                                            "plural": false,
                                            "selections": [
                                              (v14/*: any*/),
                                              (v26/*: any*/),
                                              (v30/*: any*/)
                                            ],
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      },
                                      (v29/*: any*/)
                                    ],
                                    "storageKey": "threads(first:50,outdatedFilter:\"ONLY_OUTDATED\",subjectType:\"LINE\")"
                                  },
                                  {
                                    "alias": null,
                                    "args": (v36/*: any*/),
                                    "concreteType": "PullRequestThreadConnection",
                                    "kind": "LinkedField",
                                    "name": "threads",
                                    "plural": false,
                                    "selections": [
                                      (v24/*: any*/),
                                      (v25/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "PullRequestThreadEdge",
                                        "kind": "LinkedField",
                                        "name": "edges",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "PullRequestThread",
                                            "kind": "LinkedField",
                                            "name": "node",
                                            "plural": false,
                                            "selections": [
                                              (v14/*: any*/),
                                              (v26/*: any*/),
                                              (v30/*: any*/),
                                              (v23/*: any*/)
                                            ],
                                            "storageKey": null
                                          },
                                          (v37/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v38/*: any*/),
                                      (v29/*: any*/)
                                    ],
                                    "storageKey": "threads(first:50,subjectType:\"FILE\")"
                                  },
                                  {
                                    "alias": null,
                                    "args": (v36/*: any*/),
                                    "filters": [
                                      "subjectType"
                                    ],
                                    "handle": "connection",
                                    "key": "FileConversationsButton_threads",
                                    "kind": "LinkedHandle",
                                    "name": "threads"
                                  },
                                  {
                                    "kind": "ClientExtension",
                                    "selections": [
                                      {
                                        "alias": "objectId",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "__id",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "isCollapsed",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "diffLinesManuallyExpandedListDiffView",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "diffLinesManuallyUnhidden",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "hasInjectedContextLinesListDiffView",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Range",
                                        "kind": "LinkedField",
                                        "name": "injectedContextLinesListDiffView",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "start",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "end",
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ]
                                  },
                                  (v23/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v37/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v38/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": (v20/*: any*/),
                        "filters": null,
                        "handle": "connection",
                        "key": "Diffs_pullRequest_diffEntries",
                        "kind": "LinkedHandle",
                        "name": "diffEntries"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestSummaryDelta",
                        "kind": "LinkedField",
                        "name": "summary",
                        "plural": true,
                        "selections": [
                          (v23/*: any*/),
                          (v22/*: any*/),
                          (v21/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "changeType",
                            "storageKey": null
                          },
                          (v25/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totalAnnotationsCount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v34/*: any*/),
                      (v35/*: any*/),
                      {
                        "condition": "isSingleCommit",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Commit",
                            "kind": "LinkedField",
                            "name": "newCommit",
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
                                        "selections": (v40/*: any*/),
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
                                "selections": (v40/*: any*/),
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
                                  (v41/*: any*/),
                                  (v33/*: any*/),
                                  (v14/*: any*/)
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
                                  (v42/*: any*/),
                                  (v14/*: any*/)
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
                                  (v23/*: any*/),
                                  (v42/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "User",
                                    "kind": "LinkedField",
                                    "name": "signer",
                                    "plural": false,
                                    "selections": [
                                      (v28/*: any*/),
                                      (v39/*: any*/),
                                      (v14/*: any*/)
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
                                        "selections": (v43/*: any*/),
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "CertificateAttributes",
                                        "kind": "LinkedField",
                                        "name": "subject",
                                        "plural": false,
                                        "selections": (v43/*: any*/),
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
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestUserPreferences",
                    "kind": "LinkedField",
                    "name": "viewerPreferences",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "ignoreWhitespace",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerViewedFiles",
                    "storageKey": null
                  },
                  {
                    "alias": "allThreads",
                    "args": [
                      (v27/*: any*/),
                      {
                        "kind": "Literal",
                        "name": "isPositioned",
                        "value": false
                      }
                    ],
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "threads",
                    "plural": false,
                    "selections": [
                      (v25/*: any*/)
                    ],
                    "storageKey": "threads(first:50,isPositioned:false)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "repository",
                    "plural": false,
                    "selections": [
                      (v33/*: any*/),
                      (v41/*: any*/),
                      (v14/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              },
              (v16/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "e8df2ecef95b839e26dd1915df419f88",
    "metadata": {},
    "name": "updateTitleAndBaseBranchMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "022dfb1e70cf98a3c9aa552d8094e703";

export default node;
