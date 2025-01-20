# frozen_string_literal: true

require 'ffi'
require_relative "sarif/version"
require "json"
require "rbconfig"
require 'active_support/core_ext/hash/indifferent_access'

module Sarif
  class Response < FFI::AutoPointer
    def self.release(ptr)
      Sarif._free(ptr)
    end

    def to_s
      @str ||= self.read_string.force_encoding('UTF-8')
    end
  end

  extend FFI::Library

  ffi_lib File.join(File.dirname(__FILE__), 'sarif', "sarif.#{RbConfig::CONFIG["DLEXT"]}")

  class Error < StandardError; end

  class ParseError < Error; end
  class ValidateError < Error; end

  class ReadError < Error; end

  class DecodeError < ReadError; end
  class EmptyError < ReadError; end
  class LimitError < ReadError; end

  attach_function :_parse, :sarif_parse, [:pointer, :size_t, :bool, :int], Sarif::Response
  attach_function :_free, :sarif_free, [Sarif::Response], :void

  def self.parse(doc, validate, limit)
    buf = FFI::MemoryPointer.from_string(doc)

    code, doc = JSON.parse(Sarif._parse(buf, buf.size, validate, limit).to_s)

    return doc.map(&:with_indifferent_access) || [] if code == 0
    klass, msg = doc
    raise Sarif.const_get(klass), msg
  end
end
