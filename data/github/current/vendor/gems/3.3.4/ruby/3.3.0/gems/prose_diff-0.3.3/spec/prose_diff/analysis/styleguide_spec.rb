require 'spec_helper'

describe ProseDiff::Diff do

  describe 'timing the styleguide' do

    before do
      @before, @after = <<'BEFOREHTML', <<'AFTERHTML'
<article class="markdown-body entry-content" itemprop="mainContentOfPage"><h1>
<a name="ruby-styleguide" class="anchor" href="#ruby-styleguide"><span class="octicon octicon-link"></span></a>Ruby Styleguide</h1>

<p>If you're visiting from the internet, feel free to learn from our style. This is a guide we use for our own ruby apps internally at GitHub.  We encourage you to set up one that works for your own team.</p>

<p>Much of this was taken from <a href="https://github.com/bbatsov/ruby-style-guide">https://github.com/bbatsov/ruby-style-guide</a>. Please add to this guide if you find any particular patterns or styles that we've adopted internally. Submit a pull request to ask for feedback (if you're an employee).</p>

<h2>
<a name="coding-style" class="anchor" href="#coding-style"><span class="octicon octicon-link"></span></a>Coding Style</h2>

<ul>
<li><p>Use soft-tabs with a two space indent.</p></li>
<li><p>Keep lines fewer than 80 characters.</p></li>
<li><p>Never leave trailing whitespace.</p></li>
<li><p>End each file with a blank newline.</p></li>
<li>
<p>Use spaces around operators, after commas, colons and semicolons, around <code>{</code>
and before <code>}</code>.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">sum</span> <span class="o">=</span> <span class="mi">1</span> <span class="o">+</span> <span class="mi">2</span>
<span class="n">a</span><span class="p">,</span> <span class="n">b</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="mi">2</span>
<span class="mi">1</span> <span class="o">&gt;</span> <span class="mi">2</span> <span class="o">?</span> <span class="kp">true</span> <span class="p">:</span> <span class="kp">false</span><span class="p">;</span> <span class="nb">puts</span> <span class="s2">"Hi"</span>
<span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="n">e</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">e</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>No spaces after <code>(</code>, <code>[</code> or before <code>]</code>, <code>)</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="n">some</span><span class="p">(</span><span class="n">arg</span><span class="p">)</span><span class="o">.</span><span class="n">other</span>
<span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">length</span>
</pre></div>
</li>
<li>
<p>No spaces after <code>!</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="o">!</span><span class="n">array</span><span class="o">.</span><span class="n">include?</span><span class="p">(</span><span class="n">element</span><span class="p">)</span>
</pre></div>
</li>
<li>
<p>Indent <code>when</code> as deep as <code>case</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="k">case</span>
<span class="k">when</span> <span class="n">song</span><span class="o">.</span><span class="n">name</span> <span class="o">==</span> <span class="s2">"Misty"</span>
<span class="nb">puts</span> <span class="s2">"Not again!"</span>
<span class="k">when</span> <span class="n">song</span><span class="o">.</span><span class="n">duration</span> <span class="o">&gt;</span> <span class="mi">120</span>
<span class="nb">puts</span> <span class="s2">"Too long!"</span>
<span class="k">when</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span><span class="o">.</span><span class="n">hour</span> <span class="o">&gt;</span> <span class="mi">21</span>
<span class="nb">puts</span> <span class="s2">"It's too late"</span>
<span class="k">else</span>
<span class="n">song</span><span class="o">.</span><span class="n">play</span>
<span class="k">end</span>

<span class="n">kind</span> <span class="o">=</span> <span class="k">case</span> <span class="n">year</span>
<span class="k">when</span> <span class="mi">1850</span><span class="o">.</span><span class="n">.</span><span class="mi">1889</span> <span class="k">then</span> <span class="s2">"Blues"</span>
<span class="k">when</span> <span class="mi">1890</span><span class="o">.</span><span class="n">.</span><span class="mi">1909</span> <span class="k">then</span> <span class="s2">"Ragtime"</span>
<span class="k">when</span> <span class="mi">1910</span><span class="o">.</span><span class="n">.</span><span class="mi">1929</span> <span class="k">then</span> <span class="s2">"New Orleans Jazz"</span>
<span class="k">when</span> <span class="mi">1930</span><span class="o">.</span><span class="n">.</span><span class="mi">1939</span> <span class="k">then</span> <span class="s2">"Swing"</span>
<span class="k">when</span> <span class="mi">1940</span><span class="o">.</span><span class="n">.</span><span class="mi">1950</span> <span class="k">then</span> <span class="s2">"Bebop"</span>
<span class="k">else</span> <span class="s2">"Jazz"</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Use empty lines between <code>def</code>s and to break up a method into logical
paragraphs.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">def</span> <span class="nf">some_method</span>
<span class="n">data</span> <span class="o">=</span> <span class="kp">initialize</span><span class="p">(</span><span class="n">options</span><span class="p">)</span>

<span class="n">data</span><span class="o">.</span><span class="n">manipulate!</span>

<span class="n">data</span><span class="o">.</span><span class="n">result</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">some_method</span>
<span class="n">result</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="documentation" class="anchor" href="#documentation"><span class="octicon octicon-link"></span></a>Documentation</h2>

<p>Use <a href="http://tomdoc.org">TomDoc</a> to the best of your ability. It's pretty sweet:</p>

<div class="highlight highlight-ruby"><pre><span class="c1"># Public: Duplicate some text an arbitrary number of times.</span>
<span class="c1">#</span>
<span class="c1"># text  - The String to be duplicated.</span>
<span class="c1"># count - The Integer number of times to duplicate the text.</span>
<span class="c1">#</span>
<span class="c1"># Examples</span>
<span class="c1">#</span>
<span class="c1">#   multiplex("Tom", 4)</span>
<span class="c1">#   # =&gt; "TomTomTomTom"</span>
<span class="c1">#</span>
<span class="c1"># Returns the duplicated String.</span>
<span class="k">def</span> <span class="nf">multiplex</span><span class="p">(</span><span class="n">text</span><span class="p">,</span> <span class="n">count</span><span class="p">)</span>
<span class="n">text</span> <span class="o">*</span> <span class="n">count</span>
<span class="k">end</span>
</pre></div>

<h2>
<a name="syntax" class="anchor" href="#syntax"><span class="octicon octicon-link"></span></a>Syntax</h2>

<ul>
<li>
<p>Use <code>def</code> with parentheses when there are arguments. Omit the
parentheses when the method doesn't accept any arguments.</p>

<div class="highlight highlight-Ruby"><pre>   <span class="k">def</span> <span class="nf">some_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">some_method_with_arguments</span><span class="p">(</span><span class="n">arg1</span><span class="p">,</span> <span class="n">arg2</span><span class="p">)</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Never use <code>for</code>, unless you know exactly why. Most of the time iterators
should be used instead. <code>for</code> is implemented in terms of <code>each</code> (so
you're adding a level of indirection), but with a twist - <code>for</code>
doesn't introduce a new scope (unlike <code>each</code>) and variables defined
in its block will be visible outside it.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">arr</span> <span class="o">=</span> <span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">]</span>

<span class="c1"># bad</span>
<span class="k">for</span> <span class="n">elem</span> <span class="k">in</span> <span class="n">arr</span> <span class="k">do</span>
<span class="nb">puts</span> <span class="n">elem</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">arr</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="n">elem</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">elem</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>Never use <code>then</code> for multi-line <code>if/unless</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="n">some_condition</span> <span class="k">then</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid the ternary operator (<code>?:</code>) except in cases where all expressions are extremely
trivial. However, do use the ternary operator(<code>?:</code>) over <code>if/then/else/end</code> constructs
for single line conditionals.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="n">result</span> <span class="o">=</span> <span class="k">if</span> <span class="n">some_condition</span> <span class="k">then</span> <span class="n">something</span> <span class="k">else</span> <span class="n">something_else</span> <span class="k">end</span>

