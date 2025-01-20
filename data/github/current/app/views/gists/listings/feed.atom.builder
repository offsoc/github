# frozen_string_literal: true
atom_feed(:root_url => GitHub.blog_url, :schema_date => 2008, "xmlns:media" => "http://search.yahoo.com/mrss/") do |feed|
  feed.title title
  feed.updated(gists.first.updated_at) if gists.present?

  gists.each do |gist|
    feed.entry gist, :url => user_gist_url(gist.owner, gist),
      :id => "tag:#{request.host_with_port},2008:Gist/#{gist.nwo}" do |entry|

      entry.title gist.description.blank? ? gist.title : gist.description
      entry.tag! "media:thumbnail", :url => avatar_url_for(gist.owner)

      entry.author do |author|
        author.name(gist.owner.profile_name || gist.owner.display_login)
        author.uri user_url(gist.owner)
      end

      entry.content render(:partial => "gists/listings/files_for_feed", :formats => [:html], :locals => { :gist => gist }),
        :type => "html"
    end
  end
end
