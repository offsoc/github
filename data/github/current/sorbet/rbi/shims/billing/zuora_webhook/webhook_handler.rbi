# typed: true
# frozen_string_literal: true

class ::Billing::Zuora::Webhooks::WebhookHandler
  # Callbacks
  sig { params(args: T.untyped, block: T.untyped).void }
  def self.before_perform(*args, &block); end

  sig { params(args: T.untyped, block: T.untyped).void }
  def self.after_perform(*args, &block); end

  sig { returns(T.nilable(::Billing::Types::Account)) }
  def account; end
end
