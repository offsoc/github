# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::UpdateStaffNotePayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::UpdateStaffNotePayload`.

class Api::App::PlatformTypes::UpdateStaffNotePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::StaffNote)) }
  def staff_note; end

  sig { returns(T::Boolean) }
  def staff_note?; end
end
