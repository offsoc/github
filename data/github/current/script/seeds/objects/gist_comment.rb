# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class GistComment
      def self.create(gist:, user:, body: nil)

        body ||= "Comment Random stuff #{Time.now}"
        comment = ::GistComment.create(gist: gist, user: user, body: body)
        comment
      end
    end
  end
end
