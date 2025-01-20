# frozen_string_literal: true
# typed: true

module VersionSorter
  extend T::Sig

  sig { params(versions: T::Array[String]).returns(T::Array[String]) }
  def self.sort(versions); end

  sig { params(versions: T::Array[String]).returns(T::Array[String]) }
  def self.rsort(versions); end

  sig { params(versions: T::Array[String]).returns(T::Array[String]) }
  def self.sort!(versions); end

  sig { params(versions: T::Array[String]).returns(T::Array[String]) }
  def self.rsort!(versions); end

  sig { params(version_a: String, version_b: String).returns(Integer) }
  def self.compare(version_a, version_b); end
end
