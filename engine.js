(function(root){
'use strict';
const N=8,TYPES=6;
const type=c=>c===null?-1:c%TYPES;
function matches(b){const found=new Set(),runs=[];for(let r=0;r<N;r++)for(let c=0;c<N;){let j=c+1;while(j<N&&type(b[r*N+j])===type(b[r*N+c])&&b[r*N+c]!==null)j++;if(j-c>=3){let run=[];for(let k=c;k<j;k++){found.add(r*N+k);run.push(r*N+k)}runs.push(run)}c=j}for(let c=0;c<N;c++)for(let r=0;r<N;){let j=r+1;while(j<N&&type(b[j*N+c])===type(b[r*N+c])&&b[r*N+c]!==null)j++;if(j-r>=3){let run=[];for(let k=r;k<j;k++){found.add(k*N+c);run.push(k*N+c)}runs.push(run)}r=j}return{cells:[...found],runs}}
function adjacent(a,b){return Math.abs(Math.floor(a/N)-Math.floor(b/N))+Math.abs(a%N-b%N)===1}
function swap(b,a,c){[b[a],b[c]]=[b[c],b[a]]}
function moves(b){let out=[];for(let i=0;i<N*N;i++)for(const j of [i%N<N-1?i+1:-1,i+N<N*N?i+N:-1])if(j>=0){swap(b,i,j);const m=matches(b);swap(b,i,j);if(m.cells.length)out.push([i,j])}return out}
function generate(rng=Math.random){let b;do{b=[];for(let i=0;i<N*N;i++){let options=[];for(let t=0;t<TYPES;t++){if(i%N>=2&&type(b[i-1])===t&&type(b[i-2])===t)continue;if(i>=N*2&&type(b[i-N])===t&&type(b[i-2*N])===t)continue;options.push(t)}b.push(options[Math.floor(rng()*options.length)])}}while(!moves(b).length);return b}
function expand(b,cells){const out=new Set(cells),queue=[...cells];while(queue.length){const i=queue.pop();if(b[i]>=TYPES){let r=Math.floor(i/N),c=i%N;for(let y=Math.max(0,r-1);y<=Math.min(N-1,r+1);y++)for(let x=Math.max(0,c-1);x<=Math.min(N-1,c+1);x++){const j=y*N+x;if(!out.has(j)){out.add(j);queue.push(j)}}}}return [...out]}
function gravity(b,rng=Math.random){const fresh=[];for(let c=0;c<N;c++){let row=N-1;for(let r=N-1;r>=0;r--)if(b[r*N+c]!==null)b[row--*N+c]=b[r*N+c];while(row>=0){const i=row--*N+c;b[i]=Math.floor(rng()*TYPES);fresh.push(i)}}return fresh}
const api={N,TYPES,type,matches,adjacent,swap,moves,generate,expand,gravity};root.MatchEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
