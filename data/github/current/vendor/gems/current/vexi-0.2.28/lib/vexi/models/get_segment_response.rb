# frozen_string_literal: true
# typed: strict

module Vexi
  # GetSegmentResponse is the response returned by the GetSegment method.
  class GetSegmentResponse < GetEntityResponse
    extend T::Sig
    extend T::Helpers

    sig { returns(T.nilable(Segment)) }
    attr_reader :segment

    sig { params(name: String, segment: T.nilable(Segment), error: T.nilable(StandardError)).void }
    def initialize(name: "", segment: nil, error: nil)
      super(name: name, entity: segment, error: error)
      @segment = segment
    end
  end
end
