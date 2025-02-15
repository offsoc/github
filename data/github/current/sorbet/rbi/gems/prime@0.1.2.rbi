# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `prime` gem.
# Please instead update this file by running `bin/tapioca gem prime`.

# source://prime//lib/prime.rb#18
class Integer < ::Numeric
  include ::ActiveSupport::NumericWithFormat
  include ::MessagePack::CoreExt
  include ::JSON::Ext::Generator::GeneratorMethods::Integer

  # Returns true if +self+ is a prime number, else returns false.
  # Not recommended for very big integers (> 10**23).
  #
  # @return [Boolean]
  #
  # source://prime//lib/prime.rb#35
  def prime?; end

  # Returns the factorization of +self+.
  #
  # See Prime#prime_division for more details.
  #
  # source://prime//lib/prime.rb#29
  def prime_division(generator = T.unsafe(nil)); end

  private

  # source://prime//lib/prime.rb#69
  def miller_rabin_bases; end

  # source://prime//lib/prime.rb#96
  def miller_rabin_test(bases); end

  class << self
    # Iterates the given block over all prime numbers.
    #
    # See +Prime+#each for more details.
    #
    # source://prime//lib/prime.rb#122
    def each_prime(ubound, &block); end

    # Re-composes a prime factorization and returns the product.
    #
    # See Prime#int_from_prime_division for more details.
    #
    # source://prime//lib/prime.rb#22
    def from_prime_division(pd); end
  end
end

# source://prime//lib/prime.rb#52
Integer::MILLER_RABIN_BASES = T.let(T.unsafe(nil), Array)

# The set of all prime numbers.
#
# == Example
#
#   Prime.each(100) do |prime|
#     p prime  #=> 2, 3, 5, 7, 11, ...., 97
#   end
#
# Prime is Enumerable:
#
#   Prime.first 5 # => [2, 3, 5, 7, 11]
#
# == Retrieving the instance
#
# For convenience, each instance method of +Prime+.instance can be accessed
# as a class method of +Prime+.
#
# e.g.
#   Prime.instance.prime?(2)  #=> true
#   Prime.prime?(2)           #=> true
#
# == Generators
#
# A "generator" provides an implementation of enumerating pseudo-prime
# numbers and it remembers the position of enumeration and upper bound.
# Furthermore, it is an external iterator of prime enumeration which is
# compatible with an Enumerator.
#
# +Prime+::+PseudoPrimeGenerator+ is the base class for generators.
# There are few implementations of generator.
#
# [+Prime+::+EratosthenesGenerator+]
#   Uses Eratosthenes' sieve.
# [+Prime+::+TrialDivisionGenerator+]
#   Uses the trial division method.
# [+Prime+::+Generator23+]
#   Generates all positive integers which are not divisible by either 2 or 3.
#   This sequence is very bad as a pseudo-prime sequence. But this
#   is faster and uses much less memory than the other generators. So,
#   it is suitable for factorizing an integer which is not large but
#   has many prime factors. e.g. for Prime#prime? .
#
# source://prime//lib/prime.rb#170
class Prime
  include ::Prelude::Enumerator
  include ::Enumerable
  include ::Singleton
  extend ::Singleton::SingletonClassMethods
  extend ::Prelude::Enumerator
  extend ::Enumerable

  # Iterates the given block over all prime numbers.
  #
  # == Parameters
  #
  # +ubound+::
  #   Optional. An arbitrary positive number.
  #   The upper bound of enumeration. The method enumerates
  #   prime numbers infinitely if +ubound+ is nil.
  # +generator+::
  #   Optional. An implementation of pseudo-prime generator.
  #
  # == Return value
  #
  # An evaluated value of the given block at the last time.
  # Or an enumerator which is compatible to an +Enumerator+
  # if no block given.
  #
  # == Description
  #
  # Calls +block+ once for each prime number, passing the prime as
  # a parameter.
  #
  # +ubound+::
  #   Upper bound of prime numbers. The iterator stops after it
  #   yields all prime numbers p <= +ubound+.
  #
  # source://prime//lib/prime.rb#212
  def each(ubound = T.unsafe(nil), generator = T.unsafe(nil), &block); end

  # Returns true if +obj+ is an Integer and is prime.  Also returns
  # true if +obj+ is a Module that is an ancestor of +Prime+.
  # Otherwise returns false.
  #
  # @return [Boolean]
  #
  # source://prime//lib/prime.rb#220
  def include?(obj); end

  # Re-composes a prime factorization and returns the product.
  #
  # For the decomposition:
  #
  #   [[p_1, e_1], [p_2, e_2], ..., [p_n, e_n]],
  #
  # it returns:
  #
  #   p_1**e_1 * p_2**e_2 * ... * p_n**e_n.
  #
  # == Parameters
  # +pd+:: Array of pairs of integers.
  #        Each pair consists of a prime number -- a prime factor --
  #        and a natural number -- its exponent (multiplicity).
  #
  # == Example
  #   Prime.int_from_prime_division([[3, 2], [5, 1]])  #=> 45
  #   3**2 * 5                                         #=> 45
  #
  # source://prime//lib/prime.rb#268
  def int_from_prime_division(pd); end

  # Returns true if +value+ is a prime number, else returns false.
  # Integer#prime? is much more performant.
  #
  # == Parameters
  #
  # +value+:: an arbitrary integer to be checked.
  # +generator+:: optional. A pseudo-prime generator.
  #
  # @raise [ArgumentError]
  # @return [Boolean]
  #
  # source://prime//lib/prime.rb#238
  def prime?(value, generator = T.unsafe(nil)); end

  # Returns the factorization of +value+.
  #
  # For an arbitrary integer:
  #
  #   p_1**e_1 * p_2**e_2 * ... * p_n**e_n,
  #
  # prime_division returns an array of pairs of integers:
  #
  #   [[p_1, e_1], [p_2, e_2], ..., [p_n, e_n]].
  #
  # Each pair consists of a prime number -- a prime factor --
  # and a natural number -- its exponent (multiplicity).
  #
  # == Parameters
  # +value+:: An arbitrary integer.
  # +generator+:: Optional. A pseudo-prime generator.
  #               +generator+.succ must return the next
  #               pseudo-prime number in ascending order.
  #               It must generate all prime numbers,
  #               but may also generate non-prime numbers, too.
  #
  # === Exceptions
  # +ZeroDivisionError+:: when +value+ is zero.
  #
  # == Example
  #
  #   Prime.prime_division(45)  #=> [[3, 2], [5, 1]]
  #   3**2 * 5                  #=> 45
  #
  # @raise [ZeroDivisionError]
  #
  # source://prime//lib/prime.rb#303
  def prime_division(value, generator = T.unsafe(nil)); end

  class << self
    # source://prime//lib/prime.rb#181
    def method_added(method); end
  end
