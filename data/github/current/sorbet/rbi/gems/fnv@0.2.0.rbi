# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `fnv` gem.
# Please instead update this file by running `bin/tapioca gem fnv`.

# source://fnv//lib/fnv.rb#1
class FNV
  # source://fnv//lib/fnv.rb#9
  def fnv1_32(data); end

  # source://fnv//lib/fnv.rb#20
  def fnv1_64(data); end

  # source://fnv//lib/fnv.rb#31
  def fnv1a_32(data); end

  # source://fnv//lib/fnv.rb#42
  def fnv1a_64(data); end
end

# source://fnv//lib/fnv.rb#2
FNV::INIT32 = T.let(T.unsafe(nil), Integer)

# source://fnv//lib/fnv.rb#3
FNV::INIT64 = T.let(T.unsafe(nil), Integer)

# source://fnv//lib/fnv.rb#6
FNV::MOD32 = T.let(T.unsafe(nil), Integer)

# source://fnv//lib/fnv.rb#7
FNV::MOD64 = T.let(T.unsafe(nil), Integer)

# source://fnv//lib/fnv.rb#4
FNV::PRIME32 = T.let(T.unsafe(nil), Integer)

# source://fnv//lib/fnv.rb#5
FNV::PRIME64 = T.let(T.unsafe(nil), Integer)
