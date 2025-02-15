# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `cff` gem.
# Please instead update this file by running `bin/tapioca gem cff`.

# This library provides a Ruby interface to manipulate CITATION.cff files. The
# primary entry points are Index and File.
#
# See the [CITATION.cff documentation](https://citation-file-format.github.io/)
# for more details.
#
# source://cff//lib/cff.rb#22
module CFF; end

# Methods to enable turning a CFF model or file into a citation.
#
# The core functionality is in the `citation` method. In addition, each
# available output format has a `to_{format}` method generated for it as
# well, e.g. `to_bibtex` or `to_apalike`. These methods take a single
# parameter, `preferred_citation:`, which defaults to `true` as in the
# `citation` method.
#
# source://cff//lib/cff/citable.rb#28
module CFF::Citable
  # :call-seq:
  #   citation(format, preferred_citation: true) -> String
  #
  # Output this Index in the specified format. Setting
  # `preferred_citation: true` will honour the `preferred_citation` field in
  # the index if one is present (default).
  #
  # `format` can be supplied as a String or a Symbol.
  #
  # Formats that are built-in to Ruby CFF are:
  #
  # * APAlike (e.g. `:apalike`, `'apalike'` or `'APAlike'`)
  # * BibTeX (e.g. `:bibtex`, `'bibtex'` or `'BibTeX'`)
  #
  # *Note:* This method assumes that this Index is valid when called.
  #
  # source://cff//lib/cff/citable.rb#44
  def citation(format, preferred_citation: T.unsafe(nil)); end

  # source://cff//lib/cff/citable.rb#60
  def to_apalike(preferred_citation: T.unsafe(nil)); end

  # source://cff//lib/cff/citable.rb#60
  def to_bibtex(preferred_citation: T.unsafe(nil)); end

  class << self
    # source://cff//lib/cff/citable.rb#51
    def add_to_format_method(format); end
  end
end

# source://cff//lib/cff/version.rb#21
CFF::DEFAULT_SPEC_VERSION = T.let(T.unsafe(nil), String)

# An Entity can represent different types of entities, e.g., a publishing
# company, or conference. Like a Person, an Entity might have a number of
# roles, such as author, contact, editor, etc.
#
# Entity implements all of the fields listed in the
# [CFF standard](https://citation-file-format.github.io/). All fields
# are simple strings and can be set as such. A field which has not been set
# will return the empty string. The simple fields are (with defaults in
# parentheses):
#
# * `address`
# * `alias`
# * `city`
# * `country`
# * `date_end` - *Note:* returns a `Date` object
# * `date_start` - *Note:* returns a `Date` object
# * `email`
# * `fax`
# * `location`
# * `name`
# * `orcid`
# * `post_code`
# * `region`
# * `tel`
# * `website`
#
# source://cff//lib/cff/entity.rb#47
class CFF::Entity < ::CFF::ModelPart
  # :call-seq:
  #   new(name) -> Entity
  #   new(name) { |entity| block } -> Entity
  #
  # Create a new Entity with the supplied name.
  #
  # @return [Entity] a new instance of Entity
  # @yield [_self]
  # @yieldparam _self [CFF::Entity] the object that the method was called on
  #
  # source://cff//lib/cff/entity.rb#57
  def initialize(param); end

  # source://cff//lib/cff/model_part.rb#80
  def date_end; end

  # source://cff//lib/cff/model_part.rb#102
  def date_end=(date); end

  # source://cff//lib/cff/model_part.rb#80
  def date_start; end

  # source://cff//lib/cff/model_part.rb#102
  def date_start=(date); end
end

# source://cff//lib/cff/entity.rb#48
CFF::Entity::ALLOWED_FIELDS = T.let(T.unsafe(nil), Array)

# Error is the base class for all errors raised by this library.
#
# source://cff//lib/cff/errors.rb#20
class CFF::Error < ::RuntimeError
  # @return [Error] a new instance of Error
  #
  # source://cff//lib/cff/errors.rb#21
  def initialize(message = T.unsafe(nil)); end
end

