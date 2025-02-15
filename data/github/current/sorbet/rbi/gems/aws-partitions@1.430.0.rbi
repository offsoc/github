# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `aws-partitions` gem.
# Please instead update this file by running `bin/tapioca gem aws-partitions`.

# A {Partition} is a group of AWS {Region} and {Service} objects. You
# can use a partition to determine what services are available in a region,
# or what regions a service is available in.
#
# ## Partitions
#
# **AWS accounts are scoped to a single partition**. You can get a partition
# by name. Valid partition names include:
#
# * `"aws"` - Public AWS partition
# * `"aws-cn"` - AWS China
# * `"aws-us-gov"` - AWS GovCloud
#
# To get a partition by name:
#
#     aws = Aws::Partitions.partition('aws')
#
# You can also enumerate all partitions:
#
#     Aws::Partitions.each do |partition|
#       puts partition.name
#     end
#
# ## Regions
#
# A {Partition} is divided up into one or more regions. For example, the
# "aws" partition contains, "us-east-1", "us-west-1", etc. You can get
# a region by name. Calling {Partition#region} will return an instance
# of {Region}.
#
#     region = Aws::Partitions.partition('aws').region('us-west-2')
#     region.name
#     #=> "us-west-2"
#
# You can also enumerate all regions within a partition:
#
#     Aws::Partitions.partition('aws').regions.each do |region|
#       puts region.name
#     end
#
# Each {Region} object has a name, description and a list of services
# available to that region:
#
#     us_west_2 = Aws::Partitions.partition('aws').region('us-west-2')
#
#     us_west_2.name #=> "us-west-2"
#     us_west_2.description #=> "US West (Oregon)"
#     us_west_2.partition_name "aws"
#     us_west_2.services #=> #<Set: {"APIGateway", "AutoScaling", ... }
#
# To know if a service is available within a region, you can call `#include?`
# on the set of service names:
#
#     region.services.include?('DynamoDB') #=> true/false
#
# The service name should be the service's module name as used by
# the AWS SDK for Ruby. To find the complete list of supported
# service names, see {Partition#services}.
#
# Its also possible to enumerate every service for every region in
# every partition.
#
#     Aws::Partitions.partitions.each do |partition|
#       partition.regions.each do |region|
#         region.services.each do |service_name|
#           puts "#{partition.name} -> #{region.name} -> #{service_name}"
#         end
#       end
#     end
#
# ## Services
#
# A {Partition} has a list of services available. You can get a
# single {Service} by name:
#
#     Aws::Partitions.partition('aws').service('DynamoDB')
#
# You can also enumerate all services in a partition:
#
#     Aws::Partitions.partition('aws').services.each do |service|
#       puts service.name
#     end
#
# Each {Service} object has a name, and information about regions
# that service is available in.
#
#     service.name #=> "DynamoDB"
#     service.partition_name #=> "aws"
#     service.regions #=> #<Set: {"us-east-1", "us-west-1", ... }
#
# Some services have multiple regions, and others have a single partition
# wide region. For example, {Aws::IAM} has a single region in the "aws"
# partition. The {Service#regionalized?} method indicates when this is
# the case.
#
#     iam = Aws::Partitions.partition('aws').service('IAM')
#
#     iam.regionalized? #=> false
#     service.partition_region #=> "aws-global"
#
# Its also possible to enumerate every region for every service in
# every partition.
#
#     Aws::Partitions.partitions.each do |partition|
#       partition.services.each do |service|
#         service.regions.each do |region_name|
#           puts "#{partition.name} -> #{region_name} -> #{service.name}"
#         end
#       end
#     end
#
# ## Service Names
#
# {Service} names are those used by the the AWS SDK for Ruby. They
# correspond to the service's module.
module Aws::Partitions
  extend ::Prelude::Enumerator
  extend ::Enumerable

  class << self
    # @api private For internal use only.
    # @param new_partitions [Hash]
    #
    # source://aws-partitions//lib/aws-partitions.rb#191
    def add(new_partitions); end

    # @api private For internal use only.
    #
    # source://aws-partitions//lib/aws-partitions.rb#199
    def clear; end

    # @api private
    # @return [PartitionList]
    #
    # source://aws-partitions//lib/aws-partitions.rb#206
    def default_partition_list; end

    # @api private
    # @return [Hash]
    #
    # source://aws-partitions//lib/aws-partitions.rb#212
    def defaults; end

    # @return [Enumerable<Partition>]
    #
    # source://aws-partitions//lib/aws-partitions.rb#136
    def each(&block); end

    # Return the partition with the given name. A partition describes
    # the services and regions available in that partition.
    #
    #     aws = Aws::Partitions.partition('aws')
    #
    #     puts "Regions available in the aws partition:\n"
    #     aws.regions.each do |region|
    #       puts region.name
    #     end
    #
    #     puts "Services available in the aws partition:\n"
    #     aws.services.each do |services|
    #       puts services.name
    #     end
    #
    # @param name [String] The name of the partition to return.
    #   Valid names include "aws", "aws-cn", and "aws-us-gov".
    # @raise [ArgumentError] Raises an `ArgumentError` if a partition is
    #   not found with the given name. The error message contains a list
    #   of valid partition names.
    # @return [Partition]
    #
    # source://aws-partitions//lib/aws-partitions.rb#163
    def partition(name); end

    # Returns an array with every partitions. A partition describes
    # the services and regions available in that partition.
    #
    #     Aws::Partitions.partitions.each do |partition|
    #
    #       puts "Regions available in #{partition.name}:\n"
    #       partition.regions.each do |region|
    #         puts region.name
    #       end
    #
    #       puts "Services available in #{partition.name}:\n"
    #       partition.services.each do |service|
    #         puts service.name
    #       end
    #     end
    #
    # @return [Enumerable<Partition>] Returns an enumerable of all
    #   known partitions.
    #
    # source://aws-partitions//lib/aws-partitions.rb#185
    def partitions; end

    # @api private For internal use only.
    # @return [Hash<String,String>] Returns a map of service module names
    #   to their id as used in the endpoints.json document.
    #
    # source://aws-partitions//lib/aws-partitions.rb#223
    def service_ids; end
  end
