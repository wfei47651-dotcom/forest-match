(function(root){
'use strict';
const N=9,colors=[0,1,2,4];
const clone=x=>JSON.parse(JSON.stringify(x));
const tile=t=>({t,s:''});
const adjacent=(a,b)=>a>=0&&b>=0&&a<81&&b<81&&Math.abs((a/9|0)-(b/9|0))+Math.abs(a%9-b%9)===1;
function matches(b){const cells=new Set(),runs=[];for(let axis=0;axis<2;axis++)for(let line=0;line<9;line++)for(let p=0;p<9;){const at=q=>axis?q*9+line:line*9+q,i=at(p),t=b[i]?.t;let q=p+1;while(q<9&&t!==undefined&&t>=0&&b[at(q)]?.t===t)q++;if(q-p>=3){const run=[];for(let k=p;k<q;k++){run.push(at(k));cells.add(at(k))}runs.push({cells:run,axis})}p=q}return{cells:[...cells],runs}}
class Game{
 constructor(rng=Math.random){this.rng=rng;this.history=[];this.reset()}
 random(){const refill=[0,1,2,4,5,5];return tile(refill[Math.floor(this.rng()*refill.length)])}
 generate(){const b=[];for(let i=0;i<81;i++){let choices=colors.filter(t=>!(i%9>1&&b[i-1].t===t&&b[i-2].t===t)&&!(i>=18&&b[i-9].t===t&&b[i-18].t===t));b.push(tile(choices[Math.floor(this.rng()*choices.length)]))}return b}
 reset(){this.board=this.generate();this.moves=19;this.goal=57;this.score=0;this.tools={shuffle:2,undo:3,force:2,hammer:3,extra:1};this.history=[];this.events=[];
 // 构造无初始三连、接近参考图的示范关。
 for(const i of [17,26,36,54,63,71,72,73,74,79,80])this.board[i]=tile(5);
 for(const i of [33,42,51,60])this.board[i]={t:-1,hp:2};
 for(const i of [67,68,75,76,77,78])this.board[i]={t:-2,s:'bird'};
 this.board[0]=tile(1);this.board[1]=tile(1);this.board[2]=tile(0);this.board[9]=tile(2);this.board[10]=tile(0);this.board[11]=tile(1);
 // 只重排偶然形成的普通初始匹配，保留关卡障碍与特效布局。
 for(let n=0;n<100;n++){const m=matches(this.board);if(!m.cells.length)break;for(const i of m.cells)if(this.board[i].t!==5)this.board[i]=this.random();else this.board[i]=tile(colors[(i+n)%4])}
 this.ensureMove();return this}
 get status(){return this.goal<=0?'won':this.moves<=0?'lost':'playing'}
 snapshot(){return clone({board:this.board,moves:this.moves,goal:this.goal,score:this.score,tools:this.tools})}
 save(){this.history.push(this.snapshot());if(this.history.length>30)this.history.shift()}
 undo(){if(!this.tools.undo||!this.history.length)return false;const available=this.tools.undo-1,s=this.history.pop();Object.assign(this,s);this.tools.undo=Math.min(available,s.tools.undo);this.events=[];return true}
 swap(a,b){[this.board[a],this.board[b]]=[this.board[b],this.board[a]]}
 valid(a,b){if(!adjacent(a,b)||this.board[a].hp||this.board[b].hp)return false;if(this.board[a].s==='bird'||this.board[b].s==='bird'||(this.board[a].s&&this.board[b].s))return true;this.swap(a,b);const m=matches(this.board).cells;this.swap(a,b);return m.includes(a)||m.includes(b)}
 movesAvailable(){for(let a=0;a<81;a++)for(const b of [a+1,a+9])if(adjacent(a,b)&&this.valid(a,b))return[a,b];return null}
 ensureMove(){if(this.movesAvailable())return;this.shuffleBoard()}
 shuffleBoard(){const ids=this.board.map((v,i)=>!v.hp&&v.t>=0&&!v.s?i:-1).filter(i=>i>=0);for(let n=0;n<100;n++){const b=this.generate();ids.forEach(i=>this.board[i]=b[i]);if(!matches(this.board).cells.length&&this.movesAvailable())return}throw Error('无法生成可玩棋盘')}
 gravity(){const falls=[];for(let c=0;c<9;c++){let bottom=8;while(bottom>=0){if(this.board[bottom*9+c]?.hp){bottom--;continue}let top=bottom;while(top>=0&&!this.board[top*9+c]?.hp)top--;const values=[];for(let r=bottom;r>top;r--)if(this.board[r*9+c])values.push({value:this.board[r*9+c],from:r*9+c});let fresh=0;for(let r=bottom;r>top;r--){const entry=values[bottom-r],to=r*9+c;this.board[to]=entry?.value||this.random();const from=entry?entry.from:(top-fresh++)*9+c;if(from!==to)falls.push({from,to,fresh:!entry})}bottom=top-1}}return falls}
 clear(ids,keep=new Map(),chain=1){const before=this.pendingBefore||this.snapshot(),effects=this.pendingEffects||[];this.pendingBefore=null;this.pendingEffects=null;const out=new Set(ids),queue=[...ids];while(queue.length){const i=queue.pop(),v=this.board[i];if(!v||v.hp||keep.has(i))continue;let extra=[];if(v.s==='row')extra=Array.from({length:9},(_,k)=>(i/9|0)*9+k);if(v.s==='col')extra=Array.from({length:9},(_,k)=>k*9+i%9);if(v.s==='bird'){const t=colors[Math.floor(this.rng()*4)];extra=this.board.map((v,j)=>v.t===t?j:-1).filter(j=>j>=0)}if(extra.length)effects.push({kind:v.s,source:i,targets:extra});for(const j of extra)if(!out.has(j)){out.add(j);queue.push(j)}}
 const hit=new Set();for(const i of out){if(this.board[i]?.hp)hit.add(i);else for(const j of [i-9,i+9,i-1,i+1])if(adjacent(i,j)&&this.board[j]?.hp)hit.add(j)}
 let collected=0;for(const i of out){const v=this.board[i];if(!v||v.hp||keep.has(i))continue;if(v.t===5)collected++;this.board[i]=null;this.score+=60*chain}
 for(const i of hit){if(--this.board[i].hp===0){collected+=3;this.board[i]=null;this.score+=180}}
 for(const [i,v] of keep)this.board[i]=v;this.goal=Math.max(0,this.goal-collected);const cleared=this.snapshot(),falls=this.gravity();this.events.push({cells:[...out],hit:[...hit],collected,chain,effects,before,cleared,after:this.snapshot(),falls,kept:[...keep.keys()]})}
 resolve(preferred=-1){for(let chain=1;chain<=100;chain++){const m=matches(this.board);if(!m.cells.length)break;const keep=new Map();for(const run of [...m.runs].sort((a,b)=>b.cells.length-a.cells.length)){if(run.cells.length<4||run.cells.some(i=>keep.has(i)))continue;const i=run.cells.includes(preferred)?preferred:run.cells[run.cells.length/2|0],v=this.board[i];if(v.s)continue;keep.set(i,run.cells.length>=5?{t:-2,s:'bird'}:{t:v.t,s:run.axis?'col':'row'})}this.clear(m.cells,keep,chain);preferred=-1}this.ensureMove()}
 exchange(a,b,force=false){this.events=[];if(this.status!=='playing'||!adjacent(a,b)||this.board[a].hp||this.board[b].hp)return{ok:false};if(force&&!this.tools.force)return{ok:false};if(!force&&!this.valid(a,b))return{ok:false};this.save();const va=clone(this.board[a]),vb=clone(this.board[b]);this.swap(a,b);if(force){this.tools.force--}else this.moves--;
 if(va.s==='bird'||vb.s==='bird'){let ids;if(va.s==='bird'&&vb.s==='bird')ids=Array.from({length:81},(_,i)=>i);else{const t=va.s==='bird'?vb.t:va.t;ids=this.board.map((v,i)=>v.t===t||i===a||i===b?i:-1).filter(i=>i>=0);if((va.s&&va.s!=='bird')||(vb.s&&vb.s!=='bird'))for(const i of ids)if(this.board[i].t===t)this.board[i].s='row'}this.pendingEffects=[{kind:va.s==='bird'&&vb.s==='bird'?'double-bird':'bird',source:va.s==='bird'?b:a,partner:va.s==='bird'?a:b,targets:ids}];this.pendingBefore=this.snapshot();this.board[a].s='';this.board[b].s='';this.clear(ids)}else if(va.s&&vb.s){const ids=new Set();for(const i of [a,b])for(let k=0;k<9;k++){ids.add((i/9|0)*9+k);ids.add(k*9+i%9)}this.pendingEffects=[a,b].flatMap(i=>[{kind:'row',source:i,targets:Array.from({length:9},(_,k)=>(i/9|0)*9+k)},{kind:'col',source:i,targets:Array.from({length:9},(_,k)=>k*9+i%9)}]);this.clear([...ids])}this.resolve(b);return{ok:true,events:this.events,status:this.status}}
 use(kind,index){this.events=[];if(this.status!=='playing'||!this.tools[kind])return false;if(kind==='undo')return this.undo();if(kind==='hammer'&&(!Number.isInteger(index)||index<0||index>=81))return false;this.save();this.tools[kind]--;if(kind==='extra')this.moves+=5;else if(kind==='shuffle')this.shuffleBoard();else if(kind==='hammer'){this.clear([index]);this.resolve()}return true}
}
const api={Game,N,adjacent,matches,tile};root.SoloEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
