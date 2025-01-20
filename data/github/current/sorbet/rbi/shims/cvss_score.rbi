# typed: true
# frozen_string_literal: true

module AdvisoryDB::CvssScore
  extend T::Sig

  sig { returns(T.nilable(String)) }
  def cvss_v3; end

  sig { returns(T.nilable(String)) }
  def cvss_v4; end
end
