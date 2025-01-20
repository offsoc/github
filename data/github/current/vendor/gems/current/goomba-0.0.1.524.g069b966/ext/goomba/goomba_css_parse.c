#define _GNU_SOURCE 1
#include <ctype.h>
#include <sys/mman.h>
#include "goomba_css.h"
#include "strbuf.h"
#include "util.h"
#include "css_lexer.h"

struct lexer {
	const char *error;
	yyscan_t yy;
	YY_BUFFER_STATE buffer;
	char *s;
	int len, token;
};

static bool parse_selector_2(struct lexer *l, strbuf *out);

static void lex_init(struct lexer *lexer, const char *string, int len)
{
	yylex_init(&lexer->yy);

	while (len && gumbo_isspace(string[0])) {
		string++; len--;
	}

	while (len && gumbo_isspace(string[len - 1]))
		len--;

	lexer->buffer = yy_scan_bytes(string, len, lexer->yy);
	lexer->error = NULL;
	lexer->s = NULL;
	lexer->len = 0;
	lexer->token = 0;
}

static void lex_destroy(struct lexer *lexer)
{
	yy_delete_buffer(lexer->buffer, lexer->yy);
	yylex_destroy(lexer->yy);
}

static int add_codepoint(char *text, int pos, long c)
{
	int num_bytes, prefix, i;

	if (c <= 0x7f) {
		num_bytes = 0;
		prefix = 0;
	} else if (c <= 0x7ff) {
		num_bytes = 1;
		prefix = 0xc0;
	} else if (c <= 0xffff) {
		num_bytes = 2;
		prefix = 0xe0;
	} else {
		num_bytes = 3;
		prefix = 0xf0;
	}

	text[pos++] = prefix | (c >> (num_bytes * 6));
	for (i = num_bytes - 1; i >= 0; --i)
		text[pos++] = 0x80 | (0x3f & (c >> (i * 6)));

	return pos;
}

static int lex_unescape(char *text, int len)
{
	int i = 0, j = 0;

	while (i < len) {
		if (text[i] == '\\') {
			i++;
			if (isxdigit(text[i])) {
				char *end;
				long codepoint;

				codepoint = strtol(text + i, &end, 16);
				i = (end - text);

				if (gumbo_isspace(text[i]))
					i++;

				j = add_codepoint(text, j, codepoint);
			}
			continue;
		}

		text[j++] = text[i++];
	}
	return j;
}

static void lex_next(struct lexer *lexer)
{
	lexer->token = yylex(lexer->yy);
	lexer->s = yyget_text(lexer->yy);
	lexer->len = yyget_leng(lexer->yy);

	if (lexer->token == IDENT)
		lexer->len = lex_unescape(lexer->s, lexer->len);
}

static inline void lex_next_ws(struct lexer *lexer)
{
	lex_next(lexer);
	if (lexer->token == S)
		lex_next(lexer);
}

static inline bool lex_number(int *number, const struct lexer *lexer)
{
	char *end;

	if (lexer->token != NUMBER)
		return false;

	*number = (int)strtol(lexer->s, &end, 10);
	return end == (lexer->s + lexer->len);
}

static inline bool lex_dimension(int *number, const struct lexer *lexer)
{
	char *end;
	*number = (int)strtol(lexer->s, &end, 10);
	return end == (lexer->s + lexer->len - 1) && *end == 'n';
}

#define ENSURE(l, pred, msg) if (!(pred)) { (l)->error = msg; return false; }
#define TOKEN_IS(l, str) \
	((l)->len == sizeof(str) - 1 && !memcmp((l)->s, str, sizeof(str) - 1))

static bool parse_hash(struct lexer *l, strbuf *out)
{
	strbuf_putc(out, SELECT_ATTRIBUTE_VALUE);
	strbuf_putc(out, '=');
	strbuf_puts(out, "id");
	strbuf_putc(out, 0);
	strbuf_put(out, l->s + 1, l->len - 1);
	strbuf_putc(out, 0);
	return true;
}

static bool parse_dot(struct lexer *l, strbuf *out)
{
	lex_next(l);
	ENSURE(l, l->token == IDENT, "Identifier expected");

	strbuf_putc(out, SELECT_ATTRIBUTE_VALUE);
	strbuf_putc(out, '~');
	strbuf_puts(out, "class");
	strbuf_putc(out, 0);
	strbuf_put(out, l->s, l->len);
	strbuf_putc(out, 0);
	return true;
}