# File provides direct access to a CFF Index, with the addition of some
# filesystem utilities.
#
# To be a fully compliant and valid CFF file its filename should be
# 'CITATION.cff'. This class allows you to create files with any filename,
# and to validate the contents of those files independently of the preferred
# filename.
#
# source://cff//lib/cff/file.rb#33
class CFF::File
  # :call-seq:
  #   new(filename, title) -> File
  #   new(filename, index) -> File
  #
  # Create a new File. Either a pre-existing Index can be passed in or, as
  # with Index itself, a title can be supplied to initalize a new File.
  #
  # All methods provided by Index are also available directly on File
  # objects.
  #
  # @return [File] a new instance of File
  #
  # source://cff//lib/cff/file.rb#57
  def initialize(filename, param, comment = T.unsafe(nil), create: T.unsafe(nil)); end

  # A comment to be inserted at the top of the resultant CFF file.
  #
  # source://cff//lib/cff/file.rb#35
  def comment; end

  # :call-seq:
  #   comment = string or array
  #
  # A comment to be inserted at the top of the resultant CFF file. This can
  # be supplied as a simple string or an array of strings. When the file is
  # saved this comment is formatted as follows:
  #
  # * a simple string is split into 75 character lines and `'# '` is prepended
  # to each line;
  # * an array of strings is joined into a single string with `'\n'` and
  # `'# '` is prepended to each line;
  #
  # If you care about formatting, use an array of strings for your comment,
  # if not, use a single string.
  #
  # source://cff//lib/cff/file.rb#220
  def comment=(comment); end

  # The filename of this CFF file.
  #
  # source://cff//lib/cff/file.rb#38
  def filename; end

  # source://cff//lib/cff/file.rb#229
  def method_missing(name, *args); end

  # source://cff//lib/cff/file.rb#225
  def to_yaml; end

  # :call-seq:
  #   validate(fail_fast: false, fail_on_filename: true) -> Array
  #
  # Validate this file and return an array with the result. The result array
  # is a three-element array, with `true`/`false` at index 0 to indicate
  # pass/fail, an array of schema validation errors at index 1 (if any), and
  # `true`/`false` at index 2 to indicate whether the filename passed/failed
  # validation.
  #
  # You can choose whether filename validation failure should cause overall
  # validation failure with the `fail_on_filename` parameter (default: true).
  #
  # source://cff//lib/cff/file.rb#163
  def validate(fail_fast: T.unsafe(nil), fail_on_filename: T.unsafe(nil)); end

  # :call-seq:
  #   validate!(fail_fast: false, fail_on_filename: true)
  #
  # Validate this file and raise a ValidationError upon failure. If an error
  # is raised it will contain the detected validation failures for further
  # inspection.
  #
  # You can choose whether filename validation failure should cause overall
  # validation failure with the `fail_on_filename` parameter (default: true).
  #
  # @raise [ValidationError]
  #
  # source://cff//lib/cff/file.rb#180
  def validate!(fail_fast: T.unsafe(nil), fail_on_filename: T.unsafe(nil)); end

  # :call-seq:
  #   write(save_as: filename)
  #
  # Write this CFF File. The `save_as` parameter can be used to save a new
  # copy of this CFF File under a different filename, leaving the original
  # file untouched. If `save_as` is used then the internal filename of the
  # File will be updated to the supplied filename.
  #
  # source://cff//lib/cff/file.rb#196
  def write(save_as: T.unsafe(nil)); end

  private

  # @return [Boolean]
  #
  # source://cff//lib/cff/file.rb#238
  def respond_to_missing?(name, *all); end

  class << self
    # source://cff//lib/cff/file.rb#242
    def format_comment(comment); end

    # :call-seq:
    #   open(filename) -> File
    #   open(filename) { |cff| block }
    #
    # With no associated block, File.open is a synonym for ::read. If the
    # optional code block is given, it will be passed the opened file as an
    # argument and the File object will automatically be written (if edited)
    # and closed when the block terminates.
    #
    # File.open will create a new file if one does not already exist with the
    # provided file name.
    #
    # source://cff//lib/cff/file.rb#90
    def open(file); end

    # source://cff//lib/cff/file.rb#253
    def parse_comment(content); end

    # :call-seq:
    #   read(filename) -> File
    #
    # Read a file and parse it for subsequent manipulation.
    #
    # source://cff//lib/cff/file.rb#70
    def read(file); end

    # :call-seq:
    #   validate(filename, fail_on_filename: true) -> Array
    #
    # Read a file and return an array with the result. The result array is a
    # three-element array, with `true`/`false` at index 0 to indicate
    # pass/fail, an array of schema validation errors at index 1 (if any), and
    # `true`/`false` at index 2 to indicate whether the filename passed/failed
    # validation.
    #
    # You can choose whether filename validation failure should cause overall
    # validation failure with the `fail_on_filename` parameter (default: true).
    #
    # source://cff//lib/cff/file.rb#121
    def validate(file, fail_on_filename: T.unsafe(nil)); end

    # :call-seq:
    #   validate!(filename, fail_on_filename: true)
    #
    # Read a file and raise a ValidationError upon failure. If an error is
    # raised it will contain the detected validation failures for further
    # inspection.
    #
    # You can choose whether filename validation failure should cause overall
    # validation failure with the `fail_on_filename` parameter (default: true).
    #
    # source://cff//lib/cff/file.rb#134
    def validate!(file, fail_on_filename: T.unsafe(nil)); end

    # :call-seq:
    #   write(filename, File)
    #   write(filename, Index)
    #   write(filename, yaml)
    #
    # Write the supplied File, Index or yaml string to `file`.
    #
    # source://cff//lib/cff/file.rb#144
    def write(file, cff, comment = T.unsafe(nil)); end
  end
