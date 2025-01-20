#include "goomba.h"

VALUE rb_cSelector;
static VALUE rb_eParseError;

static void selector_free(GoombaSelector *sel)
{
	css_selector_free(&sel->match);
	css_selector_free(&sel->reject);
	xfree(sel);
}

static VALUE rb_goomba_selector_new(VALUE klass, VALUE rb_selector)
{
	VALUE rb_match = Qnil, rb_reject = Qnil;
	GoombaSelector *sel;
	const char *error;
	int res = 0;

	if (rb_type(rb_selector) == T_HASH) {
		rb_match = rb_hash_lookup(rb_selector, CSTR2SYM("match"));
		if (!NIL_P(rb_match))
			Check_Type(rb_match, T_STRING);

		rb_reject = rb_hash_lookup(rb_selector, CSTR2SYM("reject"));
		if (!NIL_P(rb_reject))
			Check_Type(rb_reject, T_STRING);
	} else {
		rb_match = rb_selector;
		Check_Type(rb_match, T_STRING);
	}

	sel = xcalloc(1, sizeof(GoombaSelector));

	if (!NIL_P(rb_match))
		res = css_selector_parse(&sel->match, RSTRING_PTR(rb_match), RSTRING_LEN(rb_match), &error);

	if (!res && !NIL_P(rb_reject))
		res = css_selector_parse(&sel->reject, RSTRING_PTR(rb_reject), RSTRING_LEN(rb_reject), &error);

	if (res != 0) {
		selector_free(sel);
		rb_raise(rb_eParseError, "failed to parse CSS selector: %s", error);
	}

	VALUE rb_goomba_selector = Data_Wrap_Struct(klass, NULL, selector_free, sel);

	if (!NIL_P(rb_match))
	  rb_iv_set(rb_goomba_selector, "@match_selector", rb_match);

	if (!NIL_P(rb_reject))
	  rb_iv_set(rb_goomba_selector, "@reject_selector", rb_reject);

	return rb_goomba_selector;
}

void rb_goomba_selector_check(VALUE rb_selector)
{
	if (!rb_obj_is_kind_of(rb_selector, rb_cSelector))
		rb_raise(rb_eTypeError, "expected a Goomba::Selector instance, got %s", rb_obj_classname(rb_selector));
}

VALUE rb_goomba_selector_coerce(VALUE rb_selector)
{
	if (rb_obj_is_kind_of(rb_selector, rb_cSelector))
		return rb_selector;
	return rb_goomba_selector_new(rb_cSelector, rb_selector);
}

static VALUE
rb_goomba_selector_analyze(VALUE rb_self)
{
	GoombaSelector *selector;
	int matches;
	VALUE rb_matches;

	Data_Get_Struct(rb_self, GoombaSelector, selector);

	matches = css_selector_analyze(&selector->match);

	rb_matches = rb_ary_new();
	if (matches & MATCHES_ELEMENT)
		rb_ary_push(rb_matches, CSTR2SYM("elements"));
	if (matches & MATCHES_TEXT)
		rb_ary_push(rb_matches, CSTR2SYM("text"));

	return rb_matches;
}

static VALUE
rb_goomba_selector_jit_bang(VALUE rb_self)
{
	GoombaSelector *selector;
	Data_Get_Struct(rb_self, GoombaSelector, selector);

	if (selector->match.bytecode)
		css_selector_jit(&selector->match);

	if (selector->reject.bytecode)
		css_selector_jit(&selector->reject);

	return rb_self;
}

static VALUE
rb_goomba_selector_jit_code(VALUE rb_self)
{
	VALUE rb_code;
	GoombaSelector *selector;
	Data_Get_Struct(rb_self, GoombaSelector, selector);

	rb_code = rb_hash_new();

	if (selector->match.bytecode) {
		css_selector_jit(&selector->match);
		rb_hash_aset(rb_code, CSTR2SYM("match"),
			rb_str_new((void *)selector->match.compiled, selector->match.memsize));
	}

	if (selector->reject.bytecode) {
		css_selector_jit(&selector->reject);
		rb_hash_aset(rb_code, CSTR2SYM("reject"),
			rb_str_new((void *)selector->reject.compiled, selector->reject.memsize));
	}

	return rb_code;
}

static VALUE
rb_goomba_selector_can_jit(VALUE rb_self)
{
	return css_selector_can_jit() ? Qtrue : Qfalse;
}

void Init_goomba_selector(void)
{
	rb_cSelector = rb_define_class_under(rb_mGoomba, "Selector", rb_cObject);
	rb_undef_alloc_func(rb_cSelector);
	rb_define_singleton_method(rb_cSelector, "new", rb_goomba_selector_new, 1);
	rb_define_singleton_method(rb_cSelector, "can_jit?", rb_goomba_selector_can_jit, 0);
	rb_define_method(rb_cSelector, "analyze_matches", rb_goomba_selector_analyze, 0);
	rb_define_method(rb_cSelector, "jit!", rb_goomba_selector_jit_bang, 0);
	rb_define_method(rb_cSelector, "_native_code", rb_goomba_selector_jit_code, 0);

	rb_eParseError = rb_define_class_under(rb_cSelector, "ParseError", rb_eStandardError);
}
