/**
 * @generated SignedSource<<bfc620eabddc087ec73ea575b04bc8b8>>
 * @relayHash 070df29f4bdaac8e4045edaee83c8e86
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 070df29f4bdaac8e4045edaee83c8e86

import { ConcreteRequest, Query } from 'relay-runtime';
export type EmuContributionBlockedBannerQuery$variables = {
  enterpriseId: string;
};
export type EmuContributionBlockedBannerQuery$data = {
  readonly node: {
    readonly slug?: string;
  } | null | undefined;
};
export type EmuContributionBlockedBannerQuery = {
  response: EmuContributionBlockedBannerQuery$data;
  variables: EmuContributionBlockedBannerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "enterpriseId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "enterpriseId"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slug",
      "storageKey": null
    }
  ],
  "type": "Enterprise",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EmuContributionBlockedBannerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "EmuContributionBlockedBannerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "070df29f4bdaac8e4045edaee83c8e86",
    "metadata": {},
    "name": "EmuContributionBlockedBannerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1a22b02e388e4fe346c25ca360ecd63c";

export default node;
