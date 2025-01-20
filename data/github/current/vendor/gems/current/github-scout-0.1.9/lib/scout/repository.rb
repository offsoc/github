require 'scout/lazy_blob'
require 'set'
require 'scout/cache_helper'

module Scout
  # Its primary purpose is for gathering programming stack statistics across
  # the entire project.
  class Repository < Linguist::Repository

    attr_reader :cache_helper
    def initialize(repo, commit_oid)
      super

      @cache_helper = CacheHelper.new(repo.path)
    end

    def languages
      old_language_map, old_language_commit_oid = cache_helper.load_languages_from_cache
      load_existing_stats(old_language_commit_oid, old_language_map) if old_language_commit_oid

      super
    end

    def load_stacks_cache
      old_stacks_stats, old_stacks_commit_oid = cache_helper.load_stacks_map_from_cache
      load_existing_stacks_stats(old_stacks_commit_oid, old_stacks_stats) if old_stacks_commit_oid
    end

    def stacks
      @stacksList ||=
        begin
          stacksList = Set.new()
          stacks_cache.each do |_, stack|
            if stack.kind_of?(Array)
              stacksList.merge(stack)
            else
              stacksList.add?(stack)
            end
          end
          stacksList
        end
    end

    def stacks_cache
      @stacks_cache ||= begin
        if @old_stacks_commit_oid == @commit_oid
          @old_stacks_stats
        else
          compute_stacks_stats(@old_stacks_commit_oid, @old_stacks_stats)
        end
      end
    end

    def update_stacks_cache
      unless @old_stacks_commit_oid == @commit_oid
        cache_helper.save_stacks_cache(@commit_oid, stacks_cache)
      end
    end

    def compute_stacks_stats(old_commit_oid, cache = nil)
      return {} if current_tree.count_recursive(MAX_TREE_SIZE) >= MAX_TREE_SIZE

      old_tree = old_commit_oid && Rugged::Commit.lookup(repository, old_commit_oid).tree
      read_index
      diff = Rugged::Tree.diff(repository, old_tree, current_tree)

      # Clear file map and fetch full diff if any .gitattributes files are changed
      if cache && diff.each_delta.any? { |delta| File.basename(delta.new_file[:path]) == ".gitattributes" }
        diff = Rugged::Tree.diff(repository, old_tree = nil, current_tree)
        file_map = {}
      else
        file_map = cache ? cache.dup : {}
      end

      diff.each_delta do |delta|
        old = delta.old_file[:path]
        new = delta.new_file[:path]

        file_map.delete(old)
        next if delta.binary

        if [:added, :modified].include? delta.status
          # Skip submodules and symlinks
          mode = delta.new_file[:mode]
          mode_format = (mode & 0170000)
          next if mode_format == 0120000 || mode_format == 040000 || mode_format == 0160000

          blob = Scout::LazyBlob.new(repository, delta.new_file[:oid], new, mode.to_s(8))

          update_stacks_file_map(blob, file_map, new)

          blob.cleanup!
        end
      end

      file_map
    end

    def update_stacks_file_map(blob, file_map, key)
      if blob.include_in_stack_stats?
        if blob.stack.kind_of?(Array)
          file_map[key] = blob.stack.map(&:name)
        else
          file_map[key] = blob.stack.name
        end
      end
    end

    private

    def load_existing_stacks_stats(old_commit_oid, old_stats)
      @old_stacks_commit_oid = old_commit_oid
      @old_stacks_stats = old_stats
    end
  end
end
