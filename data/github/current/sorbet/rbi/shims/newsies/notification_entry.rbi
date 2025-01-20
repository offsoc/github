# typed: strict
# frozen_string_literal: true

module Newsies
  class NotificationEntry
    # TODO: these overrides can be removed when the tapioca gem is updated to include
    # https://github.com/Shopify/tapioca/pull/1955
    sig { returns(T::Boolean) }
    def rollup_summary_changed?; end
    sig { returns(T::Boolean) }
    def notification_summary_changed?; end
  end
end
