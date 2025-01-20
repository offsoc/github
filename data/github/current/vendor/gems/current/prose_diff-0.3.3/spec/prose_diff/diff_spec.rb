require 'spec_helper'

describe ProseDiff do

  it "should accept documents" do
    bef, aft = Nokogiri.HTML('<p>Helo</p>'), Nokogiri.HTML('<p>Hello</p>')
    expect { ProseDiff::Diff.new(bef, aft) }.to_not raise_exception
  end

  it "should not blow up when multiple comments are encountered" do
    bef, aft = Nokogiri::HTML.parse("<p>My Content</p>"), Nokogiri::HTML.parse("<p>My Content</p>\n<!-- comment --><p>more</p><!-- here is a comment -->\n")
    expect { ProseDiff::Diff.new(bef, aft) }.to_not raise_exception
  end
end
