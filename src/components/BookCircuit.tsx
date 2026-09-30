import type{ReactNode}from'react';

const ink='#315d55';
const accent='#068b79';
const W=({d}:{d:string})=><path d={d} fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>;
const N=({x,y}:{x:number;y:number})=><circle cx={x} cy={y} r="4" fill={ink}/>;
const T=({x,y,children,anchor='middle',strong=false}:{x:number;y:number;children:ReactNode;anchor?:'start'|'middle'|'end';strong?:boolean})=><text x={x} y={y} textAnchor={anchor} fill={strong?accent:ink} fontSize="17" fontWeight={strong?750:600} fontFamily="Arial, sans-serif">{children}</text>;
const R=({x,y,vertical=false}:{x:number;y:number;vertical?:boolean})=><rect x={x-(vertical?12:32)} y={y-(vertical?32:12)} width={vertical?24:64} height={vertical?64:24} rx="4" fill="#e4f4ee" stroke={ink} strokeWidth="3"/>;
const I=({x,y,up=false}:{x:number;y:number;up?:boolean})=><g><circle cx={x} cy={y} r="24" fill="#fff" stroke={ink} strokeWidth="3"/><W d={up?`M ${x} ${y+12} V ${y-12} M ${x-8} ${y-4} L ${x} ${y-12} L ${x+8} ${y-4}`:`M ${x} ${y-12} V ${y+12} M ${x-8} ${y+4} L ${x} ${y+12} L ${x+8} ${y+4}`}/></g>;
const V=({x,y,positive='top'}:{x:number;y:number;positive?:'top'|'bottom'|'left'})=><g><circle cx={x} cy={y} r="24" fill="#fff" stroke={ink} strokeWidth="3"/>{positive==='left'?<><T x={x-11} y={y+6}>+</T><T x={x+11} y={y+6}>−</T></>:<><T x={x} y={y-5}>{positive==='top'?'+':'−'}</T><T x={x} y={y+17}>{positive==='top'?'−':'+'}</T></>}</g>;

