# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::ActionsResults::Core::V1::Concurrency`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::ActionsResults::Core::V1::Concurrency`.

class MonolithTwirp::ActionsResults::Core::V1::Concurrency
  sig do
    params(
      group: T.nilable(String),
      waiting_on_resource: T.nilable(MonolithTwirp::ActionsResults::Core::V1::WaitingOnResource)
    ).void
  end
  def initialize(group: nil, waiting_on_resource: nil); end

  sig { void }
  def clear_group; end

  sig { void }
  def clear_waiting_on_resource; end

  sig { returns(String) }
  def group; end

  sig { params(value: String).void }
  def group=(value); end

  sig { returns(T.nilable(MonolithTwirp::ActionsResults::Core::V1::WaitingOnResource)) }
  def waiting_on_resource; end

  sig { params(value: T.nilable(MonolithTwirp::ActionsResults::Core::V1::WaitingOnResource)).void }
  def waiting_on_resource=(value); end
end
