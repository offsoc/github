# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Query::V2::MatchScore`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Query::V2::MatchScore`.

class Blackbird::Query::V2::MatchScore
  sig { params(score: T.nilable(Float)).void }
  def initialize(score: nil); end

  sig { void }
  def clear_score; end

  sig { returns(Float) }
  def score; end

  sig { params(value: Float).void }
  def score=(value); end
end
