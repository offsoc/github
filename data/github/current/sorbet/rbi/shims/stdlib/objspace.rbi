# Added this while waiting for https://github.com/sorbet/sorbet/pull/7754 to get merged
#
# An
# [`ObjectSpace::WeakKeyMap`](https://docs.ruby-lang.org/en/3.3/ObjectSpace/WeakKeyMap.html)
# is a key-value map that holds weak references to its keys, so they can be garbage collected
# when there is no more references.
#
# Unlike ObjectSpace::WeakMap:
#  - references to values are strong, so they aren’t garbage collected while they are in the map;
#  - keys are compared by value (using Object#eql?), not by identity;
#  - only garbage-collectable objects can be used as keys.
#
#    map = ObjectSpace::WeakKeyMap.new
#    val = Time.new(2023, 12, 7)
#    key = "name"
#    map[key] = val
#
#    # Value is fetched by equality: the instance of string "name" is
#    # different here, but it is equal to the key
#    map["name"] #=> 2023-12-07 00:00:00 +0200
#
#    val = nil
#    GC.start
#    # There is no more references to `val`, yet the pair isn't
#    # garbage-collected.
#    map["name"] #=> 2023-12-07 00:00:00 +0200
#
#    key = nil
#    GC.start
#    # There is no more references to `key`, key and value are
#    # garbage-collected.
#
#    map["name"] #=> nil
#
# (Note that GC.start is used here only for demonstrational purposes and might not always lead to demonstrated results.)
#
# The collection is especially useful for implementing caches of lightweight value objects, so that only one copy of
# each value representation would be stored in memory, but the copies that aren’t used would be garbage-collected.
#
#   CACHE = ObjectSpace::WeakKeyMap
#
#   def make_value(**)
#     val = ValueObject.new(**)
#     if (existing = @cache.getkey(val))
#        # if the object with this value exists, we return it
#        existing
#     else
#        # otherwise, put it in the cache
#        @cache[val] = true
#        val
#     end
#  end
#
# This will result in make_value returning the same object for same set of attributes always, but the values that
# aren’t needed anymore woudn’t be sitting in the cache forever.
class ObjectSpace::WeakKeyMap < Object

  # Returns the value associated with the given key if found
  # If key is not found, returns nil
  def [](_); end

  # Associates the given value with the given key
  # The reference to key is weak, so when there is no other reference to key it may be garbage collected
  # If the given key exists, replaces its value with the given value; the ordering is not affected
  def []=(_,_); end

  # Removes all map entries; returns self.
  def clear; end

  # Deletes the entry for the given key and returns its associated value
  # If no block is given and key is found, deletes the entry and returns the associated value
  def delete(_); end

  # Returns the existing equal key if it exists, otherwise returns nil.
  # This might be useful for implementing caches, so that only one copy of some object would be used everywhere in the program
  def getkey(_); end

  # Returns a new String containing informations about the map
  def inspect; end

  # Returns true if key is a key in self, otherwise false.
  def key?(_); end
end
