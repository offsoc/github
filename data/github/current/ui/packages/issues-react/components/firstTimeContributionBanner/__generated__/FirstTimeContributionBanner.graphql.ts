/**
 * @generated SignedSource<<a49146ba989f87c50cf624016e1650ed>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FirstTimeContributionBanner$data = {
  readonly communityProfile: {
    readonly goodFirstIssueIssuesCount: number;
  } | null | undefined;
  readonly contributingGuidelines: {
    readonly url: string | null | undefined;
  } | null | undefined;
  readonly nameWithOwner: string;
  readonly showFirstTimeContributorBanner: boolean | null | undefined;
  readonly url: string;
  readonly " $fragmentType": "FirstTimeContributionBanner";
};
export type FirstTimeContributionBanner$key = {
  readonly " $data"?: FirstTimeContributionBanner$data;
  readonly " $fragmentSpreads": FragmentRefs<"FirstTimeContributionBanner">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FirstTimeContributionBanner",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "isPullRequests",
          "value": false
        }
      ],
      "kind": "ScalarField",
      "name": "showFirstTimeContributorBanner",
      "storageKey": "showFirstTimeContributorBanner(isPullRequests:false)"
    },
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
      "concreteType": "ContributingGuidelines",
      "kind": "LinkedField",
      "name": "contributingGuidelines",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CommunityProfile",
      "kind": "LinkedField",
      "name": "communityProfile",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "goodFirstIssueIssuesCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v0/*: any*/)
  ],
  "type": "Repository",
  "abstractKey": null
};
})();

(node as any).hash = "0261b7bef1224f661571fba4b1b56b48";

export default node;
