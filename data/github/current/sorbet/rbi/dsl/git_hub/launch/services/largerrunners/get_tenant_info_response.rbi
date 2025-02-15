# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Largerrunners::GetTenantInfoResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Largerrunners::GetTenantInfoResponse`.

class GitHub::Launch::Services::Largerrunners::GetTenantInfoResponse
  sig { params(runner_scale_unit: T.nilable(String), tenant_id: T.nilable(String)).void }
  def initialize(runner_scale_unit: nil, tenant_id: nil); end

  sig { void }
  def clear_runner_scale_unit; end

  sig { void }
  def clear_tenant_id; end

  sig { returns(String) }
  def runner_scale_unit; end

  sig { params(value: String).void }
  def runner_scale_unit=(value); end

  sig { returns(String) }
  def tenant_id; end

  sig { params(value: String).void }
  def tenant_id=(value); end
end