<span class="c1"># good</span>
<span class="n">result</span> <span class="o">=</span> <span class="n">some_condition</span> <span class="p">?</span> <span class="n">something</span> <span class="p">:</span> <span class="n">something_else</span>
</pre></div>
</li>
<li>
<p>Use one expression per branch in a ternary operator. This
also means that ternary operators must not be nested. Prefer
<code>if/else</code> constructs in these cases.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="n">some_condition</span> <span class="p">?</span> <span class="p">(</span><span class="n">nested_condition</span> <span class="p">?</span> <span class="n">nested_something</span> <span class="p">:</span> <span class="n">nested_something_else</span><span class="p">)</span> <span class="p">:</span> <span class="n">something_else</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="n">nested_condition</span> <span class="p">?</span> <span class="n">nested_something</span> <span class="p">:</span> <span class="n">nested_something_else</span>
<span class="k">else</span>
<span class="n">something_else</span>
<span class="k">end</span>
</pre></div>
</li>
<li><p>The <code>and</code> and <code>or</code> keywords are banned. It's just not worth it. Always use <code>&amp;&amp;</code> and <code>||</code> instead.</p></li>
<li><p>Avoid multi-line <code>?:</code> (the ternary operator), use <code>if/unless</code> instead.</p></li>
<li>
<p>Favor modifier <code>if/unless</code> usage when you have a single-line
body.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="n">do_something</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">do_something</span> <span class="k">if</span> <span class="n">some_condition</span>
</pre></div>
</li>
<li>
<p>Never use <code>unless</code> with <code>else</code>. Rewrite these with the positive case first.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">unless</span> <span class="n">success?</span>
<span class="nb">puts</span> <span class="s2">"failure"</span>
<span class="k">else</span>
<span class="nb">puts</span> <span class="s2">"success"</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">success?</span>
<span class="nb">puts</span> <span class="s2">"success"</span>
<span class="k">else</span>
<span class="nb">puts</span> <span class="s2">"failure"</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Don't use parentheses around the condition of an <code>if/unless/while</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="p">(</span><span class="n">x</span> <span class="o">&gt;</span> <span class="mi">10</span><span class="p">)</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">x</span> <span class="o">&gt;</span> <span class="mi">10</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Prefer <code>{...}</code> over <code>do...end</code> for single-line blocks.  Avoid using
<code>{...}</code> for multi-line blocks (multiline chaining is always
ugly). Always use <code>do...end</code> for "control flow" and "method
definitions" (e.g. in Rakefiles and certain DSLs).  Avoid <code>do...end</code>
when chaining.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">names</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Bozhidar"</span><span class="p">,</span> <span class="s2">"Steve"</span><span class="p">,</span> <span class="s2">"Sarah"</span><span class="o">]</span>

<span class="c1"># good</span>
<span class="n">names</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">puts</span> <span class="nb">name</span> <span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">names</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span>
<span class="nb">puts</span> <span class="nb">name</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">names</span><span class="o">.</span><span class="n">select</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">start_with?</span><span class="p">(</span><span class="s2">"S"</span><span class="p">)</span> <span class="p">}</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">names</span><span class="o">.</span><span class="n">select</span> <span class="k">do</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span>
<span class="nb">name</span><span class="o">.</span><span class="n">start_with?</span><span class="p">(</span><span class="s2">"S"</span><span class="p">)</span>
<span class="k">end</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>
</pre></div>

<p>Some will argue that multiline chaining would look OK with the use of {...}, but they should
ask themselves - is this code really readable and can't the block's contents be extracted into
nifty methods?</p>
</li>
<li>
<p>Avoid <code>return</code> where not required.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">some_arr</span><span class="p">)</span>
<span class="k">return</span> <span class="n">some_arr</span><span class="o">.</span><span class="n">size</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">some_arr</span><span class="p">)</span>
<span class="n">some_arr</span><span class="o">.</span><span class="n">size</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Use spaces around the <code>=</code> operator when assigning default values to method parameters:</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">arg1</span><span class="o">=</span><span class="ss">:default</span><span class="p">,</span> <span class="n">arg2</span><span class="o">=</span><span class="kp">nil</span><span class="p">,</span> <span class="n">arg3</span><span class="o">=[]</span><span class="p">)</span>
<span class="c1"># do something...</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">arg1</span> <span class="o">=</span> <span class="ss">:default</span><span class="p">,</span> <span class="n">arg2</span> <span class="o">=</span> <span class="kp">nil</span><span class="p">,</span> <span class="n">arg3</span> <span class="o">=</span> <span class="o">[]</span><span class="p">)</span>
<span class="c1"># do something...</span>
<span class="k">end</span>
</pre></div>

<p>While several Ruby books suggest the first style, the second is much more prominent
in practice (and arguably a bit more readable).</p>
</li>
<li>
<p>Using the return value of <code>=</code> (an assignment) is ok with parentheses.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="p">(</span><span class="n">v</span> <span class="o">=</span> <span class="n">array</span><span class="o">.</span><span class="n">grep</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">))</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">v</span> <span class="o">=</span> <span class="n">array</span><span class="o">.</span><span class="n">grep</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">)</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>

<span class="c1"># also good - has correct precedence.</span>
<span class="k">if</span> <span class="p">(</span><span class="n">v</span> <span class="o">=</span> <span class="n">next_value</span><span class="p">)</span> <span class="o">==</span> <span class="s2">"hello"</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>
</pre></div>
</li>
<li>
<p>Use <code>||=</code> freely to initialize variables.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># set name to Bozhidar, only if it's nil or false</span>
<span class="nb">name</span> <span class="o">||=</span> <span class="s2">"Bozhidar"</span>
</pre></div>
</li>
<li>
<p>Don't use <code>||=</code> to initialize boolean variables. (Consider what
would happen if the current value happened to be <code>false</code>.)</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad - would set enabled to true even if it was false</span>
<span class="n">enabled</span> <span class="o">||=</span> <span class="kp">true</span>

<span class="c1"># good</span>
<span class="n">enabled</span> <span class="o">=</span> <span class="kp">true</span> <span class="k">if</span> <span class="n">enabled</span><span class="o">.</span><span class="n">nil?</span>
</pre></div>
</li>
<li><p>Avoid using Perl-style special variables (like <code>$0-9</code>, <code>$</code>,
etc. ). They are quite cryptic and their use in anything but
one-liner scripts is discouraged. Prefer long form versions such as
<code>$PROGRAM_NAME</code>.</p></li>
<li>
<p>Never put a space between a method name and the opening parenthesis.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">f</span> <span class="p">(</span><span class="mi">3</span> <span class="o">+</span> <span class="mi">2</span><span class="p">)</span> <span class="o">+</span> <span class="mi">1</span>

<span class="c1"># good</span>
<span class="n">f</span><span class="p">(</span><span class="mi">3</span> <span class="o">+</span> <span class="mi">2</span><span class="p">)</span> <span class="o">+</span> <span class="mi">1</span>
</pre></div>
</li>
<li><p>If the first argument to a method begins with an open parenthesis,
always use parentheses in the method invocation. For example, write
<code>f((3 + 2) + 1)</code>.</p></li>
<li>
<p>Use <code>_</code> for unused block parameters.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">result</span> <span class="o">=</span> <span class="nb">hash</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span> <span class="o">+</span> <span class="mi">1</span> <span class="p">}</span>

<span class="c1"># good</span>
<span class="n">result</span> <span class="o">=</span> <span class="nb">hash</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="n">_</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span> <span class="o">+</span> <span class="mi">1</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>Don't use the <code>===</code> (threequals) operator to check types. <code>===</code> is mostly an
implementation detail to support Ruby features like <code>case</code>, and it's not commutative.
For example, <code>String === "hi"</code> is true and <code>"hi" === String</code> is false.
Instead, use <code>is_a?</code> or <code>kind_of?</code> if you must.</p>

