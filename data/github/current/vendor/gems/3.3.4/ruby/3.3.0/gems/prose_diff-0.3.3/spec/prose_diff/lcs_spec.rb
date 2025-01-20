require 'spec_helper'

describe ProseDiff::LCS do

  it 'should find the length of the lcs of numbers in an array' do
    expect(
      ProseDiff::LCS.length([1, 2, 3, 4, 5, 6], [0, 2, 3, 1, 4, 6])
    ).to eq( 4 )
  end

  describe 'contiguous changes' do

    it 'should get a swap right' do
      before_text, after_text = 'Greeitngs', 'Greetings'
      result = ProseDiff::LCS.smallest_contiguous_change(before_text, after_text)
      expect( result ).to eq( %w{Gree it ti ngs} )
    end

    it 'should get a similar truncation right' do
      before_text, after_text = 'Greeetings', 'Greetings'
      result = ProseDiff::LCS.smallest_contiguous_change(before_text, after_text)
      expect( result ).to eq( ['Gree', 'e', '', 'tings'] )
    end

  end

  describe "pairing" do

    it 'should pair up the numbers' do
      expect(
        ProseDiff::LCS.pair([1, 2, 3, 4, 5, 6], [0, 2, 3, 1, 4, 6])
      ).to eq( [[2, 2], [3, 3], [4, 4], [6, 6]] )
    end

    it 'shoould pair up with fuzzy matching' do
      expect(
        ProseDiff::LCS.pair([1, 2, 3, 4, 5, 6], [0, 2, 3, 1, 4, 7], lambda { |x, y| (x-y).abs < 2 })
      ).to eq( [[1, 0], [2, 2], [3, 3], [5, 4], [6, 7]] )
    end

  end

  describe "diffing" do

    it 'should handle the null diff' do
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3], [1, 2, 3], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, 2], [3, 3]] )
    end

    it 'should handle a prefix' do
      expect(
        ProseDiff::LCS.fold_diff(:==, [0, 1, 2, 3], [1, 2, 3], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[0, nil], [1, 1], [2, 2], [3, 3]] )
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3], [0, 1, 2, 3], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[nil, 0], [1, 1], [2, 2], [3, 3]] )
    end

    it 'should handle a suffix' do
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3, 4], [1, 2, 3], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, 2], [3, 3], [4, nil]] )
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3], [1, 2, 3, 4], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, 2], [3, 3], [nil, 4]] )
    end

    it 'should handle an infix' do
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3, 4], [1, 2, 4], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, 2], [3, nil], [4, 4]] )
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 4], [1, 2, 3, 4], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, 2], [nil, 3], [4, 4]] )
    end

    it 'should ignore a move' do
      expect(
        ProseDiff::LCS.fold_diff(:==, [1, 2, 3, 4, 5], [1, 3, 4, 2, 5], []) do |acc, left, right|
          acc << [left, right]
        end
      ).to eq( [[1, 1], [2, nil], [3, 3], [4, 4], [nil, 2], [5, 5]] )
    end

  end

end
