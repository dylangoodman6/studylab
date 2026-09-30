import{useMemo,useState}from'react';
import{BookOpen,CheckCircle2,Clock3,Lightbulb,RotateCcw,ShieldCheck}from'lucide-react';
import quizData from'../data/quiz2.json';
import BookCircuit from'./BookCircuit';

type Locale='en'|'ar';
type Scope='quiz2'|'chapters';
type Attempt={correct:boolean;at:string;answer:string;unit:string;working:string};
type Saved=Record<string,Attempt>;
function readSaved():Saved{try{return JSON.parse(localStorage.getItem('studylab.quiz2.v2')||'{}')}catch{return{}}}
const ui=(lang:Locale,en:string,ar:string)=>lang==='en'?en:ar;
const localSource=typeof window!=='undefined'&&['127.0.0.1','localhost'].includes(window.location.hostname);

export default function Quiz2({lang,scope}:{lang:Locale;scope:Scope}){
 const initialChapter=scope==='quiz2'?'ch3':'ch4';
 const[chapterId,setChapterId]=useState(initialChapter),[questionId,setQuestionId]=useState(scope==='quiz2'?'q3-1':'q4-1');
 const[mode,setMode]=useState<'learn'|'exam'>('learn'),[answer,setAnswer]=useState(''),[unit,setUnit]=useState(''),[working,setWorking]=useState(''),[hint,setHint]=useState(0),[submitted,setSubmitted]=useState(false),[feedback,setFeedback]=useState(''),[attempts,setAttempts]=useState<Saved>(readSaved);
 const chapters=quizData.chapters.filter(c=>scope==='quiz2'?c.id==='ch3':c.id!=='ch3');
 const chapter=chapters.find(c=>c.id===chapterId)||chapters[0];
 const questions=useMemo(()=>quizData.questions.filter(q=>q.chapter===chapterId),[chapterId]);
 const question=questions.find(q=>q.id===questionId)||questions[0];
 const correct=submitted&&attempts[question.id]?.correct;
 const totalHours=chapters.reduce((sum,c)=>sum+c.hours,0);
 function reset(id:string){setQuestionId(id);setAnswer('');setUnit('');setWorking('');setHint(0);setSubmitted(false);setFeedback('')}
 function chooseChapter(id:string){setChapterId(id);reset(quizData.questions.find(q=>q.chapter===id)!.id)}
 function submit(){
   if(!answer.trim()||!unit.trim()||working.trim().length<12){setFeedback(ui(lang,'Enter a result, its unit, and at least one calculation or explanation.','أدخل الناتج ووحدته وبيّن خطوة حساب أو تفسيرًا واحدًا على الأقل.'));return}
   const numeric=Number(answer),tol=Math.max(question.tolerance,Math.abs(question.answer)*0.005);
   const normalized=unit.trim().replace(/µ/g,'μ').toLowerCase();
   const unitOk=question.unit==='ratio'?['ratio','unitless','dimensionless','1'].includes(normalized):normalized===question.unit.toLowerCase();
   const ok=Number.isFinite(numeric)&&Math.abs(numeric-question.answer)<=tol&&unitOk;
   const updated={...attempts,[question.id]:{correct:ok,at:new Date().toISOString(),answer,unit,working}};
   setAttempts(updated);localStorage.setItem('studylab.quiz2.v2',JSON.stringify(updated));setSubmitted(true);
   setFeedback(ok?ui(lang,'Numerical result and unit match. Compare your written derivation with the solution below.','الناتج والوحدة صحيحان. قارن خطواتك بالحل أدناه.'):
     ui(lang,'Recheck the numerical result, sign, and unit. Compare your derivation with the solution below.','راجع العدد والإشارة والوحدة، ثم قارن خطواتك بالحل أدناه.'));
 }
 const scopedQuestions=quizData.questions.filter(q=>scope==='quiz2'?q.chapter==='ch3':q.chapter!=='ch3');
 const completed=scopedQuestions.filter(q=>attempts[q.id]?.correct).length;
 return <div className="content quiz2-content">
   <div className="quiz2-hero"><div><span className="eyebrow light">{scope==='quiz2'?'EE241 · Quiz 2':'EE241 · Chapter practice'}</span><h1>{scope==='quiz2'?ui(lang,'Chapter 3 written-response practice','تدريب الفصل الثالث المقالي'):ui(lang,'Practice for later chapters','تدريب الفصول اللاحقة')}</h1><p>{scope==='quiz2'?ui(lang,'Only Chapter 3 through lecture PDF page 21 (slide 42). Every question stays in English in both interface languages.','الفصل الثالث فقط حتى صفحة PDF رقم 21 (السلايد 42). تبقى جميع الأسئلة بالإنجليزية في الواجهتين.'):ui(lang,'Chapter 4, 6, 7, and 8 examples. Every question stays in English in both interface languages.','أمثلة الفصول 4 و6 و7 و8. تبقى جميع الأسئلة بالإنجليزية في الواجهتين.')}</p></div><div className="quiz2-time"><Clock3 size={22}/><strong dir="ltr">{totalHours} h</strong><span>{scope==='quiz2'?ui(lang,'Estimated Chapter 3 study time','وقت دراسة الفصل الثالث المتوقع'):ui(lang,'Estimated study time for these chapters','الوقت المتوقع لهذه الفصول')}</span></div></div>
   <div className="quiz2-chapters" role="tablist">{chapters.map(c=><button role="tab" aria-selected={c.id===chapterId} key={c.id} className={c.id===chapterId?'active':''} onClick={()=>chooseChapter(c.id)}><strong dir="ltr">{c.title}</strong><small><Clock3 size={13}/> {c.hours} {ui(lang,'hours','ساعات')}</small></button>)}</div>
   <div className="quiz2-scope panel"><div><span className="panel-kicker">{ui(lang,'Course scope','نطاق المنهج')}</span><h2 dir="ltr">{chapter.title}</h2><p dir="ltr">{chapter.scope}</p><p dir="ltr"><strong>Textbook alignment:</strong> {chapter.book}</p></div><span className="quiz2-estimate"><Clock3 size={16}/>{chapter.hours} {ui(lang,'hours','ساعات')}</span></div>
   <div className="quiz2-layout"><aside className="panel quiz2-list"><div className="panel-head"><h3>{ui(lang,'Practice problems','مسائل تدريبية')}</h3><span>{questions.length}</span></div>{questions.map((q,i)=><button key={q.id} className={q.id===question.id?'active':''} onClick={()=>reset(q.id)}><span className="problem-index">{String(i+1).padStart(2,'0')}</span><span dir="ltr">{q.title}</span>{attempts[q.id]?.correct&&<CheckCircle2 size={16}/>}</button>)}</aside>
   <section className="panel quiz2-question"><div className="panel-head"><div><span className="panel-kicker">{ui(lang,'Essay problem','سؤال مقالي')} · {question.id.toUpperCase()}</span><h2 dir="ltr">{question.title}</h2></div><span className="verified"><ShieldCheck size={15}/>{ui(lang,'Verified','متحقق منه')}</span></div>
     {question.source.bookProblem&&<BookCircuit id={question.id}/>}
     <p className="quiz2-prompt" dir="ltr">{question.prompt}</p><div className="quiz2-source" dir="ltr">{question.origin}<br/>{localSource?<a href={`/source/${question.source.lecture}#page=${question.source.pdfPage}`} target="_blank" rel="noreferrer">Lecture PDF p. {question.source.pdfPage}</a>:<>Lecture PDF p. {question.source.pdfPage}</>} · {question.source.bookProblem&&'Book figure and problem: '}{localSource&&question.source.bookPdfPage?<a href={`/source/nilsson#page=${question.source.bookPdfPage}`} target="_blank" rel="noreferrer">Nilsson/Riedel {question.source.bookProblem&&`Problem ${question.source.bookProblem}, `}printed p. {question.source.bookPrintedPage}</a>:<>Nilsson/Riedel {question.source.bookProblem&&`Problem ${question.source.bookProblem}, `}printed p. {question.source.bookPrintedPage}</>}</div>
     <div className="mode-switch quiz2-mode"><button className={mode==='learn'?'active':''} onClick={()=>{setMode('learn');reset(question.id)}}>{ui(lang,'Learn','تعلّم')}</button><button className={mode==='exam'?'active':''} onClick={()=>{setMode('exam');reset(question.id)}}>{ui(lang,'Test','اختبار')}</button></div>
     <label className="quiz2-working">{ui(lang,'Your derivation or explanation','خطواتك أو تفسيرك')}<textarea dir="ltr" rows={5} value={working} disabled={submitted} onChange={e=>setWorking(e.target.value)} placeholder="Write the law, substitute values, and explain the sign or damping case."/></label>
     <div className="quiz2-answer"><label>{ui(lang,'Numerical result','الناتج العددي')}<input dir="ltr" inputMode="decimal" type="number" step="any" value={answer} disabled={submitted} onChange={e=>setAnswer(e.target.value)} placeholder="0.000"/></label><label>{ui(lang,'Unit','الوحدة')}<input dir="ltr" value={unit} disabled={submitted} onChange={e=>setUnit(e.target.value)} placeholder={question.unit}/></label><span dir="ltr">{ui(lang,'Expected unit:','الوحدة المطلوبة:')} {question.unit}</span></div>
     <div className="work-actions">{mode==='learn'&&!submitted&&<button className="hint-button" onClick={()=>setHint(h=>Math.min(3,h+1))}><Lightbulb size={17}/>{ui(lang,'Hint','تلميح')} {hint?`${hint}/3`:'1–3'}</button>}<button className="primary" onClick={submitted?()=>reset(questions[(questions.findIndex(q=>q.id===question.id)+1)%questions.length].id):submit}>{submitted?ui(lang,'Next problem','المسألة التالية'):ui(lang,'Submit written answer','سلّم الإجابة المقالية')}</button></div>
     {mode==='learn'&&hint>0&&!submitted&&<div className="hint-box"><strong>{ui(lang,'Hint level','مستوى التلميح')} {hint}</strong><p dir="ltr">{question.hints[hint-1]}</p></div>}
     {feedback&&<div className={`feedback ${correct?'good':'bad'}`} role="status">{feedback}</div>}
     {submitted&&<div className="quiz2-solution"><h3><BookOpen size={19}/>{ui(lang,'Verified worked solution','الحل المتحقق منه')}</h3><div className="quiz2-formula" dir="ltr">{question.formula}</div><p dir="ltr">{question.solution}</p><p dir="ltr"><strong>Result: {Number(question.answer.toFixed(5))} {question.unit}</strong> · exact: {question.answerExact}</p><small>{ui(lang,'Your written derivation is shown above for comparison; prose is not automatically graded.','قارن خطواتك المكتوبة بالحل؛ لا يُصحح الشرح النصي تلقائيًا.')}</small></div>}
   </section></div>
   <div className="quiz2-progress"><RotateCcw size={18}/>{ui(lang,'Correct problems','المسائل الصحيحة')}: {completed} / {scopedQuestions.length}. {ui(lang,'A later session can revisit unanswered and incorrect problems.','يمكنك العودة إلى المسائل غير المحلولة والخاطئة لاحقًا.')}</div>
 </div>
}
