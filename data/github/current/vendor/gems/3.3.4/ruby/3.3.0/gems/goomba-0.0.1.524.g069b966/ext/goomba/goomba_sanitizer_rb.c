#include <ruby/util.h>
#include "goomba.h"

VALUE rb_cSanitizer;
ID rb_goomba_id_relative;

static VALUE
rb_goomba_sanitizer_get_all_flags(VALUE rb_self)
{
	VALUE rb_flags = rb_hash_new();
	GoombaSanitizer *sanitizer;
	long i;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	for (i = 0; i < GUMBO_TAG_LAST; ++i) {
		if (sanitizer->flags[i]) {
			rb_hash_aset(rb_flags,
				goomba_tag_to_rb((GumboTag)i),
				INT2FIX(sanitizer->flags[i]));
		}
	}

	return rb_flags;
}

static int
each_element_sanitizer(st_data_t _tag, st_data_t _ef, st_data_t _payload)
{
	GumboTag tag = (GumboTag)_tag;
	GoombaElementSanitizer *ef = (GoombaElementSanitizer *)_ef;
	VALUE rb_allowed = (VALUE)_payload;

	rb_hash_aset(rb_allowed, goomba_tag_to_rb(tag), string_set_to_rb(&ef->attr_allowed));
	return ST_CONTINUE;
}

static int
each_element_sanitizer_limit(st_data_t _tag, st_data_t _ef, st_data_t _payload)
{
	GumboTag tag = (GumboTag)_tag;
	GoombaElementSanitizer *ef = (GoombaElementSanitizer *)_ef;
	VALUE rb_allowed = (VALUE)_payload;

	if (!(ef->max_nested == 0))
		rb_hash_aset(rb_allowed, goomba_tag_to_rb(tag), INT2NUM(ef->max_nested));

	return ST_CONTINUE;
}

static VALUE
rb_goomba_sanitizer_allowed_attributes(VALUE rb_self)
{
	VALUE rb_allowed = rb_hash_new();
	GoombaSanitizer *sanitizer;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	if (sanitizer->attr_allowed.size)
		rb_hash_aset(rb_allowed, ID2SYM(rb_intern("all")), string_set_to_rb(&sanitizer->attr_allowed));

	st_foreach(sanitizer->element_sanitizers, &each_element_sanitizer, (st_data_t)rb_allowed);

	return rb_allowed;
}

static VALUE
rb_goomba_sanitizer_get_limit_nesting(VALUE rb_self)
{
	VALUE rb_limit = rb_hash_new();
	GoombaSanitizer *sanitizer;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	st_foreach(sanitizer->element_sanitizers, &each_element_sanitizer_limit, (st_data_t)rb_limit);

	return rb_limit;
}