end

# source://cff//lib/cff/file.rb#41
CFF::File::CFF_COMMENT = T.let(T.unsafe(nil), Array)

# source://cff//lib/cff/file.rb#46
CFF::File::CFF_VALID_FILENAME = T.let(T.unsafe(nil), String)

# source://cff//lib/cff/file.rb#40
CFF::File::YAML_HEADER = T.let(T.unsafe(nil), String)

# A registry of output formatters for converting CFF files into citations.
#
# source://cff//lib/cff/formatters.rb#20
module CFF::Formatters
  class << self
    # source://cff//lib/cff/formatters.rb#55
    def formatter_for(format); end

    # :call-seq:
    #   formatters -> Array
    #
    # Return the list of formatters that are available.
    #
    # source://cff//lib/cff/formatters.rb#27
    def formatters; end

    # :call-seq:
    #   register_formatter(class)
    #
    # Register a citation formatter. To be registered as a formatter, a
    # class should at least provide the following class methods:
    #
    # * `format`, which takes the model to be formatted
    # as a named parameter, and the option to cite a CFF file's
    # `preferred-citation`:
    # ```ruby
    # def self.format(model:, preferred_citation: true); end
    # ```
    # * `label`, which returns a short name for the formatter, e.g.
    # `'BibTeX'`. If your formatter class subclasses `CFF::Formatter`,
    # then `label` is provided for you.
    #
    # source://cff//lib/cff/formatters.rb#46
    def register_formatter(clazz); end
  end
end

# Generates an APALIKE citation string
#
# source://cff//lib/cff/formatters/apalike.rb#23
class CFF::Formatters::APALike < ::CFF::Formatters::Formatter
  class << self
    # source://cff//lib/cff/formatters/apalike.rb#128
    def combine_authors(authors); end

    # source://cff//lib/cff/formatters/apalike.rb#106
    def date_range(start, finish); end

    # source://cff//lib/cff/formatters/apalike.rb#24
    def format(model:, preferred_citation: T.unsafe(nil)); end

    # source://cff//lib/cff/formatters/apalike.rb#134
    def format_author(author); end

    # Format a name using an alias if needs be.
    # https://blog.apastyle.org/apastyle/2012/02/how-to-cite-pseudonyms.html
    #
    # source://cff//lib/cff/formatters/apalike.rb#146
    def format_name(author); end

    # If we're citing a conference paper, try and use the date of the
    # conference. Otherwise use the specified month and year, or the date
    # of release.
    #
    # source://cff//lib/cff/formatters/apalike.rb#92
    def month_and_year_from_model(model); end

    # source://cff//lib/cff/formatters/apalike.rb#44
    def publication_data_from_model(model); end

    # source://cff//lib/cff/formatters/apalike.rb#78
    def type_and_school_from_model(model, type); end

    # source://cff//lib/cff/formatters/apalike.rb#120
    def type_label(model); end

    # Prefer a DOI over the other URI options.
    #
    # source://cff//lib/cff/formatters/apalike.rb#116
    def url(model); end

    # source://cff//lib/cff/formatters/apalike.rb#84
    def volume_from_model(model); end
  end
end

