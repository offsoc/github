require 'spec_helper'

describe ProseDiff::Diff do

  describe 'children' do

    describe 'of a paragraph with a replace' do

      before do
        afters = ProseDiff::Diff.new( '<body><p>Hello Git Hub People</p></body>', '<body><p>Hello Smart Hub People</p></body>' ).node_set
        n1, n2 = ProseDiff::Node.HTML('<body><p>Hello Git Hub People</p></body>'), ProseDiff::Node.HTML('<body><p>Hello Smart Hub People</p></body>')
        @after_nodes = afters.first.children
      end

      # second item is a remove and add span, that's hwo we attach information to it
      it 'should parse as text, span, span, test' do
        expect(@after_nodes.map(&:name)).to eq(%w{text span span text})
      end

      it 'should report an object and sameness for the first item' do
        expect(@after_nodes[0].nil?).to be_falsey
        expect( ProseDiff::Node.was_unchanged?(@after_nodes[0]) ).to be_truthy
      end

      # second is a space

      it 'should report removedness or addedness second' do
        expect( !!@after_nodes[1] ).to be_truthy
        expect( ProseDiff::Node.was_unchanged?(@after_nodes[1]) ).to be_falsey
        expect( ProseDiff::Node.was_added?(@after_nodes[1]) || ProseDiff::Node.was_removed?(@after_nodes[1]) ).to be_truthy
      end

      it 'should report the reverse of second and sameness third' do
        expect( @after_nodes.length ).to eq(4)
        if ProseDiff::Node.was_added?(@after_nodes[1])
          expect( ProseDiff::Node.was_removed?(@after_nodes[2]) ).to be_truthy
        else
          expect( ProseDiff::Node.was_added?(@after_nodes[2]) ).to be_truthy
        end

      end
    end
  end
end
