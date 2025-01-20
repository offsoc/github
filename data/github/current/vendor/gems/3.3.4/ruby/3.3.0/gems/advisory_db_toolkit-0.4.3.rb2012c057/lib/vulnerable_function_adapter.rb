# frozen_string_literal: true

module AdvisoryDBToolkit
  # This module is meant to centralize how we deal with different versions of the affected functions JSON blob.
  # As of the time of this writing, we anticipate needing to load two different "shapes", affected functions as
  # an array of friendly names and the more structured object with an object hash.
  # This currently supports both JSON and raw objects.
  module VulnerableFunctionAdapter
    # Parse currently accepts the old version string, new version string, and literal arrays.
    # Parse largely will just try to duck type what is passed to see if it understands it, if it does, it returns a FunctionList.
    def self.parse(affected_functions)
      return FunctionList.from_v1([]) if !AdvisoryDBToolkit::Utility.present?(affected_functions)
      if affected_functions.is_a?(String)
        affected_functions = JSON.parse(affected_functions)
      end

      throw "Invalid vulnerable functions content provided" unless affected_functions.is_a?(Array) || affected_functions.is_a?(Hash)

      if affected_functions.is_a? Hash
        return FunctionList.from_v1(affected_functions.to_a.sort_by { |hash_tuple| hash_tuple[0] }.map { |hash_tuple| hash_tuple[1] })
      end

      return FunctionList.from_v1([]) if affected_functions.count == 0
      return FunctionList.from_v0(affected_functions) if affected_functions[0].is_a?(String)
      return FunctionList.from_v1(affected_functions) if affected_functions[0].is_a?(Hash)
      return FunctionList.new(1, affected_functions, affected_functions) if affected_functions[0].is_a?(AdvisoryDBToolkit::VulnerableFunctionAdapter::FunctionSegment)

      throw "Invalid vulnerable functions content provided"
    end

    def self.ensure_latest_format(affected_functions)
      function_list = parse(affected_functions)
      function_list.functions
    end

    # fqn - string. fully qualified name, aleph concept
    # fqn_version - FQNs have an "old" style that we originally got, 0, and a new style that is preferred, 1
    # search_keys - Array of string search keys, provided by aleph and used for identification purposes
    FunctionSegment = Struct.new(:fqn, :fqn_version, :search_keys) do
      def to_json(options = nil)
        to_h.to_json(options)
      end

      # Produce a function segment from an unknown object source. Should be either a FS, a json hash or a ruby symbol hash.
      def self.from_unknown(f)
        if f.is_a?(FunctionSegment)
          return FunctionSegment.new(f.fqn, f.fqn_version, f.search_keys)
        end
        if f.is_a?(Hash) && f.key?("fqn")
          return FunctionSegment.new(f["fqn"], f["fqn_version"], f["search_keys"])
        end
        if f.is_a?(Hash) && f.key?(:fqn)
          return FunctionSegment.new(f[:fqn], f[:fqn_version], f[:search_keys])
        end
        
        raise "Invalid object type submitted"
      end
    end

    class FunctionList
      # Not meant to be called publicly
      # FQN is fully qualified name, an aleph concept
      # version is the version of the overall functions format:
      # v0: An array of fqnV0 strings
      # v1: An array of hashes, { fqn: string, search_keys: [string] }
      def initialize(version, original_content, functions)
        @version = version
        @original_content = original_content
        @functions = functions
      end

      def self.from_v0(fqn_array)
        FunctionList.new(:v0, fqn_array, fqn_array.map { |f| FunctionSegment.new(f, 0, nil) })
      end

      def self.from_v1(complex_array)
        FunctionList.new(:v1, complex_array, complex_array.map { |f| FunctionSegment.from_unknown(f) })
      end

      def version
        @version
      end

      # Get things in the V0 string format, which is:
      # "[\"fqn\", \"fqn\"]"
      def v0_s
        JSON.dump(v0_a)
      end

      # Get things in the V0 array format, which is:
      # ["fqn", "fqn1"]
      # Make sure that empty v1 format entries are dropped, in v0 expectation.
      def v0_a
        AdvisoryDBToolkit::Utility.compact_blank(@functions.filter { |f| f.fqn_version == 0 }.map { |f| f.fqn })
      end

      # Get things in the V1 array format (used for transport outside of ADB), which is:
      # "[{\"fqn\": \"string\", \"fqn_version\": int, \"search_keys\": [\"string\"]}]"
      def v1_a
        @functions.map {|f| JSON.parse f.to_json}
      end

      # Get things in the V1 hash format (used for storage in advisory payload), which is:
      # "{0 => {\"fqn\": \"string\", \"fqn_version\": int, \"search_keys\": [\"string\"]}}"
      def v1_adb_hash
        hash = @functions.map.with_index { |f, index| [index, f.to_h.transform_keys! { |key| key.to_s }]}.to_h
      end

      # Get things in the V1 format, which is:
      # fqn is the fully qualified name of the path
      # fqn_version is the version of the fqn string:
      #  0: The display name implementation that was originally in use.
      #  1: A yet to be implemented string representation that will be converted to eventually.
      # [{fqn: string, fqn_version: int, searchKeys: [string]},
      #  {fqn: string, fqn_version: int, searchKeys: [string]}]
      def v1
        @functions
      end

      def ==(other)
        return false unless AdvisoryDBToolkit::Utility.present?(other)
        return false unless other.is_a?(FunctionList)

        @functions.each_with_index do |val, index|
          return false if val != other.functions[index]
        end

        true
      end

      def eql?(other)
        self == other
      end

      def equal?(other)
        self == other
      end

      def ===(other)
        self == other
      end

      attr_reader :functions
    end
  end
end