# Generates an BibTeX citation string
#
# source://cff//lib/cff/formatters/bibtex.rb#25
class CFF::Formatters::BibTeX < ::CFF::Formatters::Formatter
  class << self
    # source://cff//lib/cff/formatters/bibtex.rb#203
    def actor_list(actors); end

    # BibTeX 'address' is taken from the publisher (book, others) or the
    # conference (inproceedings).
    #
    # source://cff//lib/cff/formatters/bibtex.rb#101
    def address_from_model(model); end

    # Do what we can to map between CFF reference types and bibtex types.
    # References:
    #  * https://www.bibtex.com/e/entry-types/
    #  * https://ctan.gutenberg.eu.org/macros/latex/contrib/biblatex-contrib/biblatex-software/software-biblatex.pdf
    #
    # source://cff//lib/cff/formatters/bibtex.rb#168
    def bibtex_type(model); end

    # BibTeX 'booktitle' is CFF 'collection-title'.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#131
    def booktitle_from_model(model); end

    # BibTeX 'editor' is CFF 'editors' or 'editors-series'.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#136
    def editor_from_model(model); end

    # source://cff//lib/cff/formatters/bibtex.rb#52
    def format(model:, preferred_citation: T.unsafe(nil)); end

    # source://cff//lib/cff/formatters/bibtex.rb#189
    def format_actor(author); end

    # source://cff//lib/cff/formatters/bibtex.rb#207
    def generate_citekey(fields); end

    # BibTeX 'institution' could be grabbed from an author's affiliation, or
    # provided explicitly.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#114
    def institution_from_model(model); end

    # Escape a string to preserve special characters in LaTeX output.
    # Used in many places, so short method name to preserve reading flow.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#219
    def l(string); end

    # If we're citing a conference paper, try and use the date of the
    # conference. Otherwise use the specified month and year, or the date
    # of release.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#155
    def month_and_year_from_model(model); end

    # BibTeX 'number' is CFF 'issue'.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#95
    def number_from_model(model); end

    # Get various bits of information about the reference publication.
    # Reference: https://www.bibtex.com/format/
    #
    # source://cff//lib/cff/formatters/bibtex.rb#83
    def publication_data_from_model(model, type, fields); end

    # source://cff//lib/cff/formatters/bibtex.rb#144
    def publisher_from_model(model); end

    # BibTeX 'school' is CFF 'institution'.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#121
    def school_from_model(model); end

    # source://cff//lib/cff/formatters/bibtex.rb#148
    def series_from_model(model); end

    # BibTeX 'type' for theses is CFF 'thesis-type'.
    #
    # source://cff//lib/cff/formatters/bibtex.rb#126
    def type_from_model(model); end
  end
end

# Fields without `!` have a simple one-to-one mapping between CFF and
# BibTeX. Those with `!` call out to a more complex getter.
#
# source://cff//lib/cff/formatters/bibtex.rb#26
CFF::Formatters::BibTeX::ENTRY_TYPE_MAP = T.let(T.unsafe(nil), Hash)

# We need to escape these characters in titles and names, as per
# https://tex.stackexchange.com/questions/34580/escape-character-in-latex
#
# source://cff//lib/cff/formatters/bibtex.rb#50
CFF::Formatters::BibTeX::ESCAPE_CHARS = T.let(T.unsafe(nil), Regexp)

# Convert months to three letter abbreviations, as per
# https://www.bibtex.com/f/month-field/. Need to downcase from the
# built-in set.
#
# source://cff//lib/cff/formatters/bibtex.rb#44
CFF::Formatters::BibTeX::MONTHS_MAP = T.let(T.unsafe(nil), Array)

# Formatter base class
#
# source://cff//lib/cff/formatters/formatter.rb#23
class CFF::Formatters::Formatter
  class << self
    # source://cff//lib/cff/formatters/formatter.rb#43
    def initials(name); end

    # source://cff//lib/cff/formatters/formatter.rb#30
    def label; end

    # source://cff//lib/cff/formatters/formatter.rb#69
    def month_and_year_from_date(value); end

    # source://cff//lib/cff/formatters/formatter.rb#56
    def month_and_year_from_model(model); end

    # source://cff//lib/cff/formatters/formatter.rb#47
    def note_from_model(model); end

    # CFF 'pages' is the number of pages, which has no equivalent in BibTeX
    # or APA. References: https://www.bibtex.com/f/pages-field/,
    # https://apastyle.apa.org/style-grammar-guidelines/references/examples
    #
    # source://cff//lib/cff/formatters/formatter.rb#78
    def pages_from_model(model, dash: T.unsafe(nil)); end

    # source://cff//lib/cff/formatters/formatter.rb#34
    def select_and_check_model(model, preferred_citation); end

    # Prefer `repository_code` over `url`
    #
    # source://cff//lib/cff/formatters/formatter.rb#52
    def url(model); end
  end
