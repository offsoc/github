#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "optparse"

category = ""
subcategory = ""
erblint = false

OptionParser.new do |opt|
  opt.on("--category CATEGORY") { |v| category = v }
  opt.on("--subcategory SUBCATEGORY") { |v| subcategory = v }
  opt.on("--erblint ERBLINT") { |v| erblint = v }
end.parse!

date = DateTime.now.strftime("%Y-%m-%d")

$stdin.each_line do |line|
  if erblint
    location, rule, _ = line.split(": ")
    relative_path, line, column = location.split(":")
  else
    location, _, rule, _ = line.split(": ")
    path, line, column = location.split(":")
    relative_path = path.sub("/workspaces/github/", "")

    if relative_path.include? "app/models"
      subcategory = relative_path.sub("packages/", "").split(/\//)[0]
    end
  end

  puts "#{date},#{category},#{subcategory},#{relative_path},#{line},#{rule}"
end
