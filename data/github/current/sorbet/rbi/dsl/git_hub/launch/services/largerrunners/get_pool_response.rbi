# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Largerrunners::GetPoolResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Largerrunners::GetPoolResponse`.

class GitHub::Launch::Services::Largerrunners::GetPoolResponse
  sig { params(pool: T.nilable(GitHub::Launch::Services::Largerrunners::Pool)).void }
  def initialize(pool: nil); end

  sig { void }
  def clear_pool; end

  sig { returns(T.nilable(GitHub::Launch::Services::Largerrunners::Pool)) }
  def pool; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Largerrunners::Pool)).void }
  def pool=(value); end
end