end

# source://cff//lib/cff/formatters/formatter.rb#24
CFF::Formatters::Formatter::STATUS_TEXT_MAP = T.let(T.unsafe(nil), Hash)

# An Identifier represents an identifier in a CITATION.cff file.
#
# Identifier implements all of the fields listed in the
# [CFF standard](https://citation-file-format.github.io/). All fields
# are simple strings and can be set as such. A field which has not been set
# will return the empty string. The simple fields are (with defaults in
# parentheses):
#
# * `description`
# * `type`
# * `value`
#
# source://cff//lib/cff/identifier.rb#33
class CFF::Identifier < ::CFF::ModelPart
  # :call-seq:
  #   new -> Identifier
  #   new { |id| block } -> Identifier
  #   new(type, value) -> Identifier
  #   new(type, value) { |id| block } -> Identifier
  #
  # Create a new Identifier with the optionally supplied type and value.
  # If the supplied type is invalid, then neither the type or value are set.
  #
  # @return [Identifier] a new instance of Identifier
  # @yield [_self]
  # @yieldparam _self [CFF::Identifier] the object that the method was called on
  #
  # source://cff//lib/cff/identifier.rb#50
  def initialize(param = T.unsafe(nil), *more); end

  # :call-seq:
  #   type = type
  #
  # Sets the type of this Identifier. The type is restricted to a
  # [defined set of identifier types](https://github.com/citation-file-format/citation-file-format/blob/main/README.md#identifier-type-strings).
  #
  # source://cff//lib/cff/identifier.rb#72
  def type=(type); end
end

# source://cff//lib/cff/identifier.rb#34
CFF::Identifier::ALLOWED_FIELDS = T.let(T.unsafe(nil), Array)

# The [defined set of identifier types](https://github.com/citation-file-format/citation-file-format/blob/main/README.md#identifier-type-strings).
#
# source://cff//lib/cff/identifier.rb#38
CFF::Identifier::IDENTIFIER_TYPES = T.let(T.unsafe(nil), Array)

# source://cff//lib/cff/index.rb#58
class CFF::Index < ::CFF::ModelPart
  include ::CFF::Citable
  include ::CFF::Licensable
  include ::CFF::Validatable

  # :call-seq:
  #   new(title) -> Index
  #   new(title) { |index| block } -> Index
  #
  # Initialize a new Index with the supplied title.
  #
  # @return [Index] a new instance of Index
  # @yield [_self]
  # @yieldparam _self [CFF::Index] the object that the method was called on
  #
  # source://cff//lib/cff/index.rb#79
  def initialize(param); end

  # source://cff//lib/cff/model_part.rb#80
  def date_released; end

  # source://cff//lib/cff/model_part.rb#102
  def date_released=(date); end

  # source://cff//lib/cff/index.rb#132
  def to_yaml; end

  # :call-seq:
  #   type = type
  #
  # Sets the type of this CFF Index. The type is currently restricted to one
  # of `software` or `dataset`. If this field is not set then you should
  # assume that the type is `software`.
  #
  # source://cff//lib/cff/index.rb#127
  def type=(type); end

  private

  # source://cff//lib/cff/index.rb#146
  def build_index(fields); end

  # source://cff//lib/cff/index.rb#138
  def fields; end

  class << self
    # :call-seq:
    #   open(String) -> Index
    #   open(String) { |cff| block } -> Index
    #
    # With no associated block, Index.open is a synonym for ::read. If the
    # optional code block is given, it will be passed the parsed index as an
    # argument and the Index will be returned when the block terminates.
    #
    # @yield [cff]
    #
    # source://cff//lib/cff/index.rb#113
    def open(index); end

    # :call-seq:
    #   read(String) -> Index
    #
    # Read a CFF Index from a String and parse it for subsequent manipulation.
    #
    # source://cff//lib/cff/index.rb#102
    def read(index); end
  end
