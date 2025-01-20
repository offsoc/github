# typed: true
# frozen_string_literal: true

class GitHub::Config::Flipper::FlipperProxy
  sig { void }
  def reset; end

  # Public: Access the SimpleDelegator delegated ::Flipper::DSL instance.
  sig { returns(::Flipper::DSL) }
  def __getobj__; end

  # Public: Access a feature instance by name.
  #
  # feature_name - The String or Symbol name of the feature.
  #
  # Returns an instance of Flipper::Feature.
  # Public: Shortcut access to a feature instance by name.
  #
  # name - The String or Symbol name of the feature.
  #
  # Returns an instance of Flipper::Feature.
  sig { params(feature_name: Symbol).returns(::Flipper::Feature) }
  def feature(feature_name); end

  # Public: Access a feature instance by name.
  #
  # feature_name - The String or Symbol name of the feature.
  #
  # Returns an instance of Flipper::Feature.
  # Public: Shortcut access to a feature instance by name.
  #
  # name - The String or Symbol name of the feature.
  #
  # Returns an instance of Flipper::Feature.
  sig { params(feature_name: T.nilable(T.any(Symbol, String))).returns(::Flipper::Feature) }
  def [](feature_name = nil); end

  # Public: Check if a feature is enabled.
  #
  # feature_name - The String or Symbol name of the feature.
  # actor - (optional) The actor to check the feature for.
  #
  # Returns true if feature is enabled, false if not.
  #
  # @return [Boolean]
  sig { params(feature_name: T.any(Symbol, String), actor: T.nilable(GitHub::IFlipperActor)).returns(T::Boolean) }
  def enabled?(feature_name, actor = nil); end

  # Public: Disable a feature.
  #
  # feature name - The String or Symbol name of the feature.
  # actor - (optional) The actor to check the feature for.
  #
  # Returns the result of the feature instance disable call.
  sig { params(feature_name: T.any(Symbol, String), actor: T.nilable(GitHub::IFlipperActor)).returns(T::Boolean) }
  def disable(feature_name, actor = nil); end

  # Public: Enable a feature.
  #
  # feature_name - The String or Symbol name of the feature.
  # actor - (optional) The actor to check the feature for.
  #
  # Returns the result of the feature instance enable call.
  sig { params(feature_name: T.any(Symbol, String), actor: T.nilable(GitHub::IFlipperActor)).returns(T::Boolean) }
  def enable(feature_name, actor = nil); end

  def actors(value); end

  def adapter; end

  def features; end

  sig { returns(T::Boolean) }
  def memoizing?; end

  sig { params(bool: T::Boolean).returns(T::Boolean) }
  def memoize=(bool); end
end

class Flipper::Feature
  # Public: Check if a feature is enabled for a thing.
  #
  # actor [GitHub::FlipperActor] - (optional) The actor to check the feature for.
  #
  # Returns true if enabled, false if not.
  #
  # @return [Boolean]
  #
  # Most major models in GitHub include the FlipperActor module (User, Repository etc.)
  # You cannot call this method with an actor that doesn't include FlipperActor.
  #
  # To resolve sorbet issues where the type is not known (mixins for example) options include:
  # - ensure the actor includes GitHub::Flipper actor, or implements GitHub::IFlipperActor
  # - if it's a mixin add `requires_ancestor { GitHub::FlipperActor }``
  # - sometimes it might need to be `requires_ancestor { GitHub::IFlipperActor }`
  #   if the actor only implements the more general interface
  # - otherwise the actor cannot be checked against flipper
  sig { params(actor: T.nilable(GitHub::IFlipperActor)).returns(T::Boolean) }
  def enabled?(actor = nil); end
end
