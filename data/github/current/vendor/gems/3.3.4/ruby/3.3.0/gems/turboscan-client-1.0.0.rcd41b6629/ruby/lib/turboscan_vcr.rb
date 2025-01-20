# frozen_string_literal: true
require "vcr"
require "active_support"
require "active_support/core_ext"

module TurboscanVCR
  VCR_DIR = File.join(__dir__, "../spec/fixtures/vcr_cassettes")

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
      "turboscan.gem/" + path
    end
  end

  def self.turboscan_matcher(r1, r2, print_on_mismatch: false)
    return false unless ::VCR.request_matchers[:method].matches?(r1, r2)
    return false unless ::VCR.request_matchers[:uri].matches?(r1, r2)

    req1 = JSON.parse(r1.body)
    req2 = JSON.parse(r2.body)

    params_to_clear = ["repositoryId", "resolverId", "deleterId", "globalActorId", "actorLogin", "globalRepositoryId" , "actionsInstallationId", "ownerId", "enabledByActorGrid", "enabledByActorLogin"]

    params_to_clear.each do |param|
      if !req1[param].nil? && !req2[param].nil?
        req1[param] = 0
        req2[param] = 0
      end
    end

    if print_on_mismatch and req1 != req2
      puts "R1: #{r1.body}\n R2: #{r2.body}"
    end
    req1 == req2
  end

  def self.turboscan_match_repo_id(r1, r2)
    req1 = JSON.parse(r1.body)
    req2 = JSON.parse(r2.body)

    req1["repositoryId"] == req2["repositoryId"]
  end

  ::VCR.cassette_persisters[:turboscan] = TurboscanVCR::Persister
  ::VCR.request_matchers.register(:turbomatch) do |r1, r2|
    TurboscanVCR::turboscan_matcher(r1, r2)
  end
  ::VCR.request_matchers.register(:turbomatch_debug) do |r1, r2|
    TurboscanVCR::turboscan_matcher(r1, r2, print_on_mismatch: true)
  end
  ::VCR.request_matchers.register(:match_on_repo_id) do |r1, r2|
    TurboscanVCR::turboscan_match_repo_id(r1, r2)
  end
end

module Turbocassette

  def self.use(name, match_on_repo_id: false, debug: false, &block)
    unless block
      raise ArgumentError, "`Turbocassette.use` requires a block. "
    end
    matchers = debug ? [:turbomatch_debug] : [:turbomatch]
    matchers << :match_on_repo_id if match_on_repo_id

    VCR.use_cassette(name, persist_with: :turboscan, match_requests_on: matchers) do
      yield
    end
  end
end
