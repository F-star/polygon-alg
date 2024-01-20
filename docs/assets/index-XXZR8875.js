(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function R(t,e,n,r){const{x:o,y:s}=t,{x:c,y:a}=e,{x:i,y:l}=n,{x:m,y:x}=r,g=a-s,I=o-c,d=o*a-c*s,y=x-l,u=i-m,P=i*x-m*l,p=g*u-I*y;if(Math.abs(p)<1e-9)return null;const h=(d*u-P*I)/p,f=(g*P-d*y)/p;return h>=Math.min(o,c)&&h<=Math.max(o,c)&&f>=Math.min(s,a)&&f<=Math.max(s,a)&&h>=Math.min(i,m)&&h<=Math.max(i,m)&&f>=Math.min(l,x)&&f<=Math.max(l,x)?{x:h,y:f}:null}function v(t,e){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))}function T(t){const e=[],n=t.length;for(let r=0;r<n;r++){const o=t[r],s=t[(r+1)%n];(o.x!==s.x||o.y!==s.y)&&e.push(o)}return e}function L(t,e,n){const r=t.indexOf(e);r!==-1&&(t[r]=n)}function D(t){const e=[],n=F(t.length);if(t.length<3)return{crossPts:e,adjList:n};const r=new Map,o=t.length;for(let s=0;s<o-2;s++){const c=t[s],a=t[s+1];let i=s+2;for(;i<o;i++){const l=(i+1)%o;if(s===l)continue;const m=t[i],x=t[l],g=R(c,a,m,x);if(g){e.push(g);const I=[],d=o+e.length-1;{const y=`${s}-${s+1}`;r.has(y)||r.set(y,[[0,s],[v(c,a),s+1]]);const u=r.get(y),P=v(c,g),[p,h]=E(u.map(O=>O[0]),P),f=u[p][1],M=u[h][1];I.push(f,M);const j=n[f];L(j,f,d),L(j,M,d);const w=n[M];L(w,f,d),L(w,M,d),u.splice(h,0,[P,d])}{const y=`${i}-${l}`;r.has(y)||r.set(y,[[0,i],[v(m,x),l]]);const u=r.get(y),P=v(m,g),[p,h]=E(u.map(O=>O[0]),P),f=u[p][1],M=u[h][1];I.push(f,M),u.splice(h,0,[P,d]);const j=n[f];L(j,f,d),L(j,M,d);const w=n[M];L(w,f,d),L(w,M,d)}n.push(I)}}}return{crossPts:e,adjList:n}}function E(t,e){let n=0,r=t.length-1;for(let o=0;o<t.length-1;o++){const s=t[o],c=t[o+1];if(e>=s&&e<=c){n=o,r=o+1;break}}return[n,r]}function F(t){const e=[];for(let n=0;n<t;n++){const r=n-1<0?t-1:n-1,o=(n+1)%t;e.push([r,o])}return e}function C(t){if(t=T(t),t.length<=3)return{crossPts:[],adjList:[],resultIndices:t.map((i,l)=>l),resultPoints:t};console.log("---------- start ----------"),console.log("去重后的原始点",t);const{crossPts:e,adjList:n}=D(t),r=[...t,...e];let o=t[0],s=0;for(let i=1;i<t.length;i++){const l=t[i];(l.y>o.y||l.y===o.y&&l.x<o.x)&&(o=l,s=i)}console.log("最底边的点",o);const c=[s],a=9999;for(let i=0;i<a;i++){const l=c[i-1],m=c[i],x=r[l],g=r[m],I=i==0?{x:1,y:0}:{x:x.x-g.x,y:x.y-g.y},d=n[c[i]];let y=1/0,u=-1;for(const P of d){if(P===l)continue;const p=r[P],h=X(g.x,g.y,p.x,p.y,I);h<y&&(y=h,u=P)}if(u===c[0])break;c.push(u)}return c.length>=a&&console.error(`轮廓多边形计算失败，超过最大循环次数 ${a}`),console.log("---------- end ----------"),{crossPts:e,adjList:n,resultIndices:c,resultPoints:c.map(i=>r[i])}}const K=Math.PI*2;function X(t,e,n,r,o){const s=[n-t,r-e],c=[o.x,o.y],a=s[0]*c[0]+s[1]*c[1],i=Math.sqrt(s[0]*s[0]+s[1]*s[1])*Math.sqrt(c[0]*c[0]+c[1]*c[1]);let l=Math.acos(parseFloat((a/i).toFixed(12)));return l=parseFloat(l.toFixed(10)),Y(o,{x:s[0],y:s[1]})>0&&(l=K-l),l}function Y(t,e){return t.x*e.y-e.x*t.y}const S=document.querySelector("#draw-area"),q=[];let A=null;const H=t=>{const e=t.clientX,n=t.clientY;q.push({x:e,y:n}),_()},B=t=>{const e=t.clientX,n=t.clientY;A={x:e,y:n},_()},_=()=>{const t=[...q];A&&t.push(A);const e=S.getContext("2d");e.clearRect(0,0,S.width,S.height);const{crossPts:n,adjList:r,resultIndices:o,resultPoints:s}=C(t);z(s),N(e,t);for(let c=0;c<t.length;c++){const a=t[c];$(e,a),b(e,a,c+"")}for(let c=0;c<n.length;c++){const a=n[c];$(e,a,"#f04"),b(e,a,t.length+c+"","#f04")}document.querySelector("#outlinePoints").innerHTML=o.join(", "),document.querySelector("#adjListInfo").innerHTML=k(r)},$=(t,{x:e,y:n},r)=>{t.save(),r&&(t.fillStyle=r),t.beginPath(),t.arc(e,n,2,0,Math.PI*2),t.fill(),t.closePath(),t.restore()},b=(t,e,n,r,o=-3)=>{t.save();const s=-10;r&&(t.fillStyle=r),t.font="12px sans-serif",t.fillText(n,e.x+o,e.y+s),t.restore()};function N(t,e){t.save(),t.beginPath();for(let n=0;n<e.length;n++){const r=e[n];t.lineTo(r.x,r.y)}t.closePath(),t.stroke(),t.restore()}function U(t,e){t.save(),t.beginPath(),t.fillStyle="#dde3e9";for(let n=0;n<e.length;n++){const r=e[n];t.lineTo(r.x,r.y)}t.closePath(),t.fill(),t.restore()}const k=t=>t.map((e,n)=>`${n}: [${e.join(", ")}]`).join("<br>");function z(t){const e=document.querySelector("#outline"),n=e.getContext("2d");n.clearRect(0,0,e.width,e.height),U(n,t),N(n,t);const r=new Set;for(let o=0;o<t.length;o++){const s=t[o];$(n,s);const c=`${s.x}-${s.y}`;if(r.has(c)){b(n,s,`(${o})`,void 0,10);continue}else r.add(c),b(n,s,o+"")}}S.addEventListener("mousedown",H);S.addEventListener("mousemove",B);