# frozen_string_literal: true

require_relative "./business_git"

module Driftwood
  module ExportTwirpRequest
    class BusinessGitV2 < Driftwood::ExportTwirpRequest::BusinessGit
      def client_method
        :export_business_git_audit_entries_v2
      end
    end
  end
end