static bool parse_brackets(struct lexer *l, strbuf *out)
{
	char *attr, *attr_ns, *value;
	int attr_len, attr_ns_len, value_len;

	lex_next_ws(l);
	ENSURE(l, l->token == IDENT, "Identifier expected");

	attr = l->s;
	attr_len = l->len;

	lex_next_ws(l);

	if (l->token == '|') {
		lex_next_ws(l);

		if (l->token == '*') {
			lex_next_ws(l);
			ENSURE(l, l->token == ']', "']' expected");

			strbuf_putc(out, SELECT_NS_ATTRIBUTE_ANY);
			strbuf_put(out, attr, attr_len);
			strbuf_putc(out, 0);

			return true;
		}

		ENSURE(l, l->token == IDENT, "Identifier or '*' expected after NS");

		attr_ns = attr;
		attr_ns_len = attr_len;

		attr = l->s;
		attr_len = l->len;

		lex_next_ws(l);
	} else {
		attr_ns = NULL;
		attr_ns_len = 0;
	}

	if (l->token == ']') {
		strbuf_putc(out, SELECT_ATTRIBUTE);
		if (attr_ns_len) {
			strbuf_put(out, attr_ns, attr_ns_len);
			strbuf_putc(out, ':');
		}
		strbuf_put(out, attr, attr_len);
		strbuf_putc(out, 0);
		return true;
	}

  int c = 0;
	switch (l->token) {
		case INCLUDES: c = '~'; break;
		case DASHMATCH: c = '|'; break;
		case PREFIXMATCH: c = '^'; break;
		case SUFFIXMATCH: c = '$'; break;
		case SUBSTRINGMATCH: c = '*'; break;
		case '=': c = '='; break;
		default: ENSURE(l, 0, "Invalid attribute comparison");
	}

	lex_next_ws(l);
	ENSURE(l, l->token == STRING || l->token == IDENT,
	       "Token is neither string nor identifier");

	value = l->s;
	value_len = l->len;

	if (l->token == STRING) {
		value += 1;
		value_len -= 2;
	}

  size_t ins_offset = out->length;
	strbuf_putc(out, SELECT_ATTRIBUTE_VALUE);
	strbuf_putc(out, c);
	if (attr_ns_len) {
		strbuf_put(out, attr_ns, attr_ns_len);
		strbuf_putc(out, ':');
	}
	strbuf_put(out, attr, attr_len);
	strbuf_putc(out, 0);
	strbuf_put(out, value, value_len);
	strbuf_putc(out, 0);

	lex_next_ws(l);

  if (l->token == IDENT && l->len == 1 && tolower(l->s[0]) == 'i') {
    lex_next_ws(l);
    out->data[ins_offset] = SELECT_ATTRIBUTE_VALUE_INSENSITIVE;
  }


	ENSURE(l, l->token == ']', "']' expected");
	return true;
}

#define CHECK_PCLASS(str) (sizeof(str) - 1 == len && !memcmp(str, t, len))

static bool parse_pseudo_class_1(struct lexer *l, strbuf *out)
{
	const char *t = l->s;
	const int len = l->len;

	/* Pseudo-classes that have their own bytecode */
	if (CHECK_PCLASS("root"))
		strbuf_putc(out, SELECT_PSEUDO_ROOT);
	else if (CHECK_PCLASS("empty"))
		strbuf_putc(out, SELECT_PSEUDO_EMPTY);
	else if (CHECK_PCLASS("text"))
		strbuf_putc(out, SELECT_TEXT);
	else if (CHECK_PCLASS("comment"))
		strbuf_putc(out, SELECT_COMMENT);

	/* Pseudo-classes composed in 2 bytes */
	else if (CHECK_PCLASS("first-child")) {
			strbuf_putc(out, SELECT_PSEUDO_POSITION);
			strbuf_putc(out, PSEUDO_FIRST_CHILD);
	}
	else if (CHECK_PCLASS("last-child")) {
			strbuf_putc(out, SELECT_PSEUDO_POSITION);
			strbuf_putc(out, PSEUDO_LAST_CHILD);
	}
	else if (CHECK_PCLASS("first-of-type")) {
		strbuf_putc(out, SELECT_PSEUDO_POSITION);
		strbuf_putc(out, PSEUDO_FIRST_OF_TYPE);
	}
	else if (CHECK_PCLASS("last-of-type")) {
		strbuf_putc(out, SELECT_PSEUDO_POSITION);
		strbuf_putc(out, PSEUDO_LAST_OF_TYPE);
	}
	else if (CHECK_PCLASS("only-child")) {
		strbuf_putc(out, SELECT_PSEUDO_POSITION);
		strbuf_putc(out, PSEUDO_ONLY_CHILD);
	}
	else if (CHECK_PCLASS("only-of-type")) {
		strbuf_putc(out, SELECT_PSEUDO_POSITION);
		strbuf_putc(out, PSEUDO_ONLY_OF_TYPE);
	}

	/* Custom pseudo-classes with 2 bytes */
	else if (CHECK_PCLASS("-goomba-first-child-node")) {
		strbuf_putc(out, SELECT_PSEUDO_CUSTOM);
		strbuf_putc(out, PSEUDO_C_FIRST_CHILD_NODE);
	}
	else if (CHECK_PCLASS("-goomba-last-child-node")) {
		strbuf_putc(out, SELECT_PSEUDO_CUSTOM);
		strbuf_putc(out, PSEUDO_C_LAST_CHILD_NODE);
	}
	else if (CHECK_PCLASS("-goomba-only-child-node")) {
		strbuf_putc(out, SELECT_PSEUDO_CUSTOM);
		strbuf_putc(out, PSEUDO_C_ONLY_CHILD_NODE);
	}

	/* no match */
	else {
		ENSURE(l, 0, "unknown pseudo-class");
	}
	return true;
}

