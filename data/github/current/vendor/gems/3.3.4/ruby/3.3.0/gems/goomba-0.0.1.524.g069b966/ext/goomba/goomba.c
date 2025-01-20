#include "goomba.h"

VALUE rb_mGoomba;

static ID g_GoombaTagNames[GUMBO_TAG_LAST];

VALUE goomba_tag_to_rb(GumboTag tag)
{
	if (tag < GUMBO_TAG_UNKNOWN)
		return ID2SYM(g_GoombaTagNames[tag]);
	return Qnil;
}

const char* rb_tag_to_char(VALUE rb_tag) {
	if (SYMBOL_P(rb_tag)) {
		return rb_id2name(SYM2ID(rb_tag));
	} else {
		return StringValueCStr(rb_tag);
	}
}

bool is_custom_tag(const char *tag_name) {
	size_t len = strlen(tag_name);
	if (len < 2) return false;
	if (len > MAX_CUSTOM_TAG_LENGTH) return false;
	// A valid custom element name is a sequence of characters name that meets all of the following requirements:
	// name must match the PotentialCustomElementName production:
	// PotentialCustomElementName ::= [a-z] (PCENChar)* '-' (PCENChar)*
	// PCENChar ::= "-" | "." | [0-9] | "_" | [a-z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
	// See https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
	if (tag_name[0] < 'a' || tag_name[0] > 'z') return false;
	bool has_dash = false;
	size_t i;
	for (i=1; i < len; i++) {
		if (tag_name[i] == '-') has_dash = true;
		if (tag_name[i] < '0' && tag_name[i] != '-' && tag_name[i] != '.') return false;
		if (tag_name[i] > '9' && tag_name[i] < 'a' && tag_name[i] != '_') return false;
	}
	return has_dash;
}

GumboTag goomba_tag_from_rb(GoombaSanitizer *sanitizer, VALUE rb_tag)
{
	const char *tag_name = rb_tag_to_char(rb_tag);
	GumboTag t;

	if ((t = gumbo_tag_enum(tag_name)) == GUMBO_TAG_UNKNOWN) {
		if (is_custom_tag(tag_name)) {
			return GUMBO_TAG_UNKNOWN;
		} else if (string_set_contains(&sanitizer->extended_tags, tag_name)) {
			return GUMBO_TAG_UNKNOWN;
		}

		rb_raise(rb_eArgError, "unknown HTML5 tag: '%s'", tag_name);
	}

	return t;
}

static void
set_element_flags_1(GoombaSanitizer *sanitizer, VALUE rb_tag, bool set, int flag)
{
	GumboTag t = goomba_tag_from_rb(sanitizer, rb_tag);
	if (t == GUMBO_TAG_UNKNOWN) {
		string_set_insert(&sanitizer->custom_tags, rb_tag_to_char(rb_tag));
	}
	if (set) sanitizer->flags[(int)t] |= flag;
	else sanitizer->flags[(int)t] &= ~flag;
}

void goomba_set_element_flags(GoombaSanitizer *sanitizer, VALUE rb_el, bool set, int flag)
{
	if (RB_TYPE_P(rb_el, T_ARRAY)) {
		long i;
		for (i = 0; i < RARRAY_LEN(rb_el); ++i)
			set_element_flags_1(sanitizer, RARRAY_AREF(rb_el, i), set, flag);
	}
	else {
		set_element_flags_1(sanitizer, rb_el, set, flag);
	}
}

void goomba_strcheck(VALUE rb_str)
{
	Check_Type(rb_str, T_STRING);
	if (ENCODING_GET_INLINED(rb_str) != rb_utf8_encindex())
		rb_raise(rb_eEncodingError, "Expected UTF8 encoding");
}

__attribute__ ((visibility ("default"))) void Init_goomba(void)
{
	for (GumboTag x = 0; x < GUMBO_TAG_LAST; ++x)
		g_GoombaTagNames[x] = rb_intern(gumbo_normalized_tagname(x));

	rb_mGoomba = rb_define_module("Goomba");
	Init_goomba_document();
	Init_goomba_sanitizer();
	Init_goomba_serializer();
	Init_goomba_selector();
}
