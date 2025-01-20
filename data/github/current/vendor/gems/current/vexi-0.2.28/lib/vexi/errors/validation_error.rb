# frozen_string_literal: true
# typed: strict

module Vexi
  module Errors
    # Public: Vexi validation error.
    class ValidationError < StandardError
      extend T::Sig
    end
  end
end
