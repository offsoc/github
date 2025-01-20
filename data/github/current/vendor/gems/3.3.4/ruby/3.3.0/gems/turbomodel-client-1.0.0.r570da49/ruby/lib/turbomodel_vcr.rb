# frozen_string_literal: true
require "vcr"
require "active_support"
require "active_support/core_ext"

module TurbomodelVCR
  VCR_DIR = File.join(__dir__, "../cassettes")

  module Persister
    class Error < StandardError
    end
    extend self

    def []=(path, value)
      VCR.cassette_persisters[:file_system][path] = value
    end

    def [](path)
      local_cassette = VCR.cassette_persisters[:file_system][path]
      return local_cassette if local_cassette.present?
      abs_path = File.join(VCR_DIR, path)
      return nil unless File.exist?(abs_path)
      File.binread(abs_path)
    end

    def absolute_path_to_file(path)
      local_persister = VCR.cassette_persisters[:file_system]
      return local_persister.absolute_path_to_file(path) if local_persister[path].present?
      "turbomodel.gem/" + path
    end
  end

  ::VCR.cassette_persisters[:turbomodel] = TurbomodelVCR::Persister
end
