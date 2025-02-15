"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([["app_assets_modules_github_graphs_traffic-clones-graph-element_ts"],{82887:(t,e,n)=>{n.d(e,{A:()=>r});function r(t,e){return t<e?-1:t>e?1:t>=e?0:NaN}},5122:(t,e,n)=>{n.d(e,{A:()=>a});var r=n(82887);function a(t){let e=t,n=t;function a(t,e,r,a){for(null==r&&(r=0),null==a&&(a=t.length);r<a;){let l=r+a>>>1;0>n(t[l],e)?r=l+1:a=l}return r}return 1===t.length&&(e=(e,n)=>t(e)-n,n=(e,n)=>(0,r.A)(t(e),n)),{left:a,center:function(t,n,r,l){null==r&&(r=0),null==l&&(l=t.length);let o=a(t,n,r,l-1);return o>r&&e(t[o-1],n)>-e(t[o],n)?o-1:o},right:function(t,e,r,a){for(null==r&&(r=0),null==a&&(a=t.length);r<a;){let l=r+a>>>1;n(t[l],e)>0?a=l:r=l+1}return r}}}},61573:(t,e,n)=>{n.d(e,{A:()=>r});function r(t,e){let n,r;if(void 0===e)for(let e of t)null!=e&&(void 0===n?e>=e&&(n=r=e):(n>e&&(n=e),r<e&&(r=e)));else{let a=-1;for(let l of t)null!=(l=e(l,++a,t))&&(void 0===n?l>=l&&(n=r=l):(n>l&&(n=l),r<l&&(r=l)))}return[n,r]}},44317:(t,e,n)=>{n.d(e,{A:()=>r});function r(t,e){let n;if(void 0===e)for(let e of t)null!=e&&(n>e||void 0===n&&e>=e)&&(n=e);else{let r=-1;for(let a of t)null!=(a=e(a,++r,t))&&(n>a||void 0===n&&a>=a)&&(n=a)}return n}},83836:(t,e,n)=>{n.d(e,{A:()=>a});var r=n(82562);function a(t){return Intl.NumberFormat((0,r.mf)(),{maximumFractionDigits:2,maximumSignificantDigits:4,notation:"compact"}).format(t)}},87031:(t,e,n)=>{n.d(e,{A:()=>l});var r=n(10541),a=n(50183);function l(){let t=function(){let t=document.createElement("div");return t.style.position="absolute",t.style.top="0",t.style.opacity="0",t.style.pointerEvents="none",t.style.boxSizing="border-box",t}(),e=null;function n(){return[0,0]}function l(){return" "}function o(n){e=(function(t){let e=t.node();return"svg"===e.tagName.toLowerCase()?e:e.ownerSVGElement})(n).createSVGPoint(),document.body.appendChild(t)}return o.show=function(r,a){let i=l(a),s=n(a),u=document.documentElement.scrollTop||document.body.scrollTop,c=document.documentElement.scrollLeft||document.body.scrollLeft;t.innerHTML=i,t.style.opacity="1",t.style.pointerEvents="all";let f=function(t,e,n){let r=function(t,e){let n=t;for(;void 0===n.getScreenCTM&&"undefined"===n.parentNode;)n=n.parentNode;let r={},a=n.getScreenCTM(),l=n.getBBox(),o=l.width,i=l.height,s=l.x,u=l.y;return e.x=s,e.y=u,r.nw=e.matrixTransform(a),e.x+=o,r.ne=e.matrixTransform(a),e.y+=i,r.se=e.matrixTransform(a),e.x-=o,r.sw=e.matrixTransform(a),e.y-=i/2,r.w=e.matrixTransform(a),e.x+=o,r.e=e.matrixTransform(a),e.x-=o/2,e.y-=i/2,r.n=e.matrixTransform(a),e.y+=i,r.s=e.matrixTransform(a),r}(n,t);return{top:r.n.y-e.offsetHeight,left:r.n.x-e.offsetWidth/2}}(e,t,r.target);return t.classList.toggle("n",!0),t.style.top=`${f.top+s[0]+u}px`,t.style.left=`${f.left+s[1]+c}px`,o},o.hide=function(){return t.style.opacity="0",t.style.pointerEvents="none",o},o.attr=function(e,n){return r.Ay.prototype.attr.apply((0,a.A)(t),[e,n]),o},o.offset=function(t){return n=function(){return t},o},o.html=function(t){return l=t,o},o}},27938:(t,e,n)=>{n.r(e);var r=n(39595),a=n(87031),l=n(27193),o=n(14398),i=n(5225),s=n(21403),u=n(57327);function c(t,e,n,r){var a,l=arguments.length,o=l<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,n):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,n,r);else for(var i=t.length-1;i>=0;i--)(a=t[i])&&(o=(l<3?a(o):l>3?a(e,n,o):a(e,n))||o);return l>3&&o&&Object.defineProperty(e,n,o),o}let f=(0,n(22211).aL)("%A, %B %-d, %Y"),d=(0,o.GP)(","),p=(0,i.A)(m);async function m(t){let e=await (0,l.Ee)(t,{headers:{accept:"application/json"}});return await e.json()}let g=class TrafficClonesGraphElement extends HTMLElement{async connectedCallback(){let t=this.graph,e=t.getAttribute("data-url");if(e){for(let e of t.querySelectorAll("svg.viz"))e.remove();t.classList.add("is-graph-loading"),t.classList.remove("is-graph-load-error","is-graph-empty");try{let n=await p(e);t.classList.remove("is-graph-loading"),null!=n&&n.unusable?t.classList.add("is-graph-without-usable-data"):null!=n&&0===n.length||null!=n&&null!=n.summary&&0===n.summary.total||null!=n[0]&&null!=n[0].weeks&&0===n[0].weeks.length?t.classList.add("is-graph-empty"):function(t,e){let n=(0,a.A)().attr("class","svg-tip web-views comparison").offset([-10,0]).html(t=>{let e=1===t.total?"clone":"clones",n=1===t.unique?"unique cloner":"unique cloners";return`<span class='title'>${f(t.date)}</span> <ul class='web-views'> <li class='totals metric-0'><strong>${d(t.total)}</strong> ${e}</li> <li class='uniques metric-1'><strong>${d(t.unique)}</strong> ${n}</li> </ul>`});(0,s.lB)("#js-clones-graph .js-graph",{remove(){n.hide()}}),(0,u.E)(t,e,n,{width:719,height:243,margin:{top:20,right:40,bottom:30,left:40}})}(this.container,n)}catch(e){throw t.classList.remove("is-graph-loading"),t.classList.add("is-graph-load-error"),e}}}};c([r.aC],g.prototype,"graph",void 0),c([r.aC],g.prototype,"container",void 0),g=c([r.p_],g)},57327:(t,e,n)=>{n.d(e,{E:()=>L});var r=n(82887),a=n(5122),l=n(61573),o=n(21671),i=n(44317);function s(t,e,n){let r=t[e];t[e]=t[n],t[n]=r}var u=n(51889),c=n(50183),f=n(70240),d=n(30540),p=n(95389),m=n(59312),g=n(60804),h=n(34552),y=n(7146),v=n(86844),A=n(81695),x=n(22211),b=n(96020),w=n(99065),T=n(4049),k=n(58679),C=n(14398),M=n(83836);function S(t){return(0,C.GP)(",")(t)}function L(t,e,n,C){let L=C.margin,q=C.width-L.left-L.right,E=C.height-L.top-L.bottom;if(!e||null!=e.error)return;let $=(function(){return w.C.apply((0,b.B)(d.$Z,d.lk,p.Mb,m.R6,g.Hl,h.dA,y.pz,v.vD,A.R,x.aL).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)]),arguments)})().range([0,q]),j=(0,T.A)().range([E,0]),N=(0,T.A)().range([E,0]),B=(0,x.aL)("%m/%d"),D=(0,u.l7)($).ticks(e.counts.length).tickSize(E+5).tickPadding(10).tickFormat(B),F=(0,u.V4)(j).ticks(3).tickFormat(M.A),G=(0,k.A)().x(t=>$(t.key)).y(t=>j(t.value)),P=(0,c.A)(t).select(".js-graph").append("svg").attr("viewBox",`0 0 ${q+L.left+L.right} ${E+L.top+L.bottom}`).attr("preserveAspectRatio","xMinYMin meet").attr("class","viz").attr("data-hpc","").append("g").attr("transform",`translate(${L.left},${L.top})`).call(n),R=e.counts;for(let t of R)t.date=new Date(1e3*t.bucket);R.sort((t,e)=>(0,r.A)(t.date,e.date));let _=(0,a.A)(t=>t.date).left,V=R.map(t=>({key:t.date,value:t.total})),z=R.map(t=>({key:t.date,value:t.unique})),H=[V,z],[Y,O]=(0,l.A)(R,t=>t.date.getTime()),U=(0,l.A)(V,t=>t.value)[1],J=(0,o.A)(z,t=>t.value)+function(t,e,n){if(a=(t=Float64Array.from(function*(t,e){if(void 0===e)for(let e of t)null!=e&&(e=+e)>=e&&(yield e);else{let n=-1;for(let r of t)null!=(r=e(r,++n,t))&&(r=+r)>=r&&(yield r)}}(t,n))).length){if((e=+e)<=0||a<2)return(0,i.A)(t);if(e>=1)return(0,o.A)(t);var a,l=(a-1)*e,u=Math.floor(l),c=(0,o.A)((function t(e,n,a=0,l=e.length-1,o=r.A){for(;l>a;){if(l-a>600){let r=l-a+1,i=n-a+1,s=Math.log(r),u=.5*Math.exp(2*s/3),c=.5*Math.sqrt(s*u*(r-u)/r)*(i-r/2<0?-1:1),f=Math.max(a,Math.floor(n-i*u/r+c)),d=Math.min(l,Math.floor(n+(r-i)*u/r+c));t(e,n,f,d,o)}let r=e[n],i=a,u=l;for(s(e,a,n),o(e[l],r)>0&&s(e,a,l);i<u;){for(s(e,i,u),++i,--u;0>o(e[i],r);)++i;for(;o(e[u],r)>0;)--u}0===o(e[a],r)?s(e,a,u):s(e,++u,l),u<=n&&(a=u+1),n<=u&&(l=u-1)}return e})(t,u).subarray(0,u+1));return c+((0,i.A)(t.subarray(u+1))-c)*(l-u)}}(z,.5,t=>t.value);$.domain([Y,O]),j.domain([0,U]),N.domain([0,J]);let X=e.summary.total,I=t.querySelector(".js-traffic-total");I&&(I.textContent=S(X));let W=e.summary.unique,Z=t.querySelector(".js-traffic-uniques");Z&&(Z.textContent=S(W)),P.append("g").attr("class","x axis").call(D),P.append("g").attr("class","y axis views").call(F),P.selectAll("path.path").data(H).enter().append("path").attr("class",(t,e)=>`path ${0===e?"total":"unique"}`).attr("d",(t,e)=>0===e?G(t):G.y(t=>N(t.value))(t)),P.selectAll("g.dots").data(H).enter().append("g").attr("class",(t,e)=>0===e?"dots totals":"dots uniques").each(function(t,e){let n=(0,c.A)(this);return 1===e&&(j=N),n.selectAll("circle").data(t=>t).enter().append("circle").attr("cx",t=>$(t.key)).attr("cy",t=>j(t.value)).attr("r",4)}),F=(0,u.eH)(N).ticks(3).tickFormat(M.A),P.append("g").attr("class","y axis unique").attr("transform",`translate(${q}, 0)`).call(F),P.append("rect").attr("class","overlay").attr("width",q).attr("height",E).on("mousemove",function(t){let e;let r=$.invert((0,f.A)(t)[0]),a=_(R,r,1),l=R[a-1],o=R[a];if(l&&o){let t=r-l.date>o.date-r?o:l;return(e=(e=P.selectAll("g.dots circle").filter(e=>e.key===t.date)).nodes()).sort((t,e)=>Number(t.getAttribute("cy"))-Number(e.getAttribute("cy"))),n.show({target:e[0]},t)}}).on("mouseout",function(){setTimeout(n.hide,500)})}},82562:(t,e,n)=>{n.d(e,{US:()=>a,mf:()=>l,mx:()=>r});let r=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],a=["January","February","March","April","May","June","July","August","September","October","November","December"],l=()=>{try{return Intl.getCanonicalLocales(window.navigator.language)[0]}catch(t){return"en-US"}}},70240:(t,e,n)=>{n.d(e,{A:()=>r});function r(t,e){if(t=function(t){let e;for(;e=t.sourceEvent;)t=e;return t}(t),void 0===e&&(e=t.currentTarget),e){var n=e.ownerSVGElement||e;if(n.createSVGPoint){var r=n.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(e.getScreenCTM().inverse())).x,r.y]}if(e.getBoundingClientRect){var a=e.getBoundingClientRect();return[t.clientX-a.left-e.clientLeft,t.clientY-a.top-e.clientTop]}}return[t.pageX,t.pageY]}}}]);
//# sourceMappingURL=app_assets_modules_github_graphs_traffic-clones-graph-element_ts-96c77c648c11.js.map