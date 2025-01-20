"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([["ui_packages_query-builder-element_query-builder-element_ts-ui_packages_safe-storage_safe-storage_ts"],{27756:(t,e,i)=>{let s;function a(){if(!s)throw Error("Client env was requested before it was loaded. This likely means you are attempting to use client env at the module level in SSR, which is not supported. Please move your client env usage into a function.");return s}function n(){return s?.locale??"en-US"}i.d(e,{JK:()=>n,_$:()=>a}),function(){if("undefined"!=typeof document){let t=document.getElementById("client-env");if(t)try{s=JSON.parse(t.textContent||"")}catch(t){console.error("Error parsing client-env",t)}}}()},5728:(t,e,i)=>{i.d(e,{G:()=>a,K:()=>n});var s=i(97156);let a=s.XC?.readyState==="interactive"||s.XC?.readyState==="complete"?Promise.resolve():new Promise(t=>{s.XC?.addEventListener("DOMContentLoaded",()=>{t()})}),n=s.XC?.readyState==="complete"?Promise.resolve():new Promise(t=>{s.cg?.addEventListener("load",t)})},97564:(t,e,i)=>{i.d(e,{G7:()=>o,XY:()=>u,fQ:()=>l});var s=i(5225),a=i(27756);function n(){return new Set((0,a._$)().featureFlags.map(t=>t.toLowerCase()))}let r=i(97156).X3?n:(0,s.A)(n);function l(){return Array.from(r())}function o(t){return r().has(t.toLowerCase())}let u={isFeatureEnabled:o}},60016:(t,e,i)=>{i.d(e,{qy:()=>l.qy,XX:()=>l.XX,_3:()=>l._3});var s=i(6440),a=i(2240);let n="jtml-no-op",r=s.wA.createPolicy(n,{createHTML:t=>a.b.apply({policy:()=>t,policyName:n,fallback:t,fallbackOnError:!0})});var l=i(31143);l.QI.setCSPTrustedTypesPolicy(r)},74324:(t,e,i)=>{var s,a,n,r;i.d(e,{CN:()=>SearchItem,P$:()=>QueryEvent,VJ:()=>r,dS:()=>FetchDataEvent,k8:()=>l,m4:()=>a,nM:()=>o,o7:()=>s,qi:()=>FilterItem,yk:()=>n}),function(t){t.DIRECTORY="Search in this directory",t.ORG="Search in this organization",t.OWNER="Search in this owner",t.REPO="Search in this repository",t.GITHUB="Search all of GitHub",t.GENERAL="Submit search",t.COMMAND="Run command",t.COPILOT_CHAT="Start a new Copilot thread",t.COPILOT_SEARCH="Search with Copilot",t.EXPLORE="Learn More",t.DEFAULT="Jump to"}(s||(s={}));let l="Autocomplete";let FilterItem=class FilterItem extends Event{constructor({filter:t,value:e,name:i="",description:s="",inlineDescription:a=!1,priority:n=1/0,icon:r,avatar:l,action:o}){super("filter-item"),this.inlineDescription=!1,this.filter=t,this.value=e,this.name=i,this.description=s,this.inlineDescription=a,this.priority=n,this.icon=r,this.avatar=l,this.action=o}};function o(t){return t instanceof Object}!function(t){t.Apps="apps",t.Archived="archived",t.Book="book",t.Bookmark="bookmark",t.Branch="branch",t.Calendar="calendar",t.Circle="circle",t.Code="code",t.CodeReview="code-review",t.CodeSquare="code-square",t.Comment="comment",t.CommentDiscussion="comment-discussion",t.Copilot="copilot",t.CopilotError="copilot-error",t.Codespaces="codespaces",t.CreditCard="credit-card",t.Default="default",t.DeviceDesktop="device-desktop",t.DeviceMobile="device-mobile",t.Discussion="discussion",t.Draft="draft",t.FileCode="file-code",t.Filter="filter",t.Forbidden="forbidden",t.Gift="gift",t.Globe="globe",t.Heart="heart",t.History="history",t.Issue="issue",t.IssueOpened="issue-opened",t.IssueClosed="issueClosed",t.Iterations="iterations",t.Mention="mention",t.Merged="merged",t.Milestone="milestone",t.No="no",t.Not="not",t.Organization="organization",t.Package="package",t.Pencil="pencil",t.Person="person",t.Play="play",t.PlusCircle="plus-circle",t.Project="project",t.PullRequest="pullRequest",t.Question="question",t.Reaction="reaction",t.Repo="repo",t.Rocket="rocket",t.Search="search",t.Server="server",t.ShieldCheck="shield-check",t.SingleSelect="single-select",t.Sort="sort",t.Tag="tag",t.Team="team",t.Telescope="telescope",t.Trash="trash",t.Workflow="workflow"}(a||(a={})),function(t){t.Entity="--color-prettylights-syntax-entity",t.Constant="--color-prettylights-syntax-constant",t.Keyword="--color-prettylights-syntax-keyword",t.Variable="--color-prettylights-syntax-variable",t.String="--color-prettylights-syntax-string"}(n||(n={}));let SearchItem=class SearchItem extends Event{constructor({id:t,priority:e,value:i,action:s,description:a="",icon:n,scope:r="DEFAULT",prefixText:l,prefixColor:o,isFallbackSuggestion:u,isUpdate:h}){super(h?"update-item":"search-item"),this.id=t,this.priority=e,this.value=i,this.prefixText=l,this.prefixColor=o,this.action=s,this.description=a,this.icon=n,this.scope=r,this.isFallbackSuggestion=u||!1}};!function(t){t.Normal="normal",t.Entity="entity",t.Constant="constant",t.FilterValue="filter-value"}(r||(r={}));let FetchDataEvent=class FetchDataEvent extends Event{constructor(t){super("fetch-data"),this.fetchPromise=t}};let QueryEvent=class QueryEvent extends Event{toString(){return this.rawQuery}constructor(t,e,i){super("query"),this.parsedQuery=t,this.rawQuery=e,this.parsedMetadata=i}};Event},72912:(t,e,i)=>{i.r(e),i.d(e,{AutocompleteText:()=>l.k8,FeedbackEvent:()=>FeedbackEvent,FetchDataEvent:()=>l.dS,FilterItem:()=>l.qi,Octicon:()=>l.m4,PrefixColor:()=>l.yk,QueryBuilderElement:()=>QueryBuilderElement,QueryEvent:()=>l.P$,SearchItem:()=>l.CN,SearchScopeText:()=>l.o7,TextElementStyle:()=>l.VJ,isCustomIcon:()=>l.nM});var s=i(39595),a=i(35908),n=i(60016),r=i(51848),l=i(74324);function o(t,e){if(e.has(t))throw TypeError("Cannot initialize the same private elements twice on an object")}function u(t,e,i){if(!e.has(t))throw TypeError("attempted to "+i+" private field on non-instance");return e.get(t)}function h(t,e){var i=u(t,e,"get");return i.get?i.get.call(t):i.value}function c(t,e,i){o(t,e),e.set(t,i)}function d(t,e,i){var s=u(t,e,"set");return!function(t,e,i){if(e.set)e.set.call(t,i);else{if(!e.writable)throw TypeError("attempted to set read only private field");e.value=i}}(t,s,i),i}function p(t,e,i){if(!e.has(t))throw TypeError("attempted to get private field on non-instance");return i}function m(t,e){o(t,e),e.add(t)}function y(t,e,i,s){var a,n=arguments.length,r=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var l=t.length-1;l>=0;l--)(a=t[l])&&(r=(n<3?a(r):n>3?a(e,i,r):a(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}let FeedbackEvent=class FeedbackEvent extends Event{constructor(t,e,i){super("query-builder-feedback",{bubbles:!0,cancelable:!0}),this.key=t,this.text=e,this.data=i,this.key=t,this.text=e,this.data=i}};let v=(t,e)=>t.priority-e.priority;var f=new WeakMap,g=new WeakMap,b=new WeakMap,w=new WeakMap,$=new WeakMap,L=new WeakMap,I=new WeakMap,C=new WeakMap,E=new WeakMap,A=new WeakMap,k=new WeakMap,S=new WeakMap,q=new WeakMap,x=new WeakMap,T=new WeakMap,F=new WeakMap,W=new WeakMap,M=new WeakMap,P=new WeakMap,B=new WeakMap,O=new WeakMap,Q=new WeakMap,R=new WeakMap,D=new WeakSet,V=new WeakSet,_=new WeakSet,N=new WeakSet,X=new WeakSet,z=new WeakSet,j=new WeakSet,J=new WeakSet,U=new WeakSet,G=new WeakSet,K=new WeakSet,H=new WeakSet,Y=new WeakSet;let QueryBuilderElement=class QueryBuilderElement extends HTMLElement{get input(){return(0,s.FB)(this,"input")}get styledInputContent(){return(0,s.FB)(this,"styledInputContent")}get styledInputContainer(){return(0,s.FB)(this,"styledInputContainer")}get styledInput(){return(0,s.FB)(this,"styledInput")}get overlay(){return(0,s.FB)(this,"overlay")}get sizer(){return(0,s.FB)(this,"sizer")}get clearButton(){return(0,s.FB)(this,"clearButton")}get resultsList(){return(0,s.FB)(this,"resultsList")}get screenReaderFeedback(){return(0,s.FB)(this,"screenReaderFeedback")}get query(){return this.input.value}get i18n(){return{suggestion:"suggestion",suggestions:"suggestions",clear_search:"Input cleared."}}navigate(t){let e=t?.target?.closest("a")?.getAttribute("href");e&&((0,r.BI)("query-builder-element.click",{url:e}),this.dispatchEvent(new CustomEvent("query-builder:navigate",{bubbles:!0,detail:{url:e}})))}get closed(){return this.overlay&&this.overlay.hasAttribute("hidden")}set closed(t){if(t)this.closed||(this.overlay&&(this.overlay.hidden=!0),this.input.setAttribute("aria-expanded","false"),h(this,f)?.clearSelection());else{if(!this.closed)return;this.overlay&&(this.overlay.hidden=!1),this.input.setAttribute("aria-expanded","true")}}show(){this.closed=!1,this.overlay?.scrollIntoView?.({behavior:"smooth",block:"nearest"})}hide(){"false"===this.resultsList.getAttribute("data-persist-list")&&(this.closed=!0)}initialize(t,e){for(let i of(this.parser=t,d(this,O,!0),d(this,P,!0),e))this.attachProvider(i);d(this,P,!1),d(this,w,e.reduce((t,e)=>({...t,[e.value]:e}),{}))}detachElementDefinitionReadyForProviders(){this.removeEventListener("query-builder:ready-to-request-provider",this.elementDefinitionReadyForProviders)}connectedCallback(){h(this,L)?.abort();let{signal:t}=d(this,L,new AbortController);t.addEventListener("abort",()=>{d(this,w,{})}),d(this,q,this.input.getAttribute("id")),this.hasAttribute("defer-request-providers")||(document.addEventListener("query-builder:ready-to-request-provider",this.elementDefinitionReadyForProviders,!0),this.readyForRequestProviders())}readyForRequestProviders(){p(this,Y,tc).call(this)>0&&h(this,B)||(d(this,f,h(this,f)||new a.A(this.input,this.resultsList,{tabInsertsSuggestions:!1})),this.requestProviders())}async requestProviders(){d(this,B,!0),await Promise.resolve(),d(this,P,!0),this.dispatchEvent(new Event("query-builder:request-provider",{bubbles:!0})),d(this,P,!1),d(this,T,new Map);let t=this.parseInputValue();this.styleInputText(t),this.toggleClearButtonVisibility()}parseInputValue(){return this.parsedMetadata=this.parser.parse(this.input.value,this.input.selectionStart||0),this.parser.flatten(this.parsedMetadata)}attachProvider(t){if(!h(this,L))return;let{signal:e}=h(this,L);if(!h(this,P))throw Error("Can't attach providers after the query builder has been connected");h(this,w)[t.value]||(h(this,w)[t.value]=t,"filter"===t.type?(h(this,$).add(t.value),t.addEventListener("filter-item",e=>{h(this,Q).call(this,h(this,S),t),h(this,S).get(t)?.push(e),p(this,D,Z).call(this)},{signal:e}),t.addEventListener("show",()=>{h(this,k).add(t),p(this,D,Z).call(this)},{signal:e}),t.addEventListener("fetch-data",async t=>{let e=new Promise(t=>setTimeout(t,h(this,W)));d(this,M,Promise.race([Promise.all([h(this,M),t.fetchPromise]),e]));let i=h(this,M);try{await i}catch(t){if("AbortError"!==t.name)throw d(this,M,!1),t}i===h(this,M)&&(d(this,M,!1),p(this,D,Z).call(this),this.updateVisibility())},{signal:e})):(t.addEventListener("fetch-data",async e=>{h(this,A).delete(t),await e.fetchPromise,h(this,C).set(t,h(this,E).get(t)||[]),h(this,E).delete(t),p(this,D,Z).call(this)}),t.addEventListener("search-item",e=>{h(this,Q).call(this,h(this,C),t),h(this,E).has(t)?h(this,E).get(t)?.push(e):(h(this,A).has(t)&&(h(this,C).set(t,[]),h(this,A).delete(t)),h(this,C).get(t)?.push(e),p(this,D,Z).call(this))},{signal:e}),t.addEventListener("update-item",e=>{let i=h(this,C).get(t);if(!i)return;let s=i.findIndex(t=>t.id===e.id);s<0||(i[s]=e,p(this,D,Z).call(this))},{signal:e})))}disconnectedCallback(){h(this,L)?.abort()}comboboxCommit(t){let e=t.target,i=e?.getAttribute("data-type"),s=e?.getAttribute("data-value")||"",a=e?.getAttribute("data-replace-query-with")||"",n=parseInt(e?.getAttribute("data-move-caret-to")||"0")||0,r=this.parseInputValue();if("url-result"===i);else if("filter-result"===i)r.pop(),r.push({type:"filter",filter:s,value:""});else if("command-result"===i){let t=e.getAttribute("data-command-name")||"",i=JSON.parse(e.getAttribute("data-command-payload")||"{}");this.dispatchEvent(new CustomEvent(t,{detail:i}))}else if("query-result"===i){if(a)this.input.value=a,this.input.focus(),r=void 0;else{let t=this.parser.flatten(this.parser.parse(s,0));r.push(...t),r.push({type:"text",value:""})}}else"filter-item"===i&&(a?(this.input.value=a,this.input.focus(),r=void 0):this.addSelectedItemToFilter(s,r));if(this.parseQuery(r),a){let t=-1===n?this.input.value.length:n;this.input.setSelectionRange(t,t)}this.input.removeAttribute("aria-activedescendant")}addSelectedItemToFilter(t,e){let i=/\s/.test(t),s=e.pop();if(s?.type==="filter"){let a=s.value.split(",");a.pop(),a.push(i?`"${t}"`:t),e.push({type:"filter",filter:s?.filter,value:a.join(",")}),e.push({type:"text",value:""})}else s&&e.push(s)}async inputChange(){await this.parseQuery()}inputBlur(){if(clearTimeout(this.focusTimeout),h(this,g)){d(this,g,!1);return}this.styledInput.classList.remove(h(this,x)),this.input.removeAttribute("aria-activedescendant"),this.hide()}resultsMousedown(){d(this,g,!0)}async inputFocus(){this.styledInput.classList.add(h(this,x)),this.readyForRequestProviders(),h(this,f).start();let t=this.input.value;this.lastParsedQuery&&this.lastParsedQuery===this.input.value||await this.parseQuery(),this.closed&&this.input.value===t&&this.input.setSelectionRange(0,this.input.value.length),this.focusTimeout?clearTimeout(this.focusTimeout):this.focusTimeout=setTimeout(()=>{this.input.focus()},this.FOCUS_TIMEOUT_VALUE)}moveCaretToEndOfInput(){this.input.setSelectionRange(this.input.value.length,this.input.value.length)}hasFocus(){return this.styledInput.classList.contains(h(this,x))}inputKeydown(t){let e=t.key;if("Escape"===e)this.hide();else if("Enter"===e){let e=this.resultsList.querySelector('[aria-selected="true"], [data-combobox-option-default="true"]');if(!e||"true"===e.getAttribute("aria-disabled"))return;let i=e.querySelector("a");i&&(t.ctrlKey||t.metaKey?window.open(i.getAttribute("href")||"","_blank"):i.click())}}inputSubmit(){this.hide()}clearButtonFocus(t){let e=t.relatedTarget;e&&e===this.input&&this.show()}clearButtonBlur(){this.hide()}toggleClearButtonVisibility(){this.clearButton&&(""!==this.input.value?!1!==this.clearButton.hidden&&(this.clearButton.hidden=!1):this.clearButton.hidden=!0)}updateVisibility(){this.hasFocus()&&(h(this,S).size>0||h(this,C).size>0||h(this,k).size>0?this.show():h(this,M)||this.hide())}getLeadingVisual(t,e){if(e){let t="org"===e.type?"avatar avatar-1 avatar-small":"avatar avatar-1 avatar-small circle";return(0,n.qy)`<img src="${e.url}" alt="" role="presentation" class="${t}" />`}if(t&&(0,l.nM)(t))return(0,n.qy)([t.html]);let i=document.getElementById(`${t}-icon`);return(0,n.qy)([i?.innerHTML])}updateScreenReaderFeedback(t){let e=new FeedbackEvent("NEW_RESULTS",t,{});this.dispatchEvent(e),this.screenReaderFeedback.textContent=e.text}async clear(){this.dispatchEvent(new CustomEvent("query-builder:clear",{bubbles:!0,cancelable:!0}))&&await this.clearInput()}async clearInput({focusInput:t=!0}={}){await this.parseQuery([],t),d(this,b,!0)}async parseQuery(t,e=!0){h(this,I)?.abort();let{signal:i}=d(this,I,new AbortController);if(t){let e=t.map(t=>"filter"===t.type?`${t.filter}:${t.value}`:t.value).join(h(this,O)?"":" "),i=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.input),"value")?.set;i?i?.call(this.input,e):this.input.value=e,this.input.dispatchEvent(new Event("change",{bubbles:!0}))}else t=this.parseInputValue();if(this.lastParsedQuery=this.input.value,await new Promise(t=>requestAnimationFrame(t)),i.aborted||(this.styleInputText(t),e&&this.input.focus(),await new Promise(t=>setTimeout(t,100)),i.aborted))return;for(let t of h(this,C).keys())h(this,A).add(t);h(this,S).clear(),h(this,k).clear();let s=new l.P$(t,this.input.value,this.parsedMetadata);this.dispatchEvent(s);let a=!1;for(let t of h(this,A).keys())h(this,C).delete(t),h(this,A).delete(t),a=!0;a&&p(this,D,Z).call(this),this.updateVisibility()}styleInputText(t){p(this,K,tu).call(this,this.input.value);let e=document.createDocumentFragment();for(let i of t){let t=document.createElement("span"),s=document.createElement("span");s.textContent=" ";let a=!h(this,O);if("filter"===i.type){let{filter:e,value:n}=i,r=document.createElement("span");t.setAttribute("data-type","filter-expression"),r.setAttribute("data-type","filter"),r.textContent=e;let l=document.createElement("span");l.textContent=this.filterKey;let o=document.createElement("span");o.setAttribute("data-type","filter-value"),o.textContent=n,t.appendChild(r),t.appendChild(l),t.appendChild(o),a&&t.appendChild(s)}else a?t.textContent=`${i.value} `:t.textContent=i.value,i.style===l.VJ.Constant?t.classList.add("qb-constant"):i.style===l.VJ.Entity?t.classList.add("qb-entity"):i.style===l.VJ.FilterValue&&t.classList.add("qb-filter-value");e.append(t),p(this,H,th).call(this)}this.styledInputContent.replaceChildren(e)}constructor(...t){super(...t),m(this,D),m(this,V),m(this,_),m(this,N),m(this,X),m(this,z),m(this,j),m(this,J),m(this,U),m(this,G),m(this,K),m(this,H),m(this,Y),c(this,f,{writable:!0,value:void 0}),c(this,g,{writable:!0,value:void 0}),c(this,b,{writable:!0,value:void 0}),c(this,w,{writable:!0,value:void 0}),c(this,$,{writable:!0,value:void 0}),c(this,L,{writable:!0,value:void 0}),c(this,I,{writable:!0,value:void 0}),c(this,C,{writable:!0,value:void 0}),c(this,E,{writable:!0,value:void 0}),c(this,A,{writable:!0,value:void 0}),c(this,k,{writable:!0,value:void 0}),c(this,S,{writable:!0,value:void 0}),c(this,q,{writable:!0,value:void 0}),c(this,x,{writable:!0,value:void 0}),c(this,T,{writable:!0,value:void 0}),c(this,F,{writable:!0,value:void 0}),c(this,W,{writable:!0,value:void 0}),c(this,M,{writable:!0,value:void 0}),c(this,P,{writable:!0,value:void 0}),c(this,B,{writable:!0,value:void 0}),c(this,O,{writable:!0,value:void 0}),c(this,Q,{writable:!0,value:void 0}),c(this,R,{writable:!0,value:void 0}),d(this,g,!1),d(this,b,!1),d(this,w,{}),d(this,$,new Set),d(this,L,null),d(this,I,null),d(this,C,new Map),d(this,E,new Map),d(this,A,new Set),d(this,k,new Set),d(this,S,new Map),d(this,x,"QueryBuilder-focus"),d(this,T,new Map),d(this,F,150),d(this,W,3e3),d(this,M,!1),d(this,P,!1),d(this,B,!1),this.parser={parse:p(this,G,to).bind(this),flatten:t=>t},this.parsedMetadata=void 0,this.renderSingularItemNames=!1,d(this,O,!1),this.lastParsedQuery=void 0,this.FOCUS_TIMEOUT_VALUE=100,this.minWidth=300,this.elementDefinitionReadyForProviders=t=>{t.detail.id===h(this,q)&&(this.readyForRequestProviders(),t.stopImmediatePropagation())},d(this,Q,(t,e)=>{t.has(e)||t.set(e,[])}),d(this,R,!1)}};function Z(){h(this,R)||(d(this,R,!0),this.toggleClearButtonVisibility(),d(this,R,!1),p(this,N,ti).call(this))}function tt(){if(0!==h(this,k).size)return(0,n.qy)`<li role="presentation" class="ActionList-sectionDivider">
      <h3 role="presentation" class="ActionList-sectionDivider-title p-2 text-left" aria-hidden="true">
        Suggested filters
      </h3>
      <ul role="presentation">
        ${[...h(this,k)].sort(v).map(t=>p(this,J,tr).call(this,t))}
      </ul>
    </li>`}function te(t,e=!1){let i=[],s=this.parseInputValue().at(-1);if("filter"===t.type?t.manuallyDetermineFilterEligibility?i=h(this,S).get(t)?.sort(v).map(t=>p(this,U,tl).call(this,t))||[]:s?.type==="filter"&&(i=h(this,S).get(t)?.filter(t=>t.filter===s.filter).sort(v).map(t=>p(this,U,tl).call(this,t))||[]):i=[...h(this,C).get(t)||[]].filter(t=>t.isFallbackSuggestion===e).sort(v).map(t=>p(this,z,ta).call(this,t)),i.length)return""===t.name?(0,n.qy)`<li role="presentation" class="ActionList-sectionDivider">
        <ul role="presentation">
          ${i}
        </ul>
      </li>`:(0,n.qy)`<li role="presentation" class="ActionList-sectionDivider">
        <h3
          role="presentation"
          class="ActionList-sectionDivider-title QueryBuilder-sectionTitle p-2 text-left"
          aria-hidden="true"
        >
          ${t.name}
        </h3>
        <ul role="presentation">
          ${i}
        </ul>
      </li>`}function ti(){let t,e=Object.values(h(this,w)).sort((t,e)=>t.priority-e.priority).map(t=>p(this,_,te).call(this,t)).filter(t=>void 0!==t);h(this,M)||0!==e.length||(e=Object.values(h(this,w)).sort((t,e)=>t.priority-e.priority).map(t=>p(this,_,te).call(this,t,!0)).filter(t=>void 0!==t));let i=p(this,V,tt).call(this);i&&e.push(i),0===e.length?h(this,M)||(this.resultsList.textContent="",(0,n.XX)((0,n.qy)``,this.resultsList)):(0,n.XX)((0,n.qy)`${e.map((t,i)=>i===e.length-1?t:(0,n.qy)`${t}
                <li aria-hidden="true" class="ActionList-sectionDivider"></li>`)}`,this.resultsList);let s=this.resultsList.querySelectorAll('[role="option"]').length,a=1===s?this.i18n.suggestion:this.i18n.suggestions;t=`${s} ${a}.`,h(this,b)&&(t=`${this.i18n.clear_search} ${t}`,d(this,b,!1)),this.screenReaderFeedback.textContent===t&&(t+="\xa0"),setTimeout(()=>this.updateScreenReaderFeedback(t),h(this,F))}function ts(t){if(t)return t.replace(/\s/g,"-").toLowerCase()}function ta({value:t,prefixText:e,prefixColor:i,target:s,action:a,description:r,icon:o,scope:u}){if("url"in a){let c="GENERAL"===u?`${l.o7[u]}`:`jump to this ${s.singularItemName}`,d=r?`, ${r}`:"",m=`${e?`${e} `:""}${t}${d}, ${c}`,y=null;return e&&(y=(0,n.qy)`
          <span>
            <div class="d-inline-flex position-relative">
              <div
                class="position-absolute rounded-1 flex-items-stretch height-full width-full"
                style="opacity: 0.1; background-color: var(${i})"
              ></div>
              <div class="px-1" style="color: var(${i})">${e}</div>
            </div>
            ${p(this,j,tn).call(this,t)}
          </span>
        `),(0,n.qy)`<li
        role="option"
        class="ActionListItem"
        data-type="url-result"
        id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}"
        data-value="${t}"
        aria-label="${m}"
      >
        <a
          href="${a.url}"
          data-action="click:query-builder#navigate"
          tabindex="-1"
          class="QueryBuilder-ListItem-link ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
        >
          ${o?(0,n.qy)`<span
                id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(o)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${y||p(this,j,tn).call(this,t)} </span>
            ${r?(0,n.qy)`<span class="ActionListItem-description">${r}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${l.o7[u]}</span
          >
        </a>
      </li>`}if("commandName"in a){let e=l.o7[u]||l.o7.COMMAND,i=r?`, ${r}`:"",s=`${t}${i}, ${e}`;return(0,n.qy)`<li
        role="option"
        class="ActionListItem"
        data-type="command-result"
        id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}"
        data-value="${t}"
        data-command-name="${a.commandName}"
        data-command-payload="${JSON.stringify(a.data)}"
        aria-label="${s}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${o?(0,n.qy)`<span
                id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(o)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${p(this,j,tn).call(this,t)} </span>
            ${r?(0,n.qy)`<span class="ActionListItem-description">${r}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${e}</span
          >
        </span>
      </li>`}{let e="",i=0;"replaceQueryWith"in a&&(e=a.replaceQueryWith,i=a.moveCaretTo);let s="query"in a?l.o7[u]:l.k8;return(0,n.qy)` <li
        role="option"
        class="ActionListItem"
        data-type="query-result"
        data-value="${t}"
        aria-label="${t}${r?`, ${r}`:""}"
        data-replace-query-with="${e}"
        data-move-caret-to="${i}"
        id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${o?(0,n.qy)`<span
                id="${h(this,q)||"search-item"}-result-${p(this,X,ts).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(o)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal">${p(this,j,tn).call(this,t)}</span>
            ${r?(0,n.qy)`<span class="ActionListItem-description">${r}</span>`:null}
          </span>

          ${h(this,C).size>0?(0,n.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
                >${s}</span
              >`:(0,n.qy)``}
        </span>
      </li>`}}function tn(t){let e=this.parser.flatten(this.parser.parse(t,0)),i=!h(this,O),s=[];for(let t of e)if("filter"===t.type)s.push((0,n.qy)`<span>${t.filter}:</span
            ><span data-type="filter-value">${t.value}${i?" ":""}</span>`);else{let e="";t.style===l.VJ.Constant?e="qb-constant":t.style===l.VJ.Entity?e="qb-entity":t.style===l.VJ.FilterValue&&(e="qb-filter-value"),s.push((0,n.qy)`<span class="${e}">${t.value}${i?" ":""}</span>`)}return s}function tr({singularItemName:t,icon:e,description:i,value:s}){let a=i?`, ${i}`:"",r=`${this.renderSingularItemNames?t:s}${a}`;return(0,n.qy)` <li
      role="option"
      class="ActionListItem"
      data-type="filter-result"
      data-value="${s}"
      id="${h(this,q)||"filter"}-result-${p(this,X,ts).call(this,s)}"
      aria-label="${r}, filter"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${e?(0,n.qy)`<span
              id="${h(this,q)||"filter"}-result-${p(this,X,ts).call(this,s)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(e)}
            </span>`:null}
        <span class="ActionListItem-descriptionWrap">
          <span class="ActionListItem-label text-normal">
            ${this.renderSingularItemNames?t:`${s}:`}
          </span>
          ${i?(0,n.qy)`<span class="ActionListItem-description">${i}</span>`:null}
        </span>

        ${h(this,C).size>0?(0,n.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${l.k8}</span
            >`:(0,n.qy)``}
      </span>
    </li>`}function tl({name:t,value:e,target:i,icon:s,avatar:a,description:r,inlineDescription:o,action:u}){let c=t&&t.length>0?t:e,d=r?`, ${r}`:"",m=i.singularItemName?`${c}${d}, autocomplete this ${i.singularItemName}`:`${c}${d}, ${i.name}`,y="",v=0;return u&&"replaceQueryWith"in u&&(y=u.replaceQueryWith,v=u.moveCaretTo),(0,n.qy)` <li
      role="option"
      class="ActionListItem"
      data-type="filter-item"
      data-replace-query-with="${y}"
      data-move-caret-to="${v}"
      data-value="${e}"
      id="${h(this,q)||"filter-item"}-result-${p(this,X,ts).call(this,e)}"
      aria-label="${m}"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${s?(0,n.qy)`<span
              id="${h(this,q)||"filter-item"}-result-${p(this,X,ts).call(this,e)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(s,a)}
            </span>`:null}
        <span class="${o?"ActionListItem-descriptionWrap-inline":"ActionListItem-descriptionWrap"}">
          <span class="ActionListItem-label text-normal">${c}</span>
          ${r?(0,n.qy)`<span class="ActionListItem-description">${r}</span>`:null}
        </span>

        ${h(this,C).size>0?(0,n.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${l.k8}</span
            >`:(0,n.qy)``}
      </span>
    </li>`}function to(t){let e=h(this,T).get(t);if(e)return e.slice();{let e=[];for(let i of t.split(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g)){let t=i.indexOf(this.filterKey);if(t>0){let s=i.substring(0,t),a=i.substring(t+1);e.push(h(this,$).has(s)?{type:"filter",filter:s,value:a}:{type:"text",value:i})}else e.push({type:"text",value:i})}return h(this,T).set(t,[...e]),e}}function tu(t){if(this.sizer.textContent="",null!==this.input.selectionStart&&this.input.selectionStart===this.input.selectionEnd){let e=this.input.selectionStart,i=document.createElement("span");this.sizer.append(t.substring(0,e),i,t.substring(e))}else this.sizer.textContent=t}function th(){let t=this.minWidth;requestAnimationFrame(()=>{let e=this.sizer.querySelector("span");e&&(e.offsetLeft<this.styledInputContainer.scrollLeft?this.styledInputContainer.scrollLeft=e.offsetLeft-t:e.offsetLeft>this.styledInputContainer.scrollLeft+this.styledInputContainer.clientWidth&&(this.styledInputContainer.scrollLeft=e.offsetLeft-this.styledInputContainer.clientWidth+t));let i=Math.max(this.sizer.scrollWidth+2,""===this.input.value?2:0,t);this.input.style.width=`${i}px`})}function tc(){return Object.keys(h(this,w)).length}y([s.CF],QueryBuilderElement.prototype,"filterKey",void 0),y([s.CF],QueryBuilderElement.prototype,"minWidth",void 0),QueryBuilderElement=y([s.p_],QueryBuilderElement)},14740:(t,e,i)=>{i.d(e,{k:()=>r,v:()=>l});var s=i(5225),a=i(97156);let n=(0,s.A)(function(){return a.XC?.head?.querySelector('meta[name="runtime-environment"]')?.content||""}),r=(0,s.A)(function(){return"enterprise"===n()}),l="webpack-react-next"},74572:(t,e,i)=>{i.d(e,{A:()=>r,D:()=>l});var s=i(97156),a=i(51528);let n=class NoOpStorage{getItem(){return null}setItem(){}removeItem(){}clear(){}key(){return null}get length(){return 0}};function r(t,e={throwQuotaErrorsOnSet:!1},i=s.cg,r=t=>t,l=t=>t){let o;try{if(!i)throw Error();o=i[t]||new n}catch{o=new n}let{throwQuotaErrorsOnSet:u}=e;function h(t){e.sendCacheStats&&(0,a.i)({incrementKey:t})}function c(t){try{if(o.removeItem(t),e.ttl){let e=`${t}:expiry`;o.removeItem(e)}}catch(t){}}return{getItem:function(t,e=new Date().getTime()){try{let i=o.getItem(t);if(!i)return null;let s=`${t}:expiry`,a=Number(o.getItem(s));if(a&&e>a)return c(t),c(s),h("SAFE_STORAGE_VALUE_EXPIRED"),null;return h("SAFE_STORAGE_VALUE_WITHIN_TTL"),r(i)}catch(t){return null}},setItem:function(t,i,s=new Date().getTime()){try{if(o.setItem(t,l(i)),e.ttl){let i=`${t}:expiry`,a=s+e.ttl;o.setItem(i,a.toString())}}catch(t){if(u&&t instanceof Error&&t.message.toLowerCase().includes("quota"))throw t}},removeItem:c,clear:o.clear,key:o.key,get length(){return o.length}}}function l(t){return r(t,{throwQuotaErrorsOnSet:!1},s.cg,JSON.parse,JSON.stringify)}},51528:(t,e,i)=>{i.d(e,{X:()=>p,i:()=>u});var s=i(97156),a=i(5728),n=i(14740),r=i(97564),l=i(70170);let o=[];function u(t,e=!1,i=.5){if(!0!==(0,r.G7)("BROWSER_STATS_DISABLED")){if(i<0||i>1)throw RangeError("Sampling probability must be between 0 and 1");void 0===t.timestamp&&(t.timestamp=new Date().getTime()),t.loggedIn=!!s.XC?.head?.querySelector('meta[name="user-login"]')?.content,t.staff=p(),t.bundler=n.v,Math.random()<i&&o.push(t),e?d():c()}}let h=null,c=(0,l.n)(async function(){await a.K,null==h&&(h=window.requestIdleCallback(d))},5e3);function d(){if(h=null,!o.length)return;let t=s.XC?.head?.querySelector('meta[name="browser-stats-url"]')?.content;if(t){for(let e of function(t){let e=[],i=t.map(t=>JSON.stringify(t));for(;i.length>0;)e.push(function(t){let e=t.shift(),i=[e],s=e.length;for(;t.length>0&&s<=65536;){let e=t[0].length;if(s+e<=65536){let a=t.shift();i.push(a),s+=e}else break}return i}(i));return e}(o))!function(t,e){try{navigator.sendBeacon&&navigator.sendBeacon(t,e)}catch{}}(t,`{"stats": [${e.join(",")}] }`);o=[]}}function p(){return!!s.XC?.head?.querySelector('meta[name="user-staff"]')?.content}s.XC?.addEventListener("pagehide",d),s.XC?.addEventListener("visibilitychange",d)}}]);
//# sourceMappingURL=ui_packages_query-builder-element_query-builder-element_ts-ui_packages_safe-storage_safe-storage_ts-014014fdc539.js.map