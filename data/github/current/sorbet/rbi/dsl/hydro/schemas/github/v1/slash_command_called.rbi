# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SlashCommandCalled`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SlashCommandCalled`.

class Hydro::Schemas::Github::V1::SlashCommandCalled
  sig do
    params(
      category: T.nilable(String),
      command_data: T.nilable(String),
      command_name: T.nilable(String),
      employee_triggered: T.nilable(T::Boolean),
      has_footer: T.nilable(T::Boolean),
      page_number: T.nilable(Integer),
      page_type: T.nilable(String),
      phase: T.nilable(T.any(Symbol, Integer)),
      platform: T.nilable(T.any(Symbol, Integer)),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      resource_id: T.nilable(Integer),
      resource_type: T.nilable(String),
      surface: T.nilable(String),
      trigger: T.nilable(Hydro::Schemas::Github::V1::Entities::SlashCommandTrigger),
      user: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(category: nil, command_data: nil, command_name: nil, employee_triggered: nil, has_footer: nil, page_number: nil, page_type: nil, phase: nil, platform: nil, repository: nil, request_context: nil, resource_id: nil, resource_type: nil, surface: nil, trigger: nil, user: nil); end

  sig { returns(String) }
  def category; end

  sig { params(value: String).void }
  def category=(value); end

  sig { void }
  def clear_category; end

  sig { void }
  def clear_command_data; end

  sig { void }
  def clear_command_name; end

  sig { void }
  def clear_employee_triggered; end

  sig { void }
  def clear_has_footer; end

  sig { void }
  def clear_page_number; end

  sig { void }
  def clear_page_type; end

  sig { void }
  def clear_phase; end

  sig { void }
  def clear_platform; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_resource_id; end

  sig { void }
  def clear_resource_type; end

  sig { void }
  def clear_surface; end

  sig { void }
  def clear_trigger; end

  sig { void }
  def clear_user; end

  sig { returns(String) }
  def command_data; end

  sig { params(value: String).void }
  def command_data=(value); end

  sig { returns(String) }
  def command_name; end

  sig { params(value: String).void }
  def command_name=(value); end

  sig { returns(T::Boolean) }
  def employee_triggered; end

  sig { params(value: T::Boolean).void }
  def employee_triggered=(value); end

  sig { returns(T::Boolean) }
  def has_footer; end

  sig { params(value: T::Boolean).void }
  def has_footer=(value); end

  sig { returns(Integer) }
  def page_number; end

  sig { params(value: Integer).void }
  def page_number=(value); end

  sig { returns(String) }
  def page_type; end

  sig { params(value: String).void }
  def page_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def phase; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def phase=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def platform; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def platform=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(Integer) }
  def resource_id; end

  sig { params(value: Integer).void }
  def resource_id=(value); end

  sig { returns(String) }
  def resource_type; end

  sig { params(value: String).void }
  def resource_type=(value); end

  sig { returns(String) }
  def surface; end

  sig { params(value: String).void }
  def surface=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SlashCommandTrigger)) }
  def trigger; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SlashCommandTrigger)).void }
  def trigger=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def user; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def user=(value); end
end
