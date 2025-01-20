# typed: true
# frozen_string_literal: true

module GitHub
  module SecurityCenter
    module LoggingHelper
      module LogMethods
        # Same as calling `GitHub.logger.info`, but it automatically includes:
          # - `code.function`
          # - `gh.request_id` if present in `GitHub.context`
          # - `gh.request.controller` if present in `GitHub.context`
          # - `gh.request.action` if present in `GitHub.context`
        sig { params(args: T.untyped, kwargs: T.untyped).void }
        def log_info(*args, **kwargs); end

        # Same as calling `GitHub.logger.warn`, but it automatically includes:
          # - `code.function`
          # - `gh.request_id` if present in `GitHub.context`
          # - `gh.request.controller` if present in `GitHub.context`
          # - `gh.request.action` if present in `GitHub.context`
        sig { params(args: T.untyped, kwargs: T.untyped).void }
        def log_warn(*args, **kwargs); end
      end
    end
  end
end
