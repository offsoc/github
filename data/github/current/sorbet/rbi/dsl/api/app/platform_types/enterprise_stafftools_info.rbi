# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::EnterpriseStafftoolsInfo`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::EnterpriseStafftoolsInfo`.

class Api::App::PlatformTypes::EnterpriseStafftoolsInfo < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::EnterpriseAdministratorConnection) }
  def admins; end

  sig { returns(T::Boolean) }
  def admins?; end

  sig { returns(T.nilable(String)) }
  def billing_email; end

  sig { returns(T::Boolean) }
  def billing_email?; end

  sig { returns(T::Boolean) }
  def is_downgraded_to_free_plan; end

  sig { returns(T::Boolean) }
  def is_downgraded_to_free_plan?; end

  sig { returns(T::Boolean) }
  def is_hammy; end

  sig { returns(T::Boolean) }
  def is_hammy?; end

  sig { returns(T::Boolean) }
  def is_never_spammy; end

  sig { returns(T::Boolean) }
  def is_never_spammy?; end

  sig { returns(T::Boolean) }
  def is_spammy; end

  sig { returns(T::Boolean) }
  def is_spammy?; end

  sig { returns(T::Boolean) }
  def is_suspended; end

  sig { returns(T::Boolean) }
  def is_suspended?; end

  sig { returns(T::Boolean) }
  def is_trial_account; end

  sig { returns(T::Boolean) }
  def is_trial_account?; end

  sig { returns(Api::App::PlatformTypes::EnterpriseMemberConnection) }
  def members; end

  sig { returns(T::Boolean) }
  def members?; end

  sig { returns(T.nilable(String)) }
  def spammy_reason; end

  sig { returns(T::Boolean) }
  def spammy_reason?; end
end
