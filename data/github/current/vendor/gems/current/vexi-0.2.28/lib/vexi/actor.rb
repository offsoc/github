# frozen_string_literal: true
# typed: strict

module Vexi
  # Vexi actor interface.
  module Actor
    extend T::Sig
    extend T::Helpers
    interface!

    include Kernel

    # The ID stored for this actor to enable per-actor or
    # percent-of-actors enabling of features.
    sig { abstract.returns(String) }
    def vexi_id; end
  end
end
