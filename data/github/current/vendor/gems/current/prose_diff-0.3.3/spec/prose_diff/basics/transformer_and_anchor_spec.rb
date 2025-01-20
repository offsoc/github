require 'spec_helper'

describe ProseDiff::Transformer do

    before do
      @HTML = %Q{<p><strong><a href="/github/github/blob/master/docs/process.md">strong</a></strong></p>}
      @nodeset = ProseDiff::Node.HTML @HTML
    end

    it "shouldn't be altered by after_all" do
      transformed = ProseDiff::Transformer.transform_document(:after_all, @nodeset)
      expect( transformed.to_html ).to eq(%Q{<div class="expandable unchanged">#{normalize(@HTML)}</div>})
    end

end