<p>Refactoring is even better. It's worth looking hard at any code that explicitly checks types.</p>
</li>
</ul><h2>
<a name="naming" class="anchor" href="#naming"><span class="octicon octicon-link"></span></a>Naming</h2>

<ul>
<li><p>Use <code>snake_case</code> for methods and variables.</p></li>
<li><p>Use <code>CamelCase</code> for classes and modules.  (Keep acronyms like HTTP,
RFC, XML uppercase.)</p></li>
<li><p>Use <code>SCREAMING_SNAKE_CASE</code> for other constants.</p></li>
<li><p>The names of predicate methods (methods that return a boolean value)
should end in a question mark. (i.e. <code>Array#empty?</code>).</p></li>
<li><p>The names of potentially "dangerous" methods (i.e. methods that modify <code>self</code> or the
arguments, <code>exit!</code>, etc.) should end with an exclamation mark. Bang methods
should only exist if a non-bang method exists. (<a href="http://dablog.rubypal.com/2007/8/15/bang-methods-or-danger-will-rubyist">More on this</a>).</p></li>
</ul><h2>
<a name="classes" class="anchor" href="#classes"><span class="octicon octicon-link"></span></a>Classes</h2>

<ul>
<li>
<p>Avoid the usage of class (<code>@@</code>) variables due to their unusual behavior
in inheritance.</p>

<div class="highlight highlight-Ruby"><pre><span class="k">class</span> <span class="nc">Parent</span>
<span class="vc">@@class_var</span> <span class="o">=</span> <span class="s2">"parent"</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">print_class_var</span>
<span class="nb">puts</span> <span class="vc">@@class_var</span>
<span class="k">end</span>
<span class="k">end</span>

<span class="k">class</span> <span class="nc">Child</span> <span class="o">&lt;</span> <span class="no">Parent</span>
<span class="vc">@@class_var</span> <span class="o">=</span> <span class="s2">"child"</span>
<span class="k">end</span>

<span class="no">Parent</span><span class="o">.</span><span class="n">print_class_var</span> <span class="c1"># =&gt; will print "child"</span>
</pre></div>

<p>As you can see all the classes in a class hierarchy actually share one
class variable. Class instance variables should usually be preferred
over class variables.</p>
</li>
<li>
<p>Use <code>def self.method</code> to define singleton methods. This makes the methods
more resistant to refactoring changes.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">TestClass</span>
<span class="c1"># bad</span>
<span class="k">def</span> <span class="nc">TestClass</span><span class="o">.</span><span class="nf">some_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">some_other_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid <code>class &lt;&lt; self</code> except when necessary, e.g. single accessors and aliased
attributes.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">TestClass</span>
<span class="c1"># bad</span>
<span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="nb">self</span>
<span class="k">def</span> <span class="nf">first_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">second_method_etc</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="nb">self</span>
<span class="kp">attr_accessor</span> <span class="ss">:per_page</span>
<span class="n">alias_method</span> <span class="ss">:nwo</span><span class="p">,</span> <span class="ss">:find_by_name_with_owner</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">first_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">second_method_etc</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Indent the <code>public</code>, <code>protected</code>, and <code>private</code> methods as much the
method definitions they apply to. Leave one blank line above them.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">SomeClass</span>
<span class="k">def</span> <span class="nf">public_method</span>
<span class="c1"># ...</span>
<span class="k">end</span>

<span class="kp">private</span>
<span class="k">def</span> <span class="nf">private_method</span>
<span class="c1"># ...</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><ul>
<li>
<p>Avoid explicit use of <code>self</code> as the recipient of internal class or instance
messages unless to specify a method shadowed by a variable.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">SomeClass</span>
<span class="kp">attr_accessor</span> <span class="ss">:message</span>

<span class="k">def</span> <span class="nf">greeting</span><span class="p">(</span><span class="nb">name</span><span class="p">)</span>
<span class="n">message</span> <span class="o">=</span> <span class="s2">"Hi </span><span class="si">#{</span><span class="nb">name</span><span class="si">}</span><span class="s2">"</span> <span class="c1"># local variable in Ruby, not attribute writer</span>
<span class="nb">self</span><span class="o">.</span><span class="n">message</span> <span class="o">=</span> <span class="n">message</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>

<h2>
<a name="exceptions" class="anchor" href="#exceptions"><span class="octicon octicon-link"></span></a>Exceptions</h2>
</li>
<li>
<p>Don't use exceptions for flow of control.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">begin</span>
<span class="n">n</span> <span class="o">/</span> <span class="n">d</span>
<span class="k">rescue</span> <span class="no">ZeroDivisionError</span>
<span class="nb">puts</span> <span class="s2">"Cannot divide by 0!"</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">d</span><span class="o">.</span><span class="n">zero?</span>
<span class="nb">puts</span> <span class="s2">"Cannot divide by 0!"</span>
<span class="k">else</span>
<span class="n">n</span> <span class="o">/</span> <span class="n">d</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid rescuing the <code>Exception</code> class.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">begin</span>
<span class="c1"># an exception occurs here</span>
<span class="k">rescue</span>
<span class="c1"># exception handling</span>
<span class="k">end</span>

<span class="c1"># still bad</span>
<span class="k">begin</span>
<span class="c1"># an exception occurs here</span>
<span class="k">rescue</span> <span class="no">Exception</span>
<span class="c1"># exception handling</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="collections" class="anchor" href="#collections"><span class="octicon octicon-link"></span></a>Collections</h2>

<ul>
<li>
<p>Prefer <code>%w</code> to the literal array syntax when you need an array of
strings.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="no">STATES</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"draft"</span><span class="p">,</span> <span class="s2">"open"</span><span class="p">,</span> <span class="s2">"closed"</span><span class="o">]</span>

<span class="c1"># good</span>
<span class="no">STATES</span> <span class="o">=</span> <span class="sx">%w(draft open closed)</span>
</pre></div>
</li>
<li><p>Use <code>Set</code> instead of <code>Array</code> when dealing with unique elements. <code>Set</code>
implements a collection of unordered values with no duplicates. This
is a hybrid of <code>Array</code>'s intuitive inter-operation facilities and
<code>Hash</code>'s fast lookup.</p></li>
<li>
<p>Use symbols instead of strings as hash keys.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="nb">hash</span> <span class="o">=</span> <span class="p">{</span> <span class="s2">"one"</span> <span class="o">=&gt;</span> <span class="mi">1</span><span class="p">,</span> <span class="s2">"two"</span> <span class="o">=&gt;</span> <span class="mi">2</span><span class="p">,</span> <span class="s2">"three"</span> <span class="o">=&gt;</span> <span class="mi">3</span> <span class="p">}</span>

<span class="c1"># good</span>
<span class="nb">hash</span> <span class="o">=</span> <span class="p">{</span> <span class="ss">:one</span> <span class="o">=&gt;</span> <span class="mi">1</span><span class="p">,</span> <span class="ss">:two</span> <span class="o">=&gt;</span> <span class="mi">2</span><span class="p">,</span> <span class="ss">:three</span> <span class="o">=&gt;</span> <span class="mi">3</span> <span class="p">}</span>
</pre></div>
</li>
</ul><h2>
<a name="strings" class="anchor" href="#strings"><span class="octicon octicon-link"></span></a>Strings</h2>

<ul>
<li>
<p>Prefer string interpolation instead of string concatenation:</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">email_with_name</span> <span class="o">=</span> <span class="n">user</span><span class="o">.</span><span class="n">name</span> <span class="o">+</span> <span class="s2">" &lt;"</span> <span class="o">+</span> <span class="n">user</span><span class="o">.</span><span class="n">email</span> <span class="o">+</span> <span class="s2">"&gt;"</span>

