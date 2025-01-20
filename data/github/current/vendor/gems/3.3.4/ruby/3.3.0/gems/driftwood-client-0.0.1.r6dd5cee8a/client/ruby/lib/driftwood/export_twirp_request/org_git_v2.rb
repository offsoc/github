# frozen_string_literal: true

require_relative "./org_git"

module Driftwood
  module ExportTwirpRequest
    class OrgGitV2 < Driftwood::ExportTwirpRequest::OrgGit
      def client_method
        :export_org_git_audit_entries_v2
      end
    end
  end
end
