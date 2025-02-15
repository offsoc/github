# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `ruby-xxHash` gem.
# Please instead update this file by running `bin/tapioca gem ruby-xxHash`.

# source://ruby-xxHash//lib/ruby-xxhash.rb#46
class Digest::XXHash < ::Digest::Class
  # @return [XXHash] a new instance of XXHash
  #
  # source://ruby-xxHash//lib/ruby-xxhash.rb#48
  def initialize(bitlen, seed = T.unsafe(nil)); end

  # source://ruby-xxHash//lib/ruby-xxhash.rb#64
  def digest(val = T.unsafe(nil)); end

  # source://ruby-xxHash//lib/ruby-xxhash.rb#72
  def digest!(val = T.unsafe(nil)); end

  # Returns the value of attribute digest_length.
  #
  # source://ruby-xxHash//lib/ruby-xxhash.rb#47
  def digest_length; end

  # source://ruby-xxHash//lib/ruby-xxhash.rb#78
  def reset; end

  # source://ruby-xxHash//lib/ruby-xxhash.rb#60
  def update(chunk); end
end

# source://ruby-xxHash//lib/ruby-xxhash.rb#84
class Digest::XXHash32 < ::Digest::XXHash
  # @return [XXHash32] a new instance of XXHash32
  #
  # source://ruby-xxHash//lib/ruby-xxhash.rb#85
  def initialize(seed = T.unsafe(nil)); end
end

# source://ruby-xxHash//lib/ruby-xxhash.rb#90
class Digest::XXHash64 < ::Digest::XXHash
  # @return [XXHash64] a new instance of XXHash64
  #
  # source://ruby-xxHash//lib/ruby-xxhash.rb#91
  def initialize(seed = T.unsafe(nil)); end
end

# source://ruby-xxHash//lib/ruby-xxhash/version.rb#1
module XXhash
  class << self
    # source://ruby-xxHash//lib/ruby-xxhash.rb#10
    def xxh32(input, seed = T.unsafe(nil)); end

    # source://ruby-xxHash//lib/ruby-xxhash.rb#16
    def xxh32_stream(io, seed = T.unsafe(nil), chunk = T.unsafe(nil)); end

    # source://ruby-xxHash//lib/ruby-xxhash.rb#26
    def xxh64(input, seed = T.unsafe(nil)); end

    # source://ruby-xxHash//lib/ruby-xxhash.rb#32
    def xxh64_stream(io, seed = T.unsafe(nil), chunk = T.unsafe(nil)); end
  end
end

# source://ruby-xxHash//lib/ruby-xxhash/version.rb#2
XXhash::VERSION = T.let(T.unsafe(nil), String)

# source://ruby-xxHash//lib/ruby-xxhash32.rb#4
module XXhash::XXhashInternal; end

# source://ruby-xxHash//lib/ruby-xxhash32.rb#5
class XXhash::XXhashInternal::XXhash32
  # @return [XXhash32] a new instance of XXhash32
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#15
  def initialize(seed); end

  # source://ruby-xxHash//lib/ruby-xxhash32.rb#72
  def digest(val = T.unsafe(nil)); end

  # source://ruby-xxHash//lib/ruby-xxhash32.rb#20
  def reset; end

  # source://ruby-xxHash//lib/ruby-xxhash32.rb#30
  def update(bytes); end

  private

  # source://ruby-xxHash//lib/ruby-xxhash32.rb#118
  def uint32(x); end

  # Returns the value of attribute v1.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v1; end

  # Sets the attribute v1
  #
  # @param value the value to set the attribute v1 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v1=(_arg0); end

  # Returns the value of attribute v2.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v2; end

  # Sets the attribute v2
  #
  # @param value the value to set the attribute v2 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v2=(_arg0); end

  # Returns the value of attribute v3.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v3; end

  # Sets the attribute v3
  #
  # @param value the value to set the attribute v3 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v3=(_arg0); end

  # Returns the value of attribute v4.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v4; end

  # Sets the attribute v4
  #
  # @param value the value to set the attribute v4 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash32.rb#116
  def v4=(_arg0); end
end

# source://ruby-xxHash//lib/ruby-xxhash64.rb#5
class XXhash::XXhashInternal::XXhash64
  # @return [XXhash64] a new instance of XXhash64
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#15
  def initialize(seed); end

  # source://ruby-xxHash//lib/ruby-xxhash64.rb#72
  def digest(val = T.unsafe(nil)); end

  # source://ruby-xxHash//lib/ruby-xxhash64.rb#20
  def reset; end

  # source://ruby-xxHash//lib/ruby-xxhash64.rb#30
  def update(bytes); end

  private

  # source://ruby-xxHash//lib/ruby-xxhash64.rb#142
  def uint64(x); end

  # Returns the value of attribute v1.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v1; end

  # Sets the attribute v1
  #
  # @param value the value to set the attribute v1 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v1=(_arg0); end

  # Returns the value of attribute v2.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v2; end

  # Sets the attribute v2
  #
  # @param value the value to set the attribute v2 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v2=(_arg0); end

  # Returns the value of attribute v3.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v3; end

  # Sets the attribute v3
  #
  # @param value the value to set the attribute v3 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v3=(_arg0); end

  # Returns the value of attribute v4.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v4; end

  # Sets the attribute v4
  #
  # @param value the value to set the attribute v4 to.
  #
  # source://ruby-xxHash//lib/ruby-xxhash64.rb#140
  def v4=(_arg0); end
end
