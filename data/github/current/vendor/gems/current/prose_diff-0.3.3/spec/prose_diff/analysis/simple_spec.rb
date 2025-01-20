require 'spec_helper'

describe ProseDiff::Diff do

  describe 'a simple equal case' do

    before do
      @afters = ProseDiff::Diff.new('<body><p>Hello ProseDiff::Diff</p></body>', '<body><p>Hello ProseDiff::Diff</p></body>').node_set
    end

    it 'should have one element' do
      @afters.length.should eq(1)
    end

    it 'should have a p element' do
      expect( @afters.first.name ).to eq('p')
    end

    it "should report sameness" do
      ProseDiff::Node.analysis(@afters.first).should eq('unchanged')
    end

  end

  describe 'a deletion' do

    before do
      @afters = ProseDiff::Diff.new('<body><p>Hello</p><p>there,</p><p>ProseDiff::Diff</p></body>', '<body><p>Hello</p><p>ProseDiff::Diff</p></body>').node_set
    end

    it "should report sameness for the first element" do
      ProseDiff::Node.analysis(@afters.first).should eq('unchanged')
    end

    it "should have the element before and after" do
      expect(@afters[1]).not_to be_nil
    end

    it "should mark the element as removed" do
      expect(ProseDiff::Node.analysis @afters[1]).to eq('removed')
    end

    it "should report sameness for the remaining element" do
      ProseDiff::Node.analysis(@afters.last).should eq('unchanged')
    end

  end

  describe 'an insertion' do

    before do
      @afters = ProseDiff::Diff.new('<body><p>Hello</p><p>ProseDiff::Diff</p></body>', '<body><p>Hello</p><p>there,</p><p>ProseDiff::Diff</p></body>').node_set
    end

    it "should report sameness for the first element" do
      ProseDiff::Node.analysis(@afters.first).should eq('unchanged')
    end

    it "should mark the element as added" do
      ProseDiff::Node.analysis(@afters[1]).should eq('added')
    end

    it "should report sameness for the remaining element" do
      ProseDiff::Node.analysis(@afters.last).should eq('unchanged')
    end

  end

end
