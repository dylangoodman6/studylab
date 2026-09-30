import type {Branch,Problem} from '../types';
const W=640,H=320;
function symbol(b:Branch,x:number,y:number,rotation:number){
 const shape=b.kind==='R'?<rect x={x-34} y={y-13} width="68" height="26" rx="5" className="component resistor"/>:b.kind==='G'?<path d={`M ${x} ${y-27} L ${x+27} ${y} L ${x} ${y+27} L ${x-27} ${y} Z`} className="component source"/>:<circle cx={x} cy={y} r="25" className="component source"/>;
 const label=b.kind==='G'?b.id:`${b.id} · ${b.value} ${b.unit}`;
 return <g key={b.id} className="symbol" data-branch={b.id}>
  <g transform={rotation?`rotate(${rotation} ${x} ${y})`:undefined}>{shape}{b.kind==='V'&&<><text x={x-12} y={y+6} className="polarity">+</text><text x={x+11} y={y+6} className="polarity">−</text></>}{(b.kind==='I'||b.kind==='G')&&<path d={`M ${x-13} ${y} L ${x+13} ${y} M ${x+6} ${y-6} L ${x+13} ${y} L ${x+6} ${y+6}`} className="current-arrow"/>}</g>
  <text x={x} y={rotation===90||rotation===-90?116:31} className="symbol-label">{label}</text>
 </g>
}
function detail(b:Branch){
 if(b.kind==='R')return `${b.value} Ω · ${b.n1}–${b.n2}`;
 if(b.kind==='I')return `${b.value} A · ${b.n1} → ${b.n2}`;
 if(b.kind==='V')return `${b.value} V · +${b.n1}, −${b.n2}`;
 return `I = ${b.value} S × [V(${b.controlPlus}) − V(${b.controlMinus})] · ${b.n1} → ${b.n2}`;
}
export default function Circuit({problem,activeNode}:{problem:Problem;activeNode?:string|null}){
 const tops=problem.nodes.filter(n=>n!=='g');
 const pos=problem.visual?.nodePositions||Object.fromEntries(tops.map((n,k)=>[n,tops.length===2?180+k*280:110+k*210]));
 const groundCounts:Record<string,number>={};
 const groundIndex:Record<string,number>={};
 for(const b of problem.branches) if(b.n1==='g'||b.n2==='g'){const n=b.n1==='g'?b.n2:b.n1;groundCounts[n]=(groundCounts[n]||0)+1}
 return <><svg className="circuit-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Circuit diagram for ${problem.title}`} direction="ltr">
   <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dce8e6" strokeWidth=".7"/></pattern></defs>
   <rect width={W} height={H} rx="16" fill="#f6faf9"/><rect width={W} height={H} rx="16" fill="url(#grid)" opacity=".75"/>
   <path d="M 44 260 H 596" className="wire"/>
   {problem.branches.map(b=>{
     const ground=b.n1==='g'||b.n2==='g';
     if(ground){const n=b.n1==='g'?b.n2:b.n1;const idx=groundIndex[n]||0;groundIndex[n]=idx+1;const count=groundCounts[n];const spacing=count<=2?86:Math.min(66,150/(count-1));const x=pos[n]+(idx-(count-1)/2)*spacing;const mid=165;
       return <g key={b.id}><path d={`M ${pos[n]} 68 H ${x} V ${mid-33} M ${x} ${mid+33} V 260`} className="wire"/>{symbol(b,x,mid,b.n1==='g'?-90:90)}</g>}
     const x1=pos[b.n1],x2=pos[b.n2],mid=(x1+x2)/2;
     return <g key={b.id}><path d={`M ${x1} 68 H ${mid-42} M ${mid+42} 68 H ${x2}`} className="wire"/>{symbol(b,mid,68,x1>x2?180:0)}</g>
   })}
   {tops.map(n=><g key={n}><circle cx={pos[n]} cy="68" r={activeNode===n?11:7} className={activeNode===n?'node active':'node'}/><text x={pos[n]} y="41" className="node-label">{n}</text></g>)}
   {(problem.meshEquations||problem.topic==='mesh'||problem.topic==='supermesh')&&<g className="mesh-annotations"><text x={tops.length===2?pos.a+50:220} y="236" className="mesh-label">↻ i₁</text><text x={tops.length===2?pos.b-80:430} y="236" className="mesh-label">↻ i₂</text></g>}
   <path d="M 320 260 V 277 M 308 277 H 332 M 313 283 H 327 M 317 289 H 323" className="wire"/>
   <text x="344" y="287" className="ground-label">g = 0 V</text>
 </svg><div className="diagram-legend" dir="ltr" aria-label="Circuit components">{problem.branches.map(b=><div className="diagram-legend-item" key={b.id}><strong>{b.id}</strong><span>{detail(b)}</span></div>)}</div></>
}
