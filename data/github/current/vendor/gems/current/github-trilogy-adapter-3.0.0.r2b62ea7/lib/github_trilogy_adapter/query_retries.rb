# frozen_string_literal: true

module GitHubTrilogyAdapter
  module QueryRetries
    # Allow retries in more places than upstream if query_retries is > 0
    def initialize(...)
      super
      @query_retries = @config[:query_retries] || 0
    end

    # Should match upstream except for `allow_retry`
    # https://github.com/rails/rails/blob/b4d8603bd3a9f814e0a233ee39b1cdcee2e60e29/activerecord/lib/active_record/connection_adapters/trilogy/database_statements.rb#L44
    def raw_execute(*args, **kwargs)
      super(*args, **kwargs.merge(allow_retry: @query_retries > 0))
    end
  end
end
