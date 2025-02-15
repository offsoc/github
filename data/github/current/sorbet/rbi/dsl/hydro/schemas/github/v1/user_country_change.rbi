# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::UserCountryChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::UserCountryChange`.

class Hydro::Schemas::Github::V1::UserCountryChange
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      anomalous_session: T.nilable(T::Boolean),
      previous_city: T.nilable(Google::Protobuf::StringValue),
      previous_country_code: T.nilable(Google::Protobuf::StringValue),
      previous_country_name: T.nilable(Google::Protobuf::StringValue),
      previous_region: T.nilable(Google::Protobuf::StringValue),
      previous_region_name: T.nilable(Google::Protobuf::StringValue),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, anomalous_session: nil, previous_city: nil, previous_country_code: nil, previous_country_name: nil, previous_region: nil, previous_region_name: nil, request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(T::Boolean) }
  def anomalous_session; end

  sig { params(value: T::Boolean).void }
  def anomalous_session=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_anomalous_session; end

  sig { void }
  def clear_previous_city; end

  sig { void }
  def clear_previous_country_code; end

  sig { void }
  def clear_previous_country_name; end

  sig { void }
  def clear_previous_region; end

  sig { void }
  def clear_previous_region_name; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def previous_city; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def previous_city=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def previous_country_code; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def previous_country_code=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def previous_country_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def previous_country_name=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def previous_region; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def previous_region=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def previous_region_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def previous_region_name=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
