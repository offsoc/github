/**
 * @generated SignedSource<<e9688f16bd20eb64ce16492bc7b2f1d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RelationshipsSectionFragment$data = {
  readonly id: string;
  readonly parent: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"ParentIssueFragment">;
  } | null | undefined;
  readonly repository: {
    readonly nameWithOwner: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly " $fragmentSpreads": FragmentRefs<"useCanEditSubIssues">;
  readonly " $fragmentType": "RelationshipsSectionFragment";
};
export type RelationshipsSectionFragment$key = {
  readonly " $data"?: RelationshipsSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RelationshipsSectionFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelationshipsSectionFragment",
  "selections": [
    (v0/*: any*/),
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
          "name": "nameWithOwner",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "parent",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ParentIssueFragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useCanEditSubIssues"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "e01c3ab4a1278f585ec1d75bdc5afaca";

export default node;
