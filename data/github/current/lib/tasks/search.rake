# frozen_string_literal: true
namespace :search do
  desc "Delete all local ElasticSearch data and start over."
  task :reset do
    port = ENV.fetch "GH_ELASTICSEARCH_PORT", "9200"
    sh %{curl -XDELETE 'localhost:#{port}/_all?pretty'}
    sh %{RAILS_ENV=test script/elastomer bootstrap}
    sh %{RAILS_ENV=development script/elastomer bootstrap}
  end
end
