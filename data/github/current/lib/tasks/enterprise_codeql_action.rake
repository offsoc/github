# frozen_string_literal: true

require "codeql_action_creator"
require "codeql_action_tag_restorer"

namespace :enterprise do
  namespace :codeql_action do
    task :seed, [] => [:environment] do |_t, _args|
      CodeQLActionCreator.create_codeql_action if GitHub.enterprise? && GitHub.code_scanning_enabled? && GitHub.actions_enabled?
    end

    task :restore_release_tags, [] => [:environment] do |_t, _args|
      CodeQLActionTagRestorer.restore_tags if GitHub.enterprise? && GitHub.code_scanning_enabled? && GitHub.actions_enabled?
    end
  end
end
