# frozen_string_literal: true

module GitHubTrilogyAdapter
  module SupportOverrides
    # MySQL 8.0.19 replaces `VALUES(<expression>)` clauses with row and column alias names,
    # but Vitess doesn't support the new syntax yet (https://github.com/rails/rails/pull/51348)
    def supports_insert_raw_alias_syntax?
      false
    end
  end
end
