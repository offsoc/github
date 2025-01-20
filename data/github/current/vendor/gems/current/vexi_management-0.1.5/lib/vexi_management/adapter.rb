# frozen_string_literal: true
# typed: strict

require 'vexi/models/feature_flag'

module VexiManagement
  # Public: The Vexi Management Adapter interface.
  module Adapter
    extend T::Sig
    extend T::Helpers
    interface!

    sig { abstract.params(feature_flag: Vexi::FeatureFlag).void }
    def create(feature_flag); end

    sig { abstract.params(name: T.any(String, Symbol)).returns(T.nilable(Vexi::FeatureFlag)) }
    def get(name); end

    sig { abstract.params(name: T.any(String, Symbol)).void }
    def delete(name); end

    sig { abstract.params(name: T.any(String, Symbol)).void }
    def enable(name); end

    sig { abstract.params(name: T.any(String, Symbol)).void }
    def disable(name); end

    sig { abstract.params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
    def add_actor(name, actor); end

    sig { abstract.params(name: T.any(String, Symbol), actor: T.any(String, Vexi::Actor)).void }
    def remove_actor(name, actor); end

    sig { abstract.params(name: T.any(String, Symbol), percentage: Float).void }
    def enable_percentage_of_calls(name, percentage); end

    sig { abstract.params(name: T.any(String, Symbol), percentage: Float).void }
    def enable_percentage_of_actors(name, percentage); end

    sig { abstract.params(name: T.any(String, Symbol), custom_gate: String).void }
    def add_custom_gate(name, custom_gate); end

    sig { abstract.params(name: T.any(String, Symbol), custom_gate: String).void }
    def remove_custom_gate(name, custom_gate); end
  end
end
