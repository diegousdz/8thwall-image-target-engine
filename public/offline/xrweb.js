/* Copyright (c) 2018 8th Wall, Inc. All Rights Reserved */
!function(){const s=document.currentScript||[].find.call(document.scripts,e=>/xrweb(\?.*)?$/.test(e.src)),getAppKeyFromTag=()=>{const e=s.getAttribute("appKey");if(e)return e;const r=s.src.match(/app[kK]ey=([a-zA-Z0-9]+)/);if(!r){const e="Missing 8th Wall appKey";throw console.error(e,s),alert(e),new Error(e)}return r[1]},checkSimdSupported=()=>{try{
// This was taken from the minified version of wasm-feature-detect's simd() function:
// https://unpkg.com/wasm-feature-detect@1.2.11/dist/umd/index.js
return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))}catch(e){return!1}},useAsync="false"!==s.getAttribute("async"),xrwebUrl="";let src=xrwebUrl||`${s.src}?appKey=${getAppKeyFromTag()}`;const xrwebSimdUrl="",useSimd=xrwebSimdUrl&&checkSimdSupported();useSimd&&(src=xrwebSimdUrl);
// We only need credentials if we are requesting again with an added app key, to preserve tokens
const withCredentials=!xrwebUrl;
// Set useful metadata on the window so that jsxr can find it without additional loads.
window._XR8="{_XR8}";
// Set up chunk map URLs depending if we're using simd or not.
const chunkPrefix="";if(chunkPrefix){
// Chunk names corresponds to name of all the separated modules (face, hand, slam, etc.)
const e=["face","hand","slam"];window._XR8.chunkMap={};let r="";useSimd?r="simd/":src.includes("jse")&&(r="jse/"),e.forEach(e=>{window._XR8.chunkMap[e]=`${chunkPrefix}${r}${e}.js`})}if(useAsync){const e=document.createElement("SCRIPT");withCredentials||e.setAttribute("crossorigin","anonymous"),e.src=src,e.setAttribute("async","true"),document.head.appendChild(e)}else{const xhr=new XMLHttpRequest;xhr.onload=function(){eval(xhr.responseText)},xhr.open("GET",src,!1),// Synchronous XMLHttpRequest on the main thread
xhr.withCredentials=withCredentials,xhr.send(null)}}();
// # sourceURL=xrweb.js