<span class="c1"># good</span>
<span class="n">email_with_name</span> <span class="o">=</span> <span class="s2">"</span><span class="si">#{</span><span class="n">user</span><span class="o">.</span><span class="n">name</span><span class="si">}</span><span class="s2"> &lt;</span><span class="si">#{</span><span class="n">user</span><span class="o">.</span><span class="n">email</span><span class="si">}</span><span class="s2">&gt;"</span>
</pre></div>
</li>
<li>
<p>Prefer double-quoted strings. Interpolation and escaped characters
will always work without a delimiter change, and <code>'</code> is a lot more
common than <code>"</code> in string literals.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="nb">name</span> <span class="o">=</span> <span class="s1">'Bozhidar'</span>

<span class="c1"># good</span>
<span class="nb">name</span> <span class="o">=</span> <span class="s2">"Bozhidar"</span>
</pre></div>
</li>
<li>
<p>Avoid using <code>String#+</code> when you need to construct large data chunks.
Instead, use <code>String#&lt;&lt;</code>. Concatenation mutates the string instance in-place
and is always faster than <code>String#+</code>, which creates a bunch of new string objects.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># good and also fast</span>
<span class="n">html</span> <span class="o">=</span> <span class="s2">""</span>
<span class="n">html</span> <span class="o">&lt;&lt;</span> <span class="s2">"&lt;h1&gt;Page title&lt;/h1&gt;"</span>

<span class="n">paragraphs</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="n">paragraph</span><span class="o">|</span>
<span class="n">html</span> <span class="o">&lt;&lt;</span> <span class="s2">"&lt;p&gt;</span><span class="si">#{</span><span class="n">paragraph</span><span class="si">}</span><span class="s2">&lt;/p&gt;"</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="regular-expressions" class="anchor" href="#regular-expressions"><span class="octicon octicon-link"></span></a>Regular Expressions</h2>

<ul>
<li>
<p>Avoid using $1-9 as it can be hard to track what they contain. Named groups
can be used instead.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="sr">/(regexp)/</span> <span class="o">=~</span> <span class="n">string</span>
<span class="o">.</span><span class="n">.</span><span class="o">.</span>
<span class="n">process</span> <span class="vg">$1</span>

<span class="c1"># good</span>
<span class="sr">/(?&lt;meaningful_var&gt;regexp)/</span> <span class="o">=~</span> <span class="n">string</span>
<span class="o">.</span><span class="n">.</span><span class="o">.</span>
<span class="n">process</span> <span class="n">meaningful_var</span>
</pre></div>
</li>
<li>
<p>Be careful with <code>^</code> and <code>$</code> as they match start/end of line, not string endings.
If you want to match the whole string use: <code>\A</code> and <code>\z</code>.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">string</span> <span class="o">=</span> <span class="s2">"some injection</span><span class="se">\n</span><span class="s2">username"</span>
<span class="n">string</span><span class="o">[</span><span class="sr">/^username$/</span><span class="o">]</span>   <span class="c1"># matches</span>
<span class="n">string</span><span class="o">[</span><span class="sr">/\Ausername\z/</span><span class="o">]</span> <span class="c1"># don't match</span>
</pre></div>
</li>
<li>
<p>Use <code>x</code> modifier for complex regexps. This makes them more readable and you
can add some useful comments. Just be careful as spaces are ignored.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">regexp</span> <span class="o">=</span> <span class="sr">%r{</span>
<span class="sr">    start         # some text</span>
<span class="sr">    \s            # white space char</span>
<span class="sr">    (group)       # first group</span>
<span class="sr">    (?:alt1|alt2) # some alternation</span>
<span class="sr">    end</span>
<span class="sr">  }x</span>
</pre></div>
</li>
</ul><h2>
<a name="percent-literals" class="anchor" href="#percent-literals"><span class="octicon octicon-link"></span></a>Percent Literals</h2>

<ul>
<li>
<p>Use <code>%w</code> freely.</p>

<div class="highlight highlight-Ruby"><pre><span class="no">STATES</span> <span class="o">=</span> <span class="sx">%w(draft open closed)</span>
</pre></div>
</li>
<li>
<p>Use <code>%()</code> for single-line strings which require both interpolation
and embedded double-quotes. For multi-line strings, prefer heredocs.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad (no interpolation needed)</span>
<span class="sx">%(&lt;div class="text"&gt;Some text&lt;/div&gt;)</span>
<span class="c1"># should be "&lt;div class="text"&gt;Some text&lt;/div&gt;"</span>

