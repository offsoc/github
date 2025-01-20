# typed: strict
# frozen_string_literal: true

class Business

  sig { override.returns(T::Array[Symbol]) }
  def completed_onboarding_tasks; end

  sig { params(ignore_linked_record: T::Boolean).returns(::AccountScreeningProfile) }
  def trade_screening_record(ignore_linked_record: false); end

end
