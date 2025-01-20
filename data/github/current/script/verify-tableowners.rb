#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "github/serviceowners/tableowners_chrome"
require_relative "../config/environment"

tableowners_chrome = GitHub::Serviceowners::TableownersChrome.new

puts "Verifying table ownership data..."

err = tableowners_chrome.verify_all
if !err.blank?
  puts err
  exit 1
else
  exit 0
end
