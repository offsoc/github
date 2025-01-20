# frozen_string_literal: true

require_relative "./results_git"

module Driftwood
  module ExportTwirpRequest
    class ResultsGitV2 < Driftwood::ExportTwirpRequest::ResultsGit
      def client_method
        :export_git_audit_entries_fetch_v2
      end
    end
  end
end
