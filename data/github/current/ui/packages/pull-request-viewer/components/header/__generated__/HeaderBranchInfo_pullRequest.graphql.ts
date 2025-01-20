/**
 * @generated SignedSource<<434626e112c2e6269ff6955fb15bde66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type HeaderBranchInfo_pullRequest$data = {
  readonly author: {
    readonly login: string;
  } | null | undefined;
  readonly baseRef: {
    readonly repository: {
      readonly defaultBranch: string;
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
  } | null | undefined;
  readonly baseRefName: string;
  readonly baseRepository: {
    readonly defaultBranchRef: {
      readonly name: string;
    } | null | undefined;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  } | null | undefined;
  readonly commits: {
    readonly totalCount: number;
  };
  readonly headRefName: string;
  readonly headRepository: {
    readonly isFork: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  } | null | undefined;
  readonly mergedAt: string | null | undefined;
  readonly state: PullRequestState;
  readonly viewerCanChangeBaseBranch: boolean;
  readonly " $fragmentType": "HeaderBranchInfo_pullRequest";
};
export type HeaderBranchInfo_pullRequest$key = {
  readonly " $data"?: HeaderBranchInfo_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderBranchInfo_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderBranchInfo_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mergedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "baseRefName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Ref",
      "kind": "LinkedField",
      "name": "baseRef",
      "plural": false,
      "selections": [
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
              "name": "defaultBranch",
              "storageKey": null
            },
            (v0/*: any*/),
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      ],
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
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestCommitConnection",
      "kind": "LinkedField",
      "name": "commits",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "baseRepository",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Ref",
          "kind": "LinkedField",
          "name": "defaultBranchRef",
          "plural": false,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "headRepository",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isFork",
          "storageKey": null
        },
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanChangeBaseBranch",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "ff666d78c1f8ee4b42ea0b5a9d083db1";

export default node;
