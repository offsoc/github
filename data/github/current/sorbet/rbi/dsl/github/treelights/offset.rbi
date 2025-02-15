# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::Treelights::Offset`.
# Please instead update this file by running `bin/tapioca dsl Github::Treelights::Offset`.

class Github::Treelights::Offset
  sig { params(utf16: T.nilable(Integer), utf8: T.nilable(Integer)).void }
  def initialize(utf16: nil, utf8: nil); end

  sig { void }
  def clear_utf16; end

  sig { void }
  def clear_utf8; end

  sig { returns(Integer) }
  def utf16; end

  sig { params(value: Integer).void }
  def utf16=(value); end

  sig { returns(Integer) }
  def utf8; end

  sig { params(value: Integer).void }
  def utf8=(value); end
end
