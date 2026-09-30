import{useLayoutEffect,useRef,useState}from'react';
import type{DragEvent,PointerEvent}from'react';
import{boardGroups,socketsPerGroup,unionMap}from'../lib/lab';
import type{Placement}from'../lib/lab';

export type BoardTool='select'|'wire'|'R'|'V'|'I'|'red'|'black';
export type BoardDraft={kind:'R'|'V'|'I';value:number;enteredValue:number;unit:string;position:{x:number;y:number};rating?:number};
type Point={x:number;y:number};
type Props={selected:string|null;placements:Placement[];tool:BoardTool;pending:string|null;draft:BoardDraft|null;onSocket:(group:string)=>void;onDropPayload:(payload:string,position:Point)=>void;onCancelDraft:()=>void};
const clamp=(n:number)=>Math.max(.07,Math.min(.93,n));
function componentLabel(p:Placement|BoardDraft){const entered=p.enteredValue??p.value??0,unit=p.unit??(p.kind==='R'?'Ω':p.kind==='V'?'V':'A');return`${entered} ${unit}`}

export default function LabBoard({selected,placements,tool,pending,draft,onSocket,onDropPayload,onCancelDraft}:Props){
 const grid=useRef<HTMLDivElement>(null),groups=useRef<Record<string,HTMLDivElement|null>>({});
 const pointerStart=useRef<{x:number;y:number}|null>(null);
 const[points,setPoints]=useState<Record<string,Point>>({}),[size,setSize]=useState({width:1,height:1}),[dropActive,setDropActive]=useState(false);
 const {find}=unionMap(placements),activeRoot=selected?find(selected):null;
 useLayoutEffect(()=>{
   const measure=()=>{if(!grid.current)return;const box=grid.current.getBoundingClientRect();const next:Record<string,Point>={};for(const group of boardGroups){const element=groups.current[group];if(element){const rect=element.getBoundingClientRect();next[group]={x:rect.left-box.left+rect.width/2,y:rect.top-box.top+rect.height/2}}}setPoints(next);setSize({width:box.width,height:box.height})};
   measure();const observer=new ResizeObserver(measure);if(grid.current)observer.observe(grid.current);window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure)};
 },[]);
 function position(event:DragEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect();return{x:clamp((event.clientX-box.left)/box.width),y:clamp((event.clientY-box.top)/box.height)}}
 function drop(event:DragEvent<HTMLDivElement>){event.preventDefault();setDropActive(false);const payload=event.dataTransfer.getData('text/plain');if(payload)onDropPayload(payload,position(event))}
 function endMove(event:PointerEvent<HTMLDivElement>,payload:string){const start=pointerStart.current;pointerStart.current=null;const box=grid.current?.getBoundingClientRect();if(!start||!box||Math.hypot(event.clientX-start.x,event.clientY-start.y)<8||event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)return;onDropPayload(payload,{x:clamp((event.clientX-box.left)/box.width),y:clamp((event.clientY-box.top)/box.height)})}
 const chips=placements.filter(p=>p.kind!=='wire');
 const fallbackPosition=(p:Placement)=>{
   if(p.position)return p.position;
   if(p.kind==='V'||p.kind==='I')return{x:.52,y:.75};
   const resistors=chips.filter(item=>item.kind==='R'),index=resistors.findIndex(item=>item.id===p.id);
   return{x:resistors.length===1?.34:resistors.length===2?[.29,.71][index]:[.2,.5,.8][index]||.5,y:.36};
 };
 const visualPositions=new Map<string,Point>();
 for(const chip of chips){const desired=fallbackPosition(chip),options=[desired,{x:desired.x,y:clamp(desired.y+.15)},{x:desired.x,y:clamp(desired.y-.15)},{x:clamp(desired.x+.23),y:desired.y},{x:clamp(desired.x-.23),y:desired.y}];const clear=options.find(point=>[...visualPositions.values()].every(other=>Math.abs(point.x-other.x)>.18||Math.abs(point.y-other.y)>.1));visualPositions.set(chip.id,clear||desired)}
 const componentPosition=(p:Placement)=>visualPositions.get(p.id)||fallbackPosition(p);
 return <div className="board-shell" dir="ltr"><div ref={grid} className={`board-grid interactive-board ${dropActive?'drop-active':''}`} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';setDropActive(true)}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDropActive(false)}} onDrop={drop}>
   {boardGroups.map(group=><div ref={element=>{groups.current[group]=element}} key={group} className={`socket-group ${activeRoot&&find(group)===activeRoot?'node-lit':''} ${pending===group?'pending':''}`}><span className="group-label">{group}</span><div className="nine-grid">{Array.from({length:socketsPerGroup},(_,index)=><button type="button" data-testid={`socket-${group}-${index}`} title={`${group} · socket ${index+1}`} aria-label={`Socket ${index+1} in group ${group}`} key={index} className={`socket ${activeRoot&&find(group)===activeRoot?'lit':''}`} onClick={()=>onSocket(group)}/>)}</div></div>)}
   <svg className="board-connections" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
     {placements.map(p=>{const a=points[p.a],b=points[p.b];if(!a||!b)return null;if(p.kind==='wire')return <g key={p.id}><path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} className="placed-wire"/><circle cx={a.x} cy={a.y} r="5" className="placed-end"/><circle cx={b.x} cy={b.y} r="5" className="placed-end"/></g>;const pos=componentPosition(p),x=pos.x*size.width,y=pos.y*size.height;return <g key={p.id}><path d={`M ${a.x} ${a.y} L ${x-43} ${y} M ${x+43} ${y} L ${b.x} ${b.y}`} className={`placed-lead ${p.kind==='V'?'voltage-lead':p.kind==='I'?'current-lead':''}`}/><circle cx={a.x} cy={a.y} r="4" className="placed-end"/><circle cx={b.x} cy={b.y} r="4" className="placed-end"/></g>})}
     {draft&&pending&&points[pending]&&<path d={`M ${points[pending].x} ${points[pending].y} L ${draft.position.x*size.width} ${draft.position.y*size.height}`} className="draft-lead"/>}
   </svg>
   {chips.map(p=>{const pos=componentPosition(p);return <div key={p.id} className={`board-component board-component-${p.kind}`} onPointerDown={event=>{pointerStart.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerUp={event=>endMove(event,JSON.stringify({moveId:p.id}))} style={{left:`${pos.x*100}%`,top:`${pos.y*100}%`}} title={`Drag to move · ${p.a} to ${p.b}`} aria-label={`${p.kind==='R'?'Resistor':p.kind==='V'?'Voltage source':'Current source'} ${componentLabel(p)} from ${p.a} to ${p.b}`}><span>{p.kind==='R'?'▭':p.kind==='V'?'+ −':'➜'}</span><strong>{componentLabel(p)}</strong><small>{p.kind==='V'?`+${p.a} · −${p.b}`:p.kind==='I'?`${p.a} → ${p.b}`:`${p.a} ↔ ${p.b}`}</small></div>})}
   {draft&&<div className={`board-component board-draft board-component-${draft.kind}`} onPointerDown={event=>{pointerStart.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId)}} onPointerUp={event=>endMove(event,JSON.stringify({draftMove:true}))} style={{left:`${draft.position.x*100}%`,top:`${draft.position.y*100}%`}}><span>{draft.kind==='R'?'▭':draft.kind==='V'?'+ −':'➜'}</span><strong>{componentLabel(draft)}</strong><small>choose two groups</small></div>}
  </div><div className="board-foot">Each 3×3 socket group is one internal node. Drag a component onto the board, then click two socket groups to connect its terminals.</div><div className="board-tool-status"><span>Tool: <strong>{tool==='select'?'Explore':tool==='wire'?'Wire':tool==='red'?'Red probe':tool==='black'?'Black probe':tool==='R'?'Resistor':tool==='V'?'Voltage source':'Current source'}</strong>{pending&&` · first node ${pending}`}{draft&&' · awaiting two terminals'}</span>{draft&&<button type="button" onClick={onCancelDraft}>Cancel component</button>}</div></div>;
}