static bool parse_pseudo_func_1(struct lexer *l, strbuf *out)
{
	const char *t = l->s;
	const int len = l->len - 1;

	strbuf_putc(out, SELECT_PSEUDO_NTH);

	if (CHECK_PCLASS("nth-child"))
		strbuf_putc(out, PSEUDO_NTH_CHILD);
	else if (CHECK_PCLASS("nth-last-child"))
		strbuf_putc(out, PSEUDO_NTH_LAST_CHILD);
	else if (CHECK_PCLASS("nth-of-type"))
		strbuf_putc(out, PSEUDO_NTH_OF_TYPE);
	else if (CHECK_PCLASS("nth-last-of-type"))
		strbuf_putc(out, PSEUDO_NTH_LAST_OF_TYPE);
	else {
		ENSURE(l, 0, "unknown pseudo-class function");
	}
	return true;
}

static bool parse_colon(struct lexer *l, strbuf *out)
{
	lex_next(l);
	ENSURE(l, l->token != ':', "unsupported '::' pseudo-class");

	if (l->token == IDENT) {
		if (!parse_pseudo_class_1(l, out))
			return false;
	} else if (l->token == FUNCTION) {
		int an = 0, b = 0;

		if (!parse_pseudo_func_1(l, out))
			return false;

		lex_next_ws(l);
		if (l->token == IDENT) {
			if (TOKEN_IS(l, "odd") || TOKEN_IS(l, "even")) {
				an = 2;
				b = TOKEN_IS(l, "odd") ? 1 : 0;
				lex_next(l);
				ENSURE(l, l->token == ')', "')' expected");
			}
			else if (TOKEN_IS(l, "n") || TOKEN_IS(l, "-n")) {
				an = TOKEN_IS(l, "n") ? 1 : -1;
				lex_next(l);
				if (l->token == PLUS) {
					lex_next_ws(l);
					ENSURE(l, lex_number(&b, l), "Number expected");
					lex_next(l);
					ENSURE(l, l->token == ')', "')' expected");
				} else if (l->token != ')') {
					ENSURE(l, 0, "')' expected");
				}
			} else {
				ENSURE(l, 0, "odd/even/n expected");
			}
		} else if (l->token == DIMENSION) {
			ENSURE(l, lex_dimension(&an, l), "Expression of form 'an' expected");
			lex_next(l);
			if (l->token == PLUS) {
				lex_next_ws(l);
				ENSURE(l, lex_number(&b, l), "Number expected");
				lex_next(l);
				ENSURE(l, l->token == ')', "')' expected");
			}
		} else if (l->token == NUMBER) {
			ENSURE(l, lex_number(&b, l), "Number expected");
			lex_next(l);
			ENSURE(l, l->token == ')', "')' expected");
		} else {
			ENSURE(l, 0, "Invalid expression");
		}

		ENSURE(l, an < 256, "function dimension too large");
		ENSURE(l, b < 256, "function size number too large");

		strbuf_putc(out, (uint8_t)an);
		strbuf_putc(out, (uint8_t)b);
	} else {
		ENSURE(l, 0, "Identifier or funtion expected");
	}
	return true;
}

static bool parse_not(struct lexer *l, strbuf *out)
{
	lex_next(l);
	strbuf_putc(out, SELECT_NOT);
	parse_selector_2(l, out);
	ENSURE(l, l->token == ')', "')' expected");
	return true;
}

static bool parse_ident(struct lexer *l, strbuf *out) {
	if (l->token == IDENT) {
		GumboTag tag = gumbo_tagn_enum(l->s, l->len);
		if (tag == GUMBO_TAG_UNKNOWN) {
			strbuf_putc(out, SELECT_ELEMENT_CUSTOM);
			strbuf_put(out, l->s, l->len);
			strbuf_putc(out, 0);
		} else {
			strbuf_putc(out, SELECT_ELEMENT);
			strbuf_putc(out, (uint8_t)tag);
		}
		return true;
	} else if (l->token == '*') {
		strbuf_putc(out, SELECT_ANY_ELEMENT);
		return true;
	}

	return false;
}