end

# source://cff//lib/cff/index.rb#63
CFF::Index::ALLOWED_FIELDS = T.let(T.unsafe(nil), Array)

# The default message to use if none is explicitly set.
#
# source://cff//lib/cff/index.rb#69
CFF::Index::DEFAULT_MESSAGE = T.let(T.unsafe(nil), String)

# The allowed CFF [types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#type).
#
# source://cff//lib/cff/index.rb#66
CFF::Index::MODEL_TYPES = T.let(T.unsafe(nil), Array)

# Functionality to add licence(s) to parts of the CFF model.
#
# source://cff//lib/cff/licensable.rb#22
module CFF::Licensable
  # source://cff//lib/cff/licensable.rb#33
  def license=(lic); end
end

# source://cff//lib/cff/licensable.rb#23
CFF::Licensable::LICENSES = T.let(T.unsafe(nil), Array)

# source://cff//lib/cff/version.rb#22
CFF::MIN_VALIDATABLE_VERSION = T.let(T.unsafe(nil), String)

# ModelPart is the superclass of anything that makes up part of the CFF Index.
# This includes Index, Person, Entity and Reference.
#
# ModelPart provides only one method for the public API: `empty?`.
#
# source://cff//lib/cff/model_part.rb#25
class CFF::ModelPart
  # :call-seq:
  #   empty? -> false
  #
  # Define `empty?` for CFF classes so that they can be tested in the
  # same way as strings and arrays.
  #
  # This always returns `false` because CFF classes always return something
  # from all of their methods.
  #
  # @return [Boolean]
  #
  # source://cff//lib/cff/model_part.rb#54
  def empty?; end

  # :stopdoc:
  #
  # source://cff//lib/cff/model_part.rb#27
  def fields; end

  # source://cff//lib/cff/model_part.rb#29
  def method_missing(name, *args); end

  private

  # source://cff//lib/cff/model_part.rb#115
  def method_to_field(name); end

  # @return [Boolean]
  #
  # source://cff//lib/cff/model_part.rb#40
  def respond_to_missing?(name, *_arg1); end

  class << self
    # source://cff//lib/cff/model_part.rb#58
    def attr_date(*symbols); end

    private

    # source://cff//lib/cff/model_part.rb#67
    def date_getter(symbol, field); end

    # source://cff//lib/cff/model_part.rb#94
    def date_setter(symbol, field); end
  end
end

# A Person represents a person in a CITATION.cff file. A Person might have a
# number of roles, such as author, contact, editor, etc.
#
# Person implements all of the fields listed in the
# [CFF standard](https://citation-file-format.github.io/). All fields
# are simple strings and can be set as such. A field which has not been set
# will return the empty string. The simple fields are (with defaults in
# parentheses):
#
# * `address`
# * `affiliation`
# * `alias`
# * `city`
# * `country`
# * `email`
# * `family_names`
# * `fax`
# * `given_names`
# * `name_particle`
# * `name_suffix`
# * `orcid`
# * `post_code`
# * `region`
# * `tel`
# * `website`
#
# source://cff//lib/cff/person.rb#47
class CFF::Person < ::CFF::ModelPart
  # :call-seq:
  #   new -> Person
  #   new { |person| block } -> Person
  #   new(given_name, family_name) -> Person
  #   new(given_name, family_name) { |person| block } -> Person
  #
  # Create a new Person with the optionally supplied given and family names.
  #
  # @return [Person] a new instance of Person
  # @yield [_self]
  # @yieldparam _self [CFF::Person] the object that the method was called on
  #
  # source://cff//lib/cff/person.rb#57
  def initialize(param = T.unsafe(nil), *more); end
end

# source://cff//lib/cff/person.rb#48
CFF::Person::ALLOWED_FIELDS = T.let(T.unsafe(nil), Array)