static VALUE
rb_goomba_sanitizer_set_flag(VALUE rb_self,
	VALUE rb_element, VALUE rb_flag, VALUE rb_bool)
{
	GoombaSanitizer *sanitizer;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);
	Check_Type(rb_flag, T_FIXNUM);
	goomba_set_element_flags(sanitizer, rb_element,
		RTEST(rb_bool), FIX2INT(rb_flag));
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_set_all_flags(VALUE rb_self, VALUE rb_flag, VALUE rb_bool)
{
	long i;
	uint8_t flag;
	GoombaSanitizer *sanitizer;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	Check_Type(rb_flag, T_FIXNUM);
	flag = FIX2INT(rb_flag);

	if (RTEST(rb_bool)) {
		for (i = 0; i < GUMBO_TAG_UNKNOWN; ++i)
			sanitizer->flags[i] |= flag;
	} else {
		for (i = 0; i < GUMBO_TAG_UNKNOWN; ++i)
			sanitizer->flags[i] &= ~flag;
	}
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_limit_nesting(VALUE rb_self, VALUE rb_elem, VALUE rb_nested)
{
	int nested;
	GoombaSanitizer *sanitizer;
	GumboTag tag;
	GoombaElementSanitizer *ef;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	Check_Type(rb_nested, T_FIXNUM);
	nested = FIX2INT(rb_nested);

	if (nested >= 0) {
		tag = goomba_tag_from_rb(sanitizer, rb_elem);
		ef = goomba_sanitizer_get_element(sanitizer, tag);

		ef->max_nested = (size_t)nested;
	}

	return Qnil;
}

static VALUE
rb_goomba_sanitizer_allowed_protocols(VALUE rb_self,
	VALUE rb_element, VALUE rb_attribute, VALUE rb_allowed)
{
	GoombaSanitizer *sanitizer;
	GoombaElementSanitizer *element_f = NULL;
	GoombaProtocolSanitizer *proto_f = NULL;
	long i;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);
	element_f = goomba_sanitizer_get_element(sanitizer,
		goomba_tag_from_rb(sanitizer, rb_element));

	Check_Type(rb_attribute, T_STRING);
	proto_f = goomba_element_sanitizer_get_proto(element_f,
		StringValueCStr(rb_attribute));

	Check_Type(rb_allowed, T_ARRAY);
	string_set_clear(&proto_f->allowed);

	for (i = 0; i < RARRAY_LEN(rb_allowed); ++i) {
		VALUE rb_proto = RARRAY_AREF(rb_allowed, i);
		const char *protocol = NULL;

		if (SYMBOL_P(rb_proto) &&
			SYM2ID(rb_proto) == rb_goomba_id_relative) {
			protocol = "/";
		} else {
			Check_Type(rb_proto, T_STRING);
			rb_funcall(rb_proto, rb_intern("downcase!"), 0);
			protocol = StringValueCStr(rb_proto);
		}

		string_set_insert(&proto_f->allowed, protocol);
	}
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_set_allow_comments(VALUE rb_self, VALUE rb_bool)
{
	GoombaSanitizer *sanitizer;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);
	sanitizer->allow_comments = RTEST(rb_bool);
	return rb_bool;
}

static VALUE
rb_goomba_sanitizer_get_allow_comments(VALUE rb_self)
{
	GoombaSanitizer *sanitizer;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	if (sanitizer->allow_comments) {
		return Qtrue;
	} else {
		return Qfalse;
	}
}

static VALUE
rb_goomba_sanitizer_set_name_prefix(VALUE rb_self, VALUE rb_prefix)
{
	GoombaSanitizer *sanitizer;
	const char *prefix = NULL;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	if (!NIL_P(rb_prefix))
		prefix = StringValueCStr(rb_prefix);

        xfree(sanitizer->name_prefix);
	if (!prefix || !prefix[0]) {
		sanitizer->name_prefix = NULL;
	} else {
		sanitizer->name_prefix = ruby_strdup(prefix);
	}

	return rb_prefix;
}

static VALUE
rb_goomba_sanitizer_get_name_prefix(VALUE rb_self)
{
	GoombaSanitizer *sanitizer;
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);
	if (sanitizer->name_prefix == NULL) {
		return Qnil;
	}
	return rb_locale_str_new_cstr(sanitizer->name_prefix);
}

static void
set_in_stringset(StringSet *set, VALUE rb_attr, bool allow)
{
	goomba_strcheck(rb_attr);
	if (allow)
		string_set_insert(set, StringValueCStr(rb_attr));
	else
		string_set_remove(set, StringValueCStr(rb_attr));
}

