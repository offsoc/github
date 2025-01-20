**What is this? I don't even ...**

This small section of github.com handles the process of executing searches
against the ElasticSearch index. Each type of query is represented as a
`Query` object, and each `Query` object is responsible for searching one type
of information in an ElasticSearch index. The search process is broken down
into several steps:

* parse the user's search phrase
* create a `Query` object from the parsed search phrase
* execute the query against the ElasticSearch index
* process the search results into a normalized form

The purpose of this document is to walk through these steps and provide a
rational for why they exist and a common language for talking about this
search process.


## Parse

**Never trust the user!**

The search phrase typed in by the user can contain a few different elements.
Most obvious are the actual query terms the user is interested in finding;
these are the relevant words the user is trying to find more information
about. "wookie", "puppy", "id_rsa", "vim keybindings" are all examples of
query terms.

The search phrase can also contain filters. These are terms that restrict the
set of returned search documents based on some criteria. A good example is
restricting the search results to a single organization via the "@github"
filter. Other filters are expressed as "key:value" pairs where the "key" is
one of the fields stored in the search index and the "value" filters search
results to only those documents whose "key" is "value". An example of this
would be filtering repositories based on their "created_at" key. Here the
value is a date or a date range.

Some example search phrases:

* pants @github
* json path:Gemfile -path:Gemfile.lock
* "search terms" created:>2012-12-31

The search phrase is parsed into three different artifacts: the query terms,
the positive filters, and the negative filters. The query terms are returned
as a string, and the filters are returned as hashes of keys and values. The
negative filters are simply those filters whose key starts with a `-`
characters; these filters return documents that do **not** match the filter -
the opposite of the positive filters.

#### Query Terms

The query terms are passed to the ElasticSearch cluster. The actual search is
performed on these terms, and the filters are used to refine the returned
documents.

ElasticSearch is built on top of the Lucene search library. Special characters
can be included in the query terms that affect how Lucene will process the
query. The most familiar of these is the wild-card `*` character. Unfortunately
these special characters dramatically affect search performance (mostly
negatively) and so we escape all these special characters when found in the
query terms.

The one exception we make to this escaping rule is the quote `"` character. It
is used to indicate that the terms found inside the quotes should appear as-is
in the returned documents.

When the words `AND`, `OR,` and `NOT` appear, they instruct Lucene how to
treat the following terms. The `AND` operator indicates that both terms must
appear in returned documents: "foo AND bar". The `OR` operator does just the
opposite; a returned document can contain either term or both: "dog OR cat".
Finally the `NOT` operator excludes documents that contains the term. The
phrase "dog NOT cat" would return documents that contain `dog` and do **not**
contain `cat`.

#### Query Filters

The query filters refine the document set found by ElasticSearch when it
matched the query terms. Both processes - finding documents that match the
query terms and the filtering of those documents - take place entirely inside
ElasticSearch (just to clarify). We get the results back when both processes
are complete.

Query filters passed in by the user are transformed into specific `Filter`
objects. These `Filter` objects are used by `Query` objects to generate the
JSON filter constructs that get passed to ElasticSearch. The `Filter` objects
parse the filters values into a format usable by ElasticSearch; hence they
define the syntax for the filter values used by the users in their search
phrases. We have `Filter` objects for each type of data that can be filtered
on.


## Query

**In the immortal words of Socrates: "I drank what?"**

After the search phrase has been parsed into query terms and filter terms, the
actual process of querying the search index can take place. This is handled by
`Query` objects. There are specific `Query` objects for each kind of search
the user can perform - code search, issue search, repository search, user
search.

#### Query Object

The `Query` object is at the center of the search process. It orchestrates the
interactions of the various other search objects, and it handles the overall
flow of the search process. There is a specific `Query` object for each type
of search the user can perform. The common functionality is shared via the
`Query` superclass, and each specific query type tailors the search process
for the information type being searched.

To understand this a little better let's talk briefly about the major
components and an ElasticSearch search. ElasticSearch talks JSON, and a search
is simply a JSON document that is sent to ElasticSearch. There are five
top-level keys in this JSON document:

* [query](https://www.elastic.co/guide/en/elasticsearch/reference/master/search-your-data.html)
* [filter](https://www.elastic.co/guide/en/elasticsearch/reference/master/filter-search-results.html)
* [aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/master/search-aggregations.html)
* [highlight](https://www.elastic.co/guide/en/elasticsearch/reference/master/highlighting.html)
* [sort](https://www.elastic.co/guide/en/elasticsearch/reference/master/sort-search-results.html)

The `Query` objects build this JSON search document section by section, and
then issue the search request to ElasticSearch. You will see various `build_*`
methods either in the specific `Query` objects or in the superclass.

The building of the filter section is the most involved. It combines the query
filters from the user with the filters we need for security. Each user can see
their own private information but not the private information of other users.
We need to ensure this data separation applies to the search results as well.
Each document in the search index contains the database record ID of the
repository the document belongs to. We issue a permissions query to the
database to get a list of all repositories the user is allowed to view. This
list is used as a filter to restrict the returned search documents.

The remaining sections are very specific to the type of data being queried.
They depend entirely on the type of data stored in ElasticSearch for the
particular document type being queried.

The `aggregations` section is interesting and bears talking about a little bit. It
provides data on the language types of the search results. Wherever possible,
we include a language field in the documents stored in ElasticSearch. For
users this is their primary coding language. For repositories this is the
primary language of the repo. Issues and milestones inherit the language of
the repository. And for code we determine the language via the
[Linguist](https://github.com/github-linguist/linguist) library.

The aggregations break the search into buckets by language. It shows the number of
documents that would be returned by the exact same search but restricted to
just that one particular language. You can see these aggregations in the left
sidebar of the main [search results](https://github.com/search?q=pugs) page.

Finally, the `Query` objects curate the results returned from ElasticSearch.
If a document has been removed from the database or if the owner of the
document has been flagged as spammy, we immediately schedule a task to repair
the search index. This repair brings the search index back into sync with the
state of the database records. We'll talk a little bit more about this in the
normalization section below.


## Normalize

**You're a unique and special snowflake just like everyone else.**

ElasticSearch returns JSON documents containing the original indexed document
or just the requested document fields. Depending upon the parameters used for
the search, the structure of the response can vary. We normalize the responses
into Ruby objects - usually structs for nicer field access.

However, you cam pass a Normalizer object to the `Query` and it will be used
to tailor the results to whatever format you need. The only requirement on the
Normalizer is that it responds to the `call` method. So a lambda is a
perfectly acceptable. Each `Query` object is documented with the types passed
to the `Normalizer#call` method.

Before normalization a sanity check is performed on the results. Documents
that exist in the search index but have been removed from the database are
pruned from the result list; a background job is issued for that document to
remove it from the search index. Similar checks are performed for spamminess;
those documents get deleted, too.


## Nomenclature

**You keep using that word. I do not think it means what you think it means.**

* **query filter** - the user supplied terms used by ElasticSearch to filter
  the documents that match the query terms
* **query term** - the user supplied terms used by ElasticSearch to search the
  stored documents
* **search** - the process of taking a search phrase, constructing a query,
  executing the query against an ElasticSearch index, and returning the
  results
* **search phrase** - the text typed by a user into a search form (or a robot
  cause I'm not carbon biased)