# source://cff//lib/cff/reference.rb#97
class CFF::Reference < ::CFF::ModelPart
  include ::CFF::Licensable

  # :call-seq:
  #   new(title) -> Reference
  #   new(title) { |ref| block } -> Reference
  #   new(title, type) -> Reference
  #   new(title, type) { |ref| block } -> Reference
  #
  # Create a new Reference with the supplied title and, optionally, type.
  # If type is not given, or is not one of the
  # [defined set of reference types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#definitionsreferencetype),
  # 'generic' will be used by default.
  #
  # @return [Reference] a new instance of Reference
  # @yield [_self]
  # @yieldparam _self [CFF::Reference] the object that the method was called on
  #
  # source://cff//lib/cff/reference.rb#127
  def initialize(param, *more); end

  # :call-seq:
  #   add_language language
  #
  # Add a language to this Reference. Input is converted to the ISO 639-3
  # three letter language code, so `GER` becomes `deu`, `french` becomes
  # `fra` and `en` becomes `eng`.
  #
  # source://cff//lib/cff/reference.rb#178
  def add_language(lang); end

  # source://cff//lib/cff/model_part.rb#80
  def date_accessed; end

  # source://cff//lib/cff/model_part.rb#102
  def date_accessed=(date); end

  # source://cff//lib/cff/model_part.rb#80
  def date_downloaded; end

  # source://cff//lib/cff/model_part.rb#102
  def date_downloaded=(date); end

  # source://cff//lib/cff/model_part.rb#80
  def date_published; end

  # source://cff//lib/cff/model_part.rb#102
  def date_published=(date); end

  # source://cff//lib/cff/model_part.rb#80
  def date_released; end

  # source://cff//lib/cff/model_part.rb#102
  def date_released=(date); end

  # Override superclass #fields as References contain model parts too.
  #
  # source://cff//lib/cff/reference.rb#241
  def fields; end

  # Returns the format of this Reference.
  #
  # This method is explicitly defined to override the private format method
  # that all objects seem to have.
  #
  # source://cff//lib/cff/reference.rb#208
  def format; end

  # Sets the format of this Reference.
  #
  # This method is explicitly defined to override the private format method
  # that all objects seem to have.
  #
  # source://cff//lib/cff/reference.rb#216
  def format=(fmt); end

  # source://cff//lib/cff/model_part.rb#80
  def issue_date; end

  # source://cff//lib/cff/model_part.rb#102
  def issue_date=(date); end

  # :call-seq:
  #   languages -> Array
  #
  # Return the list of languages associated with this Reference.
  #
  # source://cff//lib/cff/reference.rb#200
  def languages; end

  # :call-seq:
  #   reset_languages
  #
  # Reset the list of languages for this Reference to be empty.
  #
  # source://cff//lib/cff/reference.rb#192
  def reset_languages; end

  # :call-seq:
  #   status = status
  #
  # Sets the status of this Reference. The status is restricted to a
  # [defined set of status types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#definitionsreferencestatus).
  #
  # source://cff//lib/cff/reference.rb#225
  def status=(status); end

  # :call-seq:
  #   type = type
  #
  # Sets the type of this Reference. The type is restricted to a
  # [defined set of reference types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#definitionsreferencetype).
  #
  # source://cff//lib/cff/reference.rb#235
  def type=(type); end

  private

  # source://cff//lib/cff/reference.rb#254
  def build_model(fields); end

  class << self
    # :call-seq:
    #   from_cff(File, type: 'software') -> Reference
    #   from_cff(Index, type: 'software') -> Reference
    #
    # Create a Reference from another CFF File or Index. This is useful for
    # easily adding a reference to something with its own CITATION.cff file
    # already.
    #
    # This method assumes that the type of the Reference should be `software`,
    # but this can be overridden with the `type` parameter.
    #
    # source://cff//lib/cff/reference.rb#159
    def from_cff(model, type: T.unsafe(nil)); end
  end
end

# This list does not include `format` for reasons explained below, where
# the `format` method is defined!
#
# source://cff//lib/cff/reference.rb#102
CFF::Reference::ALLOWED_FIELDS = T.let(T.unsafe(nil), Array)

# The [defined set of reference status types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#definitionsreferencestatus).
#
# source://cff//lib/cff/reference.rb#111
CFF::Reference::REFERENCE_STATUS_TYPES = T.let(T.unsafe(nil), Array)

# The [defined set of reference types](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md#definitionsreferencetype).
#
# source://cff//lib/cff/reference.rb#107
CFF::Reference::REFERENCE_TYPES = T.let(T.unsafe(nil), Array)

# source://cff//lib/cff/schema.rb#22
CFF::SCHEMA_FILE = T.let(T.unsafe(nil), Hash)

