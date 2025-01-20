# frozen_string_literal: true
# typed: strict

module Vexi
  # GetFeatureFlagResponse is the response returned by the GetFeatureFlag method.
  class GetFeatureFlagResponse < GetEntityResponse
    extend T::Sig
    extend T::Helpers

    sig { returns(T.nilable(FeatureFlag)) }
    attr_accessor :feature_flag

    sig { params(name: String, feature_flag: T.nilable(FeatureFlag), error: T.nilable(StandardError)).void }
    def initialize(name: "", feature_flag: nil, error: nil)
      super(name: name, entity: feature_flag, error: error)
      @feature_flag = feature_flag
    end
  end
end
