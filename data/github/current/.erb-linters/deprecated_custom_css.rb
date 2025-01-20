# typed: true
# frozen_string_literal: true
require "json"
require_relative "custom_rule_helpers"
require_relative "component_helpers"

module ERBLint
  module Linters
    class DeprecatedCustomCss < Linter
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
        if path_matches(path, @config.ignore_files)
          return
        end

        deprecations = self.deprecations
        ignore_classes = @config.ignore_classes || []
        deprecated_classes = deprecations.keys - ignore_classes

        tags(processed_source).each do |tag|
          next if tag.closing?
          classes = tag.attributes["class"]&.value&.split(" ") || []
          deprecated = classes & deprecated_classes
          next if deprecated.empty?

          deprecated.each do |klass|
            info = deprecations[klass]
            generate_offense(
              self.class,
              processed_source,
              tag,
              "The CSS class '#{klass}' is deprecated. #{info['message']}"
            )
          end
        end

        components(processed_source) do |tag, kwargs, classes|
          deprecated = classes & deprecated_classes

          next if deprecated.empty?

          deprecated.each do |klass|
            info = deprecations[klass]
            generate_offense(
              self.class,
              processed_source,
              tag,
              "The CSS class '#{klass}' is deprecated. #{info['message']}"
            )
          end
        end
      end

      def path_matches(path, globs)
        globs.any? { |glob| File.fnmatch("#{Dir.pwd}/#{glob}", path) }
      end

      def deprecations
        @loaded_deprecations || load_deprecations
      end

      private

      def load_deprecations
        json = JSON.parse(File.read("app/assets/stylesheets/components/deprecated/classlist.json"))
        deprecations = {}
        json["selectors"].each do |selector, info|
          if match = selector.match(/\A\.([-\w]+)\z/)
            klass = match[1]
            deprecations[klass] ||= info
          end
        end
        @loaded_deprecations = deprecations
        deprecations
      end
    end
  end
end
