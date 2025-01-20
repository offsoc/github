"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([["ui_packages_copilot-content-exclusion_partials_ContentExclusionForm_tsx"],{49776:(e,t,s)=>{s.r(t),s.d(t,{default:()=>p});var i=s(9449),n=s(40526),a=s(85053),l=s(69909),o=s(86519),r=s(62133),c=s(74520);function p(e){let{updateEndpoint:t,document:s,lastEditedBy:p}=e.initialPayload;return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(c.Av,{name:"Content exclusion",meta:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(a.A,{variant:"success",children:"Beta"}),"\xa0",(0,i.jsx)(c.A2,{})]})}),(0,i.jsxs)(c.BJ,{space:"normal","data-hpc":!0,children:[(0,i.jsxs)("div",{children:[(0,i.jsxs)("p",{children:["Choose the repositories and paths that GitHub Copilot should exclude."," ",(0,i.jsxs)(l.A,{sx:{fontWeight:"bold"},children:["Copilot won\u2019t be able to access or utilize the contents located in those specified paths."," "]})]}),(0,i.jsxs)("p",{children:["All exclusions defined will apply to all members of your enterprise."," ",(0,i.jsx)(o.A,{href:"https://gh.io/copilot-content-exclusion",target:"_blank",inline:!0,children:"Learn more about setup and usage."})]})]}),(0,i.jsx)(r.C,{label:"Repositories and paths to exclude:",endpoint:t,initialValue:s??"",placeholder:d,initialLastEdited:p})]}),(0,i.jsx)(n.s,{})]})}let d=`# Example patterns:

git@ssh.dev.azure.com:v3/org/project/repo:
 - **/*.env

git@internal.corp.net:my-team/my-repo:
 - /**/*.env
 - /*/releases/**/*
`;try{p.displayName||(p.displayName="ContentExclusionFormApp")}catch{}}}]);
//# sourceMappingURL=ui_packages_copilot-content-exclusion_partials_ContentExclusionForm_tsx-9ea2544d79ce.js.map