<span class="c1"># bad (no double-quotes)</span>
<span class="sx">%(This is </span><span class="si">#{</span><span class="n">quality</span><span class="si">}</span><span class="sx"> style)</span>
<span class="c1"># should be "This is #{quality} style"</span>

<span class="c1"># bad (multiple lines)</span>
<span class="sx">%(&lt;div&gt;</span><span class="se">\n</span><span class="sx">&lt;span class="big"&gt;</span><span class="si">#{</span><span class="n">exclamation</span><span class="si">}</span><span class="sx">&lt;/span&gt;</span><span class="se">\n</span><span class="sx">&lt;/div&gt;)</span>
<span class="c1"># should be a heredoc.</span>

<span class="c1"># good (requires interpolation, has quotes, single line)</span>
<span class="sx">%(&lt;tr&gt;&lt;td class="name"&gt;</span><span class="si">#{</span><span class="nb">name</span><span class="si">}</span><span class="sx">&lt;/td&gt;)</span>
</pre></div>
</li>
<li>
<p>Use <code>%r</code> only for regular expressions matching <em>more than</em> one '/' character.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="sr">%r(\s+)</span>

<span class="c1"># still bad</span>
<span class="sr">%r(^/(.*)$)</span>
<span class="c1"># should be /^\/(.*)$/</span>

<span class="c1"># good</span>
<span class="sr">%r(^/blog/2011/(.*)$)</span>
</pre></div>
</li>
</ul><h2>
<a name="hashes" class="anchor" href="#hashes"><span class="octicon octicon-link"></span></a>Hashes</h2>

<p>Use hashrocket syntax for Hash literals instead of the JSON style introduced in 1.9.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">login</span><span class="p">:</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="nb">name</span><span class="p">:</span> <span class="s2">"Chris Wanstrath"</span>
<span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">login</span><span class="p">:</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="nb">name</span><span class="p">:</span> <span class="s2">"Chris Wanstrath"</span><span class="p">,</span>
<span class="s2">"followers-count"</span> <span class="o">=&gt;</span> <span class="mi">52390235</span>
<span class="p">}</span>

<span class="c1"># good</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">:login</span> <span class="o">=&gt;</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="ss">:name</span> <span class="o">=&gt;</span> <span class="s2">"Chris Wanstrath"</span><span class="p">,</span>
<span class="s2">"followers-count"</span> <span class="o">=&gt;</span> <span class="mi">52390235</span>
<span class="p">}</span>
</pre></div>

<h2>
<a name="above-all-else" class="anchor" href="#above-all-else"><span class="octicon octicon-link"></span></a>Above all else</h2>

<p>Follow your <img class="emoji" title=":heart:" alt=":heart:" src="https://github.global.ssl.fastly.net/images/icons/emoji/heart.png" height="20" width="20" align="absmiddle"></p></article>
BEFOREHTML
<article class="markdown-body entry-content" itemprop="mainContentOfPage"><h1>
<a name="ruby-styleguide" class="anchor" href="#ruby-styleguide"><span class="octicon octicon-link"></span></a>Ruby Styleguide</h1>

<p>If you're visiting from the internet, feel free to learn from our style. This is a guide we use for our own ruby apps internally at GitHub.  We encourage you to set up one that works for your own team.</p>

<p>Much of this was taken from <a href="https://github.com/bbatsov/ruby-style-guide">https://github.com/bbatsov/ruby-style-guide</a>. Please add to this guide if you find any particular patterns or styles that we've adopted internally. Submit a pull request to ask for feedback (if you're an employee).</p>

<h2>
<a name="coding-style" class="anchor" href="#coding-style"><span class="octicon octicon-link"></span></a>Coding Style</h2>

<ul>
<li><p>Use soft-tabs with a two space indent.</p></li>
<li><p>Keep lines fewer than 80 characters.</p></li>
<li><p>Never leave trailing whitespace.</p></li>
<li><p>End each file with a blank newline.</p></li>
<li>
<p>Use spaces around operators, after commas, colons and semicolons, around <code>{</code>
and before <code>}</code>.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">sum</span> <span class="o">=</span> <span class="mi">1</span> <span class="o">+</span> <span class="mi">2</span>
<span class="n">a</span><span class="p">,</span> <span class="n">b</span> <span class="o">=</span> <span class="mi">1</span><span class="p">,</span> <span class="mi">2</span>
<span class="mi">1</span> <span class="o">&gt;</span> <span class="mi">2</span> <span class="o">?</span> <span class="kp">true</span> <span class="p">:</span> <span class="kp">false</span><span class="p">;</span> <span class="nb">puts</span> <span class="s2">"Hi"</span>
<span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="n">e</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">e</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>No spaces after <code>(</code>, <code>[</code> or before <code>]</code>, <code>)</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="n">some</span><span class="p">(</span><span class="n">arg</span><span class="p">)</span><span class="o">.</span><span class="n">other</span>
<span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">length</span>
</pre></div>
</li>
<li>
<p>No spaces after <code>!</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="o">!</span><span class="n">array</span><span class="o">.</span><span class="n">include?</span><span class="p">(</span><span class="n">element</span><span class="p">)</span>
</pre></div>
</li>
<li>
<p>Indent <code>when</code> as deep as <code>case</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="k">case</span>
<span class="k">when</span> <span class="n">song</span><span class="o">.</span><span class="n">name</span> <span class="o">==</span> <span class="s2">"Misty"</span>
<span class="nb">puts</span> <span class="s2">"Not again!"</span>
<span class="k">when</span> <span class="n">song</span><span class="o">.</span><span class="n">duration</span> <span class="o">&gt;</span> <span class="mi">120</span>
<span class="nb">puts</span> <span class="s2">"Too long!"</span>
<span class="k">when</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span><span class="o">.</span><span class="n">hour</span> <span class="o">&gt;</span> <span class="mi">21</span>
<span class="nb">puts</span> <span class="s2">"It's too late"</span>
<span class="k">else</span>
<span class="n">song</span><span class="o">.</span><span class="n">play</span>
<span class="k">end</span>

<span class="n">kind</span> <span class="o">=</span> <span class="k">case</span> <span class="n">year</span>
<span class="k">when</span> <span class="mi">1850</span><span class="o">.</span><span class="n">.</span><span class="mi">1889</span> <span class="k">then</span> <span class="s2">"Blues"</span>
<span class="k">when</span> <span class="mi">1890</span><span class="o">.</span><span class="n">.</span><span class="mi">1909</span> <span class="k">then</span> <span class="s2">"Ragtime"</span>
<span class="k">when</span> <span class="mi">1910</span><span class="o">.</span><span class="n">.</span><span class="mi">1929</span> <span class="k">then</span> <span class="s2">"New Orleans Jazz"</span>
<span class="k">when</span> <span class="mi">1930</span><span class="o">.</span><span class="n">.</span><span class="mi">1939</span> <span class="k">then</span> <span class="s2">"Swing"</span>
<span class="k">when</span> <span class="mi">1940</span><span class="o">.</span><span class="n">.</span><span class="mi">1950</span> <span class="k">then</span> <span class="s2">"Bebop"</span>
<span class="k">else</span> <span class="s2">"Jazz"</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Use empty lines between <code>def</code>s and to break up a method into logical
paragraphs.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">def</span> <span class="nf">some_method</span>
<span class="n">data</span> <span class="o">=</span> <span class="kp">initialize</span><span class="p">(</span><span class="n">options</span><span class="p">)</span>

<span class="n">data</span><span class="o">.</span><span class="n">manipulate!</span>

<span class="n">data</span><span class="o">.</span><span class="n">result</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">some_method</span>
<span class="n">result</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="documentation" class="anchor" href="#documentation"><span class="octicon octicon-link"></span></a>Documentation</h2>

<p>Use <a href="http://tomdoc.org">TomDoc</a> to the best of your ability. It's pretty sweet:</p>

<div class="highlight highlight-ruby"><pre><span class="c1"># Public: Duplicate some text an arbitrary number of times.</span>
<span class="c1">#</span>
<span class="c1"># text  - The String to be duplicated.</span>
<span class="c1"># count - The Integer number of times to duplicate the text.</span>
<span class="c1">#</span>
<span class="c1"># Examples</span>
<span class="c1">#</span>
<span class="c1">#   multiplex("Tom", 4)</span>
<span class="c1">#   # =&gt; "TomTomTomTom"</span>
<span class="c1">#</span>
<span class="c1"># Returns the duplicated String.</span>
<span class="k">def</span> <span class="nf">multiplex</span><span class="p">(</span><span class="n">text</span><span class="p">,</span> <span class="n">count</span><span class="p">)</span>
<span class="n">text</span> <span class="o">*</span> <span class="n">count</span>
<span class="k">end</span>
</pre></div>

<h2>
<a name="syntax" class="anchor" href="#syntax"><span class="octicon octicon-link"></span></a>Syntax</h2>

<ul>
<li>
<p>Use <code>def</code> with parentheses when there are arguments. Omit the
parentheses when the method doesn't accept any arguments.</p>

<div class="highlight highlight-Ruby"><pre>   <span class="k">def</span> <span class="nf">some_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">some_method_with_arguments</span><span class="p">(</span><span class="n">arg1</span><span class="p">,</span> <span class="n">arg2</span><span class="p">)</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Never use <code>for</code>, unless you know exactly why. Most of the time iterators
should be used instead. <code>for</code> is implemented in terms of <code>each</code> (so
you're adding a level of indirection), but with a twist - <code>for</code>
doesn't introduce a new scope (unlike <code>each</code>) and variables defined
in its block will be visible outside it.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">arr</span> <span class="o">=</span> <span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">]</span>

<span class="c1"># bad</span>
<span class="k">for</span> <span class="n">elem</span> <span class="k">in</span> <span class="n">arr</span> <span class="k">do</span>
<span class="nb">puts</span> <span class="n">elem</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">arr</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="n">elem</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">elem</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>Never use <code>then</code> for multi-line <code>if/unless</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="n">some_condition</span> <span class="k">then</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid the ternary operator (<code>?:</code>) except in cases where all expressions are extremely
trivial. However, do use the ternary operator(<code>?:</code>) over <code>if/then/else/end</code> constructs
for single line conditionals.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="n">result</span> <span class="o">=</span> <span class="k">if</span> <span class="n">some_condition</span> <span class="k">then</span> <span class="n">something</span> <span class="k">else</span> <span class="n">something_else</span> <span class="k">end</span>

<span class="c1"># good</span>
<span class="n">result</span> <span class="o">=</span> <span class="n">some_condition</span> <span class="p">?</span> <span class="n">something</span> <span class="p">:</span> <span class="n">something_else</span>
</pre></div>
</li>
<li>
<p>Use one expression per branch in a ternary operator. This
also means that ternary operators must not be nested. Prefer
<code>if/else</code> constructs in these cases.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="n">some_condition</span> <span class="p">?</span> <span class="p">(</span><span class="n">nested_condition</span> <span class="p">?</span> <span class="n">nested_something</span> <span class="p">:</span> <span class="n">nested_something_else</span><span class="p">)</span> <span class="p">:</span> <span class="n">something_else</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="n">nested_condition</span> <span class="p">?</span> <span class="n">nested_something</span> <span class="p">:</span> <span class="n">nested_something_else</span>
<span class="k">else</span>
<span class="n">something_else</span>
<span class="k">end</span>
</pre></div>
</li>
<li><p>The <code>and</code> and <code>or</code> keywords are banned. It's just not worth it. Always use <code>&amp;&amp;</code> and <code>||</code> instead.</p></li>
<li><p>Avoid multi-line <code>?:</code> (the ternary operator), use <code>if/unless</code> instead.</p></li>
<li>
<p>Favor modifier <code>if/unless</code> usage when you have a single-line
body.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="k">if</span> <span class="n">some_condition</span>
<span class="n">do_something</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">do_something</span> <span class="k">if</span> <span class="n">some_condition</span>
</pre></div>
</li>
<li>
<p>Never use <code>unless</code> with <code>else</code>. Rewrite these with the positive case first.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">unless</span> <span class="n">success?</span>
<span class="nb">puts</span> <span class="s2">"failure"</span>
<span class="k">else</span>
<span class="nb">puts</span> <span class="s2">"success"</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">success?</span>
<span class="nb">puts</span> <span class="s2">"success"</span>
<span class="k">else</span>
<span class="nb">puts</span> <span class="s2">"failure"</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Don't use parentheses around the condition of an <code>if/unless/while</code>.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="p">(</span><span class="n">x</span> <span class="o">&gt;</span> <span class="mi">10</span><span class="p">)</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">x</span> <span class="o">&gt;</span> <span class="mi">10</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Prefer <code>{...}</code> over <code>do...end</code> for single-line blocks.  Avoid using
<code>{...}</code> for multi-line blocks (multiline chaining is always
ugly). Always use <code>do...end</code> for "control flow" and "method
definitions" (e.g. in Rakefiles and certain DSLs).  Avoid <code>do...end</code>
when chaining.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">names</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Bozhidar"</span><span class="p">,</span> <span class="s2">"Steve"</span><span class="p">,</span> <span class="s2">"Sarah"</span><span class="o">]</span>

