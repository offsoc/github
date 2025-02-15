# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `zstd-ruby` gem.
# Please instead update this file by running `bin/tapioca gem zstd-ruby`.

# source://zstd-ruby//lib/zstd-ruby/version.rb#1
module Zstd
  private

  def compress(*_arg0); end
  def decompress(_arg0); end
  def zstd_version; end

  class << self
    def compress(*_arg0); end
    def decompress(_arg0); end
    def zstd_version; end
  end
end

# source://zstd-ruby//lib/zstd-ruby/version.rb#2
Zstd::VERSION = T.let(T.unsafe(nil), String)