end

# @api private
class Aws::Partitions::EndpointProvider
  # Intentionally marked private. The format of the endpoint rules
  # is an implementation detail.
  #
  # @api private
  # @return [EndpointProvider] a new instance of EndpointProvider
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#31
  def initialize(rules); end

  # @api private Use the static class methods instead.
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#58
  def dns_suffix_for(region); end

  # @api private Use the static class methods instead.
  # @param region [String] The region for the client.
  # @param service [String] The endpoint prefix for the service, e.g.
  #   "monitoring" for cloudwatch.
  # @param sts_regional_endpoints [String] [STS only] Whether to use
  #   `legacy` (global endpoint for legacy regions) or `regional` mode for
  #   using regional endpoint for supported regions except 'aws-global'
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#42
  def resolve(region, service, sts_regional_endpoints); end

  # @api private Use the static class methods instead.
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#47
  def signing_region(region, service); end

  private

  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#115
  def default_partition; end

  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#64
  def endpoint_for(region, service, sts_regional_endpoints); end

  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#94
  def get_partition(region); end

  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#100
  def partition_containing_region(region); end

  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#106
  def partition_matching_region(region); end

  class << self
    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#129
    def dns_suffix_for(region); end

    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#121
    def resolve(region, service, sts_regional_endpoints = T.unsafe(nil)); end

    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#125
    def signing_region(region, service); end

    private

    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#135
    def default_provider; end
  end
end

# When sts_regional_endpoint is set to `legacy`, the endpoint
# pattern stays global for the following regions:
#
# @api private
#
# source://aws-partitions//lib/aws-partitions/endpoint_provider.rb#9
Aws::Partitions::EndpointProvider::STS_LEGACY_REGIONS = T.let(T.unsafe(nil), Array)

class Aws::Partitions::Partition
  # @api private
  # @option options
  # @option options
  # @option options
  # @param options [Hash] a customizable set of options
  # @return [Partition] a new instance of Partition
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#10
  def initialize(options = T.unsafe(nil)); end

  # @return [String] The partition name, e.g. "aws", "aws-cn", "aws-us-gov".
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#17
  def name; end

  # @param region_name [String] The name of the region, e.g. "us-east-1".
  # @raise [ArgumentError] Raises `ArgumentError` for unknown region name.
  # @return [Region]
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#22
  def region(region_name); end

  # @param region_name [String] The name of the region, e.g. "us-east-1".
  # @return [Boolean] true if the region is in the partition.
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#39
  def region?(region_name); end

  # @return [Array<Region>]
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#33
  def regions; end

  # @param service_name [String] The service module name.
  # @raise [ArgumentError] Raises `ArgumentError` for unknown service name.
  # @return [Service]
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#46
  def service(service_name); end

  # @param service_name [String] The service module name.
  # @return [Boolean] true if the service is in the partition.
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#63
  def service?(service_name); end

  # @return [Array<Service>]
  #
  # source://aws-partitions//lib/aws-partitions/partition.rb#57
  def services; end

  class << self
    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/partition.rb#69
    def build(partition); end

    private

    # @param partition [Hash]
    # @return [Hash<String,Region>]
    #
    # source://aws-partitions//lib/aws-partitions/partition.rb#81
    def build_regions(partition); end

    # @param partition [Hash]
    # @return [Hash<String,Service>]
    #
    # source://aws-partitions//lib/aws-partitions/partition.rb#94
    def build_services(partition); end
  end
