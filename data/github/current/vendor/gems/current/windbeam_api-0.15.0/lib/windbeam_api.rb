# frozen_string_literal: true

# Adding the vendor directory to the load path
$: << File.join(File.expand_path(File.dirname(__FILE__)), "..", "vendor")

require "windbeam_api/version"
require "windbeam_api/client"