// These diagrams are redrawn from the five cited exercises. The exact branch
// values, topology, source polarity and current arrows are kept in the SVG.
export default function BookCircuit({id}:{id:string}){
 let art:ReactNode;
 switch(id){
  case'q3-b1':art=<>
   <W d="M 115 65 V 86 M 115 150 V 181 M 115 229 V 265 M 115 65 H 278 M 342 65 H 695 M 525 65 V 133 M 525 197 V 265 M 695 65 V 141 M 695 189 V 265 M 115 265 H 695"/>
   <R x={115} y={118} vertical/><R x={310} y={65}/><R x={525} y={165} vertical/><V x={115} y={205}/><I x={695} y={165}/>
   <N x={525} y={65}/><N x={525} y={265}/><T x={525} y={38} strong>x</T><T x={310} y={38}>80 Ω</T><T x={73} y={124}>20 Ω</T><T x={73} y={211}>24 V</T><T x={478} y={172}>25 Ω</T><T x={758} y={172}>40 mA</T>
   <T x={568} y={122} strong>+</T><T x={568} y={229} strong>−</T><T x={590} y={174} strong>Vx</T><T x={405} y={304}>ground (0 V)</T>
  </>;break;
  case'q3-b2':art=<>
   <W d="M 80 65 H 353 M 417 65 H 720 M 80 65 V 141 M 80 189 V 265 M 255 65 V 133 M 255 197 V 265 M 490 65 V 133 M 490 197 V 265 M 605 65 V 133 M 605 197 V 265 M 720 65 V 141 M 720 189 V 265 M 80 265 H 720"/>
   <I x={80} y={165} up/><R x={255} y={165} vertical/><R x={385} y={65}/><R x={490} y={165} vertical/><R x={605} y={165} vertical/><I x={720} y={165}/>
   <N x={255} y={65}/><N x={565} y={65}/><T x={255} y={37} strong>a</T><T x={565} y={37} strong>b</T><T x={385} y={38}>8 Ω</T><T x={211} y={172}>40 Ω</T><T x={447} y={172}>80 Ω</T><T x={652} y={172}>120 Ω</T><T x={42} y={172}>6 A</T><T x={761} y={172}>1 A</T><T x={400} y={304}>ground (0 V)</T>
  </>;break;
  case'q3-b3':art=<>
   <W d="M 65 65 H 276 M 324 65 H 528 M 592 65 H 700 M 65 65 V 141 M 65 189 V 265 M 170 65 V 133 M 170 197 V 265 M 435 65 V 133 M 435 197 V 265 M 700 65 V 133 M 700 197 V 265 M 65 265 H 700"/>
   <I x={65} y={165}/><R x={170} y={165} vertical/><V x={300} y={65} positive="left"/><R x={435} y={165} vertical/><R x={560} y={65}/><R x={700} y={165} vertical/>
   <N x={170} y={65}/><N x={435} y={65}/><T x={170} y={38} strong>b</T><T x={435} y={38} strong>c</T><T x={300} y={37}>25 V</T><T x={560} y={37}>20 Ω</T><T x={126} y={172}>50 Ω</T><T x={475} y={172}>150 Ω</T><T x={746} y={172}>55 Ω</T><T x={25} y={172}>2 A</T>
   <T x={211} y={120} strong>+</T><T x={211} y={228} strong>−</T><T x={237} y={174} strong>Vb</T><T x={390} y={304}>ground (0 V)</T>
  </>;break;
  case'q3-b4':art=<>
   <W d="M 95 65 H 213 M 277 65 H 523 M 587 65 H 705 M 95 265 H 213 M 277 265 H 523 M 587 265 H 705 M 95 65 V 141 M 95 189 V 265 M 400 65 V 133 M 400 197 V 265 M 705 65 V 141 M 705 189 V 265"/>
   <V x={95} y={165}/><R x={245} y={65}/><R x={400} y={165} vertical/><R x={555} y={65}/><V x={705} y={165}/><R x={245} y={265}/><R x={555} y={265}/>
   <N x={400} y={65}/><N x={400} y={265}/><T x={245} y={38}>75 Ω</T><T x={555} y={38}>150 Ω</T><T x={245} y={304}>125 Ω</T><T x={555} y={304}>250 Ω</T><T x={447} y={172}>200 Ω</T><T x={48} y={172}>80 V</T><T x={761} y={172}>140 V</T>
   <T x={330} y={111} strong>iₐ →</T><T x={636} y={111} strong>← i_c</T><T x={442} y={219} strong>i_b ↓</T><T x={245} y={204}>↻ i₁</T><T x={555} y={204}>↻ i₂</T>
  </>;break;
  case'q3-b5':art=<>
   <W d="M 100 65 H 213 M 277 65 H 523 M 587 65 H 700 M 100 265 H 213 M 277 265 H 523 M 587 265 H 700 M 100 65 V 141 M 100 189 V 265 M 400 65 V 141 M 400 189 V 265 M 700 65 V 141 M 700 189 V 265"/>
   <V x={100} y={165}/><R x={245} y={65}/><I x={400} y={165}/><R x={555} y={65}/><V x={700} y={165} positive="bottom"/><R x={245} y={265}/><R x={555} y={265}/>
   <N x={400} y={65}/><N x={400} y={265}/><T x={245} y={38}>6 Ω</T><T x={555} y={38}>20 Ω</T><T x={245} y={304}>9 Ω</T><T x={555} y={304}>30 Ω</T><T x={48} y={172}>100 V</T><T x={751} y={172}>25 V</T><T x={459} y={172} strong>4 A</T><T x={245} y={204}>↻ i₁</T><T x={555} y={204}>↻ i₂</T>
  </>;break;
  default:return null;
 }
 const number=id==='q3-b1'?'4.6':id==='q3-b2'?'4.13':id==='q3-b3'?'4.22':id==='q3-b4'?'4.32(a)':'4.49';
 return <figure className="book-circuit" dir="ltr"><svg viewBox="0 0 800 325" role="img" aria-label={`Redrawn circuit for Nilsson and Riedel Problem ${number}`} xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="800" height="325" rx="12" fill="#f7fbf9"/>{art}</svg><figcaption>Redrawn circuit · Nilsson/Riedel Problem {number}</figcaption></figure>;
}
