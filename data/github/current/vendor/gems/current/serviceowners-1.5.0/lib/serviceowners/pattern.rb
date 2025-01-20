# typed: strict
# frozen_string_literal: true

module Serviceowners
  # A pattern which describes a set of files
  class Pattern
    extend T::Sig

    # only match glob special characters:
    # https://ruby-doc.org/core-2.7.0/File.html#method-c-fnmatch
    GLOB_REGEX = T.let(/[*?\[\]]/, Regexp)
    TWIRP_PREFIX = "app/api/internal/twirp/"

    sig { params(text: String).void }
    def initialize(text)
      @text = text
      @type = T.let(nil, T.nilable(Symbol))
      @parts = T.let(nil, T.nilable(T::Array[String]))
    end

    sig { returns(String).checked(:tests) }
    attr_reader :text

    sig { returns(T::Boolean).checked(:tests) }
    def directory?
      type == :directory
    end

    sig { returns(T::Boolean).checked(:tests) }
    def glob?
      type == :glob
    end

    sig { returns(T::Boolean).checked(:tests) }
    def file?
      type == :file
    end

    # TODO: hack for api-reviewers
    sig { returns(T::Boolean) }
    def twirp?
      text.start_with?(TWIRP_PREFIX)
    end

    # TODO: hack for api-reviewers
    sig { returns(T::Boolean) }
    def broad?
      text.start_with?("**/", "app/**/*")
    end

    # TODO: hack for api-reviewers
    sig { returns(T::Boolean) }
    def api?
      text.start_with?("app/api/", "**/api/")
    end

    sig { returns(T::Boolean) }
    def rest_api?
      api? && !twirp?
    end

    sig { params(path: String).returns(T::Boolean).checked(:tests) }
    def matches?(path)
      if file?
        text == path
      elsif directory?
        path.start_with?(text)
      elsif glob?
        glob_match?(path)
      else
        raise Error, "Unexpected type '#{type}' for pattern '#{text}'"
      end
    end

    sig { returns(T::Array[String]) }
    def parts
      @parts ||= text.split("/")
    end

    sig { returns(T::Array[String]) }
    def non_glob_parts
      parts.take_while { |p| !contains_globbing?(p) }
    end

    sig { returns(Symbol).checked(:tests) }
    def type
      @type ||= if text.match?(GLOB_REGEX)
                  :glob
                elsif text.end_with?("/")
                  :directory
                else
                  :file
                end
    end

    sig { params(other: Object).returns(T.nilable(Integer)).checked(:tests) }
    def <=>(other)
      return nil unless other.is_a?(Pattern)

      sort_order = type_precedence <=> other.type_precedence
      return sort_order unless sort_order.zero?

      # Sort by number of path elements and then the name to make subdirectories
      # take priority over their parent directory.
      if directory?
        sort_value = text.count("/") <=> other.text.count("/")
        return sort_value unless sort_value.zero?
      end

      text <=> other.text
    end

    sig { returns(String) }
    def to_s
      @text
    end

    sig { returns(String) }
    def to_codeowners
      if !@text.start_with?("/") && !@text.start_with?("*")
        "/#{@text}"
      else
        @text
      end
    end

    sig { returns(Integer) }
    def hash
      [text, type].hash
    end

    sig { params(other: Object).returns(T::Boolean) }
    def eql?(other)
      hash == other.hash
    end

    protected

    sig { returns(Integer).checked(:tests) }
    def type_precedence
      return 1 if glob?
      return 2 if directory?

      3
    end

    private

    sig { params(text: String).returns(T::Boolean) }
    def contains_globbing?(text)
      text.match?(GLOB_REGEX)
    end

    # Returns true if the provided path matches the glob pattern.
    sig { params(path: String).returns(T::Boolean).checked(:tests) }
    def glob_match?(path)
      # Try matching with two kinds of settings:
      # - First, allow `*` to match directory separators
      #   (this is how `git ls-files works`, and how Serviceowners was first implemented)
      # - Then, _don't_ allow `*` to match directory separators,
      #   but allow `**` to match no-directory (this is how `Dir.glob` and CODEOWNERS work)
      File.fnmatch(text, path, File::FNM_DOTMATCH) ||
        File.fnmatch(text, path, File::FNM_DOTMATCH | File::FNM_PATHNAME)
    end
  end
end
