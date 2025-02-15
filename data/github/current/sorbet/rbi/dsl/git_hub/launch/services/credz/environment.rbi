# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::Environment`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::Environment`.

class GitHub::Launch::Services::Credz::Environment
  sig do
    params(
      global_id: T.nilable(String),
      new_global_id: T.nilable(String),
      repository_id: T.nilable(Integer)
    ).void
  end
  def initialize(global_id: nil, new_global_id: nil, repository_id: nil); end

  sig { void }
  def clear_global_id; end

  sig { void }
  def clear_new_global_id; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def global_id; end

  sig { params(value: String).void }
  def global_id=(value); end

  sig { returns(String) }
  def new_global_id; end

  sig { params(value: String).void }
  def new_global_id=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
