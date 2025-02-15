# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `rapidjson` gem.
# Please instead update this file by running `bin/tapioca gem rapidjson`.

# source://rapidjson//lib/rapidjson/version.rb#3
module RapidJSON
  class << self
    # source://rapidjson//lib/rapidjson.rb#36
    def dump(object); end

    # source://rapidjson//lib/rapidjson.rb#36
    def encode(object); end

    def json_escape(_arg0); end
    def json_ready?(_arg0); end

    # source://rapidjson//lib/rapidjson.rb#31
    def load(string); end

    # source://rapidjson//lib/rapidjson.rb#31
    def parse(string); end

    # source://rapidjson//lib/rapidjson.rb#41
    def pretty_encode(object); end

    # @return [Boolean]
    #
    # source://rapidjson//lib/rapidjson.rb#45
    def valid_json?(string); end
  end
end

# source://rapidjson//lib/rapidjson/active_support_encoder.rb#2
class RapidJSON::ActiveSupportEncoder
  # @return [ActiveSupportEncoder] a new instance of ActiveSupportEncoder
  #
  # source://rapidjson//lib/rapidjson/active_support_encoder.rb#3
  def initialize(options = T.unsafe(nil)); end

  # Encode the given object into a JSON string
  #
  # source://rapidjson//lib/rapidjson/active_support_encoder.rb#15
  def encode(value); end
end

# source://rapidjson//lib/rapidjson.rb#10
class RapidJSON::Coder
  # @return [Coder] a new instance of Coder
  #
  # source://rapidjson//lib/rapidjson.rb#11
  def initialize(pretty: T.unsafe(nil), allow_nan: T.unsafe(nil), &to_json); end

  def _load(_arg0, _arg1); end

  # source://rapidjson//lib/rapidjson.rb#17
  def dump(object); end

  # source://rapidjson//lib/rapidjson.rb#21
  def load(string); end

  def valid_json?(_arg0); end

  private

  def _dump(_arg0, _arg1, _arg2, _arg3); end
end

# source://rapidjson//lib/rapidjson.rb#50
RapidJSON::DEFAULT_CODER = T.let(T.unsafe(nil), RapidJSON::Coder)

class RapidJSON::EncodeError < ::RapidJSON::Error; end

# source://rapidjson//lib/rapidjson.rb#6
class RapidJSON::Error < ::StandardError; end

# source://rapidjson//lib/rapidjson.rb#8
class RapidJSON::Fragment < ::Struct
  # Returns the value of attribute to_json
  #
  # @return [Object] the current value of to_json
  def to_json; end

  # Sets the attribute to_json
  #
  # @param value [Object] the value to set the attribute to_json to.
  # @return [Object] the newly set value
  def to_json=(_); end

  class << self
    def [](*_arg0); end
    def inspect; end
    def keyword_init?; end
    def members; end
    def new(*_arg0); end
  end
end

# source://rapidjson//lib/rapidjson/json_gem.rb#4
module RapidJSON::JSONGem
  class << self
    # source://rapidjson//lib/rapidjson/json_gem.rb#59
    def dump(object, anIO = T.unsafe(nil), limit = T.unsafe(nil)); end

    # source://rapidjson//lib/rapidjson/json_gem.rb#67
    def generate(object, opts = T.unsafe(nil)); end

    # source://rapidjson//lib/rapidjson/json_gem.rb#43
    def load(string, proc = T.unsafe(nil), options = T.unsafe(nil)); end

    # source://rapidjson//lib/rapidjson/json_gem.rb#51
    def parse(string, opts = T.unsafe(nil)); end

    private

    # source://rapidjson//lib/rapidjson/json_gem.rb#77
    def method_missing(name, *args, **_arg2); end

    # @return [Boolean]
    #
    # source://rapidjson//lib/rapidjson/json_gem.rb#82
    def respond_to_missing?(name, include_private = T.unsafe(nil)); end
  end
end

# source://rapidjson//lib/rapidjson/json_gem.rb#33
RapidJSON::JSONGem::DUMP_CODER = T.let(T.unsafe(nil), RapidJSON::Coder)

# source://rapidjson//lib/rapidjson/json_gem.rb#7
RapidJSON::JSONGem::GEM = JSON

# source://rapidjson//lib/rapidjson/json_gem.rb#30
RapidJSON::JSONGem::GENERATE_CODER = T.let(T.unsafe(nil), RapidJSON::Coder)

# source://rapidjson//lib/rapidjson/json_gem.rb#5
RapidJSON::JSONGem::GeneratorError = RapidJSON::EncodeError

# source://rapidjson//lib/rapidjson/json_gem.rb#36
RapidJSON::JSONGem::PRETTY_CODER = T.let(T.unsafe(nil), RapidJSON::Coder)

# source://rapidjson//lib/rapidjson/json_gem.rb#10
RapidJSON::JSONGem::STATE = T.let(T.unsafe(nil), JSON::Ext::Generator::State)

# source://rapidjson//lib/rapidjson/json_gem.rb#13
RapidJSON::JSONGem::TO_JSON_PROC = T.let(T.unsafe(nil), Proc)

# source://rapidjson//lib/rapidjson.rb#53
RapidJSON::PRETTY_CODER = T.let(T.unsafe(nil), RapidJSON::Coder)

class RapidJSON::ParseError < ::RapidJSON::Error; end

# source://rapidjson//lib/rapidjson/version.rb#4
RapidJSON::VERSION = T.let(T.unsafe(nil), String)
