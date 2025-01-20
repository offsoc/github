# frozen_string_literal: true
# typed: strict

require "json"

module Vexi
  module Adapters
    # Public: File adapter for Vexi.
    class FileAdapter
      extend T::Sig
      extend T::Helpers

      include Adapter

      sig { returns(String) }
      attr_reader :feature_flag_base_path

      sig { returns(String) }
      attr_reader :segments_base_path

      sig { params(feature_flag_base_path: String, segments_base_path: String).void }
      def initialize(feature_flag_base_path, segments_base_path)
        super()
        @feature_flag_base_path = T.let(feature_flag_base_path, String)
        @segments_base_path = T.let(segments_base_path, String)
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetFeatureFlagResponse]) }
      def get_feature_flags(names)
        flags = []
        names.each do |name|
          flag = load_feature_flag(name)
          flags << GetFeatureFlagResponse.new(name: name, feature_flag: flag)
        rescue StandardError => e
          flags << GetFeatureFlagResponse.new(name: name, error: e)
        end
        flags
      end

      sig { override.params(names: T::Array[String]).returns(T::Array[GetSegmentResponse]) }
      def get_segments(names)
        segments = []
        names.each do |name|
          segment = load_segment(name)
          segments << GetSegmentResponse.new(name: name, segment: segment)
        rescue StandardError => e
          segments << GetSegmentResponse.new(name: name, error: e)
        end
        segments
      end

      sig { override.returns(String) }
      def adapter_name
        "json_file"
      end
      sig { params(name: String).returns(Segment) }
      def load_segment(name)
        file_path = File.join(@segments_base_path, "#{name}.json")
        json_text = File.read(file_path)
        json_segment = JSON.parse(json_text)
        Segment.from_json(json_segment)
      end

      sig { params(feature_flag: FeatureFlag).void }
      def create(feature_flag)
        existing_feature_flag = get_feature_flag(feature_flag.name)
        unless existing_feature_flag.nil?
          raise ArgumentError, "Feature flag with name #{feature_flag.name} already exists"
        end

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol)).returns(T.nilable(FeatureFlag)) }
      def get_feature_flag(name)
        feature_flag_responses = get_feature_flags([name.to_s])
        first_response = feature_flag_responses.first

        return nil unless first_response&.feature_flag

        first_response.feature_flag
      end

      sig { params(name: T.any(String, Symbol)).void }
      def delete(name)
        path = feature_flag_file_path(name)
        return unless File.exist?(path)

        File.delete(path)
      end

      sig { params(name: T.any(String, Symbol)).void }
      def enable(name)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        return if feature_flag.boolean_gate == true

        feature_flag.boolean_gate = true
        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol)).void }
      def disable(name)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        # disable boolean_gate and clear all other gates
        feature_flag.boolean_gate = false
        feature_flag.percentage_of_actors = 0.0
        feature_flag.percentage_of_calls = 0.0
        feature_flag.custom_gates = []
        feature_flag.actors = HashActorCollection.new({})
        feature_flag.segments = []

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), actor: T.any(String, Actor)).void }
      def add_actor(name, actor)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        actor_id = if actor.is_a?(Actor)
                     actor.vexi_id
                   else
                     actor
                   end

        feature_flag.actors[actor_id] = true

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), actor: T.any(String, Actor)).void }
      def remove_actor(name, actor)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        actor_id = if actor.is_a?(Actor)
                     actor.vexi_id
                   else
                     actor
                   end

        feature_flag.actors.delete(actor_id)

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_actors(name, percentage)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.percentage_of_actors = percentage

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), percentage: Float).void }
      def enable_percentage_of_calls(name, percentage)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.percentage_of_calls = percentage

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), custom_gate: String).void }
      def add_custom_gate(name, custom_gate)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.custom_gates << custom_gate unless feature_flag.custom_gates.include?(custom_gate)

        write_feature_flag(feature_flag)
      end

      sig { params(name: T.any(String, Symbol), custom_gate: String).void }
      def remove_custom_gate(name, custom_gate)
        feature_flag = get_feature_flag(name)
        raise ArgumentError, "Feature flag with name #{name} does not exist" unless feature_flag

        feature_flag.custom_gates.delete(custom_gate)

        write_feature_flag(feature_flag)
      end

      private

      sig { params(name: String).returns(FeatureFlag) }
      def load_feature_flag(name)
        file_path = File.join(@feature_flag_base_path, "#{name}.json")
        json_text = File.read(file_path)
        json_flag = JSON.parse(json_text)

        feature_flag = FeatureFlag.from_json(json_flag)

        feature_flag.segments << feature_flag.default_segment unless feature_flag.is_default_segment_embedded

        feature_flag
      end

      sig { params(name: T.any(String, Symbol)).returns(String) }
      def feature_flag_file_path(name)
        File.join(@feature_flag_base_path, "#{name}.json")
      end

      sig { params(feature_flag: FeatureFlag).void }
      def write_feature_flag(feature_flag)
        File.write(feature_flag_file_path(feature_flag.name),
                   JSON.pretty_generate(FeatureFlag.to_h(feature_flag)))
      end
    end
  end
end
