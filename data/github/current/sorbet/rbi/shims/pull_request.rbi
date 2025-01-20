# typed: true
# frozen_string_literal: true

class PullRequest
  # Defined via Spam::Spammable#setup_spammable
  sig { returns(T::Boolean) }
  def spammy?; end
end