end

class Aws::Partitions::PartitionList
  include ::Prelude::Enumerator
  include ::Enumerable

  # @return [PartitionList] a new instance of PartitionList
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#9
  def initialize; end

  # @api private
  # @param partition [Partition]
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#37
  def add_partition(partition); end

  # Removed all partitions.
  #
  # @api private
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#47
  def clear; end

  # @return [Enumerator<Partition>]
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#14
  def each(&block); end

  # @param partition_name [String]
  # @return [Partition]
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#20
  def partition(partition_name); end

  # @return [Array<Partition>]
  #
  # source://aws-partitions//lib/aws-partitions/partition_list.rb#31
  def partitions; end

  class << self
    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/partition_list.rb#54
    def build(partitions); end
  end
end

class Aws::Partitions::Region
  # @api private
  # @option options
  # @option options
  # @option options
  # @option options
  # @param options [Hash] a customizable set of options
  # @return [Region] a new instance of Region
  #
  # source://aws-partitions//lib/aws-partitions/region.rb#14
  def initialize(options = T.unsafe(nil)); end

  # @return [String] A short description of this region.
  #
  # source://aws-partitions//lib/aws-partitions/region.rb#25
  def description; end

  # @return [String] The name of this region, e.g. "us-east-1".
  #
  # source://aws-partitions//lib/aws-partitions/region.rb#22
  def name; end

  # @return [String] The partition this region exists in, e.g. "aws",
  #   "aws-cn", "aws-us-gov".
  #
  # source://aws-partitions//lib/aws-partitions/region.rb#29
  def partition_name; end

  # @return [Set<String>] The list of services available in this region.
  #   Service names are the module names as used by the AWS SDK
  #   for Ruby.
  #
  # source://aws-partitions//lib/aws-partitions/region.rb#34
  def services; end

  class << self
    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/region.rb#39
    def build(region_name, region, partition); end

    private

    # source://aws-partitions//lib/aws-partitions/region.rb#50
    def region_services(region_name, partition); end

    # @return [Boolean]
    #
    # source://aws-partitions//lib/aws-partitions/region.rb#61
    def service_in_region?(svc, region_name); end
  end
end

class Aws::Partitions::Service
  # @api private
  # @option options
  # @option options
  # @option options
  # @option options
  # @option options
  # @param options [Hash] a customizable set of options
  # @return [Service] a new instance of Service
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#15
  def initialize(options = T.unsafe(nil)); end

  # @return [String] The name of this service. The name is the module
  #   name as used by the AWS SDK for Ruby.
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#25
  def name; end

  # @return [String] The partition name, e.g "aws", "aws-cn", "aws-us-gov".
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#28
  def partition_name; end

  # @return [String, nil] The global patition endpoint for this service.
  #   May be `nil`.
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#36
  def partition_region; end

  # Returns `false` if the service operates with a single global
  # endpoint for the current partition, returns `true` if the service
  # is available in multiple regions.
  #
  # Some services have both a partition endpoint and regional endpoints.
  #
  # @return [Boolean]
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#45
  def regionalized?; end

  # @return [Set<String>] The regions this service is available in.
  #   Regions are scoped to the partition.
  #
  # source://aws-partitions//lib/aws-partitions/service.rb#32
  def regions; end

  class << self
    # @api private
    #
    # source://aws-partitions//lib/aws-partitions/service.rb#52
    def build(service_name, service, partition); end

    private

    # source://aws-partitions//lib/aws-partitions/service.rb#70
    def partition_region(service); end

    # source://aws-partitions//lib/aws-partitions/service.rb#64
    def regions(service, partition); end
  end
end
