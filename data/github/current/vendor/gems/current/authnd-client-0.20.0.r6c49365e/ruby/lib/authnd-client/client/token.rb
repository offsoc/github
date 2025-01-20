# frozen_string_literal: true

module Authnd
  module Client
    AUTHND_TOKEN_REGEX = /
      ^(
        gh1_[A-Za-z0-9]{21}_[A-Za-z0-9]{59}  # legacy v1 token format (i.e. PATv2)
      |
        github_pat_[0-9][A-Za-z0-9]{21}_[A-Za-z0-9]{59}  # v1 token format (i.e. PATv2)
      )$
    /x.freeze # 'x' enables free spacing mode which ignores whitespace and comments.

    def self.authnd_token?(token)
      AUTHND_TOKEN_REGEX.match? token
    end
  end
end
