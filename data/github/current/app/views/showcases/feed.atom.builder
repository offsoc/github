# frozen_string_literal: true
atom_feed(:root_url => "https://" + GitHub.host_name + "/showcases", :schema_date => 2008, "xmlns:media" => "http://search.yahoo.com/mrss/") do |feed|
  if GitHub.enterprise?
    feed.title("GitHub Enterprise Showcases")
  else
    feed.title("GitHub Showcases")
  end
  if !@collections.blank?
    feed.updated(@collections.first.updated_at)

    @collections.each do |collection|
      feed.entry(collection) do |entry|
        entry.title(collection.name)
        entry.category(collection.languages.join ", ")
        entry.url showcase_collection_url(collection)
        entry.content(collection.body_html, :type => "html")
      end
    end
  end
end