<span class="c1"># good</span>
<span class="n">names</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">puts</span> <span class="nb">name</span> <span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">names</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span>
<span class="nb">puts</span> <span class="nb">name</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="n">names</span><span class="o">.</span><span class="n">select</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">start_with?</span><span class="p">(</span><span class="s2">"S"</span><span class="p">)</span> <span class="p">}</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">names</span><span class="o">.</span><span class="n">select</span> <span class="k">do</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span>
<span class="nb">name</span><span class="o">.</span><span class="n">start_with?</span><span class="p">(</span><span class="s2">"S"</span><span class="p">)</span>
<span class="k">end</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">name</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>
</pre></div>

<p>Some will argue that multiline chaining would look OK with the use of {...}, but they should
ask themselves - is this code really readable and can't the block's contents be extracted into
nifty methods?</p>
</li>
<li>
<p>Avoid <code>return</code> where not required.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">some_arr</span><span class="p">)</span>
<span class="k">return</span> <span class="n">some_arr</span><span class="o">.</span><span class="n">size</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">some_arr</span><span class="p">)</span>
<span class="n">some_arr</span><span class="o">.</span><span class="n">size</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Use spaces around the <code>=</code> operator when assigning default values to method parameters:</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">arg1</span><span class="o">=</span><span class="ss">:default</span><span class="p">,</span> <span class="n">arg2</span><span class="o">=</span><span class="kp">nil</span><span class="p">,</span> <span class="n">arg3</span><span class="o">=[]</span><span class="p">)</span>
<span class="c1"># do something...</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nf">some_method</span><span class="p">(</span><span class="n">arg1</span> <span class="o">=</span> <span class="ss">:default</span><span class="p">,</span> <span class="n">arg2</span> <span class="o">=</span> <span class="kp">nil</span><span class="p">,</span> <span class="n">arg3</span> <span class="o">=</span> <span class="o">[]</span><span class="p">)</span>
<span class="c1"># do something...</span>
<span class="k">end</span>
</pre></div>

<p>While several Ruby books suggest the first style, the second is much more prominent
in practice (and arguably a bit more readable).</p>
</li>
<li>
<p>Using the return value of <code>=</code> (an assignment) is ok with parentheses.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">if</span> <span class="p">(</span><span class="n">v</span> <span class="o">=</span> <span class="n">array</span><span class="o">.</span><span class="n">grep</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">))</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">v</span> <span class="o">=</span> <span class="n">array</span><span class="o">.</span><span class="n">grep</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">)</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>

<span class="c1"># also good - has correct precedence.</span>
<span class="k">if</span> <span class="p">(</span><span class="n">v</span> <span class="o">=</span> <span class="n">next_value</span><span class="p">)</span> <span class="o">==</span> <span class="s2">"hello"</span> <span class="o">.</span><span class="n">.</span><span class="o">.</span>
</pre></div>
</li>
<li>
<p>Use <code>||=</code> freely to initialize variables.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># set name to Bozhidar, only if it's nil or false</span>
<span class="nb">name</span> <span class="o">||=</span> <span class="s2">"Bozhidar"</span>
</pre></div>
</li>
<li>
<p>Don't use <code>||=</code> to initialize boolean variables. (Consider what
would happen if the current value happened to be <code>false</code>.)</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad - would set enabled to true even if it was false</span>
<span class="n">enabled</span> <span class="o">||=</span> <span class="kp">true</span>

<span class="c1"># good</span>
<span class="n">enabled</span> <span class="o">=</span> <span class="kp">true</span> <span class="k">if</span> <span class="n">enabled</span><span class="o">.</span><span class="n">nil?</span>
</pre></div>
</li>
<li><p>Avoid using Perl-style special variables (like <code>$0-9</code>, <code>$</code>,
etc. ). They are quite cryptic and their use in anything but
one-liner scripts is discouraged. Prefer long form versions such as
<code>$PROGRAM_NAME</code>.</p></li>
<li>
<p>Never put a space between a method name and the opening parenthesis.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">f</span> <span class="p">(</span><span class="mi">3</span> <span class="o">+</span> <span class="mi">2</span><span class="p">)</span> <span class="o">+</span> <span class="mi">1</span>

<span class="c1"># good</span>
<span class="n">f</span><span class="p">(</span><span class="mi">3</span> <span class="o">+</span> <span class="mi">2</span><span class="p">)</span> <span class="o">+</span> <span class="mi">1</span>
</pre></div>
</li>
<li><p>If the first argument to a method begins with an open parenthesis,
always use parentheses in the method invocation. For example, write
<code>f((3 + 2) + 1)</code>.</p></li>
<li>
<p>Use <code>_</code> for unused block parameters.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">result</span> <span class="o">=</span> <span class="nb">hash</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span> <span class="o">+</span> <span class="mi">1</span> <span class="p">}</span>

<span class="c1"># good</span>
<span class="n">result</span> <span class="o">=</span> <span class="nb">hash</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="n">_</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span> <span class="o">+</span> <span class="mi">1</span> <span class="p">}</span>
</pre></div>
</li>
<li>
<p>Don't use the <code>===</code> (threequals) operator to check types. <code>===</code> is mostly an
implementation detail to support Ruby features like <code>case</code>, and it's not commutative.
For example, <code>String === "hi"</code> is true and <code>"hi" === String</code> is false.
Instead, use <code>is_a?</code> or <code>kind_of?</code> if you must.</p>

<p>Refactoring is even better. It's worth looking hard at any code that explicitly checks types.</p>
</li>
</ul><h2>
<a name="naming" class="anchor" href="#naming"><span class="octicon octicon-link"></span></a>Naming</h2>

