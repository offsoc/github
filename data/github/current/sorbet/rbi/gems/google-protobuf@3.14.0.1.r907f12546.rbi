# typed: false

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `google-protobuf` gem.
# Please instead update this file by running `bin/tapioca gem google-protobuf`.

# We define these before requiring the platform-specific modules.
# That way the module init can grab references to these.
#
# source://google-protobuf//lib/google/protobuf/empty_pb.rb#13
module Google; end

# source://google-protobuf//lib/google/protobuf/empty_pb.rb#14
module Google::Protobuf
  class << self
    # source://google-protobuf//lib/google/protobuf.rb#138
    def decode(klass, proto); end

    # source://google-protobuf//lib/google/protobuf.rb#142
    def decode_json(klass, json, options = T.unsafe(nil)); end

    def deep_copy(_arg0); end
    def discard_unknown(_arg0); end

    # source://google-protobuf//lib/google/protobuf.rb#130
    def encode(msg); end

    # source://google-protobuf//lib/google/protobuf.rb#134
    def encode_json(msg, options = T.unsafe(nil)); end
  end
end

class Google::Protobuf::Any
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#69
  def is(klass); end

  def method_missing(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#48
  def pack(msg, type_url_prefix = T.unsafe(nil)); end

  def to_h; end
  def to_s; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#65
  def type_name; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#57
  def unpack(klass); end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end

    # source://google-protobuf//lib/google/protobuf/well_known_types.rb#42
    def pack(msg, type_url_prefix = T.unsafe(nil)); end
  end
end

class Google::Protobuf::BoolValue
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::BytesValue
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Descriptor
  include ::Prelude::Enumerator
  include ::Enumerable

  def initialize(_arg0, _arg1, _arg2); end

  def each; end
  def each_oneof; end
  def file_descriptor; end
  def lookup(_arg0); end
  def lookup_oneof(_arg0); end
  def msgclass; end
  def name; end
end

class Google::Protobuf::DescriptorPool
  def build(*_arg0); end
  def lookup(_arg0); end

  class << self
    def generated_pool; end
  end
end

class Google::Protobuf::DoubleValue
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Duration
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#100
  def to_f; end

  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Empty
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::EnumDescriptor
  include ::Prelude::Enumerator
  include ::Enumerable

  def initialize(_arg0, _arg1, _arg2); end

  def each; end
  def enummodule; end
  def file_descriptor; end
  def lookup_name(_arg0); end
  def lookup_value(_arg0); end
  def name; end
end

class Google::Protobuf::Error < ::StandardError; end

class Google::Protobuf::FieldDescriptor
  def initialize(_arg0, _arg1, _arg2); end

  def clear(_arg0); end
  def default; end
  def get(_arg0); end
  def has?(_arg0); end
  def label; end
  def name; end
  def number; end
  def set(_arg0, _arg1); end
  def submsg_name; end
  def subtype; end
  def type; end
end

class Google::Protobuf::FieldMask
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::FileDescriptor
  def initialize(_arg0, _arg1, _arg2); end

  def name; end
  def syntax; end
end

class Google::Protobuf::FloatValue
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Int32Value
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Int64Value
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

module Google::Protobuf::Internal
  class << self
    # source://google-protobuf//lib/google/protobuf.rb#111
    def fixup_descriptor(package, msg_names, enum_names); end

    # source://google-protobuf//lib/google/protobuf.rb#57
    def infer_package(names); end
  end
end

class Google::Protobuf::Internal::Builder
  def initialize(_arg0); end

  def add_enum(_arg0); end
  def add_file(*_arg0); end
  def add_message(_arg0); end
end

class Google::Protobuf::Internal::EnumBuilderContext
  def initialize(_arg0, _arg1); end

  def value(_arg0, _arg1); end
end

class Google::Protobuf::Internal::FileBuilderContext
  def initialize(_arg0, _arg1, _arg2); end

  def add_enum(_arg0); end
  def add_message(_arg0); end
end

class Google::Protobuf::Internal::MessageBuilderContext
  def initialize(_arg0, _arg1); end

  def map(*_arg0); end
  def oneof(_arg0); end
  def optional(*_arg0); end
  def proto3_optional(*_arg0); end
  def repeated(*_arg0); end
  def required(*_arg0); end
end

class Google::Protobuf::Internal::NestingBuilder
  # @return [NestingBuilder] a new instance of NestingBuilder
  #
  # source://google-protobuf//lib/google/protobuf.rb#75
  def initialize(msg_names, enum_names); end

  # source://google-protobuf//lib/google/protobuf.rb#87
  def build(package); end

  private

  # source://google-protobuf//lib/google/protobuf.rb#92
  def build_msg(msg); end

  # source://google-protobuf//lib/google/protobuf.rb#101
  def parent(name); end
end

class Google::Protobuf::Internal::OneofBuilderContext
  def initialize(_arg0, _arg1); end

  def optional(*_arg0); end
end

class Google::Protobuf::ListValue
  include ::Google::Protobuf::MessageExts
  include ::Prelude::Enumerator
  include ::Enumerable
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#208
  def <<(value); end

  def ==(_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#200
  def [](index); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#204
  def []=(index, value); end

  def clone; end
  def dup; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#214
  def each; end

  def eql?(_arg0); end
  def hash; end
  def inspect; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#196
  def length; end

  def method_missing(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#218
  def to_a; end

  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end

    # source://google-protobuf//lib/google/protobuf/well_known_types.rb#222
    def from_a(arr); end
  end
end

class Google::Protobuf::Map
  include ::Prelude::Enumerator
  include ::Enumerable

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clear; end
  def delete(_arg0); end
  def dup; end
  def each; end
  def has_key?(_arg0); end
  def hash; end
  def inspect; end
  def keys; end
  def length; end
  def merge(_arg0); end
  def to_h; end
  def values; end
end

module Google::Protobuf::MessageExts
  mixes_in_class_methods ::Google::Protobuf::MessageExts::ClassMethods

  # source://google-protobuf//lib/google/protobuf/message_exts.rb#43
  def to_json(options = T.unsafe(nil)); end

  # source://google-protobuf//lib/google/protobuf/message_exts.rb#47
  def to_proto; end

  class << self
    # this is only called in jruby; mri loades the ClassMethods differently
    #
    # source://google-protobuf//lib/google/protobuf/message_exts.rb#36
    def included(klass); end
  end
end

module Google::Protobuf::MessageExts::ClassMethods; end

module Google::Protobuf::NullValue
  class << self
    def descriptor; end
    def lookup(_arg0); end
    def resolve(_arg0); end
  end
end

# source://google-protobuf//lib/google/protobuf/struct_pb.rb#35
Google::Protobuf::NullValue::NULL_VALUE = T.let(T.unsafe(nil), Integer)

class Google::Protobuf::OneofDescriptor
  include ::Prelude::Enumerator
  include ::Enumerable

  def initialize(_arg0, _arg1, _arg2); end

  def each; end
  def name; end
end

class Google::Protobuf::ParseError < ::Google::Protobuf::Error; end

class Google::Protobuf::RepeatedField
  include ::Prelude::Enumerator
  include ::Enumerable
  extend ::Forwardable

  def initialize(*_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def &(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def *(*args, **_arg1, &block); end

  def +(_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def -(*args, **_arg1, &block); end

  def <<(_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def <=>(*args, **_arg1, &block); end

  def ==(_arg0); end
  def [](*_arg0); end
  def []=(_arg0, _arg1); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def assoc(*args, **_arg1, &block); end

  def at(*_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def bsearch(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def bsearch_index(*args, **_arg1, &block); end

  def clear; end
  def clone; end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def collect!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def combination(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def compact(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def compact!(*args, &block); end

  def concat(_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def count(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def cycle(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#115
  def delete(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#115
  def delete_at(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def delete_if(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def dig(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def drop(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def drop_while(*args, **_arg1, &block); end

  def dup; end
  def each; end

  # array aliases into enumerable
  def each_index(*_arg0); end

  # @return [Boolean]
  #
  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#102
  def empty?; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def eql?(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def fetch(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def fill(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def find_index(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#81
  def first(n = T.unsafe(nil)); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def flatten(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def flatten!(*args, &block); end

  def hash; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def include?(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def index(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def insert(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def inspect(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def join(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def keep_if(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#86
  def last(n = T.unsafe(nil)); end

  def length; end
  def map; end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def map!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def pack(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def permutation(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#91
  def pop(n = T.unsafe(nil)); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def pretty_print(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def pretty_print_cycle(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def product(*args, **_arg1, &block); end

  def push(*_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def rassoc(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def reject!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def repeated_combination(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def repeated_permutation(*args, **_arg1, &block); end

  def replace(_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def reverse(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def reverse!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def rindex(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def rotate(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def rotate!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def sample(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def select!(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def shelljoin(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#115
  def shift(*args, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def shuffle(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def shuffle!(*args, &block); end

  def size; end
  def slice(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#115
  def slice!(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def sort!(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def sort_by!(*args, &block); end

  def to_ary; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def to_s(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def transpose(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def uniq(*args, **_arg1, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#127
  def uniq!(*args, &block); end

  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#115
  def unshift(*args, &block); end

  def values_at; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def |(*args, **_arg1, &block); end

  private

  def pop_one; end

  class << self
    private

    # source://google-protobuf//lib/google/protobuf/repeated_field.rb#114
    def define_array_wrapper_method(method_name); end

    # source://google-protobuf//lib/google/protobuf/repeated_field.rb#126
    def define_array_wrapper_with_result_method(method_name); end
  end
end

# propagates changes made by user of enumerator back to the original repeated field.
# This only applies in cases where the calling function which created the enumerator,
# such as #sort!, modifies itself rather than a new array, such as #sort
class Google::Protobuf::RepeatedField::ProxyingEnumerator < ::Struct
  # source://google-protobuf//lib/google/protobuf/repeated_field.rb#171
  def each(*args, &block); end
end

class Google::Protobuf::StringValue
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::Struct
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#162
  def [](key); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#168
  def []=(key, value); end

  def clone; end
  def dup; end
  def eql?(_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#188
  def has_key?(key); end

  def hash; end
  def inspect; end
  def method_missing(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#176
  def to_h; end

  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end

    # source://google-protobuf//lib/google/protobuf/well_known_types.rb#182
    def from_hash(hash); end
  end
end

class Google::Protobuf::Timestamp
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#85
  def from_time(time); end

  def hash; end
  def inspect; end
  def method_missing(*_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#94
  def to_f; end

  def to_h; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#90
  def to_i; end

  def to_s; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#80
  def to_time; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::TypeError < ::TypeError; end

class Google::Protobuf::UInt32Value
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::UInt64Value
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

class Google::Protobuf::UnexpectedStructType < ::Google::Protobuf::Error; end

class Google::Protobuf::Value
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#135
  def from_ruby(value); end

  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end

  # source://google-protobuf//lib/google/protobuf/well_known_types.rb#108
  def to_ruby(recursive = T.unsafe(nil)); end

  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end

module Google::Rpc; end

class Google::Rpc::Status
  include ::Google::Protobuf::MessageExts
  extend ::Google::Protobuf::MessageExts::ClassMethods

  def initialize(*_arg0); end

  def ==(_arg0); end
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def clone; end
  def dup; end
  def eql?(_arg0); end
  def hash; end
  def inspect; end
  def method_missing(*_arg0); end
  def to_h; end
  def to_s; end

  private

  def respond_to_missing?(*_arg0); end

  class << self
    def decode(_arg0); end
    def decode_json(*_arg0); end
    def descriptor; end
    def encode(_arg0); end
    def encode_json(*_arg0); end
  end
end
