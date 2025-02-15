# Code generated by protoc-gen-twirp_ruby 1.3.0, DO NOT EDIT.
require 'twirp'
require_relative 'audit_log_pb.rb'

module Driftwood
  module Auditlog
    module V1
      class AuditLogService < Twirp::Service
        package 'driftwood.auditlog.v1'
        service 'AuditLog'
        rpc :QueryOrgAuditEntries, OrganizationAuditEntriesRequest, OrganizationAuditEntriesResponse, :ruby_method => :query_org_audit_entries
        rpc :QueryBusinessAuditEntries, BusinessAuditEntriesRequest, BusinessAuditEntriesResponse, :ruby_method => :query_business_audit_entries
        rpc :QueryEmuAuditEntries, BusinessAuditEntriesRequest, BusinessAuditEntriesResponse, :ruby_method => :query_emu_audit_entries
        rpc :QueryUserAuditEntries, UserAuditEntriesRequest, UserAuditEntriesResponse, :ruby_method => :query_user_audit_entries
        rpc :QueryUserDormancyAuditEntries, UserDormancyAuditEntriesRequest, UserAuditEntriesResponse, :ruby_method => :query_user_dormancy_audit_entries
        rpc :QueryUser2FaAuditEntries, User2FAAuditEntriesRequest, UserAuditEntriesResponse, :ruby_method => :query_user2_fa_audit_entries
        rpc :QueryStafftoolsAuditEntries, StafftoolsAuditEntriesRequest, StafftoolsAuditEntriesResponse, :ruby_method => :query_stafftools_audit_entries
        rpc :QueryProjectAuditEntries, ProjectAuditEntriesRequest, ProjectAuditEntriesResponse, :ruby_method => :query_project_audit_entries
        rpc :ExportOrgGitAuditEntriesV2, ExportOrgGitAuditEntriesRequest, ExportGitAuditEntriesResponse, :ruby_method => :export_org_git_audit_entries_v2
        rpc :ExportBusinessGitAuditEntriesV2, ExportBusinessGitAuditEntriesRequest, ExportGitAuditEntriesResponse, :ruby_method => :export_business_git_audit_entries_v2
        rpc :ExportGitAuditEntriesFetchV2, ExportGitAuditEntriesFetchRequestV2, ExportGitAuditEntriesFetchResponseV2, :ruby_method => :export_git_audit_entries_fetch_v2
        rpc :QueryOrgGitAuditEntries, OrganizationGitAuditEntriesRequest, OrganizationGitAuditEntriesResponse, :ruby_method => :query_org_git_audit_entries
        rpc :QueryBusinessGitAuditEntries, BusinessGitAuditEntriesRequest, BusinessGitAuditEntriesResponse, :ruby_method => :query_business_git_audit_entries
        rpc :QueryBusinessAllAuditEntries, BusinessAllAuditEntriesRequest, BusinessAllAuditEntriesResponse, :ruby_method => :query_business_all_audit_entries
        rpc :QueryEmuGitAuditEntries, BusinessGitAuditEntriesRequest, BusinessGitAuditEntriesResponse, :ruby_method => :query_emu_git_audit_entries
        rpc :QueryEmuAllAuditEntries, BusinessAllAuditEntriesRequest, BusinessAllAuditEntriesResponse, :ruby_method => :query_emu_all_audit_entries
        rpc :QueryOrgAllAuditEntries, OrgAllAuditEntriesRequest, OrgAllAuditEntriesResponse, :ruby_method => :query_org_all_audit_entries
        rpc :GetAuditEntry, GetAuditEntryRequest, GetAuditEntryResponse, :ruby_method => :get_audit_entry
        rpc :QueryBusinessUserDormancy, BusinessUserDormancyRequest, BusinessUserDormancyResponse, :ruby_method => :query_business_user_dormancy
        rpc :StartAsyncQueryStafftoolsAuditEntries, AsyncStafftoolsQueryStartRequest, AsyncStafftoolsQueryStartResponse, :ruby_method => :start_async_query_stafftools_audit_entries
        rpc :GetAsyncQueryStafftoolsStatus, AsyncStafftoolsQueryStatusRequest, AsyncStafftoolsQueryStatusResponse, :ruby_method => :get_async_query_stafftools_status
        rpc :GetAsyncQueryStafftoolsAuditEntries, AsyncStafftoolsAuditEntriesRequest, AsyncStafftoolsAuditEntriesResponse, :ruby_method => :get_async_query_stafftools_audit_entries
      end

      class AuditLogClient < Twirp::Client
        client_for AuditLogService
      end
    end
  end
end
