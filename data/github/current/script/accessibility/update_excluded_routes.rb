# typed: strict
#!/usr/bin/env safe-ruby
# frozen_string_literal: true

# Check if the branch already exists
branch_name = "exclude-routes-from-axe-coverage"
check_branch = `git rev-parse --quiet --verify #{branch_name}`

if check_branch.length > 0
  puts "Branch #{branch_name} already exists, exiting..."

  # This will mean that the workflow fails if the branch already exists
  # Because this is after we send stuff to Data Dog, that's OK it will just remind us to delete the branch
  exit(1)
end

ROUTES_FILE = "/tmp/github-routes-for-axe-coverage-artifacts/final_routes_list.json"
EXCLUDED_ROUTES_FILE = "script/accessibility/exclude_from_axe_coverage.json"
PROGRAMATICALLY_CONSIDERED_ROUTES_FILE = "/tmp/github-routes-for-axe-coverage-artifacts/programatically_considered_routes.json"

# Loop through the routes in EXCLUDED_ROUTES_FILE and make sure they are in the PROGRAMATICALLY_EXCLUDED_ROUTES_FILE
excluded_routes = JSON.parse(File.read(EXCLUDED_ROUTES_FILE))
new_excluded_routes = []
programatically_considered_routes = File.read(PROGRAMATICALLY_CONSIDERED_ROUTES_FILE)
update_needed = T.let(false, T::Boolean)

excluded_routes.each do |route|
  if !programatically_considered_routes.include?("\"path\": \"#{route["path"]}\"")
    update_needed = true
  else
    new_excluded_routes << route
  end
end

# If updates are needed, overwrite EXCLUDED_ROUTES_FILE with the new list of excluded routes
if update_needed
  base_branch = `git rev-parse --abbrev-ref HEAD`.strip
  remote = "origin"
  puts "Base branch for pull requests: #{base_branch}"

  puts "Switching to branch #{branch_name} off of #{base_branch}..."
  `git checkout -b #{branch_name}`
  unless $?.success?
    puts "Could not create new branch #{branch_name}, exiting..."
    exit(1)
  end

  File.open(EXCLUDED_ROUTES_FILE, "w") do |file|
    JSON.dump(new_excluded_routes, file)
  end

  puts "Staging file changes..."
  `git add #{EXCLUDED_ROUTES_FILE}`
  unless $?.success?
    puts "Staging service file changes on branch #{branch_name} failed, exiting."
    exit(1)
  end

  puts "Committing file changes..."
  `git commit -m "Update excluded routes for axe coverage file"`
  unless $?.success?
    puts "Committing file changes on branch #{branch_name} failed, exiting."
    exit(1)
  end

  puts "Publishing branch for file changes..."
  `git push #{remote} #{branch_name}`
  unless $?.success?
    puts "Pushing branch #{branch_name} to remote #{remote} failed, exiting."
    exit(1)
  end

  puts "Creating pull request and assigning it to accessibility team..."
  pr_title = "Update excluded routes for axe coverage file"
  pr_body = "This updates #{EXCLUDED_ROUTES_FILE}. This pull request " \
    "was created automatically from the script script/accessibility/update_excluded_routes.rb; see #267210. " \
    "If you have any questions or concerns, please contact the accessibility team. " \
    "Please delete this branch once the pull request is merged."
  `curl -X POST https://api.github.com/repos/github/github/pulls \
  -H "Authorization: token $BP_GITHUB_TOKEN" \
  -d '{"title": "#{pr_title}", "body": "#{pr_body}", "head": "#{branch_name}", "base": "#{base_branch}", "draft": true, "assignees": ["github/accessibility-reviewers"]}'`

  pass_ci_run = true
  if !$?.success?
    puts "Could not create pull request for branch #{branch_name}, skipping..."
    pass_ci_run = false
  end

  # We only really need to do this if we're running locally but there's no harm in doing it here
  puts "Returning to starting branch..."
  `git checkout #{base_branch}`
  unless $?.success?
    puts "Could not return to starting branch #{base_branch}, exiting."
    exit(1)
  end

  puts "Deleting branch #{branch_name}..."
  `git branch -D #{branch_name}`
  puts "Could not delete branch #{branch_name}." unless $?.success?

  exit(1) unless pass_ci_run
end
