#!/usr/bin/env ruby
# frozen_string_literal: true
#
# Usage Example:
#  ./convert.rb spec/fixtures/vcr_cassettes/analyses.yml
# will create
#  spec/fixtures/vcr_cassettes/analyses_json.yml
#
require "turboscan"
require "vcr"
require "irb/completion"

vcr_full_name = ARGV[0].split("/")[-1]
lib_dir = ARGV[0].gsub(vcr_full_name, "")
vcr_name = vcr_full_name.gsub(".yml", "")

VCR.configure do |c|
  c.cassette_library_dir = lib_dir
end

v = VCR.insert_cassette(vcr_name)
VCR.http_interactions.interactions.each do |x|
  unless x.request.headers["Content-Type"] == ["application/json"]
    endpoint = x.request.uri.split("/")[-1]
    puts "#{vcr_name}.#{endpoint}"
    manifest = Turboscan::Proto::ResultsService::rpcs[endpoint]

    raise "Endpoint #{endpoint} is no longer available" if manifest.nil?

    in_type = manifest[:input_class]
    json_in = in_type.encode_json(in_type.decode(x.request.body))

    puts "Request"
    puts json_in
    puts "-----------"
    x.request.body = json_in
    x.request.headers["Content-Type"] = "application/json"

    if x.response.headers["Content-Type"] != ["application/json"]
      out_type = manifest[:output_class]
      json_out = out_type.encode_json(out_type.decode(x.response.body))
      puts "Response"
      puts json_out
      # Provide feedback for visual validation
      # Replace content in VCR

      x.response.body = json_out
      x.response.headers["Content-Type"] = "application/json"
      x.response.headers["Content-Length"] = "#{json_out.size}"
    end
  end
end

# Persist as _json.yml
persister = VCR.cassette_persisters[:file_system]
serializer = VCR.cassette_serializers[:yaml]
persister["#{vcr_name}_json.yml"] = serializer.serialize(v.serializable_hash)

VCR.eject_cassette
