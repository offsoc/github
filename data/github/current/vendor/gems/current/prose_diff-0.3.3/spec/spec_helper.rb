# encoding: utf-8

require 'prose_diff'

def parse(html)
  Nokogiri::HTML(html).xpath('//body/*').first
end

def normalize(html, options = {})
  doc = Nokogiri::HTML(html).css('body')
  # remove all blank text nodes and strip the rest
  doc.xpath('//text()').each do |node|
    if node.content=~/\S/
      node.content = node.content.strip
    else
      node.remove
    end
  end
  doc.xpath('//*').each do |node|
    node.attributes.dup.tap do |h|
      h.keys.sort.each do |key|
        node.remove_attribute(key); node[key] = h[key]
      end
    end
  end
  # sort classes
  t = ProseDiff::Transformer::SortClasses.new(:enable => 'true')
  doc = t.transform_document(doc)
  doc.css('body').children.to_html.gsub(/\n/, '')
end

RSpec.configure do |config|
  # Runs a specific HTML example.
  # This is the only way guard-rspec can pass this in. From the command line
  # you can just run: `bundle exec rspec --tag example:filename.html spec`.

  config.filter_run_including :example => ENV['EXAMPLE'] if ENV['EXAMPLE']
end

Dir[File.expand_path("../support/**/*.rb", __FILE__)].each { |f| require f }
