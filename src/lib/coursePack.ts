export type GenericDrill={id:string;question:string;options:string[];correctIndex:number;hints:string[];explanation:string;errorType:string};
export type Chapter={id:string;title:string;learningObjectives:string[];prerequisites:string[];references:{source:string;pages:number[];role:string}[];errorTypes:string[];drills?:GenericDrill[];problems?:unknown[];lab?:unknown};
export type CoursePack={schemaVersion:string;id:string;subject:{code:string;name:string;language:string;direction:'rtl'|'ltr'};chapters:Chapter[]};
const object=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const strings=(value:unknown)=>Array.isArray(value)&&value.every(v=>typeof v==='string');
export function validateCoursePack(value:unknown):CoursePack{
 if(!object(value)||value.schemaVersion!=='1.0'||typeof value.id!=='string'||!object(value.subject)||!Array.isArray(value.chapters))throw Error('A pack needs schemaVersion=1.0, an ID, subject, and chapters.');
 if(typeof value.subject.name!=='string'||typeof value.subject.code!=='string'||!['rtl','ltr'].includes(String(value.subject.direction)))throw Error('Invalid subject data or text direction.');
 if(value.subject.language!=='en'||value.subject.direction!=='ltr'||/[\u0600-\u06FF]/.test(value.subject.name))throw Error('Course packs need English source content and left-to-right layout.');
 if(value.chapters.length<1||value.chapters.length>40)throw Error('Chapter count must be from 1 to 40.');
 for(const chapter of value.chapters){
   if(!object(chapter)||typeof chapter.id!=='string'||typeof chapter.title!=='string'||!strings(chapter.learningObjectives)||!strings(chapter.prerequisites)||!strings(chapter.errorTypes)||!Array.isArray(chapter.references))throw Error('Each chapter needs goals, prerequisites, references, and error types.');
   if([chapter.title,...chapter.learningObjectives,...chapter.prerequisites].some(text=>/[\u0600-\u06FF]/.test(text)))throw Error('Chapter titles, objectives, and prerequisites must be English.');
   for(const ref of chapter.references)if(!object(ref)||typeof ref.source!=='string'||!Array.isArray(ref.pages)||!ref.pages.every((n:unknown)=>Number.isInteger(n)&&Number(n)>0))throw Error('Invalid page reference.');
   if(chapter.drills!==undefined){if(!Array.isArray(chapter.drills))throw Error('Invalid drill list.');for(const drill of chapter.drills){if(!object(drill)||typeof drill.id!=='string'||typeof drill.question!=='string'||!strings(drill.options)||drill.options.length<2||!Number.isInteger(drill.correctIndex)||Number(drill.correctIndex)<0||Number(drill.correctIndex)>=drill.options.length||!strings(drill.hints)||typeof drill.explanation!=='string'||typeof drill.errorType!=='string')throw Error('A drill has invalid question, answer, or options.');if([drill.question,drill.explanation,...drill.options,...drill.hints].some(text=>/[\u0600-\u06FF]/.test(text)))throw Error('Imported written questions and model answers must be English.')}}
   if(Array.isArray(chapter.problems)&&chapter.problems.some((problem:unknown)=>{if(!object(problem))return false;const target=object(problem.target)?problem.target.label:'';const error=object(problem.error)?problem.error.question:'';const hints=Array.isArray(problem.hints)?problem.hints:[];return[problem.title,problem.reason,target,error,...hints].some(item=>typeof item==='string'&&/[\u0600-\u06FF]/.test(item))}))throw Error('Imported circuit questions must be English.');
   if(chapter.problems!==undefined&&!Array.isArray(chapter.problems))throw Error('Circuit problems must be an array.');
 }
 return value as CoursePack;
}
