import test from 'node:test';
import assert from 'node:assert/strict';
import {boardGroups,socketsPerGroup,idealResults,powerCheck,unionMap,validateTopology,meterReading,parseQuantity,resistorsForMode} from '../src/lib/lab.ts';
const R=(id,a,b,value)=>({id,kind:'R',a,b,value});
const W=(id,a,b)=>({id,kind:'wire',a,b});
const V=(a,b)=>({id:'V1',kind:'V',a,b,value:10});

test('experiment 4 parallel and series predictions',()=>{
 const p=idealResults('exp4-parallel');
 assert.ok(Math.abs(p.currents[0]*1000-45.4545)<.001);
 assert.ok(Math.abs(p.currents[1]*1000-30.3030)<.001);
 assert.ok(Math.abs(p.totalCurrent*1000-75.7575)<.001);
 const s=idealResults('exp4-series');
 assert.ok(Math.abs(s.totalCurrent*1000-18.1818)<.001);
 assert.deepEqual(s.drops,[4,6]);
});
test('each plug-in board group has nine connected sockets',()=>{
 assert.equal(socketsPerGroup,9);assert.equal(boardGroups.length,35);
 const connections=unionMap([]);assert.equal(connections.find('B2'),connections.find('B2'));
 assert.notEqual(connections.find('B2'),connections.find('B3'));
});
test('topology compares electrical connections rather than layout or wire color',()=>{
 const circuit=[R('r1','A1','B1',220),R('r2','C1','D1',330),W('w1','A1','C1'),W('w2','B1','D1'),V('A1','B1')];
 assert.equal(validateTopology(circuit,'exp4-parallel').valid,true);
 assert.equal(validateTopology(circuit,'exp4-series').valid,false);
 assert.equal(validateTopology([...circuit,W('short','A1','B1')],'exp4-parallel').valid,false);
});
test('custom values and SI units preserve circuit topology and predictions',()=>{
 assert.equal(parseQuantity('R',4.7,'kΩ'),4700);
 assert.equal(parseQuantity('R',4.7,'kOhm'),4700);
 assert.equal(parseQuantity('V',2.5,'kV'),2500);
 assert.equal(parseQuantity('I',75,'mA'),0.075);
 assert.equal(parseQuantity('R',1,'A'),null);
 const circuit=[R('r1','A1','B1',1000),R('r2','C1','D1',2000),W('w1','A1','C1'),W('w2','B1','D1'),{id:'v',kind:'V',a:'A1',b:'B1',value:12}];
 const check=validateTopology(circuit,'exp4-parallel');
 assert.equal(check.valid,true);
 assert.deepEqual(resistorsForMode(circuit,'exp4-parallel',check.nodeMap),[1000,2000]);
 assert.deepEqual(idealResults('exp4-parallel',12,[1000,2000]).currents,[0.012,0.006]);
 assert.equal(meterReading(circuit,'exp4-parallel',{mode:'V',redPort:'VΩ',red:'A1',black:'B1'},true).value,12);
});
test('a current source can replace the voltage source in the same guided topology',()=>{
 const circuit=[R('r1','A1','B1',220),R('r2','C1','D1',330),W('w1','A1','C1'),W('w2','B1','D1'),{id:'i',kind:'I',a:'B1',b:'A1',value:1/13.2}];
 assert.equal(validateTopology(circuit,'exp4-parallel').valid,true);
 const reading=meterReading(circuit,'exp4-parallel',{mode:'V',redPort:'VΩ',red:'A1',black:'B1'},true);
 assert.equal(reading.ok,true);
 assert.ok(Math.abs(reading.value-10)<1e-9);
});
test('voltage port and parallel connection, current series connection',()=>{
 const full=[R('r1','A1','B1',220),R('r2','C1','D1',330),W('w1','A1','C1'),W('w2','B1','D1'),V('A1','B1')];
 assert.equal(meterReading(full,'exp4-parallel',{mode:'V',redPort:'mA',red:'A1',black:'B1'},true).ok,false);
 assert.equal(meterReading(full,'exp4-parallel',{mode:'V',redPort:'VΩ',red:'A1',black:'B1'},true).value,10);
 assert.equal(meterReading(full,'exp4-parallel',{mode:'A',redPort:'mA',red:'A1',black:'B1'},true).ok,false);
 const gap=[R('r1','A1','B1',220),R('r2','C1','D1',330),W('w1','B1','D1'),W('w2','C1','E1'),V('E1','B1')];
 const reading=meterReading(gap,'exp4-parallel',{mode:'A',redPort:'mA',red:'E1',black:'A1'},true);
 assert.equal(reading.ok,true);assert.equal(reading.unit,'mA');assert.ok(Math.abs(reading.value-10000/220)<1e-9);
});
test('resistance requires source disconnected and power rating catches 20V',()=>{
 assert.deepEqual(powerCheck(20,100,2),{power:4,rating:2,unsafe:true});
 const resistor=[R('r1','A1','B1',100)];
 assert.equal(meterReading([...resistor,V('A1','B1')],'exp2',{mode:'Ω',redPort:'VΩ',red:'A1',black:'B1'},false).ok,false);
 assert.equal(meterReading(resistor,'exp2',{mode:'Ω',redPort:'VΩ',red:'A1',black:'B1'},false).value,100);
});