<ul>
<li><p>Use <code>snake_case</code> for methods and variables.</p></li>
<li><p>Use <code>CamelCase</code> for classes and modules.  (Keep acronyms like HTTP,
RFC, XML uppercase.)</p></li>
<li><p>Use <code>SCREAMING_SNAKE_CASE</code> for other constants.</p></li>
<li><p>The names of predicate methods (methods that return a boolean value)
should end in a question mark. (i.e. <code>Array#empty?</code>).</p></li>
<li><p>The names of potentially "dangerous" methods (i.e. methods that modify <code>self</code> or the
arguments, <code>exit!</code>, etc.) should end with an exclamation mark. Bang methods
should only exist if a non-bang method exists. (<a href="http://dablog.rubypal.com/2007/8/15/bang-methods-or-danger-will-rubyist">More on this</a>).</p></li>
</ul><h2>
<a name="classes" class="anchor" href="#classes"><span class="octicon octicon-link"></span></a>Classes</h2>

<ul>
<li>
<p>Avoid the usage of class (<code>@@</code>) variables due to their unusual behavior
in inheritance.</p>

<div class="highlight highlight-Ruby"><pre><span class="k">class</span> <span class="nc">Parent</span>
<span class="vc">@@class_var</span> <span class="o">=</span> <span class="s2">"parent"</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">print_class_var</span>
<span class="nb">puts</span> <span class="vc">@@class_var</span>
<span class="k">end</span>
<span class="k">end</span>

<span class="k">class</span> <span class="nc">Child</span> <span class="o">&lt;</span> <span class="no">Parent</span>
<span class="vc">@@class_var</span> <span class="o">=</span> <span class="s2">"child"</span>
<span class="k">end</span>

<span class="no">Parent</span><span class="o">.</span><span class="n">print_class_var</span> <span class="c1"># =&gt; will print "child"</span>
</pre></div>

<p>As you can see all the classes in a class hierarchy actually share one
class variable. Class instance variables should usually be preferred
over class variables.</p>
</li>
<li>
<p>Use <code>def self.method</code> to define singleton methods. This makes the methods
more resistant to refactoring changes.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">TestClass</span>
<span class="c1"># bad</span>
<span class="k">def</span> <span class="nc">TestClass</span><span class="o">.</span><span class="nf">some_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">some_other_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid <code>class &lt;&lt; self</code> except when necessary, e.g. single accessors and aliased
attributes.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">TestClass</span>
<span class="c1"># bad</span>
<span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="nb">self</span>
<span class="k">def</span> <span class="nf">first_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">second_method_etc</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="nb">self</span>
<span class="kp">attr_accessor</span> <span class="ss">:per_page</span>
<span class="n">alias_method</span> <span class="ss">:nwo</span><span class="p">,</span> <span class="ss">:find_by_name_with_owner</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">first_method</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">second_method_etc</span>
<span class="c1"># body omitted</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Indent the <code>public</code>, <code>protected</code>, and <code>private</code> methods as much the
method definitions they apply to. Leave one blank line above them.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">SomeClass</span>
<span class="k">def</span> <span class="nf">public_method</span>
<span class="c1"># ...</span>
<span class="k">end</span>

<span class="kp">private</span>
<span class="k">def</span> <span class="nf">private_method</span>
<span class="c1"># ...</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><ul>
<li>
<p>Avoid explicit use of <code>self</code> as the recipient of internal class or instance
messages unless to specify a method shadowed by a variable.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="k">class</span> <span class="nc">SomeClass</span>
<span class="kp">attr_accessor</span> <span class="ss">:message</span>

<span class="k">def</span> <span class="nf">greeting</span><span class="p">(</span><span class="nb">name</span><span class="p">)</span>
<span class="n">message</span> <span class="o">=</span> <span class="s2">"Hi </span><span class="si">#{</span><span class="nb">name</span><span class="si">}</span><span class="s2">"</span> <span class="c1"># local variable in Ruby, not attribute writer</span>
<span class="nb">self</span><span class="o">.</span><span class="n">message</span> <span class="o">=</span> <span class="n">message</span>
<span class="k">end</span>
<span class="k">end</span>
</pre></div>

<h2>
<a name="exceptions" class="anchor" href="#exceptions"><span class="octicon octicon-link"></span></a>Exceptions</h2>
</li>
<li>
<p>Don't use exceptions for flow of control.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">begin</span>
<span class="n">n</span> <span class="o">/</span> <span class="n">d</span>
<span class="k">rescue</span> <span class="no">ZeroDivisionError</span>
<span class="nb">puts</span> <span class="s2">"Cannot divide by 0!"</span>
<span class="k">end</span>

<span class="c1"># good</span>
<span class="k">if</span> <span class="n">d</span><span class="o">.</span><span class="n">zero?</span>
<span class="nb">puts</span> <span class="s2">"Cannot divide by 0!"</span>
<span class="k">else</span>
<span class="n">n</span> <span class="o">/</span> <span class="n">d</span>
<span class="k">end</span>
</pre></div>
</li>
<li>
<p>Avoid rescuing the <code>Exception</code> class.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="k">begin</span>
<span class="c1"># an exception occurs here</span>
<span class="k">rescue</span>
<span class="c1"># exception handling</span>
<span class="k">end</span>

<span class="c1"># still bad</span>
<span class="k">begin</span>
<span class="c1"># an exception occurs here</span>
<span class="k">rescue</span> <span class="no">Exception</span>
<span class="c1"># exception handling</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="collections" class="anchor" href="#collections"><span class="octicon octicon-link"></span></a>Collections</h2>

<ul>
<li>
<p>Prefer <code>%w</code> to the literal array syntax when you need an array of
strings.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="no">STATES</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"draft"</span><span class="p">,</span> <span class="s2">"open"</span><span class="p">,</span> <span class="s2">"closed"</span><span class="o">]</span>

<span class="c1"># good</span>
<span class="no">STATES</span> <span class="o">=</span> <span class="sx">%w(draft open closed)</span>
</pre></div>
</li>
<li><p>Use <code>Set</code> instead of <code>Array</code> when dealing with unique elements. <code>Set</code>
implements a collection of unordered values with no duplicates. This
is a hybrid of <code>Array</code>'s intuitive inter-operation facilities and
<code>Hash</code>'s fast lookup.</p></li>
<li>
<p>Use symbols instead of strings as hash keys.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="nb">hash</span> <span class="o">=</span> <span class="p">{</span> <span class="s2">"one"</span> <span class="o">=&gt;</span> <span class="mi">1</span><span class="p">,</span> <span class="s2">"two"</span> <span class="o">=&gt;</span> <span class="mi">2</span><span class="p">,</span> <span class="s2">"three"</span> <span class="o">=&gt;</span> <span class="mi">3</span> <span class="p">}</span>

<span class="c1"># good</span>
<span class="nb">hash</span> <span class="o">=</span> <span class="p">{</span> <span class="ss">:one</span> <span class="o">=&gt;</span> <span class="mi">1</span><span class="p">,</span> <span class="ss">:two</span> <span class="o">=&gt;</span> <span class="mi">2</span><span class="p">,</span> <span class="ss">:three</span> <span class="o">=&gt;</span> <span class="mi">3</span> <span class="p">}</span>
</pre></div>
</li>
</ul><h2>
<a name="strings" class="anchor" href="#strings"><span class="octicon octicon-link"></span></a>Strings</h2>

<ul>
<li>
<p>Prefer string interpolation instead of string concatenation:</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">email_with_name</span> <span class="o">=</span> <span class="n">user</span><span class="o">.</span><span class="n">name</span> <span class="o">+</span> <span class="s2">" &lt;"</span> <span class="o">+</span> <span class="n">user</span><span class="o">.</span><span class="n">email</span> <span class="o">+</span> <span class="s2">"&gt;"</span>

