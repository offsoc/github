require "egress"
require "minitest/autorun"

module Egress
  class Test < Minitest::Test
    # Test objects to define permissions on
    #
    class User
      attr_accessor :id, :scopes, :whitelisted_repository_ids, :whitelisted_owner_ids

      def initialize(id: 404, scopes: "user:read", whitelisted_repository_ids: [], whitelisted_owner_ids: nil)
        @id = id
        @scopes = scopes
        @whitelisted_repository_ids = whitelisted_repository_ids
        @whitelisted_owner_ids = whitelisted_owner_ids
      end
    end

    class Repository
      attr_accessor :id, :owner_id

      def initialize(id: 1, owner_id: nil)
        @id = id
        @owner_id = owner_id
      end
    end

    class BlogPost
      attr_accessor :public
      alias public? public

      def initialize(public: false)
        @public = public
      end
    end

    class BlogPostComment
    end
  end
end
