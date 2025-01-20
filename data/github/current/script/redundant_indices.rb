# frozen_string_literal: true

# A simple script to take a *-structure.sql file and check for redundant indices.
# A non-unique index is considered redundant here if there is another index on the same table that
# starts with all the same columns in the same order.
# If an index is identified here as redundant, it may be safe to delete that index.
# If the redundant index is used in hints, those hints would need to be removed or modified
# before deleting the index.

if ARGV.length == 0
  puts "USAGE: ruby redundant_indices.rb schema-file.sql"
  exit
end

file = ARGV[0]
unique = []
indices = []
table = ""
indsfound = []

# parse the schema file, line by line
File.open(file, "r").each_line do |line|
  data = line.split(/[\s\(\),]/)
  data.delete_if(&:empty?)

  if data.first == "CREATE"
    # new table definition
    table = data[2]
    indices = []
    unique = []
    indsfound = []
  end

  if data.first == "UNIQUE"
    # unique index definition
    indexname = data[2]
    indexcols = data[3..-1]
    unique << { "name" => indexname, "cols" => indexcols }
  end

  if data.first == "KEY"
    # non-unique index definition
    indexname = data[1]
    indexcols = data[2..-1]

    indices.each do |ind|
      # check each prior non-unique index to see if it subsumes this one (or vice-versa)
      existing = ind["name"]
      if ind["cols"].length <= indexcols.length
        if ind["cols"] == indexcols[0..ind["cols"].length - 1]
          alreadyfound = indsfound.any? { |index| index["name"] == ind["name"] }
          unless alreadyfound
            puts "Redundant index " + ind["name"] + " on table " + table
            indsfound << { "name" => ind["name"] }
          end
        end
      end
      if ind["cols"].length > indexcols.length
        if indexcols == ind["cols"][0..indexcols.length - 1]
          alreadyfound = indsfound.any? { |index| index["name"] == indexname }
          unless alreadyfound
            puts "Redundant index " + indexname + " on table " + table
            indsfound << { "name" => indexname }
          end
        end
      end
    end

    unique.each do |uniq|
      # check each unique index to see if it subsumes this one
      existing = uniq["name"]
      if uniq["cols"].length >= indexcols.length
        if indexcols == uniq["cols"][0..indexcols.length - 1]
          alreadyfound = indsfound.any? { |index| index["name"] == indexname }
          unless alreadyfound
            puts "Redundant index " + indexname + " on table " + table
            indsfound << { "name" => indexname }
          end
        end
      end
    end
    indices << { "name" => indexname, "cols" => indexcols }
  end
end
