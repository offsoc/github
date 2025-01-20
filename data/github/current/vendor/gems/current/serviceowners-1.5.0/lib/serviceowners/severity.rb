# typed: strict
# frozen_string_literal: true

module Serviceowners
  # The set of allowed severity levels
  class Severity < T::Enum
    extend T::Sig

    enums do
      Sev1 = new
      Sev2 = new
      Sev3 = new
    end

    sig { returns(Symbol) }
    def to_sym
      case self
      when Sev1 then :sev1
      when Sev2 then :sev2
      when Sev3 then :sev3
      end
    end
  end
end
