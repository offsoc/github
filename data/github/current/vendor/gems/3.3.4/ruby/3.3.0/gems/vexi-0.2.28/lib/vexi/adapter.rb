# frozen_string_literal: true
# typed: strict

module Vexi
  # Public: Vexi adapters interface.
  module Adapter
    extend T::Sig
    extend T::Helpers
    interface!

    sig { abstract.params(_names: T::Array[String]).returns(T::Array[GetFeatureFlagResponse]) }
    def get_feature_flags(_names); end

    sig { abstract.params(_names: T::Array[String]).returns(T::Array[GetSegmentResponse]) }
    def get_segments(_names); end

    sig { abstract.returns String }
    def adapter_name; end
  end
end
