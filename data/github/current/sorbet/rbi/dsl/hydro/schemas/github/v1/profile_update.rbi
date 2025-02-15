# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::ProfileUpdate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::ProfileUpdate`.

class Hydro::Schemas::Github::V1::ProfileUpdate
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      changed_attribute_names: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      current_profile: T.nilable(Hydro::Schemas::Github::V1::Entities::Profile),
      current_social_accounts: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount], T::Array[Hydro::Schemas::Github::V1::Entities::SocialAccount])),
      previous_profile: T.nilable(Hydro::Schemas::Github::V1::Entities::Profile),
      previous_social_accounts: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount], T::Array[Hydro::Schemas::Github::V1::Entities::SocialAccount])),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      spamurai_form_signals: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals),
      specimen_company: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData),
      specimen_location: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData),
      specimen_name: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData),
      specimen_website_url: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)
    ).void
  end
  def initialize(actor: nil, changed_attribute_names: T.unsafe(nil), current_profile: nil, current_social_accounts: T.unsafe(nil), previous_profile: nil, previous_social_accounts: T.unsafe(nil), request_context: nil, spamurai_form_signals: nil, specimen_company: nil, specimen_location: nil, specimen_name: nil, specimen_website_url: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def changed_attribute_names; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def changed_attribute_names=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_changed_attribute_names; end

  sig { void }
  def clear_current_profile; end

  sig { void }
  def clear_current_social_accounts; end

  sig { void }
  def clear_previous_profile; end

  sig { void }
  def clear_previous_social_accounts; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_spamurai_form_signals; end

  sig { void }
  def clear_specimen_company; end

  sig { void }
  def clear_specimen_location; end

  sig { void }
  def clear_specimen_name; end

  sig { void }
  def clear_specimen_website_url; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Profile)) }
  def current_profile; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Profile)).void }
  def current_profile=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount]) }
  def current_social_accounts; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount]).void }
  def current_social_accounts=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Profile)) }
  def previous_profile; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Profile)).void }
  def previous_profile=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount]) }
  def previous_social_accounts; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::SocialAccount]).void }
  def previous_social_accounts=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)) }
  def spamurai_form_signals; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)).void }
  def spamurai_form_signals=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_company; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_company=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_location; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_location=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_name; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_name=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_website_url; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_website_url=(value); end
end