# source://cff//lib/cff/schema.rb#21
CFF::SCHEMA_PATH = T.let(T.unsafe(nil), String)

# Util provides utility methods useful throughout the rest of the CFF library.
#
# Util does not provide any methods or fields for the public API.
#
# source://cff//lib/cff/util.rb#28
module CFF::Util
  private

  # Currently need to make some sort of guess as to whether an actor
  # is a Person or Entity. This isn't perfect, but works 99.99% I think.
  #
  # source://cff//lib/cff/util.rb#45
  def build_actor_collection!(source); end

  # source://cff//lib/cff/util.rb#55
  def fields_to_hash(fields); end

  # source://cff//lib/cff/util.rb#51
  def normalize_modelpart_array!(array); end

  # source://cff//lib/cff/util.rb#115
  def parameterize(string, separator: T.unsafe(nil)); end

  # source://cff//lib/cff/util.rb#109
  def transliterate(string, fallback: T.unsafe(nil)); end

  # source://cff//lib/cff/util.rb#33
  def update_cff_version(version); end

  class << self
    # Currently need to make some sort of guess as to whether an actor
    # is a Person or Entity. This isn't perfect, but works 99.99% I think.
    #
    # source://cff//lib/cff/util.rb#45
    def build_actor_collection!(source); end

    # source://cff//lib/cff/util.rb#55
    def fields_to_hash(fields); end

    # source://cff//lib/cff/util.rb#51
    def normalize_modelpart_array!(array); end

    # source://cff//lib/cff/util.rb#115
    def parameterize(string, separator: T.unsafe(nil)); end

    # source://cff//lib/cff/util.rb#109
    def transliterate(string, fallback: T.unsafe(nil)); end

    # source://cff//lib/cff/util.rb#33
    def update_cff_version(version); end
  end
end

# source://cff//lib/cff/util.rb#73
CFF::Util::DEFAULT_CHAR_APPROXIMATIONS = T.let(T.unsafe(nil), Hash)

# source://cff//lib/cff/version.rb#20
CFF::VERSION = T.let(T.unsafe(nil), String)

# Methods to validate CFF files/models against a formal schema.
#
# source://cff//lib/cff/validatable.rb#25
module CFF::Validatable
  # :call-seq:
  #   validate(fail_fast: false) -> Array
  #
  # Validate a CFF file or model (Index) and return an array with the result.
  # The result array is a two-element array, with `true`/`false` at index 0
  # to indicate pass/fail, and an array of errors at index 1 (if any).
  # Setting `fail_fast` to true will fail validation at the first detected
  # failure, rather than gathering and returning all failures.
  #
  # source://cff//lib/cff/validatable.rb#51
  def validate(fail_fast: T.unsafe(nil)); end

  # :call-seq:
  #   validate!(fail_fast: false)
  #
  # Validate a CFF file or model (Index) and raise a ValidationError upon
  # failure. If an error is raised it will contain the detected validation
  # failures for further inspection. Setting `fail_fast` to true will fail
  # validation at the first detected failure, rather than gathering and
  # returning all failures.
  #
  # @raise [ValidationError]
  #
  # source://cff//lib/cff/validatable.rb#36
  def validate!(fail_fast: T.unsafe(nil)); end
end

# source://cff//lib/cff/validatable.rb#26
CFF::Validatable::SCHEMA = T.let(T.unsafe(nil), JsonSchema::Schema)

# ValidationError is raised when a CFF file fails validation. It contains
# details of each failure that was detected by the underlying JsonSchema
# library, which is used to perform the validation.
#
# Additionally, the `invalid_filename` flag is used to indicate whether the
# CFF file is named correctly. This is only used when validating a File;
# validating a Index directly will not set this flag to `true`.
#
# source://cff//lib/cff/errors.rb#33
class CFF::ValidationError < ::CFF::Error
  # @return [ValidationError] a new instance of ValidationError
  #
  # source://cff//lib/cff/errors.rb#40
  def initialize(errors, invalid_filename: T.unsafe(nil)); end

  # The list of JsonSchema::ValidationErrors found by the validator.
  #
  # source://cff//lib/cff/errors.rb#35
  def errors; end

  # If a File was validated, was its filename invalid?
  #
  # source://cff//lib/cff/errors.rb#38
  def invalid_filename; end

  # source://cff//lib/cff/errors.rb#46
  def to_s; end
end
