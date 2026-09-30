import json
from pathlib import Path
from circuits import PROBLEMS
from verify import validate_problem

for problem in PROBLEMS:
    result=validate_problem(problem)
    problem['verified']=result
    print(problem['id'],result['answerExact'],problem['target']['unit'],'power residual',result['powerResidual'])
out=Path(__file__).parent.parent/'src/data/circuits.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(PROBLEMS,ensure_ascii=False,indent=2)+'\n')
pack={
 'schemaVersion':'1.0',
 'id':'ee241-ee247-studylab',
 'subject':{'code':'EE241 / EE247','name':'Electric Circuits I and Laboratory','language':'en','direction':'ltr'},
 'chapters':[
  {'id':'ee241-ch3','title':'Methods of Analysis','learningObjectives':['Nodal analysis and supernodes','Mesh analysis and supermeshes','Dependent sources','Matrix form of circuit equations','Choose a method with fewer equations'],
   'prerequisites':['Nodes and branches','Current direction and voltage polarity','Ohm’s law','KCL','KVL'],
   'references':[{'source':'EE241_Lect9-11_Ch3-Methods of Analysis.pdf','pages':[2,10,15,19,22,25],'role':'concept scope'},
                 {'source':'EE241_Lect4-7_ Ch2-Basic Electric Laws (1).pdf','pages':[7,12,28,31],'role':'prerequisites'}],
   'errorTypes':['nodes','direction','kcl_kvl','supernode','supermesh','dependent','algebra','units'],
   'problems':PROBLEMS,
   'drills':[]},
  {'id':'ee247-lab1-5','title':'Circuits Laboratory: Experiments 1–5','learningObjectives':['Identify instruments','Read resistor color bands, tolerance, and power','Verify Ohm’s law','Verify KCL and KVL','Current and voltage division'],
   'prerequisites':['Laboratory safety','Ohm’s law','KCL','KVL'],
   'references':[{'source':'Electric Circuits Lab Manual[EE247] (1).pdf','pages':[3,5,6,9,10,12,14,15,16,17,18,19],'role':'lab instructions'}],
   'errorTypes':['wiring','polarity','meter_mode','meter_port','power_rating','units'],
   'lab':{'board':{'groupCount':35,'socketsPerGroup':9,'groups':[f'{row}{col}' for row in 'ABCDE' for col in range(1,8)]},
          'instruments':['DC power supply','digital multimeter','plug-in board','Multisim'],
          'experiments':[{'id':1,'page':5,'title':'Instruments and measurement'}, {'id':2,'page':9,'title':'Resistor colors and power'}, {'id':3,'page':12,'title':'Ohm’s law'}, {'id':4,'page':14,'title':'KCL/KVL'}, {'id':5,'page':17,'title':'Current and voltage dividers'}],
          'manualReadings':True,'sourceConnectLast':True,'sourceDisconnectFirst':True}}
 ]}
pack_out=Path(__file__).parent.parent/'public/course-packs/ee241-ee247.json'
pack_out.parent.mkdir(parents=True,exist_ok=True)
pack_out.write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
local_pack=Path(__file__).parent.parent/'src/data/course-pack.json'
local_pack.write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
