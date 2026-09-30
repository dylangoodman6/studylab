export type LabMode='exp2'|'exp3'|'exp4-parallel'|'exp4-series'|'exp5-parallel'|'exp5-series';
export type Placement={id:string;kind:'wire'|'R'|'V'|'I';a:string;b:string;value?:number;enteredValue?:number;unit?:string;position?:{x:number;y:number};rating?:number};
export type Meter={mode:'V'|'A'|'Ω';redPort:'VΩ'|'mA'|'10A';red:string|null;black:string|null};
export const boardGroups=Array.from({length:35},(_,i)=>`${String.fromCharCode(65+Math.floor(i/7))}${i%7+1}`);
export const socketsPerGroup=9;
type Edge={kind:'R'|'V'|'I';a:string;b:string;value:number};
const expected:Record<LabMode,Edge[]>={
 'exp2':[{kind:'R',a:'H',b:'L',value:100},{kind:'V',a:'H',b:'L',value:10}],
 'exp3':[{kind:'R',a:'H',b:'L',value:100},{kind:'V',a:'H',b:'L',value:10}],
 'exp4-parallel':[{kind:'R',a:'H',b:'L',value:220},{kind:'R',a:'H',b:'L',value:330},{kind:'V',a:'H',b:'L',value:10}],
 'exp4-series':[{kind:'R',a:'H',b:'M',value:220},{kind:'R',a:'M',b:'L',value:330},{kind:'V',a:'H',b:'L',value:10}],
 'exp5-parallel':[{kind:'R',a:'H',b:'L',value:100},{kind:'R',a:'H',b:'L',value:220},{kind:'V',a:'H',b:'L',value:10}],
 'exp5-series':[{kind:'R',a:'H',b:'M1',value:100},{kind:'R',a:'M1',b:'M2',value:220},{kind:'R',a:'M2',b:'L',value:470},{kind:'V',a:'H',b:'L',value:10}]
};
export const expectedResistors=(mode:LabMode)=>expected[mode].filter(e=>e.kind==='R').map(e=>e.value);
const prefixes:Record<string,number>={p:1e-12,n:1e-9,'µ':1e-6,'μ':1e-6,u:1e-6,m:1e-3,c:1e-2,d:1e-1,'':1,da:1e1,h:1e2,k:1e3,M:1e6,G:1e9,T:1e12};
export function parseQuantity(kind:'R'|'V'|'I',amount:number,unit:string){
 const clean=unit.trim().replace(/\s+/g,'');const bases=kind==='R'?['Ω','ohm','ohms']:kind==='V'?['V','volt','volts']:['A','amp','amps'];
 if(!Number.isFinite(amount)||(kind==='R'?amount<=0:amount===0))return null;
 for(const base of bases)if((base==='Ω'?clean.endsWith(base):clean.toLowerCase().endsWith(base.toLowerCase()))){
   const prefix=clean.slice(0,-base.length);const factor=prefixes[prefix];
   if(factor!==undefined){const value=amount*factor;return Number.isFinite(value)&&value!==0?value:null}
 }
 return null;
}
export function powerCheck(voltage:number,resistance:number,rating:number){const power=voltage*voltage/resistance;return {power,rating,unsafe:power>rating+1e-9};}
export function idealResults(mode:LabMode,voltage=10,resistors=expectedResistors(mode)){
 const Rs=resistors;
 if(mode.endsWith('parallel')){const currents=Rs.map(r=>voltage/r);return{voltage,resistors:Rs,currents,totalCurrent:currents.reduce((a,b)=>a+b,0),drops:Rs.map(()=>voltage),equivalent:1/Rs.reduce((a,r)=>a+1/r,0)}}
 const equivalent=Rs.reduce((a,b)=>a+b,0),current=voltage/equivalent;
 return{voltage,resistors:Rs,currents:Rs.map(()=>current),totalCurrent:current,drops:Rs.map(r=>r*current),equivalent};
}
function idealNodeVoltages(mode:LabMode,voltage:number,resistors=expectedResistors(mode)){
 const result=idealResults(mode,voltage,resistors),values:Record<string,number>={H:voltage,L:0};
 if(mode.endsWith('series')){let v=voltage;result.drops.slice(0,-1).forEach((drop,index)=>{v-=drop;values[mode==='exp5-series'?`M${index+1}`:'M']=v})}
 return values;
}
export function unionMap(placements:Placement[],bridge?:[string,string]){
 const parent=new Map(boardGroups.map(g=>[g,g]));
 const find=(g:string):string=>{const p=parent.get(g)||g;if(p===g)return g;const root=find(p);parent.set(g,root);return root};
 const union=(a:string,b:string)=>{const ra=find(a),rb=find(b);if(ra!==rb)parent.set(rb,ra)};
 placements.filter(p=>p.kind==='wire').forEach(p=>union(p.a,p.b));if(bridge)union(...bridge);
 return {find,groups:boardGroups};
}
function permutations<T>(items:T[]):T[][]{if(items.length<=1)return[items];return items.flatMap((item,i)=>permutations([...items.slice(0,i),...items.slice(i+1)]).map(rest=>[item,...rest]))}
function edgeKey(e:Edge){return e.kind==='R'?`R:${[e.a,e.b].sort().join('-')}`:`${e.kind}:${e.a}>${e.b}`}
export function validateTopology(placements:Placement[],mode:LabMode,bridge?:[string,string]){
 const {find}=unionMap(placements,bridge);
 const physical=placements.filter((p):p is Placement&{kind:'R'|'V'|'I'}=>p.kind!=='wire');
 const source=physical.find(p=>p.kind==='V'||p.kind==='I');
 if(physical.some(p=>typeof p.value!=='number'||!Number.isFinite(p.value)||p.kind==='R'&&p.value<=0))return{valid:false,reason:'أدخل قيمة صحيحة لكل عنصر قبل التحقق.',nodeMap:{} as Record<string,string>};
 if(physical.some(p=>find(p.a)===find(p.b)))return{valid:false,reason:'قصر كهربائي: طرفا عنصر متصلان بالعقدة نفسها.',nodeMap:{} as Record<string,string>};
 const desired=expected[mode].filter(e=>e.kind!=='V'||!!source).map(e=>e.kind==='V'&&source?.kind==='I'?{...e,kind:'I' as const,a:e.b,b:e.a}:e);
 if(physical.length!==desired.length)return{valid:false,reason:`يلزم ${expectedResistors(mode).length} مقاومة${source?' ومصدر واحد':''} لتوصيل مخطط التجربة؛ قيمها قابلة للتغيير.`,nodeMap:{} as Record<string,string>};
 const roots=[...new Set(physical.flatMap(p=>[find(p.a),find(p.b)]))];const nodes=[...new Set(desired.flatMap(e=>[e.a,e.b]))];
 if(roots.length!==nodes.length)return{valid:false,reason:'عدد العقد الكهربائية لا يطابق المخطط؛ افحص الأسلاك والفرع الوسطي.',nodeMap:{} as Record<string,string>};
 const expectedKeys=desired.map(edgeKey).sort().join('|');
 for(const order of permutations(nodes)){
   const map=Object.fromEntries(roots.map((root,i)=>[root,order[i]]));
   const actualKeys=physical.map(p=>edgeKey({kind:p.kind,a:map[find(p.a)],b:map[find(p.b)],value:p.value!})).sort().join('|');
   if(actualKeys===expectedKeys){const nodeMap=Object.fromEntries(boardGroups.map(g=>[g,map[find(g)]||'']));return{valid:true,reason:'التوصيل الكهربائي مطابق للمخطط، بصرف النظر عن شكل الأسلاك أو لونها.',nodeMap}}
 }
 return{valid:false,reason:'التوصيل الكهربائي لا يطابق الفروع والقطبية في المخطط.',nodeMap:{} as Record<string,string>};
}
export function resistorPlacementsForMode(placements:Placement[],mode:LabMode,nodeMap:Record<string,string>){
 const {find}=unionMap(placements),expectedBranches=expected[mode].filter(e=>e.kind==='R');const remaining=placements.filter(p=>p.kind==='R');
 return expectedBranches.map(edge=>{const index=remaining.findIndex(p=>[nodeMap[find(p.a)]||nodeMap[p.a],nodeMap[find(p.b)]||nodeMap[p.b]].sort().join('-')===[edge.a,edge.b].sort().join('-'));return index>=0?remaining.splice(index,1)[0]:remaining.shift()});
}
export function resistorsForMode(placements:Placement[],mode:LabMode,nodeMap:Record<string,string>){return resistorPlacementsForMode(placements,mode,nodeMap).map((p,i)=>p?.value||expectedResistors(mode)[i])}
function equivalentResistance(placements:Placement[],red:string,black:string){
 const {find}=unionMap(placements);const a=find(red),b=find(black);if(a===b)return 0;
 const Rs=placements.filter(p=>p.kind==='R');const roots=[...new Set(Rs.flatMap(p=>[find(p.a),find(p.b)]))];
 if(!roots.includes(a)||!roots.includes(b))return null;
 const unknown=roots.filter(n=>n!==b),matrix=unknown.map(()=>unknown.map(()=>0)),rhs:number[]=unknown.map(n=>n===a?1:0);
 for(const p of Rs){const x=find(p.a),y=find(p.b),g=1/(p.value||1);for(const [u,v,sgn] of [[x,x,1],[y,y,1],[x,y,-1],[y,x,-1]] as [string,string,number][]) {const i=unknown.indexOf(u),j=unknown.indexOf(v);if(i>=0&&j>=0)matrix[i][j]+=sgn*g}}
 for(let k=0;k<unknown.length;k++){let pivot=k;for(let i=k+1;i<unknown.length;i++)if(Math.abs(matrix[i][k])>Math.abs(matrix[pivot][k]))pivot=i;if(Math.abs(matrix[pivot][k])<1e-12)return null;[matrix[k],matrix[pivot]]=[matrix[pivot],matrix[k]];[rhs[k],rhs[pivot]]=[rhs[pivot],rhs[k]];const d=matrix[k][k];for(let j=k;j<unknown.length;j++)matrix[k][j]/=d;rhs[k]/=d;for(let i=0;i<unknown.length;i++)if(i!==k){const factor=matrix[i][k];for(let j=k;j<unknown.length;j++)matrix[i][j]-=factor*matrix[k][j];rhs[i]-=factor*rhs[k]}}
 return rhs[unknown.indexOf(a)];
}
export function meterReading(placements:Placement[],mode:LabMode,meter:Meter,powerOn:boolean,voltage=10){
 if(!meter.red||!meter.black)return{ok:false,message:'ضع المجس الأحمر والأسود على مقبسين أولًا.'};
 const hasSource=placements.some(p=>p.kind==='V'||p.kind==='I');const same=unionMap(placements).find(meter.red)===unionMap(placements).find(meter.black);
 if(meter.mode==='Ω'){
   if(powerOn||hasSource)return{ok:false,message:'افصل التغذية وأزل طرفَي المصدر قبل قياس المقاومة.'};
   if(meter.redPort!=='VΩ')return{ok:false,message:'مجس المقاومة الأحمر يجب أن يكون في منفذ VΩ.'};
   const ohms=equivalentResistance(placements,meter.red,meter.black);return ohms===null?{ok:false,message:'لا يوجد مسار مقاومي بين المجسين؛ ستظهر OL.'}:{ok:true,value:ohms,unit:'Ω',message:same?'المجسان على العقدة نفسها؛ القراءة تقارب 0 Ω.':'مقاومة الشبكة بين المجسين.'};
 }
 if(meter.mode==='V'){
   if(meter.redPort!=='VΩ')return{ok:false,message:'لقياس الجهد انقل المجس الأحمر إلى منفذ VΩ، ووصل الملتيميتر على التوازي.'};
   if(!powerOn)return{ok:false,message:'المصدر مفصول؛ توقع قراءة جهد صفري تقريبًا.'};
   if(same)return{ok:true,value:0,unit:'V',message:'المجسان على العقدة الكهربائية نفسها؛ لذلك القراءة 0 V.'};
   const check=validateTopology(placements,mode);if(!check.valid)return{ok:false,message:check.reason};
   const redNode=check.nodeMap[meter.red],blackNode=check.nodeMap[meter.black];
   const Rs=resistorsForMode(placements,mode,check.nodeMap),source=placements.find(p=>p.kind==='V'||p.kind==='I');
   const sourceVoltage=source?.kind==='I'?(source.value||0)*idealResults(mode,1,Rs).equivalent:source?.value??voltage;
   const nodeVoltage=idealNodeVoltages(mode,sourceVoltage,Rs);
   if(redNode&&blackNode&&nodeVoltage[redNode]!==undefined&&nodeVoltage[blackNode]!==undefined)return{ok:true,value:nodeVoltage[redNode]-nodeVoltage[blackNode],unit:'V',message:'الفولتميتر موصول على التوازي بين عقدتين.'};
   return{ok:false,message:'حدد مجسين على عقدتين فعالتين في المخطط.'};
 }
 if(meter.redPort!=='mA'&&meter.redPort!=='10A')return{ok:false,message:'لقياس التيار انقل الأحمر إلى منفذ mA أو 10A، ثم افتح الفرع وأدخل الجهاز على التوالي.'};
 if(same)return{ok:false,message:'المجسان على العقدة نفسها؛ الجهاز لا يجسر فجوة قياس.'};
 const withMeter=validateTopology(placements,mode,[meter.red,meter.black]);
 if(!withMeter.valid)return{ok:false,message:hasSource&&unionMap(placements,[meter.red,meter.black]).find(placements.find(p=>p.kind==='V'||p.kind==='I')!.a)===unionMap(placements,[meter.red,meter.black]).find(placements.find(p=>p.kind==='V'||p.kind==='I')!.b)?'خطر قصر: الأميتر وصل طرفَي المصدر مباشرة. افتح فرع مقاومة وأدخله على التوالي.':'الأميتر لا يعيد دائرة صحيحة؛ افتح فرعًا وأدخل الجهاز على التوالي.'};
 if(validateTopology(placements,mode).valid)return{ok:false,message:'الدائرة مكتملة دون الجهاز؛ الملتيميتر ليس في سلسلة الفرع.'};
 if(!powerOn)return{ok:false,message:'التوصيل التسلسلي صحيح؛ شغّل المصدر بعد فحص القدرة وبحضور المشرف.'};
 const without=unionMap(placements),redRoot=without.find(meter.red),blackRoot=without.find(meter.black);
 const source=placements.find(p=>p.kind==='V'||p.kind==='I');const sourceRoots=new Set(source?[without.find(source.a),without.find(source.b)]:[]);
 const chosen=!sourceRoots.has(redRoot)?redRoot:!sourceRoots.has(blackRoot)?blackRoot:blackRoot;
 const Rs=resistorsForMode(placements,mode,withMeter.nodeMap);const sourceVoltage=source?.kind==='I'?(source.value||0)*idealResults(mode,1,Rs).equivalent:source?.value??voltage;
 const nodeVoltage=idealNodeVoltages(mode,sourceVoltage,Rs);
 let outgoing=0;
 for(const resistor of placements.filter(p=>p.kind==='R')){
   const ra=without.find(resistor.a),rb=without.find(resistor.b),va=nodeVoltage[withMeter.nodeMap[resistor.a]],vb=nodeVoltage[withMeter.nodeMap[resistor.b]];
   if(ra===chosen)outgoing+=(va-vb)/(resistor.value||1);
   if(rb===chosen)outgoing+=(vb-va)/(resistor.value||1);
 }
 const current=chosen===blackRoot?outgoing:-outgoing;
 return{ok:true,value:meter.redPort==='mA'?current*1000:current,unit:meter.redPort==='mA'?'mA':'A',message:'الأميتر يجسر فجوة في المسار، والتوصيل على التوالي صحيح. الإشارة تتبع منفذ الأحمر.'};
}
