# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Organizations::V1::Organization`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Organizations::V1::Organization`.

class GitHub::Proto::SecretScanning::Organizations::V1::Organization
  sig do
    params(
      billing_email: T.nilable(String),
      billing_plan: T.nilable(String),
      business_id: T.nilable(String),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      global_relay_id: T.nilable(String),
      id: T.nilable(Integer),
      login: T.nilable(String),
      spammy: T.nilable(T::Boolean),
      spamurai_classification: T.nilable(T.any(Symbol, Integer)),
      suspended: T.nilable(T::Boolean)
    ).void
  end
  def initialize(billing_email: nil, billing_plan: nil, business_id: nil, created_at: nil, global_relay_id: nil, id: nil, login: nil, spammy: nil, spamurai_classification: nil, suspended: nil); end

  sig { returns(String) }
  def billing_email; end

  sig { params(value: String).void }
  def billing_email=(value); end

  sig { returns(String) }
  def billing_plan; end

  sig { params(value: String).void }
  def billing_plan=(value); end

  sig { returns(String) }
  def business_id; end

  sig { params(value: String).void }
  def business_id=(value); end

  sig { void }
  def clear_billing_email; end

  sig { void }
  def clear_billing_plan; end

  sig { void }
  def clear_business_id; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_login; end

  sig { void }
  def clear_spammy; end

  sig { void }
  def clear_spamurai_classification; end

  sig { void }
  def clear_suspended; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def login; end

  sig { params(value: String).void }
  def login=(value); end

  sig { returns(T::Boolean) }
  def spammy; end

  sig { params(value: T::Boolean).void }
  def spammy=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def spamurai_classification; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def spamurai_classification=(value); end

  sig { returns(T::Boolean) }
  def suspended; end

  sig { params(value: T::Boolean).void }
  def suspended=(value); end
end
