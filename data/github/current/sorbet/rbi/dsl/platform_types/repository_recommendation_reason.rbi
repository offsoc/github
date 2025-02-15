# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::RepositoryRecommendationReason`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::RepositoryRecommendationReason`.

module PlatformTypes::RepositoryRecommendationReason
  sig { returns(T::Boolean) }
  def contributed?; end

  sig { returns(T::Boolean) }
  def followed?; end

  sig { returns(T::Boolean) }
  def other?; end

  sig { returns(T::Boolean) }
  def popular?; end

  sig { returns(T::Boolean) }
  def starred?; end

  sig { returns(T::Boolean) }
  def topics?; end

  sig { returns(T::Boolean) }
  def trending?; end

  sig { returns(T::Boolean) }
  def viewed?; end

  CONTRIBUTED = T.let("CONTRIBUTED", String)
  FOLLOWED = T.let("FOLLOWED", String)
  OTHER = T.let("OTHER", String)
  POPULAR = T.let("POPULAR", String)
  STARRED = T.let("STARRED", String)
  TOPICS = T.let("TOPICS", String)
  TRENDING = T.let("TRENDING", String)
  VIEWED = T.let("VIEWED", String)
end
