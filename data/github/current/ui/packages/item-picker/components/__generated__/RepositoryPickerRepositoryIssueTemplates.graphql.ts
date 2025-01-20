/**
 * @generated SignedSource<<80beaa60d0e1c61555c68109e8cd0ec3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RepositoryPickerRepositoryIssueTemplates$data = {
  readonly contactLinks: ReadonlyArray<{
    readonly __typename: "RepositoryContactLink";
    readonly __id: string;
    readonly about: string;
    readonly name: string;
    readonly url: string;
  }> | null | undefined;
  readonly isBlankIssuesEnabled: boolean;
  readonly isSecurityPolicyEnabled: boolean | null | undefined;
  readonly issueForms: ReadonlyArray<{
    readonly __typename: "IssueForm";
    readonly __id: string;
    readonly assignees: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly totalCount: number;
    };
    readonly description: string | null | undefined;
    readonly filename: string;
    readonly labels: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"LabelPickerLabel">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly totalCount: number;
    } | null | undefined;
    readonly name: string;
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly title: string | null | undefined;
    readonly type: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypePickerIssueType">;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"IssueFormElements_templateElements">;
  }> | null | undefined;
  readonly issueTemplates: ReadonlyArray<{
    readonly __typename: "IssueTemplate";
    readonly __id: string;
    readonly about: string | null | undefined;
    readonly assignees: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly totalCount: number;
    };
    readonly body: string | null | undefined;
    readonly filename: string;
    readonly labels: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly " $fragmentSpreads": FragmentRefs<"LabelPickerLabel">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly totalCount: number;
    } | null | undefined;
    readonly name: string;
    readonly title: string | null | undefined;
    readonly type: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypePickerIssueType">;
    } | null | undefined;
  }> | null | undefined;
  readonly securityPolicyUrl: string | null | undefined;
  readonly templateTreeUrl: string;
  readonly " $fragmentType": "RepositoryPickerRepositoryIssueTemplates";
};
export type RepositoryPickerRepositoryIssueTemplates$key = {
  readonly " $data"?: RepositoryPickerRepositoryIssueTemplates$data;
  readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerRepositoryIssueTemplates">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "RepositoryPickerRepositoryIssueTemplates"
};

(node as any).hash = "e80fbaec2adb2595ece108ec7e011688";

export default node;