end

# An implementation of +PseudoPrimeGenerator+.
#
# Uses +EratosthenesSieve+.
#
# source://prime//lib/prime.rb#410
class Prime::EratosthenesGenerator < ::Prime::PseudoPrimeGenerator
  # @return [EratosthenesGenerator] a new instance of EratosthenesGenerator
  #
  # source://prime//lib/prime.rb#411
  def initialize; end

  # source://prime//lib/prime.rb#416
  def next; end

  # source://prime//lib/prime.rb#420
  def rewind; end

  # source://prime//lib/prime.rb#416
  def succ; end
end

# Internal use. An implementation of Eratosthenes' sieve
#
# source://prime//lib/prime.rb#517
class Prime::EratosthenesSieve
  include ::Singleton
  extend ::Singleton::SingletonClassMethods

  # @return [EratosthenesSieve] a new instance of EratosthenesSieve
  #
  # source://prime//lib/prime.rb#520
  def initialize; end

  # source://prime//lib/prime.rb#526
  def get_nth_prime(n); end

  private

  # source://prime//lib/prime.rb#532
  def compute_primes; end
end

# Generates all integers which are greater than 2 and
# are not divisible by either 2 or 3.
#
# This is a pseudo-prime generator, suitable on
# checking primality of an integer by brute force
# method.
#
# source://prime//lib/prime.rb#449
class Prime::Generator23 < ::Prime::PseudoPrimeGenerator
  # @return [Generator23] a new instance of Generator23
  #
  # source://prime//lib/prime.rb#450
  def initialize; end

  # source://prime//lib/prime.rb#456
  def next; end

  # source://prime//lib/prime.rb#470
  def rewind; end

  # source://prime//lib/prime.rb#456
  def succ; end
end

# An abstract class for enumerating pseudo-prime numbers.
#
# Concrete subclasses should override succ, next, rewind.
#
# source://prime//lib/prime.rb#332
class Prime::PseudoPrimeGenerator
  include ::Prelude::Enumerator
  include ::Enumerable

  # @return [PseudoPrimeGenerator] a new instance of PseudoPrimeGenerator
  #
  # source://prime//lib/prime.rb#335
  def initialize(ubound = T.unsafe(nil)); end

  # Iterates the given block for each prime number.
  #
  # source://prime//lib/prime.rb#367
  def each; end

  # alias of +succ+.
  #
  # @raise [NotImplementedError]
  #
  # source://prime//lib/prime.rb#355
  def next; end

  # Rewinds the internal position for enumeration.
  #
  # See +Enumerator+#rewind.
  #
  # @raise [NotImplementedError]
  #
  # source://prime//lib/prime.rb#362
  def rewind; end

  # source://prime//lib/prime.rb#402
  def size; end

  # returns the next pseudo-prime number, and move the internal
  # position forward.
  #
  # +PseudoPrimeGenerator+#succ raises +NotImplementedError+.
  #
  # @raise [NotImplementedError]
  #
  # source://prime//lib/prime.rb#350
  def succ; end

  # source://prime//lib/prime.rb#342
  def upper_bound; end

  # source://prime//lib/prime.rb#339
  def upper_bound=(ubound); end

  # see +Enumerator+#with_index.
  #
  # source://prime//lib/prime.rb#384
  def with_index(offset = T.unsafe(nil), &block); end

  # see +Enumerator+#with_object.
  #
  # source://prime//lib/prime.rb#395
  def with_object(obj); end
end

# Internal use. An implementation of prime table by trial division method.
#
# source://prime//lib/prime.rb#476
class Prime::TrialDivision
  include ::Singleton
  extend ::Singleton::SingletonClassMethods

  # @return [TrialDivision] a new instance of TrialDivision
  #
  # source://prime//lib/prime.rb#479
  def initialize; end

  # Returns the +index+th prime number.
  #
  # +index+ is a 0-based index.
  #
  # source://prime//lib/prime.rb#495
  def [](index); end
end

# An implementation of +PseudoPrimeGenerator+ which uses
# a prime table generated by trial division.
#
# source://prime//lib/prime.rb#428
class Prime::TrialDivisionGenerator < ::Prime::PseudoPrimeGenerator
  # @return [TrialDivisionGenerator] a new instance of TrialDivisionGenerator
  #
  # source://prime//lib/prime.rb#429
  def initialize; end

  # source://prime//lib/prime.rb#434
  def next; end

  # source://prime//lib/prime.rb#437
  def rewind; end

  # source://prime//lib/prime.rb#434
  def succ; end
end

# source://prime//lib/prime.rb#172
Prime::VERSION = T.let(T.unsafe(nil), String)