static VALUE
rb_goomba_sanitizer_allowed_attribute(VALUE rb_self,
	VALUE rb_elem, VALUE rb_attr, VALUE rb_allow)
{
	GoombaSanitizer *sanitizer;
	StringSet *set = NULL;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	if (rb_elem == CSTR2SYM("all")) {
		set = &sanitizer->attr_allowed;
	} else {
		GumboTag tag = goomba_tag_from_rb(sanitizer, rb_elem);
		GoombaElementSanitizer *ef = goomba_sanitizer_get_element(sanitizer, tag);
		set = &ef->attr_allowed;
	}

	set_in_stringset(set, rb_attr, RTEST(rb_allow));
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_required_attribute(VALUE rb_self,
	VALUE rb_elem, VALUE rb_attr, VALUE rb_req)
{
	GoombaSanitizer *sanitizer;
	GumboTag tag;
	GoombaElementSanitizer *ef;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	tag = goomba_tag_from_rb(sanitizer, rb_elem);
	ef = goomba_sanitizer_get_element(sanitizer, tag);

	set_in_stringset(&ef->attr_required, rb_attr, RTEST(rb_req));
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_allowed_class(VALUE rb_self,
	VALUE rb_elem, VALUE rb_class, VALUE rb_allow)
{
	GoombaSanitizer *sanitizer;
	StringSet *set = NULL;

	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	if (rb_elem == CSTR2SYM("all")) {
		set = &sanitizer->class_allowed;
	} else {
		GumboTag tag = goomba_tag_from_rb(sanitizer, rb_elem);
		GoombaElementSanitizer *ef = goomba_sanitizer_get_element(sanitizer, tag);
		set = &ef->class_allowed;
	}

	set_in_stringset(set, rb_class, RTEST(rb_allow));
	return Qnil;
}

static VALUE
rb_goomba_sanitizer_new(VALUE klass)
{
	GoombaSanitizer *sanitizer = goomba_sanitizer_new();
	return Data_Wrap_Struct(klass, NULL, &goomba_sanitizer_free, sanitizer);
}

void Init_goomba_sanitizer(void)
{
	rb_goomba_id_relative = rb_intern("relative");

	rb_cSanitizer = rb_define_class_under(rb_mGoomba, "Sanitizer", rb_cObject);
	rb_undef_alloc_func(rb_cSanitizer);
	rb_define_singleton_method(rb_cSanitizer, "new", rb_goomba_sanitizer_new, 0);

	rb_define_method(rb_cSanitizer, "set_flag", rb_goomba_sanitizer_set_flag, 3);
	rb_define_method(rb_cSanitizer, "set_all_flags", rb_goomba_sanitizer_set_all_flags, 2);
	rb_define_method(rb_cSanitizer, "limit_nesting", rb_goomba_sanitizer_limit_nesting, 2);
	rb_define_method(rb_cSanitizer, "element_flags", rb_goomba_sanitizer_get_all_flags, 0);
	rb_define_method(rb_cSanitizer, "allowed_attributes", rb_goomba_sanitizer_allowed_attributes, 0);

	rb_define_method(rb_cSanitizer, "allow_comments=", rb_goomba_sanitizer_set_allow_comments, 1);
	rb_define_method(rb_cSanitizer, "allowed_comments", rb_goomba_sanitizer_get_allow_comments, 0);
	rb_define_method(rb_cSanitizer, "name_prefix=", rb_goomba_sanitizer_set_name_prefix, 1);
	rb_define_method(rb_cSanitizer, "name_prefix", rb_goomba_sanitizer_get_name_prefix, 0);
	rb_define_method(rb_cSanitizer, "get_limit_nesting", rb_goomba_sanitizer_get_limit_nesting, 0);

	rb_define_method(rb_cSanitizer, "set_allowed_attribute",
		rb_goomba_sanitizer_allowed_attribute, 3);

	rb_define_method(rb_cSanitizer, "set_required_attribute",
		rb_goomba_sanitizer_required_attribute, 3);

	rb_define_method(rb_cSanitizer, "set_allowed_class",
		rb_goomba_sanitizer_allowed_class, 3);

	rb_define_method(rb_cSanitizer, "set_allowed_protocols",
		rb_goomba_sanitizer_allowed_protocols, 3);

	rb_define_const(rb_cSanitizer, "ALLOW",
		INT2FIX(GOOMBA_SANITIZER_ALLOW));
	rb_define_const(rb_cSanitizer, "REMOVE_CONTENTS",
		INT2FIX(GOOMBA_SANITIZER_REMOVE_CONTENTS));
	rb_define_const(rb_cSanitizer, "WRAP_WHITESPACE",
		INT2FIX(GOOMBA_SANITIZER_WRAP_WS));
	rb_define_const(rb_cSanitizer, "MAX_ATTR_VALUE_LENGTH",
		INT2FIX(MAX_ATTR_VALUE_LENGTH));
}
