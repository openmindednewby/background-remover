const {chromium,devices}=require('C:/desktopContents/projects/SaaS/E2ETests/node_modules/playwright');
const path=require('path');const dir=process.argv[2];
const INV=['drop','upload','cut','keep','erase','size','undo','download','new','privacy','siblings'];
const VPS={m:{...devices['Galaxy S9+'],viewport:{width:360,height:640}},d:{...devices['Desktop Chrome'],viewport:{width:1280,height:800}}};
(async()=>{const b=await chromium.launch();const out={};
for(const opt of ['a','b','c']){out[opt]={};for(const [vk,vd] of Object.entries(VPS)){const seen=new Set();let aligned=true,overflow=[];
 for(const st of ['empty','cut']){const ctx=await b.newContext(vd);const p=await ctx.newPage();
  await p.goto(require('url').pathToFileURL(path.join(dir,'mock.html')).href+`?opt=${opt}&state=${st}`);await p.waitForTimeout(700);
  const r=await p.evaluate(()=>{const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&s.visibility!=='hidden'};
   const inv=[...document.querySelectorAll('[data-inv]')].filter(vis).map(e=>e.dataset.inv);
   let al=[];document.querySelectorAll('[data-row]').forEach(row=>{const k=[...row.children].filter(vis).map(c=>c.getBoundingClientRect());
     const lines={};k.forEach(r=>{const key=Object.keys(lines).find(t=>Math.abs(t-r.top)<20);(lines[key??r.top]=lines[key??r.top]||[]).push(r)});
     Object.values(lines).forEach(l=>{if(l.length>1){const t=l.map(r=>r.top),h=l.map(r=>r.height);al.push(Math.max(...t)-Math.min(...t)<=1&&Math.max(...h)-Math.min(...h)<=1)}})});
   const hs=document.documentElement.scrollWidth>innerWidth;
   const clip=[...document.querySelectorAll('button,label.size')].filter(vis).filter(e=>{const r=e.getBoundingClientRect();return [...e.children].some(c=>{const k=c.getBoundingClientRect();return k.width>0&&(k.right>r.right-1||k.left<r.left+1)})||r.right>(e.closest('aside,.card,.bar,.dock,main,section')||document.body).getBoundingClientRect().right+0.5}).map(e=>'clip:'+e.textContent.trim().slice(0,20));const ov=clip.concat([...document.querySelectorAll('button,.status,.privacy,.size,a,h1')].filter(vis).filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim().slice(0,30)));
   const small=[...document.querySelectorAll('button,a,input')].filter(vis).filter(e=>{const r=e.getBoundingClientRect();return e.tagName!=='INPUT'&&e.tagName!=='A'&&(r.height<44||r.width<44)}).length;
   return {inv,al,hs,ov,small}});
  r.inv.forEach(i=>seen.add(i));if(r.al.includes(false))aligned=false;if(r.hs)overflow.push(st+':hscroll');overflow.push(...r.ov.map(o=>st+':'+o));if(r.small)overflow.push(st+':small'+r.small);
  await p.screenshot({path:path.join(dir,'cap',`${opt}-${st}-${vk}.png`),fullPage:false});await ctx.close();}
 const have=INV.filter(i=>seen.has(i));out[opt][vk]={inventory:`${have.length}/${INV.length}`,missing:INV.filter(i=>!seen.has(i)),aligned,issues:overflow};}}
console.log(JSON.stringify(out));require('fs').writeFileSync(path.join(dir,'measure.json'),JSON.stringify(out,null,1));await b.close();})();
