# frozen_string_literal: true

module GitHub
  module Telemetry
    # Utility methods
    module Utils
      class << self
        # Guesses the currently-running SHA.
        #
        # The SHA is guessed by:
        #
        # 1. Looking for `FAILBOT_CONTEXT_RELEASE` in the environment
        # 2. Looking for `CURRENT_SHA` in the environment
        # 3. Looking for `GIT_SHA` in the environment
        # 4. Looking for a file at `#{Rails.root}/SHA1` and reading its value, if `Rails` is defined
        #
        # @return [String] The guessed SHA of the running code, or `unknown` if no guessing fails.
        def current_sha
          (get_sha_from_env || get_from_file("SHA1") || "unknown").freeze
        end

        # Guesses the currently-running branch.
        #
        # The branch is guessed by:
        #
        # 1. Looking for `APP_REF` in the environment
        # 2. Looking for a file at `#{Rails.root}/BRANCH_NAME` and reading its value, if `Rails` is defined
        #
        # @return [String] The guessed SHA of the running code, or `unknown` if no guessing fails.
        def current_ref
          (ref_from_env || get_from_file("BRANCH_NAME") || "unknown")
        end

        private

        def get_sha_from_env
          ENV["FAILBOT_CONTEXT_RELEASE"] ||
          ENV["CURRENT_SHA"]             ||
          ENV["GIT_SHA"]
        end

        def ref_from_env
          ENV["APP_REF"] || ENV["CURRENT_REF"]
        end

        def get_from_file(name)
          if defined?(Rails) && File.readable?(path = Rails.root.join(name))
            File.read(path).strip
          end
        end
      end
    end
  end
end
