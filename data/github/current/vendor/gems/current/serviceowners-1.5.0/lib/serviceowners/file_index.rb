# typed: true
# frozen_string_literal: true

module Serviceowners
  # A faster way to get a list of files for a given subdirectory than iterating through the entire list of paths
  class FileIndex
    def initialize(file_list)
      @file_list = file_list
    end

    # @return [Array<String>] Filenames that _might_ match `pattern`. (If `pattern` is a glob,
    #   the returned files should be searched again.)
    def potential_matches(pattern)
      current_dir = file_index
      pattern.non_glob_parts.each do |part|
        return [] unless current_dir[:dirs].key?(part)

        current_dir = current_dir[:dirs][part]
      end
      current_dir[:files]
    end

    # Returns true if any file matches `pattern`
    def any_file?(pattern)
      potential_matches(pattern).any? { |f| pattern.matches?(f) }
    end

    def files
      file_index[:files]
    end

    # Eagerly load the entire file index. Useful when checking file index in parallel
    # to avoid loading the index in each subprocess.
    def preload_all_files!
      file_index

      # Return nil since we don't want to expose file_index via the public interface
      nil
    end

    private

    def add_path(path)
      @file_index[:files] << path
      dir = @file_index[:dirs]
      parts = path.split("/")
      parts.each do |part|
        dir[part] = make_directory_index unless dir.key?(part)
        cache = dir[part]
        cache[:files] << path
        dir = cache[:dirs]
      end
    end

    def file_index
      return @file_index if defined?(@file_index)

      @file_index = make_directory_index
      @file_list.each { |f| add_path(f) }
      freeze_directory_tree!(@file_index)

      @file_index
    end

    def freeze_directory_tree!(dir)
      dir.freeze
      dir[:files].freeze
      dir[:dirs].freeze
      dir[:dirs].each_value { |sub_dir| freeze_directory_tree!(sub_dir) }
    end

    def make_directory_index
      { files: [], dirs: {} }
    end
  end
end
