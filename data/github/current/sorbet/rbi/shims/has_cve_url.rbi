# typed: true
# frozen_string_literal: true

module HasCVEUrl
  extend T::Sig

  sig { returns(T.nilable(String)) }
  def cve_id; end
end
