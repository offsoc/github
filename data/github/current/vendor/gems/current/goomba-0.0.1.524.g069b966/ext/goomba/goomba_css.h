#ifndef _GOOMBA_H_CSS
#define _GOOMBA_H_CSS

#include <stdint.h>
#include "gumbo.h"

enum PseudoClass_Position {
	PSEUDO_FIRST_CHILD,
	PSEUDO_LAST_CHILD,
	PSEUDO_FIRST_OF_TYPE,
	PSEUDO_LAST_OF_TYPE,
	PSEUDO_ONLY_CHILD,
	PSEUDO_ONLY_OF_TYPE,
};

enum PseudoClass_PositionNth {
	PSEUDO_NTH_CHILD,
	PSEUDO_NTH_LAST_CHILD,
	PSEUDO_NTH_OF_TYPE,
	PSEUDO_NTH_LAST_OF_TYPE,
};

enum PseudoClass_Custom {
	PSEUDO_C_FIRST_CHILD_NODE,
	PSEUDO_C_LAST_CHILD_NODE,
	PSEUDO_C_ONLY_CHILD_NODE
};

enum SelectionOp {
	SELECT_ALL = 0x0,
	SELECT_AND,
	SELECT_OR,
	SELECT_NOT,
	SELECT_COMBINATOR,
	SELECT_ANY_ELEMENT,
	SELECT_ELEMENT,
	SELECT_ELEMENT_CUSTOM,
	SELECT_ATTRIBUTE,
	SELECT_ATTRIBUTE_VALUE,
  SELECT_ATTRIBUTE_VALUE_INSENSITIVE,
  SELECT_NS_ATTRIBUTE_ANY,
	SELECT_PSEUDO_POSITION,
	SELECT_PSEUDO_CUSTOM,
	SELECT_PSEUDO_NTH,
	SELECT_PSEUDO_ROOT,
	SELECT_PSEUDO_EMPTY,
	SELECT_NS,
	SELECT_NS_ANY,
	SELECT_TEXT,
	SELECT_COMMENT,
};

enum {
	MATCHES_ELEMENT = 0x1,
	MATCHES_TEXT = 0x2,
	MATCHES_ALL = MATCHES_ELEMENT|MATCHES_TEXT,
};

extern const char *GoombaPseudoClassNames[];

typedef struct {
	uint8_t *bytecode;
	size_t bytesize;
	bool (*compiled)(const GumboNode*); 
	size_t memsize;
} CSS_Selector;

int css_selector_parse(CSS_Selector *sel, const char *text, size_t length, const char **err);
void css_selector_free(CSS_Selector *sel);
bool css_selector_match(const CSS_Selector *s, const GumboNode *node);
int css_selector_analyze(const CSS_Selector *s);
void css_selector_jit(CSS_Selector *selector);
bool css_selector_can_jit(void);

#endif
