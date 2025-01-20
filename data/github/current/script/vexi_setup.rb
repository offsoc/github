# typed: strict
# frozen_string_literal: true

require "vexi/adapter"
require "vexi/adapters/file_adapter"
require "sorbet-runtime"

module VexiSetup
  class Adapter
    extend T::Sig

    FEATURE_FLAG_PATH = "tmp/vexi/feature-flags"
    SEGMENT_PATH = "tmp/vexi/segments"

    sig { returns(Vexi::Adapters::FileAdapter) }
    def self.create
      Vexi::Adapters::FileAdapter.new(FEATURE_FLAG_PATH, SEGMENT_PATH)
    end

    sig { returns(T::Boolean) }
    def self.enabled?
      ENV.fetch("ENABLE_VEXI", "true") == "true"
    end
  end
end
