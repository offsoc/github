# frozen_string_literal: true

xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0", "xmlns:atom": "http://www.w3.org/2005/Atom", "xmlns:dc": "http://purl.org/dc/elements/1.1/" do
  xml.channel do
    xml.title "The ReadME Project"
    xml.link URI.join(request.base_url, readme_index_path)
    xml.atom(:link, href: request.url, rel: "self", type: "application/rss+xml")
    xml.image do
      xml.title "The ReadME Project"
      xml.url image_path("modules/site/social-cards/readme-project.jpg")
      xml.link URI.join(request.base_url, readme_index_path)
    end
    xml.description "The ReadME Project amplifies the voices of the open source community: the maintainers, developers, and teams whose contributions move the world forward every day."

    page_data[:stories].each do |story|
      xml.item do
        xml.title story[:heading]
        xml.link URI.join(request.base_url, story[:url])
        xml.description story[:meta_description]

        xml.pubDate story[:publication_date_rfc2822]
        xml.guid URI.join(request.base_url, story[:url])
      end
    end
  end
end
