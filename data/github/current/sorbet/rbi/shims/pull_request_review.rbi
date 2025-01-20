# typed: true
# frozen_string_literal: true

class PullRequestReview
  sig { params(actor: T.nilable(User), message: T.nilable(String)).void }
  def dismiss!(actor, message:); end
end
