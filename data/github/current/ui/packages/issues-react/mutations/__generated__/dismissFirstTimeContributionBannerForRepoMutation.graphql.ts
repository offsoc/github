/**
 * @generated SignedSource<<7fa11f56b2f287bad636d7361827e1ac>>
 * @relayHash da3ddd34bd75926d4b320abbf42dba8b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID da3ddd34bd75926d4b320abbf42dba8b

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DismissRepositoryNoticeInput = {
  clientMutationId?: string | null | undefined;
  notice: string;
  repositoryId: string;
};
export type dismissFirstTimeContributionBannerForRepoMutation$variables = {
  input: DismissRepositoryNoticeInput;
};
export type dismissFirstTimeContributionBannerForRepoMutation$data = {
  readonly dismissRepositoryNotice: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type dismissFirstTimeContributionBannerForRepoMutation = {
  response: dismissFirstTimeContributionBannerForRepoMutation$data;
  variables: dismissFirstTimeContributionBannerForRepoMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DismissRepositoryNoticePayload",
    "kind": "LinkedField",
    "name": "dismissRepositoryNotice",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "dismissFirstTimeContributionBannerForRepoMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "dismissFirstTimeContributionBannerForRepoMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "da3ddd34bd75926d4b320abbf42dba8b",
    "metadata": {},
    "name": "dismissFirstTimeContributionBannerForRepoMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "a7ab55b350a1a7ea25ac34d44f953470";

export default node;
