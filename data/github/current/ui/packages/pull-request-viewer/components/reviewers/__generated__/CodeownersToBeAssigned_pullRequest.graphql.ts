/**
 * @generated SignedSource<<bb6e9222a0f8e8dab3019155742eed61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeownersToBeAssigned_pullRequest$data = {
  readonly codeowners: ReadonlyArray<{
    readonly __typename: "Team";
    readonly combinedSlug: string;
    readonly id: string;
    readonly name: string;
    readonly organization: {
      readonly name: string | null | undefined;
    };
    readonly teamAvatarUrl: string | null | undefined;
    readonly url: string;
  } | {
    readonly __typename: "User";
    readonly avatarUrl: string;
    readonly id: string;
    readonly login: string;
    readonly url: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  }> | null | undefined;
  readonly " $fragmentType": "CodeownersToBeAssigned_pullRequest";
};
export type CodeownersToBeAssigned_pullRequest$key = {
  readonly " $data"?: CodeownersToBeAssigned_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeownersToBeAssigned_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
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
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CodeownersToBeAssigned_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "codeowners",
      "plural": true,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "avatarUrl",
              "storageKey": null
            },
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            },
            (v1/*: any*/),
            (v2/*: any*/)
          ],
          "type": "User",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": "teamAvatarUrl",
              "args": null,
              "kind": "ScalarField",
              "name": "avatarUrl",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "combinedSlug",
              "storageKey": null
            },
            (v0/*: any*/),
            (v3/*: any*/),
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Organization",
              "kind": "LinkedField",
              "name": "organization",
              "plural": false,
              "selections": [
                (v3/*: any*/)
              ],
              "storageKey": null
            },
            (v2/*: any*/)
          ],
          "type": "Team",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "2a1e79e08d4f9b7ad05d22cf0936c6c5";

export default node;
