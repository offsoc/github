if ARGV.length == 0 || ARGV.include?("--help")
  puts "\n"
  puts "Usage: /usr/local/share/enterprise/ghe-purge-orphaned-pushes [opt...]"
  puts "\n"
  puts "Options:"
  puts "  --dry-run  Use dry run mode, print what would be purged but don't purge"
  puts "  --write    Turn off dry run mode and purge all orphaned Pushes"
  puts "\n"
  exit 1
end

puts "Loading environment..."

require_relative "/github/config/environment"
require "optparse"
Failbot.disable # suppress failbot reporting of unhandled exceptions

write = false
OptionParser.new do |opts|
  opts.on("--write") do
    write = true
  end

  opts.on("--dry-run") do
    write = false
  end
end.parse!

def purge_push_batch(batch:, write:)
  return if batch.empty?

  push_ids, repo_ids = batch.pluck(:id, :repository_id).transpose

  if write
    puts "Purging Pushes with IDs: #{push_ids}" 
    puts "from Repositories: #{repo_ids.uniq}"
    begin
      batch.delete_all
    rescue StandardError => e
      puts "Purging failed for push IDs: #{push_ids} with error:"
      puts e
    end
  else
    puts "Would have purged Pushes with IDs: #{push_ids}"
    puts "from Repositories: #{repo_ids.uniq}"
  end
end

puts "Starting Purge Pushes"
puts "\n"

if !write
  puts "\n"
  puts "DRY RUN MODE, NO PUSHES WILL BE PURGED"
  puts "\n"
else
  puts "\n"
  puts "NOT IN DRY RUN MODE, PUSHES WILL BE PURGED"
  puts "\n"
end

Push.where("(repository_id NOT IN (SELECT DISTINCT id FROM repositories)) OR (repository_id IS NULL)").in_batches(of: 100) do |batch|
  purge_push_batch(batch: batch, write: write)
end

puts "Done."
