# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `editorconfig` gem.
# Please instead update this file by running `bin/tapioca gem editorconfig`.

# source://editorconfig//lib/editor_config/version.rb#1
module EditorConfig
  class << self
    # Public: Test shell pattern against a path.
    #
    # Modeled after editorconfig/fnmatch.py.
    #   https://github.com/editorconfig/editorconfig-core-py/blob/master/editorconfig/fnmatch.py
    #
    # pattern - String shell pattern
    # path    - String pathname
    #
    # Returns true if path matches pattern, otherwise false.
    #
    # @return [Boolean]
    #
    # source://editorconfig//lib/editor_config.rb#153
    def fnmatch?(pattern, path); end

    # Public: Load EditorConfig with a custom loader implementation.
    #
    # path   - String filename on file system
    # config - Basename of config to search for (default: .editorconfig)
    #
    # loader block
    #   config_path - String "path/to/.editorconfig" to attempt to read from
    #
    # Returns Hash of String properties and values.
    #
    # source://editorconfig//lib/editor_config.rb#208
    def load(path, config: T.unsafe(nil), version: T.unsafe(nil)); end

    # Public: Load EditorConfig for a specific file.
    #
    # Starts at filename and walks up each directory gathering any .editorconfig
    # files until it reaches a config marked as "root".
    #
    # path   - String filename on file system
    # config - Basename of config to search for (default: .editorconfig)
    #
    # Returns Hash of String properties and values.
    #
    # source://editorconfig//lib/editor_config.rb#284
    def load_file(*args); end

    # Public: Parse the contents of an `.editorconfig`.
    #
    # io - An IO or String with the raw contents of an `.editorconfig` file.
    #
    # Returns a tuple of a parsed Hash of information and a boolean flag if the
    # file was marked as "root". The hash contains string keys of each section
    # of the config file.
    #
    # An example hash would look like this:
    # {
    #   "*.rb" => {
    #     "indent_style" => "space",
    #     "indent_size" => "2",
    #     "charset" => "utf-8"
    #   }
    # }
    #
    # source://editorconfig//lib/editor_config.rb#76
    def parse(io, version: T.unsafe(nil)); end

    # Public: Normalize known universal properties.
    #
    # config  - Hash configuration
    # version - String spec version
    #
    # Returns new preprocessed Hash.
    #
    # source://editorconfig//lib/editor_config.rb#105
    def preprocess(config, version: T.unsafe(nil)); end

    # Internal: Generate subpaths for given path walking upwards to the root.
    #
    # path - String pathname
    #
    # Returns an Array of String paths.
    #
    # source://editorconfig//lib/editor_config.rb#255
    def traverse(path); end
  end
end

# source://editorconfig//lib/editor_config.rb#14
EditorConfig::CHARSET = T.let(T.unsafe(nil), String)

# Public: Default config basename.
#
# source://editorconfig//lib/editor_config.rb#5
EditorConfig::CONFIG_FILENAME = T.let(T.unsafe(nil), String)

# Public: Possible EOL values.
#
# https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties#end_of_line
#
# source://editorconfig//lib/editor_config.rb#34
EditorConfig::CR = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#36
EditorConfig::CRLF = T.let(T.unsafe(nil), String)

# Internal: Default filename to use if path is too long or has too many
# components.
#
# source://editorconfig//lib/editor_config.rb#49
EditorConfig::DEFAULT_FILENAME = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#13
EditorConfig::END_OF_LINE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#23
EditorConfig::FALSE = T.let(T.unsafe(nil), String)

# Internal: Temporary replacement constants used within fnmatch.
#
# source://editorconfig//lib/editor_config.rb#141
EditorConfig::FNMATCH_ESCAPED_LBRACE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#142
EditorConfig::FNMATCH_ESCAPED_RBRACE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#11
EditorConfig::INDENT_SIZE = T.let(T.unsafe(nil), String)

# Public: Universal property names.
#
# https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties
#
# source://editorconfig//lib/editor_config.rb#10
EditorConfig::INDENT_STYLE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#16
EditorConfig::INSERT_FINAL_NEWLINE = T.let(T.unsafe(nil), String)

# Public: Possible charset values.
#
# https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties#charset
#
# source://editorconfig//lib/editor_config.rb#41
EditorConfig::LATIN1 = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#35
EditorConfig::LF = T.let(T.unsafe(nil), String)

# Internal: Maximum byte length of filename path. Paths over this limit will
# default to global "*" properties.
#
# source://editorconfig//lib/editor_config.rb#53
EditorConfig::MAX_FILENAME = T.let(T.unsafe(nil), Integer)

# Internal: Maximum number of directories a filename can have. Paths this
# deep will default to global "*" properties.
#
# source://editorconfig//lib/editor_config.rb#57
EditorConfig::MAX_FILENAME_COMPONENTS = T.let(T.unsafe(nil), Integer)

# source://editorconfig//lib/editor_config.rb#17
EditorConfig::MAX_LINE_LENGTH = T.let(T.unsafe(nil), String)

# Public: Possible indent style values.
#
# https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties#indent_style
#
# source://editorconfig//lib/editor_config.rb#28
EditorConfig::SPACE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config/version.rb#3
EditorConfig::SPEC_VERSION = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#29
EditorConfig::TAB = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#12
EditorConfig::TAB_WIDTH = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#15
EditorConfig::TRIM_TRAILING_WHITESPACE = T.let(T.unsafe(nil), String)

# Public: Possible boolean values.
#
# https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties
#
# source://editorconfig//lib/editor_config.rb#22
EditorConfig::TRUE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#44
EditorConfig::UTF_16BE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#45
EditorConfig::UTF_16LE = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#42
EditorConfig::UTF_8 = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config.rb#43
EditorConfig::UTF_8_BOM = T.let(T.unsafe(nil), String)

# source://editorconfig//lib/editor_config/version.rb#2
EditorConfig::VERSION = T.let(T.unsafe(nil), String)
