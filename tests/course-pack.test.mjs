import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCoursePack} from '../src/lib/coursePack.ts';
test('built-in course pack includes independent visual and electrical circuit data',()=>{
 const pack=validateCoursePack(JSON.parse(readFileSync(new URL('../public/course-packs/ee241-ee247.json',import.meta.url),'utf8')));
 assert.equal(pack.chapters[0].problems.length,12);
 const p=pack.chapters[0].problems[0];
 assert.ok(p.visual.nodePositions.a);
 assert.ok(p.branches.some(b=>b.kind==='R'));
 assert.equal(p.source.origin,'Original problem based on the lecture topic; not copied from the source');
 assert.equal(pack.chapters[1].lab.board.socketsPerGroup,9);
});
test('invalid general course pack is rejected',()=>{
 assert.throws(()=>validateCoursePack({schemaVersion:'1.0',id:'bad',subject:{name:'x',code:'x',direction:'rtl'},chapters:[{id:'c',title:'c',learningObjectives:[],prerequisites:[],references:[],errorTypes:[],drills:[{id:'d',question:'q',options:['yes','no'],correctIndex:3,hints:[],explanation:'',errorType:'x'}]}]}));
});
