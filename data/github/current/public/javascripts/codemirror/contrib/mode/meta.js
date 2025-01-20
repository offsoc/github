(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('codemirror/lib/codemirror'), require('codemirror/mode/meta')) :
	typeof define === 'function' && define.amd ? define(['codemirror/lib/codemirror', 'codemirror/mode/meta'], factory) :
	(factory(global.CodeMirror,global.undefined));
}(this, (function (CodeMirror,codemirror_mode_meta) { 'use strict';

CodeMirror = 'default' in CodeMirror ? CodeMirror['default'] : CodeMirror;

CodeMirror.modeInfo.push({name: "ABAP", mime: "text/abap", mode: "abap", ext: ["abap"], contrib: true})

})));
