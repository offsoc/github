# frozen_string_literal: true
module GraphQL
  module Pro
    class Repository
      # Usually, Rails reloading works on a 1-class-to-1-file basis.
      # But we don't have classes, we have instances. So to make watching work,
      # We register a map of `source_file => repository` pairs.
      #
      # When a repository is defined, it retakes the entry in that registry.
      #
      # To reload, we check the registry:
      #
      # - If the entry's file is still present, then we reload the repository instance
      #   (We know/assume that the repository is most recent one)
      # - If the entry's file is gone, then we know it was deleted,
      #   so we remove that entry from the registry.
      #
      # What about thread-safety? As long as one thread is loading a source file,
      # we're ok, because source files will always write to different keys
      # in the shared registry.
      #
      # Is it possible for multiple threads to read the same source file loading constants?
      # It's hard to imagine how that would work for Rails' _normal_ class-based
      # loading. Wouldn't the threads override each other?
      # @api private
      module Reloader
        # A shared, mutable registry of `source_file => repository` pairs,
        # holding the most-recently-defined Repository from that file.
        # @return [Hash{String => Repository}]
        DEFINITIONS = {}

        # @return [void]
        def self.add(source_filename, repository)
          watcher = Watcher.new(source_filename: source_filename, repository: repository)
          DEFINITIONS[source_filename] = watcher
          nil
        end

        def self.execute
          DEFINITIONS.each do |source_filename, watcher|
            if watcher.active?
              watcher.reload_if_changed
            else
              DEFINITIONS.delete(source_filename)
            end
          end
        end

        def self.updated?
          DEFINITIONS.any? { |f, watcher| watcher.updated? }
        end

        # Inspired by `ActiveSupport::FileUpdateChecker` but implemented by hand
        # to support non-activesupport environments
        # @api private
        class Watcher
          def initialize(source_filename:, repository:)
            @source_filename = source_filename
            @repository = repository
            @count, @mtime = load_status
          end

          # We should keep watching if:
          # - This repository's file is still present
          # - The global registry's entry for this file still points at this watcher
          # @return [Boolean]
          def active?
            File.exists?(@source_filename) && DEFINITIONS[@source_filename] == self
          end

          # @return [void]
          def reload_if_changed
            if updated?
              @count, @mtime = load_status
              @repository.reload
            end
            nil
          end

          def updated?
            new_count, new_mtime = load_status
            new_count != @count || new_mtime > @mtime
          end

          private

          # Check the filesystem for current status
          def load_status
            files = Dir.glob(@repository.glob)
            max_mtime = 0
            files.each do |f|
              mtime = File.mtime(f).to_i
              if mtime > max_mtime
                max_mtime = mtime
              end
            end
            return files.length, max_mtime
          end
        end
      end
    end
  end
end
