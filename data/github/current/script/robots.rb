#!/usr/bin/env ruby

######  ####### ######  ####### #######  #####      ####### #     # #######
#     # #     # #     # #     #    #    #     #        #     #   #     #
#     # #     # #     # #     #    #    #              #      # #      #
######  #     # ######  #     #    #     #####         #       #       #
#   #   #     # #     # #     #    #          # ###    #      # #      #
#    #  #     # #     # #     #    #    #     # ###    #     #   #     #
#     # ####### ######  #######    #     #####  ###    #    #     #    #

# This script generates public/robots.txt and public/api_robots.txt.

require "English"
require_relative "../config/basic"
require "github/robots"
require "erb"

# Enterprise instances are open for crawling bots
def enterprise?
  !!ENV["FI"]
end

def bots
  return %w( * ) if enterprise?

  GitHub::ROBOTS
end

def header
  """
# If you would like to crawl GitHub contact us via https://support.github.com?tags=dotcom-robots
# We also provide an extensive API: #{GitHub.developer_help_url}
  """.strip
end

def api_content
  <<~API
    #{header}

    User-agent: *
    Allow: /
    Disallow:
  API
end

def build_disallowed_repo_subfeatures
  [
    "/*/*/pulse",
    "/*/*/projects",
    "/*/*/forks",
    "/*/*/issues/new",
    "/*/*/issues/search",
    "/*/*/commits/",
    "/*/*/branches",
    "/*/*/contributors",
    "/*/*/tags",
    "/*/*/stargazers",
    "/*/*/watchers",
    "/*/*/network",
    "/*/*/graphs",
    "/*/*/compare"
  ].map { |path| "Disallow: #{path}" }.join("\n") + "\n"
end

def robots
  content = ERB.new(data, trim_mode: "%<>").result(binding)
  robots = File.join(File.dirname(__FILE__), "..", "public", "robots.txt")
  File.open(robots, "w+") { |f| f.puts content }

  api_robots = File.join(File.dirname(__FILE__), "..", "public", "api_robots.txt")
  File.open(api_robots, "w+") { |f| f.puts api_content }
end

def data
  <<~ERB
    <%= header %>

    User-agent: baidu
    crawl-delay: 1


    User-agent: *

    <%= build_disallowed_repo_subfeatures %>

    Disallow: /*/tree/
    Disallow: /gist/
    Disallow: /*/download
    Disallow: /*/revisions
    Disallow: /*/commits/*?author
    Disallow: /*/commits/*?path
    Disallow: /*/comments
    Disallow: /*/archive/
    Disallow: /*/blame/
    Disallow: /*/raw/
    Disallow: /*/cache/
    Disallow: /.git/
    Disallow: */.git/
    Disallow: /*.git$
    Disallow: /search/advanced
    Disallow: /search$
    Disallow: /*q=
    Disallow: /*.atom$

    Disallow: /ekansa/Open-Context-Data
    Disallow: /ekansa/opencontext-*
    Disallow: */tarball/
    Disallow: */zipball/

    Disallow: /*source=*
    Disallow: /*ref_cta=*
    Disallow: /*plan=*
    Disallow: /*return_to=*
    Disallow: /*ref_loc=*
    Disallow: /*setup_organization=*
    Disallow: /*source_repo=*
    Disallow: /*ref_page=*
    Disallow: /*source=*
    Disallow: /*referrer=*
    Disallow: /*report=*
    Disallow: /*author=*
    Disallow: /*since=*
    Disallow: /*until=*
    Disallow: /*commits?author=*
    Disallow: /*report-abuse?report=*
    Disallow: /*tab=*
    Allow: /*?tab=achievements&achievement=*

    Disallow: /account-login
    Disallow: /Explodingstuff/

    <% if enterprise? %>
    Disallow: /setup/*
    <% end %>
  ERB
end


if $PROGRAM_NAME == __FILE__
  robots
end
