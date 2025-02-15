# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CommitContributionOrderField`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CommitContributionOrderField`.

module Api::App::PlatformTypes::CommitContributionOrderField
  sig { returns(T::Boolean) }
  def commit_count?; end

  sig { returns(T::Boolean) }
  def occurred_at?; end

  COMMIT_COUNT = T.let("COMMIT_COUNT", String)
  OCCURRED_AT = T.let("OCCURRED_AT", String)
end
