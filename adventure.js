'use strict';
(function(){
 const key='forest-adventure-v1';let progress={unlocked:1,stars:{}};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Number.isInteger(saved.unlocked)&&saved.unlocked>0){progress.unlocked=Math.min(9999,saved.unlocked);for(const [k,v] of Object.entries(saved.stars||{}))if(/^\d+$/.test(k)&&Number.isInteger(v)&&v>=1&&v<=3)progress.stars[k]=v}}catch{}
 function stars(n){return '<span>'+ '★'.repeat(n)+'</span><span class="empty">'+'★'.repeat(3-n)+'</span>'}
 function draw(){const total=Object.values(progress.stars).reduce((a,b)=>a+b,0);$('total-stars').textContent=total;const page=Math.floor((Math.max(1,progress.unlocked)-1)/12)*12;const coords=[[43,90],[64,81],[49,72],[33,63],[49,54],[66,45],[52,36],[34,27],[46,18],[65,9],[77,25],[78,61]];$('level-nodes').innerHTML=coords.map(([x,y],i)=>{const n=page+i+1,locked=n>progress.unlocked;return `<button class="level-node${locked?' locked':''}${n===progress.unlocked?' current':''}" style="left:${x}%;top:${y}%" data-level="${n}" ${locked?'disabled':''} aria-label="第 ${n} 关${locked?'，未解锁':'，'+(progress.stars[n]||0)+' 颗星'}">${locked?'⌑':n}<span class="node-stars">${locked?'':stars(progress.stars[n]||0)}</span></button>`}).join('')}
 function open(){if(window.ForestOnline?.active){toast('先返回单人闯关，再选择冒险关卡');return}if(busy){toast('请等待本次消除完成');return}draw();$('adventure-map').hidden=false;$('adventure-map').scrollIntoView({behavior:'smooth',block:'start'});$('open-map').setAttribute('aria-expanded','true')}
 function close(){$('adventure-map').hidden=true;$('open-map').setAttribute('aria-expanded','false')}
 window.ForestAdventure={record(n,points,moves){const rating=moves>=8?3:moves>=3?2:1;progress.stars[n]=Math.max(progress.stars[n]||0,rating);progress.unlocked=Math.max(progress.unlocked,n+1);try{localStorage.setItem(key,JSON.stringify(progress))}catch{toast('浏览器未允许保存，当前进度仅在本次游玩保留')}draw();return stars(rating)},open};
 $('open-map').onclick=open;$('close-map').onclick=close;$('continue-level').onclick=()=>{if(busy||window.ForestOnline?.active)return;close();start(progress.unlocked)};
 $('level-nodes').onclick=e=>{const node=e.target.closest('[data-level]');if(!node||node.disabled||busy||window.ForestOnline?.active)return;const n=Number(node.dataset.level);if(n>progress.unlocked)return;close();start(n);toast('第 '+n+' 关 · 冒险开始！')};
 $('map-mascot').innerHTML=animal(0);$('open-map').setAttribute('aria-expanded','false');draw();
})();
