# frozen_string_literal: true
atom_feed(:root_url => "https://github.com/repositories", :schema_date => 2008, "xmlns:media" => "http://search.yahoo.com/mrss/") do |feed|
  feed.title "Recently Added Repositories"
  repos = current_repositories
  feed.updated(repos.first ? repos.first.created_at : Time.now.utc)

  repos.first(20).each do |repo|
    feed.entry(repo, :url => "https://github.com" + repository_path(repo)) do |entry|
      entry.title   repo.name_with_display_owner
      entry.content repo.description

      # leave an empty author name if owner is nil.
      # otherwise the atom feed won't validate.
      entry.author do |author|
        author.name repo.owner.to_s
      end

      if owner = repo.owner
        entry.tag!("media:thumbnail", :url => avatar_url_for(owner))
      end
    end
  end
end