static bool parse_pipe(struct lexer *l, strbuf *out, size_t offset) {
	const char *tag = NULL;

	switch (out->data[offset]) {
	case SELECT_ELEMENT:
		tag = gumbo_normalized_tagname(out->data[offset + 1]);
		out->length = offset;
		strbuf_putc(out, SELECT_NS);
		strbuf_put(out, tag, strlen(tag));
		strbuf_putc(out, 0);
		break;
	case SELECT_ELEMENT_CUSTOM:
		out->data[offset] = SELECT_NS;
		break;
	case SELECT_ANY_ELEMENT:
		out->length = offset;
		strbuf_putc(out, SELECT_NS_ANY);
		break;
	default:
		ENSURE(l, 0, "unknown first instruction in parse_pipe");
	}

	lex_next(l);

	if (!parse_ident(l, out))
		ENSURE(l, 0, "expected ident or * after namespace");

	return true;
}

static bool parse_simple_sequence(struct lexer *l, strbuf *out)
{
	int count = 0;
	size_t offset = out->length;

	// [ type_selector | universal ]?
	if (parse_ident(l, out)) {
		count++;
		lex_next(l);
	}

	if (count && l->token == '|') {
		if (!parse_pipe(l, out, offset)) {
			return false;
		}
		lex_next(l);
		count++;
	}

	// [ HASH | class | attrib | pseudo | negation ]*
	while (l->token) {
		bool res = false;

		switch (l->token) {
		case HASH:
			res = parse_hash(l, out);
			break;
		case '.':
			res = parse_dot(l, out);
			break;
		case '[':
			res = parse_brackets(l, out);
			break;
		case ':':
			res = parse_colon(l, out);
			break;
		case NOT:
			res = parse_not(l, out);
			break;
		case ')':
		default:
			goto finish;
		}

		if (!res)
			return false;

		lex_next(l);
		count++;
	}

finish:
	if (count > 1) {
		uint8_t header[2];
		ENSURE(l, count < 256, "too many selectors in sequence");
		header[0] = SELECT_AND;
		header[1] = (uint8_t)count;
		strbuf_splice(offset, 0, (char *)header, 2, out);
	}
	return true;
}

static bool parse_selector_2(struct lexer *l, strbuf *out)
{
	size_t offset = out->length;
	strbuf right;
	strbuf_init(&right);

	if (l->token == S)
		lex_next(l);

	if (!parse_simple_sequence(l, out)) {
		strbuf_free(&right);
		return false;
	}

	while (l->token) {
		bool space = false;
		if (l->token == S) {
			space = true;
			lex_next(l);
		}

		char c = -1;
		switch (l->token) {
		case S: c = ' '; break;
		case PLUS: c = '+'; break;
		case GREATER: c = '>'; break;
		case TILDE: c = '~'; break;
		case 0: goto finish;
		default:
			if (space) c = ' ';
			else goto finish;
		}

		if (c != ' ')
			lex_next_ws(l);

		strbuf_putc(&right, SELECT_COMBINATOR);
		strbuf_putc(&right, (uint8_t)c);
		if (!parse_simple_sequence(l, &right)) {
			strbuf_free(&right);
			return false;
		}
		strbuf_splice(offset, 0, right.data, (int)right.length, out);
		strbuf_clear(&right);
	}

finish:
	strbuf_free(&right);
	return true;
}

static bool parse_selector_1(struct lexer *l, strbuf *out)
{
	int count = 0;

	for (;;) {
		lex_next(l);
		if (!l->token)
			break;

		count++;
		if (!parse_selector_2(l, out))
			return false;

		ENSURE(l, l->token == COMMA || l->token == 0,
			"unexpected end of string");
	}

	ENSURE(l, count < 256, "too many selectors in sequence");

	if (count == 0) {
		strbuf_putc(out, SELECT_ALL);
	} else if (count > 1) {
		uint8_t header[2];
		header[0] = SELECT_OR;
		header[1] = (uint8_t)count;
		strbuf_splice(0, 0, (char *)header, 2, out);
	}
	return true;
}

int css_selector_parse(CSS_Selector *sel, const char *text, size_t length, const char **err)
{
	strbuf output;
	struct lexer l;
	bool ok;

	lex_init(&l, text, length);
	strbuf_init(&output);
	ok = parse_selector_1(&l, &output);
	lex_destroy(&l);

	if (!ok) {
		strbuf_free(&output);
		if (err) *err = l.error;
		return -1;
	}

	sel->bytecode = (uint8_t *)output.data;
	sel->bytesize = output.length;
	sel->compiled = NULL;
	sel->memsize = 0;
	return 0;
}

void css_selector_free(CSS_Selector *sel)
{
	free(sel->bytecode);
	if (sel->compiled)
		munmap((void *)sel->compiled, sel->memsize);
}
