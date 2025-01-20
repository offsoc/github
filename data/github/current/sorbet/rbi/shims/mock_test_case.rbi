# typed: true

class FixturesTest::MockTestCase
  sig { params(value: T::Boolean).void }
  def self.strict_fixtures=(value); end

  sig { returns(T::Boolean) }
  def self.strict_fixtures; end
end
