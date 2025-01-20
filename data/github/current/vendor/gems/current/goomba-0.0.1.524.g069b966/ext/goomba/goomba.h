#ifndef _GOOMBA_H_RUBY
#define _GOOMBA_H_RUBY

#include <assert.h>
#include <ruby.h>
#include <ruby/encoding.h>
#include "goomba_css.h"
#include "strbuf.h"
#include "gumbo.h"

#define ARRAY_SIZE(arr) (sizeof(arr) / sizeof((arr)[0]))
#define likely(x) __builtin_expect((x),1)
#define unlikely(x) __builtin_expect((x),0)
#define CSTR2SYM(s) (ID2SYM(rb_intern((s))))
#define OPTHASH_GIVEN_P(opts) \
    (argc > 0 && !NIL_P((opts) = rb_check_hash_type(argv[argc-1])) && (--argc, 1))
#define MAX_CUSTOM_TAG_LENGTH 128
#define MAX_ATTR_VALUE_LENGTH 0x8000

static inline VALUE
strbuf_to_rb(GumboStringBuffer *buffer, bool do_free)
{
	VALUE rb_out = rb_enc_str_new(buffer->data, buffer->length, rb_utf8_encoding());
	if (do_free) strbuf_free(buffer);
	return rb_out;
}

enum {
	GOOMBA_SANITIZER_ALLOW = (1 << 0),
	GOOMBA_SANITIZER_REMOVE_CONTENTS = (1 << 1),
	GOOMBA_SANITIZER_WRAP_WS = (1 << 2),
};

/** Document */
typedef struct {
	GumboOutput *output;

        // Gumbo requires that the buffer lives as long as the tree of nodes, so
        // we keep a copy here which we use for parsing and must free it when we
        // free the goomba document. This also relies on any nodes referencing
        // back to the document object.
        const char *buffer;
} GoombaDocument;

static inline GumboOutput *document_get_output(VALUE rb_document) {
    GoombaDocument *document;
    Data_Get_Struct(rb_document, GoombaDocument, document);
    return document->output;
}

extern VALUE rb_mGoomba;
extern VALUE rb_cDocument;
extern VALUE rb_cDocumentFragment;
extern VALUE rb_cSanitizer;
extern VALUE rb_cTextNode;
extern VALUE rb_cElementNode;

/** DOM helpers */
void goomba_reparent_children_at(GumboNode *parent, GumboVector *new_children,
	unsigned int pos_at, bool wrap);
void goomba_remove_child_at(GumboNode *parent, unsigned int pos_at, bool wrap);

/** CSS selectors */
typedef struct {
	CSS_Selector match;
	CSS_Selector reject;
} GoombaSelector;

static inline bool
goomba_selector_match(const GoombaSelector *s, const GumboNode *node)
{
	if (s->match.bytecode && !css_selector_match(&s->match, node))
		return false;

	if (s->reject.bytecode && css_selector_match(&s->reject, node))
		return false;

	return true;
}

void rb_goomba_selector_check(VALUE rb_selector);
VALUE rb_goomba_selector_coerce(VALUE rb_selector);

void Init_goomba_document(void);
void Init_goomba_sanitizer(void);
void Init_goomba_serializer(void);
void Init_goomba_selector(void);

/** String set */
typedef struct StringSet {
	char **strings;
	uint32_t size;
	uint32_t alloc;
} StringSet;

void string_set_init(StringSet *set);
void string_set_insert(StringSet *set, const char *str);
void string_set_remove(StringSet *set, const char *str);
bool string_set_contains(const StringSet *set, const char *str);
VALUE string_set_to_rb(const StringSet *set);
void string_set_clear(StringSet *set);
void string_set_free(StringSet *set);

/** Sanitizer */
typedef struct {
	uint8_t flags[GUMBO_TAG_LAST];
	StringSet attr_allowed;
	StringSet class_allowed;
	StringSet custom_tags;
	StringSet extended_tags;
	st_table *element_sanitizers;
	char *name_prefix;
	int allow_comments:1;
} GoombaSanitizer;

typedef struct GoombaProtocolSanitizer {
	char *name;
	StringSet allowed;
	struct GoombaProtocolSanitizer *next;
} GoombaProtocolSanitizer;

typedef struct {
	size_t max_nested;
	StringSet attr_allowed;
	StringSet attr_required;
	StringSet class_allowed;
	GoombaProtocolSanitizer *protocols;
} GoombaElementSanitizer;

GoombaSanitizer *goomba_sanitizer_new(void);
void goomba_sanitizer_free(void *_sanitizer);
GoombaElementSanitizer *goomba_sanitizer_get_element(GoombaSanitizer *sanitizer, GumboTag t);
GoombaProtocolSanitizer *goomba_element_sanitizer_get_proto(
		GoombaElementSanitizer *elem, const char *proto);
void goomba_node_sanitize(const GoombaSanitizer *sanitizer, GumboNode *node);

/** Serializer */
void goomba_element_to_s(GumboStringBuffer *out, GumboElement *element);
void goomba_node_serialize(GumboStringBuffer *out, GumboNode *node);
void goomba_escape_html(GumboStringBuffer *out, const char *src,
	long size, bool in_attribute);

/** Search */
VALUE rb_goomba_find_names(VALUE rb_self, bool map_to_nodes);
VALUE rb_goomba_select(VALUE rb_self, VALUE rb_selector);

/** Common */
void goomba_set_element_flags(GoombaSanitizer *sanitizer, VALUE rb_el, bool set, int flag);
VALUE goomba_tag_to_rb(GumboTag tag);
GumboTag goomba_tag_from_rb(GoombaSanitizer *sanitizer, VALUE rb_tag);
void goomba_strcheck(VALUE rb_str);

/** Document */
VALUE goomba_node_alloc(VALUE klass, VALUE rb_document, GumboNode *node);
VALUE goomba_node_to_rb(VALUE rb_document, GumboNode *node);
VALUE goomba_parse_to_rb(VALUE klass, VALUE rb_text, GumboTag fragment_ctx);

/** Perf */
double goomba_get_ms(void);
void goomba_stats(VALUE rb_stats, const char *statname, int count, double value);

/** Interned IDs */
extern ID g_id_stats;
extern ID g_id_call;
extern ID g_id_html;
extern ID g_id_selector;
extern ID g_id_halt_further_filters;

#endif
