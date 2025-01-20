/**
 * @generated SignedSource<<9c5f492785da6106d3abdd8f6abc7210>>
 * @relayHash 0ec27968d3caa9566cce5b4c519eaf3f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 0ec27968d3caa9566cce5b4c519eaf3f

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DismissNoticeInput = {
  clientMutationId?: string | null | undefined;
  notice: string;
};
export type dismissFirstTimeContributionBannerMutation$variables = {
  input: DismissNoticeInput;
};
export type dismissFirstTimeContributionBannerMutation$data = {
  readonly dismissNotice: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type dismissFirstTimeContributionBannerMutation = {
  response: dismissFirstTimeContributionBannerMutation$data;
  variables: dismissFirstTimeContributionBannerMutation$variables;
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
    "concreteType": "DismissNoticePayload",
    "kind": "LinkedField",
    "name": "dismissNotice",
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
    "name": "dismissFirstTimeContributionBannerMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "dismissFirstTimeContributionBannerMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "0ec27968d3caa9566cce5b4c519eaf3f",
    "metadata": {},
    "name": "dismissFirstTimeContributionBannerMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "627f89c848988611d395dde7073ca948";

export default node;
