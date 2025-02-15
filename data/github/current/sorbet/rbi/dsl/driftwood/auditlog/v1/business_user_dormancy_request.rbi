# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Driftwood::Auditlog::V1::BusinessUserDormancyRequest`.
# Please instead update this file by running `bin/tapioca dsl Driftwood::Auditlog::V1::BusinessUserDormancyRequest`.

class Driftwood::Auditlog::V1::BusinessUserDormancyRequest
  sig do
    params(
      business_id: T.nilable(Integer),
      region: T.nilable(Driftwood::Auditlog::V1::Region),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(business_id: nil, region: nil, user_id: nil); end

  sig { returns(Integer) }
  def business_id; end

  sig { params(value: Integer).void }
  def business_id=(value); end

  sig { void }
  def clear_business_id; end

  sig { void }
  def clear_region; end

  sig { void }
  def clear_user_id; end

  sig { returns(T.nilable(Driftwood::Auditlog::V1::Region)) }
  def region; end

  sig { params(value: T.nilable(Driftwood::Auditlog::V1::Region)).void }
  def region=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
