#!/usr/bin/env ruby

STDIN.each do |line|
  old_rev, new_rev, ref_name = line.split
  if new_rev == "0" * 40
    puts "Not allowed to delete branches"
    exit 1
  end

  if new_rev == "1" * 40
    puts "Long running operation"
    sleep 10
    puts "Operation complete"
  end

  if new_rev == "2" * 40
    # SKULL AND CROSSBONES U+2620
    puts "\xE2\x98\xA0"
    exit 0
  end

  if new_rev == "3" * 40
    # this character is invalid in UTF-8
    puts "\xAD"
    exit 0
  end
end

puts "All good"
