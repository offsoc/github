# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::TopOrgRepoUsage`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::TopOrgRepoUsage`.

class BillingPlatform::Api::V1::TopOrgRepoUsage
  sig do
    params(
      billedAmount: T.nilable(Float),
      orgId: T.nilable(Integer),
      repoId: T.nilable(Integer),
      usageAt: T.nilable(Integer)
    ).void
  end
  def initialize(billedAmount: nil, orgId: nil, repoId: nil, usageAt: nil); end

  sig { returns(Float) }
  def billedAmount; end

  sig { params(value: Float).void }
  def billedAmount=(value); end

  sig { void }
  def clear_billedAmount; end

  sig { void }
  def clear_orgId; end

  sig { void }
  def clear_repoId; end

  sig { void }
  def clear_usageAt; end

  sig { returns(Integer) }
  def orgId; end

  sig { params(value: Integer).void }
  def orgId=(value); end

  sig { returns(Integer) }
  def repoId; end

  sig { params(value: Integer).void }
  def repoId=(value); end

  sig { returns(Integer) }
  def usageAt; end

  sig { params(value: Integer).void }
  def usageAt=(value); end
end
