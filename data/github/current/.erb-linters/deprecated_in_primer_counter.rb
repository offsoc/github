# typed: true
# frozen_string_literal: true
require "json"
require_relative "custom_rule_helpers"
require_relative "component_helpers"

module ERBLint
  module Linters
    class DeprecatedInPrimerCounter < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers
      include ERBLint::Linters::ComponentHelpers

      class ConfigSchema < LinterConfig
        property :ignore_classes, accepts: array_of?(String), default: -> { [] }
        property :ignore_files, accepts: array_of?(String), default: -> { [] }
      end
      self.config_schema = ConfigSchema

      def run(processed_source)
        path = processed_source.filename

        return if path_matches(path, @config.ignore_files)

        deprecations = self.deprecations
        ignore_classes = @config.ignore_classes || []
        deprecated_classes = deprecations.keys - ignore_classes

        tags(processed_source).each do |tag|
          next if tag.closing?
          classes = tag.attributes["class"]&.value&.split(" ") || []
          deprecated = classes & deprecated_classes
          next if deprecated.empty?

          generate_deprecated_offense(processed_source, tag, deprecated)
        end

        components(processed_source) do |tag, kwargs, classes|
          deprecated = classes & deprecated_classes

          next if deprecated.empty?

          generate_deprecated_offense(processed_source, tag, deprecated)
        end

        is_counter_correct?(processed_source)
      end

      def path_matches(path, globs)
        globs.any? { |glob| File.fnmatch("#{Dir.pwd}/#{glob}", path) }
      end

      def deprecations
        @loaded_deprecations || load_deprecations
      end

      def autocorrect(processed_source, offense)
        return unless offense.context

        lambda do |corrector|
          if processed_source.file_content.include?("erblint:counter DeprecatedInPrimerCounter")
            # update the counter if exists
            corrector.replace(offense.source_range, offense.context)
          else
            # add comment with counter if none
            corrector.insert_before(processed_source.source_buffer.source_range, "#{offense.context}\n")
          end
        end
      end

      private

      def generate_deprecated_offense(processed_source, tag, deprecated)
        deprecations = self.deprecations

        deprecated.each do |klass|
          replacement = deprecations[klass]
          if replacement.is_a?(Array)
            generate_offense(
              self.class,
              processed_source,
              tag,
              "The Primer CSS class '#{klass}' is deprecated. Use one of the following classes in it's place #{replacement.join(', ')}."
            )
          elsif replacement.is_a?(String) && tag.attributes["class"].present?
            generate_offense(
              self.class,
              processed_source,
              tag.attributes["class"],
              "The Primer CSS class '#{klass}' is deprecated, use '#{replacement}' instead.",
              "class=\"#{tag.attributes["class"].value.sub(klass, replacement)}\""
            )
          else
            generate_offense(
              self.class,
              processed_source,
              tag,
              "The Primer CSS class '#{klass}' is deprecated. Please reach out to #primer to get information on what to use in it's place."
            )
          end
        end
      end

      def load_deprecations
        json = JSON.parse(File.read("node_modules/@primer/css/dist/deprecations.json"))
        @loaded_deprecations = json["selectors"]
        @loaded_deprecations
      end
    end
  end
end
