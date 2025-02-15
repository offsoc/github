# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Selfhostedrunners::GetRunnerResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Selfhostedrunners::GetRunnerResponse`.

class GitHub::Launch::Services::Selfhostedrunners::GetRunnerResponse
  sig { params(runner: T.nilable(GitHub::Launch::Services::Selfhostedrunners::Runner)).void }
  def initialize(runner: nil); end

  sig { void }
  def clear_runner; end

  sig { returns(T.nilable(GitHub::Launch::Services::Selfhostedrunners::Runner)) }
  def runner; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Selfhostedrunners::Runner)).void }
  def runner=(value); end
end
