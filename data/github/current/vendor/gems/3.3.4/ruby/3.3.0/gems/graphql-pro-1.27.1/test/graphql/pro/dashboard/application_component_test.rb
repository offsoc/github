# frozen_string_literal: true
require_relative "../dashboard_test"

class GraphQLProDashboardApplicationComponentTest < GraphQLProDashboardTest
  def test_it_redirects_to_active_component
    get "/"
    assert_equal 302, last_response.status
    redirect_url = last_response.headers["Location"]
    # It redirects to operation_store:
    assert redirect_url.end_with?("/clients")
  end

  def test_it_renders_not_found
    get "/garbage"
    assert_equal 404, last_response.status
    assert_body_includes "404 Not Found"
  end

  def test_it_renders_static_files
    get "/static/bundle.js"
    assert_equal 200, last_response.status
    assert last_response.headers.key?("Content-Type")
    assert last_response.headers.key?("Content-Length")
    assert last_response.headers.key?("Cache-Control")
    get "/static/application.css"
    assert_equal 200, last_response.status
    get "/static/favicon.ico"
    assert_equal 200, last_response.status
  end

  def test_it_uses_path_prefix
    @prefix_path = "/some/prefix"
    # Assets served with prefix
    get "/some/prefix/static/bundle.js"
    assert_equal 200, last_response.status

    # Make sure the entries are there:
    @store.reindex

    # Various links are served with prefix:
    assert_page_includes_link("/some/prefix/index/Card.name", "Card", "/some/prefix/index/Card")
    assert_page_includes_link("/some/prefix/index?q=Query.card&page=1&per_page=1", "next &raquo;", "/some/prefix/index?q=Query.card&page=2&per_page=1")
    assert_page_includes_link("/some/prefix/index?q=Query.card&page=2&per_page=1", "&laquo; prev", "/some/prefix/index?q=Query.card&page=1&per_page=1")
    assert_page_includes_link("/some/prefix/clients", "x-client-1", "/some/prefix/clients/x-client-1/operations")
    assert_page_includes_link("/some/prefix/clients/x-client-1/operations", "Manage x-client-1", "/some/prefix/clients/x-client-1/manage")
    assert_page_includes_link("/some/prefix/clients/x-client-1/manage", "Cancel", "/some/prefix/clients/x-client-1/operations")
    assert_body_includes("action=\"/some/prefix/clients/x-client-1/save\"")
  end

  def test_it_uses_link_helpers
    # The goal here is to find all internal links in the UI
    # and make sure they're rendered using link helpers
    # so that we can be sure that they'll have the proper prefixed
    # when mounted onto Rails. This test will probably need tweaking
    # as things are added to the UI!
    reject_if_includes = [
      # Don't check assets
      ".png", ".ttf", ".ico", ".js",
      # Don't check base files
      "/component.rb", "/context.rb",
    ]
    files = Dir.glob("lib/graphql/pro/dashboard/**/*")
      .reject { |f| reject_if_includes.any? { |i| f[i] } }
      .select { |f| File.file?(f) }

    files.each do |ui_path|
      file_text = File.read(ui_path)
      file_text.each_line.map(&:chomp).each_with_index do |line, idx|
        all_links = line.scan(/href|action|link_to|redirect:/).count
        found_links = 0
        found_links += assert_html_links_are_prefixed(line)
        found_links += assert_link_tos_are_ok(line)
        assert_equal all_links, found_links, "All links were found in #{ui_path}:#{idx}\n\n#{line}\n"
      end
    end
  end

  def test_context_delegates_to_locals
    context = GraphQL::Pro::Dashboard::Context.new(locals: {a: 1, b: 2})
    assert_equal 1, context.a
    assert_equal 2, context.b
    assert context.respond_to?(:a)
    refute context.respond_to?(:c)
    err = assert_raises NoMethodError do
      context.c
    end
    assert_includes err.message, "undefined method `c'"
  end

  def assert_html_links_are_prefixed(line)
    literal_hrefs = line.scan(/href/).count
    matches = line.match(/(?:(?:href|action)="(.+?)"[\s\>])+/)
    found_hrefs = matches ? matches.size - 1 : 0
    if literal_hrefs > 0 && matches
      # Make sure the regexp found them
      if found_hrefs != literal_hrefs
        assert false, "Found #{literal_hrefs} links, but regexp only matched #{found_hrefs}"
      end
      # Make sure each one is using a prefixed path
      (1..literal_hrefs).each do |idx|
        match = matches[idx]
        case match
        when "#"
          assert true, "#{line} is a link to JS"
        when /<%= [a-z_]+_path(\(.+?\))? %>/, /<%= static_path\(.*\) %>/
          assert true, "#{line} uses a link helper"
        when "<%= request.path %>?<%= to_query_string(prev_params) %>", "<%= request.path %>?<%= to_query_string(next_params) %>", "<%= component.doc_url %>"
          assert true, "#{line} is a pagination link"
        else
          assert false, "#{line} is not recognized as a valid path"
        end
      end
    end

    found_hrefs
  end

  def assert_link_tos_are_ok(line)
    case line
    when /def link_to/
      assert true, "#{line} is the method definition"
      1
    when /link_to\([^,]*, ([a-z_]+)(\(.*\))?(, [a-z_]+:.+)?\)/
      assert true, "#{line} uses a helper method (#{$1})"
      1
    else
      0
    end
  end
end
