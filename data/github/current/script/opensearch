#!/usr/bin/env ruby

#######  ######   #######  #     #   #####   #######     #     ######    #####   #     #         #     #  #     #  #
#     #  #     #  #        ##    #  #     #  #          # #    #     #  #     #  #     #          #   #   ##   ##  #
#     #  #     #  #        # #   #  #        #         #   #   #     #  #        #     #           # #    # # # #  #
#     #  ######   #####    #  #  #   #####   #####    #     #  ######   #        #######            #     #  #  #  #
#     #  #        #        #   # #        #  #        #######  #   #    #        #     #   ###     # #    #     #  #
#     #  #        #        #    ##  #     #  #        #     #  #    #   #     #  #     #   ###    #   #   #     #  #
#######  #        #######  #     #   #####   #######  #     #  #     #   #####   #     #   ###   #     #  #     #  #######

require "English"
require_relative "../config/basic"
require "fileutils"

def opensearch
  url = GitHub.url

  xml = <<~"XML"
    <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                          xmlns:moz="http://www.mozilla.org/2006/browser/search/">
      <ShortName>#{GitHub.flavor}</ShortName>
      <Description>Search #{GitHub.flavor}</Description>
      <InputEncoding>UTF-8</InputEncoding>
      <Image width="16" height="16" type="image/x-icon">#{url}/favicon.ico</Image>
      <Url type="text/html" method="get" template="#{url}/search?q={searchTerms}&amp;ref=opensearch"/>
      <moz:SearchForm>#{url}/search</moz:SearchForm>
    </OpenSearchDescription>
  XML

  os = File.join(File.dirname(__FILE__), "..", "public", "opensearch.xml")
  File.open("#{os}+", "w+") { |f| f.puts xml.to_s }
  FileUtils.mv("#{os}+", os)

  gist_url = GitHub.gist_url

  gist_xml = <<~"XML"
    <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                          xmlns:moz="http://www.mozilla.org/2006/browser/search/">
      <ShortName>Gist</ShortName>
      <Description>Search Gist</Description>
      <InputEncoding>UTF-8</InputEncoding>
      <Image width="16" height="16" type="image/x-icon">#{gist_url}/favicon.ico</Image>
      <Url type="text/html" method="get" template="#{gist_url}/search?q={searchTerms}&amp;ref=opensearch"/>
      <moz:SearchForm>#{gist_url}/search</moz:SearchForm>
    </OpenSearchDescription>
  XML

  os = File.join(File.dirname(__FILE__), "..", "public", "opensearch-gist.xml")
  File.open("#{os}+", "w+") { |f| f.puts gist_xml.to_s }
  FileUtils.mv("#{os}+", os)
end

if $PROGRAM_NAME == __FILE__
  opensearch
end