<span class="c1"># good</span>
<span class="n">email_with_name</span> <span class="o">=</span> <span class="s2">"</span><span class="si">#{</span><span class="n">user</span><span class="o">.</span><span class="n">name</span><span class="si">}</span><span class="s2"> &lt;</span><span class="si">#{</span><span class="n">user</span><span class="o">.</span><span class="n">email</span><span class="si">}</span><span class="s2">&gt;"</span>
</pre></div>
</li>
<li>
<p>Prefer double-quoted strings. Interpolation and escaped characters
will always work without a delimiter change, and <code>'</code> is a lot more
common than <code>"</code> in string literals.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="nb">name</span> <span class="o">=</span> <span class="s1">'Bozhidar'</span>

<span class="c1"># good</span>
<span class="nb">name</span> <span class="o">=</span> <span class="s2">"Bozhidar"</span>
</pre></div>
</li>
<li>
<p>Avoid using <code>String#+</code> when you need to construct large data chunks.
Instead, use <code>String#&lt;&lt;</code>. Concatenation mutates the string instance in-place
and is always faster than <code>String#+</code>, which creates a bunch of new string objects.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># good and also fast</span>
<span class="n">html</span> <span class="o">=</span> <span class="s2">""</span>
<span class="n">html</span> <span class="o">&lt;&lt;</span> <span class="s2">"&lt;h1&gt;Page title&lt;/h1&gt;"</span>

<span class="n">paragraphs</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="n">paragraph</span><span class="o">|</span>
<span class="n">html</span> <span class="o">&lt;&lt;</span> <span class="s2">"&lt;p&gt;</span><span class="si">#{</span><span class="n">paragraph</span><span class="si">}</span><span class="s2">&lt;/p&gt;"</span>
<span class="k">end</span>
</pre></div>
</li>
</ul><h2>
<a name="regular-expressions" class="anchor" href="#regular-expressions"><span class="octicon octicon-link"></span></a>Regular Expressions</h2>

<ul>
<li>
<p>Avoid using $1-9 as it can be hard to track what they contain. Named groups
can be used instead.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad</span>
<span class="sr">/(regexp)/</span> <span class="o">=~</span> <span class="n">string</span>
<span class="o">.</span><span class="n">.</span><span class="o">.</span>
<span class="n">process</span> <span class="vg">$1</span>

<span class="c1"># good</span>
<span class="sr">/(?&lt;meaningful_var&gt;regexp)/</span> <span class="o">=~</span> <span class="n">string</span>
<span class="o">.</span><span class="n">.</span><span class="o">.</span>
<span class="n">process</span> <span class="n">meaningful_var</span>
</pre></div>
</li>
<li>
<p>Be careful with <code>^</code> and <code>$</code> as they match start/end of line, not string endings.
If you want to match the whole string use: <code>\A</code> and <code>\Z</code>.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">string</span> <span class="o">=</span> <span class="s2">"some injection</span><span class="se">\n</span><span class="s2">username"</span>
<span class="n">string</span><span class="o">[</span><span class="sr">/^username$/</span><span class="o">]</span>   <span class="c1"># matches</span>
<span class="n">string</span><span class="o">[</span><span class="sr">/\Ausername\z/</span><span class="o">]</span> <span class="c1"># don't match</span>
</pre></div>
</li>
<li>
<p>Use <code>x</code> modifier for complex regexps. This makes them more readable and you
can add some useful comments. Just be careful as spaces are ignored.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="n">regexp</span> <span class="o">=</span> <span class="sr">%r{</span>
<span class="sr">    start         # some text</span>
<span class="sr">    \s            # white space char</span>
<span class="sr">    (group)       # first group</span>
<span class="sr">    (?:alt1|alt2) # some alternation</span>
<span class="sr">    end</span>
<span class="sr">  }x</span>
</pre></div>
</li>
</ul><h2>
<a name="percent-literals" class="anchor" href="#percent-literals"><span class="octicon octicon-link"></span></a>Percent Literals</h2>

<ul>
<li>
<p>Use <code>%w</code> freely.</p>

<div class="highlight highlight-Ruby"><pre><span class="no">STATES</span> <span class="o">=</span> <span class="sx">%w(draft open closed)</span>
</pre></div>
</li>
<li>
<p>Use <code>%()</code> for single-line strings which require both interpolation
and embedded double-quotes. For multi-line strings, prefer heredocs.</p>

<div class="highlight highlight-Ruby"><pre>  <span class="c1"># bad (no interpolation needed)</span>
<span class="sx">%(&lt;div class="text"&gt;Some text&lt;/div&gt;)</span>
<span class="c1"># should be "&lt;div class="text"&gt;Some text&lt;/div&gt;"</span>

<span class="c1"># bad (no double-quotes)</span>
<span class="sx">%(This is </span><span class="si">#{</span><span class="n">quality</span><span class="si">}</span><span class="sx"> style)</span>
<span class="c1"># should be "This is #{quality} style"</span>

<span class="c1"># bad (multiple lines)</span>
<span class="sx">%(&lt;div&gt;</span><span class="se">\n</span><span class="sx">&lt;span class="big"&gt;</span><span class="si">#{</span><span class="n">exclamation</span><span class="si">}</span><span class="sx">&lt;/span&gt;</span><span class="se">\n</span><span class="sx">&lt;/div&gt;)</span>
<span class="c1"># should be a heredoc.</span>

<span class="c1"># good (requires interpolation, has quotes, single line)</span>
<span class="sx">%(&lt;tr&gt;&lt;td class="name"&gt;</span><span class="si">#{</span><span class="nb">name</span><span class="si">}</span><span class="sx">&lt;/td&gt;)</span>
</pre></div>
</li>
<li>
<p>Use <code>%r</code> only for regular expressions matching <em>more than</em> one '/' character.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="sr">%r(\s+)</span>

<span class="c1"># still bad</span>
<span class="sr">%r(^/(.*)$)</span>
<span class="c1"># should be /^\/(.*)$/</span>

<span class="c1"># good</span>
<span class="sr">%r(^/blog/2011/(.*)$)</span>
</pre></div>
</li>
</ul><h2>
<a name="hashes" class="anchor" href="#hashes"><span class="octicon octicon-link"></span></a>Hashes</h2>

<p>Use hashrocket syntax for Hash literals instead of the JSON style introduced in 1.9.</p>

<div class="highlight highlight-Ruby"><pre><span class="c1"># bad</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">login</span><span class="p">:</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="nb">name</span><span class="p">:</span> <span class="s2">"Chris Wanstrath"</span>
<span class="p">}</span>

<span class="c1"># bad</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">login</span><span class="p">:</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="nb">name</span><span class="p">:</span> <span class="s2">"Chris Wanstrath"</span><span class="p">,</span>
<span class="s2">"followers-count"</span> <span class="o">=&gt;</span> <span class="mi">52390235</span>
<span class="p">}</span>

<span class="c1"># good</span>
<span class="n">user</span> <span class="o">=</span> <span class="p">{</span>
<span class="ss">:login</span> <span class="o">=&gt;</span> <span class="s2">"defunkt"</span><span class="p">,</span>
<span class="ss">:name</span> <span class="o">=&gt;</span> <span class="s2">"Chris Wanstrath"</span><span class="p">,</span>
<span class="s2">"followers-count"</span> <span class="o">=&gt;</span> <span class="mi">52390235</span>
<span class="p">}</span>
</pre></div>

<h2>
<a name="above-all-else" class="anchor" href="#above-all-else"><span class="octicon octicon-link"></span></a>Above all else</h2>

<p>Follow your <img class="emoji" title=":heart:" alt=":heart:" src="https://github.global.ssl.fastly.net/images/icons/emoji/heart.png" height="20" width="20" align="absmiddle"></p></article>
AFTERHTML
    end

    it 'should diff in less than two seconds' do
      t = Time.now
      ProseDiff.html @before, @after
      elapsed = Time.now - t
      expect(elapsed).to be < 2.0
    end

  end

end