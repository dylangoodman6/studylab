"""Verified EE241 practice. Quiz 2 contains Chapter 3 only."""
from __future__ import annotations
import json
from pathlib import Path
from verify import s

CHAPTERS = [
 {'id':'ch3','title':'Chapter 3 · Methods of Analysis','hours':2,'scope':'EE241 Chapter 3 lecture PDF pages 1–21 only (slides 1–42). Stop at the “Methods of Analysis-3” divider; exclude later inspection and method-comparison slides.','book':'Nilsson/Riedel, §§4.2–4.7, printed pp. 93–104; selected end-of-chapter problems on pp. 130–135.'},
 {'id':'ch4','title':'Chapter 4 · Circuit Theorems','hours':3,'scope':'Linearity, superposition, source transformations, Thévenin, Norton, and maximum power transfer.','book':'Nilsson/Riedel, §§4.9–4.13, printed pp. 109–124.'},
 {'id':'ch6','title':'Chapter 6 · Capacitors and Inductors','hours':2,'scope':'EE241 Chapter 6 lecture: capacitor and inductor terminal laws, stored energy, DC steady state, and series/parallel equivalents. Mutual inductance is outside these slides.','book':'Nilsson/Riedel, §§6.1–6.3, printed pp. 176–188.'},
 {'id':'ch7','title':'Chapter 7 · First-Order RC and RL','hours':3,'scope':'Natural and step responses; initial/final values and time constants.','book':'Nilsson/Riedel, §§7.1–7.4, printed pp. 214–235.'},
 {'id':'ch8','title':'Chapter 8 · Second-Order RLC','hours':4,'scope':'Initial conditions, source-free and step responses, and the three damping cases.','book':'Nilsson/Riedel, §§8.1–8.4, printed pp. 266–288.'},
]

def q(id,chapter,title,prompt,unit,expression,formula,solution,hints,lecture,page,book_page,tolerance=0.005,book_problem=None):
    exact=s.simplify(s.sympify(expression))
    assert exact.is_real and exact.is_finite
    return {'id':id,'chapter':chapter,'title':title,'prompt':prompt,'unit':unit,'expression':expression,
            'answer':float(exact),'answerExact':str(exact),'formula':formula,'solution':solution,
            'hints':hints,'source':{'lecture':lecture,'pdfPage':page,'bookPrintedPage':book_page,
                                 'bookPdfPage':book_page+24 if book_problem else None,'bookProblem':book_problem},
            'tolerance':tolerance,'origin':(f'Adapted from Nilsson/Riedel Problem {book_problem}; circuit values and connections follow the cited problem.'
                                          if book_problem else 'Original StudyLab practice question; the reference covers the concept, not this question.')}

QUESTIONS=[
 q('q3-1','ch3','Two-node KCL','Node a connects to ground through 4 Ω and to node b through 2 Ω. Node b connects to ground through 6 Ω. A 3 A source enters a from ground; a 1 A source leaves b for ground. Write KCL at both nodes and find Va.','V','6',
   'Va/4+(Va−Vb)/2=3; Vb/6+(Vb−Va)/2=−1','Solving gives Va=6 V and Vb=3 V. Substitute: 6/4+(6−3)/2=3 A; 3/6+(3−6)/2=−1 A.',
   ['Draw the two node voltages.','Apply KCL separately at a and b.','Check both source directions before solving.'],'ch3',2,94),
 q('q3-2','ch3','Supernode with reversed polarity','Node a connects to ground through 4 Ω, node b through 2 Ω, and a 3 A source enters b from ground. A 4 V source has + at b and − at a. Write supernode KCL and the source constraint. Find Va.','V','4/3',
   'Va/4+Vb/2=3; Vb−Va=4','Vb=Va+4. Then Va/4+(Va+4)/2=3, giving Va=4/3 V and Vb=16/3 V.',
   ['Enclose the voltage source and both nodes.','KCL around the supernode has the external resistor and current-source branches.','The positive terminal is at b: Vb−Va=4 V.'],'ch3',10,96),
 q('q3-3','ch3','Shared-resistor mesh','A clockwise left mesh contains a 12 V rise and a shared 6 Ω resistor. A clockwise right mesh contains that shared 6 Ω resistor and separate 2 Ω and 4 Ω resistors. Use KVL to find the clockwise left mesh current i1.','A','4',
   '6(i1−i2)=12; 6(i2−i1)+2i2+4i2=0','The first loop gives i1−i2=2 A. The second gives i2=i1/2. Thus i1=4 A and i2=2 A.',
   ['Draw both clockwise mesh currents.','Shared-resistor current is i1−i2 in the left mesh.','Solve 6(i1−i2)=12 and 12i2−6i1=0.'],'ch3',15,101),
 q('q3-4','ch3','Supermesh constraint','A 12 V source drives the outer perimeter of two clockwise meshes. The outer-left resistance is 2 Ω, the outer-right resistance is 6 Ω, and a 1 A source in their shared branch points with i1 and against i2. Write outer KVL and the source constraint; find i2.','A','5/4',
   '2i1+6i2=12; i1−i2=1','Substitute i1=i2+1 into 2i1+6i2=12: 8i2=10, so i2=1.25 A and i1=2.25 A.',
   ['Bypass the current-source branch in KVL.','Use the source arrow to form the mesh-current difference.','2i1+6i2=12 and i1−i2=1.'],'ch3',19,103),
 q('q3-b1','ch3','Book 4.6 · Single-node voltage','Use nodal analysis. A 24 V source (+ at top) reaches node x through series 20 Ω and 80 Ω resistors. From x to ground are a 25 Ω resistor and a 40 mA current source pointing downward. Write KCL at x and find Vx across the 25 Ω resistor (+ at x).','V','4',
   '(Vx−24)/100+Vx/25+0.04=0','The two series resistors carry (Vx−24)/100 A from x. KCL gives (Vx−24)/100+Vx/25+0.04=0, so 5Vx=20 and Vx=4 V. The 25 Ω branch current is 0.16 A downward.',
   ['Combine the 20 Ω and 80 Ω series resistors.','Sum currents leaving node x.','(Vx−24)/100+Vx/25+0.04=0.'],'ch3',2,130,book_problem='4.6'),
 q('q3-b2','ch3','Book 4.13 · Two-node KCL','Use the bottom wire as ground. A 6 A source injects into node a; 40 Ω joins a to ground. An 8 Ω resistor joins a to b. At b, 80 Ω and 120 Ω each connect to ground, while a 1 A source points from b to ground. Write both KCL equations and find Vb.','V','96',
   'Va/40+(Va−Vb)/8=6; Vb/80+Vb/120+(Vb−Va)/8=−1','The two KCL equations give Va=120 V and Vb=96 V. Check at a: 120/40+(120−96)/8=6 A. At b: 96/80+96/120+(96−120)/8=−1 A.',
   ['Label the two top nodes a and b.','Apply KCL with injected source current positive.','Va/40+(Va−Vb)/8=6; Vb/80+Vb/120+(Vb−Va)/8=−1.'],'ch3',2,131,book_problem='4.13'),
 q('q3-b3','ch3','Book 4.22 · Voltage-source supernode','Use the bottom wire as ground. Node b connects to ground through 50 Ω and a 2 A current source pointing downward. A 25 V source connects b (+) to node c (−). Node c connects to ground through 150 Ω and through series 20 Ω + 55 Ω. Write supernode KCL and the source constraint. Find Vb, measured from b to ground.','V','-75/2',
   'Vb/50+Vc/150+Vc/75+2=0; Vb−Vc=25','The outside branches of the supernode give (Vb+Vc)/50=−2 A, so Vb+Vc=−100 V. With Vb−Vc=25 V, Vb=−37.5 V and Vc=−62.5 V. The negative sign follows the declared voltage direction.',
   ['Include b and c in one supernode.','The 25 V source gives Vb−Vc=25.','Vb/50+Vc/150+Vc/75+2=0; Vb−Vc=25.'],'ch3',10,132,book_problem='4.22'),
 q('q3-b4','ch3','Book 4.32 · Reversed branch current','Use clockwise mesh currents i1 (left) and i2 (right). The left loop has an 80 V source (+ at top), a 75 Ω top resistor and a 125 Ω bottom resistor. The right loop has a 140 V source (+ at top), a 150 Ω top resistor and a 250 Ω bottom resistor. The loops share a 200 Ω vertical resistor. The requested current ic through the 150 Ω resistor points right-to-left, opposite clockwise i2. Write mesh KVL and find ic.','A','-9/25',
   '400i1−200i2=80; −200i1+600i2=140; ic=−i2','Mesh KVL gives i1=0.38 A and i2=0.36 A. The requested arrow through 150 Ω points opposite i2, so ic=−0.36 A. The negative value says current actually flows left-to-right.',
   ['Draw both clockwise mesh currents.','The shared 200 Ω drop is 200(i1−i2) in the left loop.','400i1−200i2=80; −200i1+600i2=140; ic=−i2.'],'ch3',15,134,book_problem='4.32(a)'),
 q('q3-b5','ch3','Book 4.49 · Supermesh power','Two clockwise meshes share a 4 A current source pointing downward. The left outer branch has a 100 V source (+ at top), a 6 Ω top resistor and a 9 Ω bottom resistor. The right outer branch has a 25 V source (+ at bottom), a 20 Ω top resistor and a 30 Ω bottom resistor. Use a supermesh and calculate the total power dissipated by the four resistors.','W','425',
   'i1−i2=4; 15i1+50i2=125; P=15i1²+50i2²','The shared-source constraint is i1−i2=4 A. Outer KVL is 15i1+50i2=100+25=125 V. Thus i1=5 A and i2=1 A; resistor power is (6+9)5²+(20+30)1²=425 W.',
   ['The 4 A source is inside the supermesh.','Write KVL around the outer perimeter and a separate source-current constraint.','i1−i2=4; 15i1+50i2=125; P=15i1²+50i2².'],'ch3',19,135,book_problem='4.49'),
 q('q4-1','ch4','Superposition at a node','A 6 V source connects to node x through 3 Ω; node x connects to ground through 6 Ω. An independent 1 A source injects current from ground into x. Use superposition to find Vx. Show each source contribution.','V','6',
   'Vx=Vx|6V+Vx|1A=4+2','With the 1 A source opened, voltage division gives 6·6/(3+6)=4 V. With the 6 V source shorted, 1 A sees 3||6=2 Ω, giving 2 V. Total Vx=6 V. Direct KCL: (Vx−6)/3+Vx/6=1.',
   ['Keep one independent source active at a time.','Short the ideal voltage source; open the ideal current source.','Add the two voltage contributions algebraically.'],'ch4',3,122),
 q('q4-2','ch4','Source transformation','An ideal 2 A source points upward in parallel with a 5 Ω resistor. Transform it to its Thévenin equivalent. Find the open-circuit voltage at the top terminal relative to the bottom terminal.','V','10',
   'Vth=Is·R','Open-circuit current through the parallel resistor is 2 A downward, so Vth=(2 A)(5 Ω)=10 V with the top terminal positive. The equivalent series resistor remains 5 Ω.',
   ['Use the current source and its parallel resistor as a pair.','Vth=IsR.','Check the voltage polarity from the source arrow.'],'ch4',7,109),
 q('q4-3','ch4','Thévenin open-circuit voltage','A 12 V source feeds a 3 kΩ resistor to terminal a. A 6 kΩ resistor connects a to terminal b (ground). With the load removed, find Vth=Vab.','V','8',
   'Vth=12·6/(3+6)','The open-circuit terminal voltage is the divider output: 12×6/(3+6)=8 V. With the source set to zero, Rth=3 kΩ||6 kΩ=2 kΩ.',
   ['Remove the external load.','The 3 kΩ and 6 kΩ resistors form a divider.','Use Vth=Vs·Rbottom/(Rtop+Rbottom).'],'ch4',14,113),
 q('q4-4','ch4','Norton equivalent','A 9 V ideal source in series with 3 Ω appears at terminals a–b, with a positive relative to b. Find the Norton source current from b to a.','A','3',
   'IN=Vth/Rth','A 9 V source in series with 3 Ω has short-circuit current 9/3=3 A. The Norton current arrow points b→a, with a 3 Ω parallel resistance.',
   ['Short the output terminals conceptually.','IN=Vth/Rth.','Check the Norton arrow needed to make a positive at open circuit.'],'ch4',22,113),
 q('q4-5','ch4','Maximum power transfer','A network has Vth=8 V and Rth=2 kΩ. Choose the load for maximum power, then calculate that maximum power in mW.','mW','8',
   'RL=Rth; Pmax=Vth²/(4Rth)','For a resistive DC load, RL=2 kΩ. Pmax=8²/(4×2000)=0.008 W=8 mW.',
   ['Match the load to the Thévenin resistance.','At the match, the load gets half the Thévenin voltage.','Pmax=Vth²/(4Rth).'],'ch4',27,120),
 q('q6-1','ch6','Series capacitors and energy','A 6 μF capacitor and a 3 μF capacitor are in series across a 12 V ideal source. Find the total stored energy in μJ after steady state.','μJ','144',
   'Ceq=(6·3)/(6+3)=2 μF; W=½CeqV²','Ceq=2 μF. Total stored energy is 0.5×2 μF×(12 V)²=144 μJ. The same charge appears on both series capacitors.',
   ['Series capacitors share charge.','Find Ceq before computing total energy.','Use W=½CeqV².'],'ch6',15,188),
 q('q6-2','ch6','Capacitor current','A 4 μF capacitor voltage rises linearly at 2 V/ms under passive sign convention. Find its current in mA entering the positive terminal.','mA','8',
   'iC=C·dv/dt','dv/dt=2000 V/s. Thus iC=(4×10⁻⁶ F)(2000 V/s)=0.008 A=8 mA.',
   ['Use the capacitor terminal equation.','Convert V/ms into V/s.','Positive dv/dt gives positive current into the + terminal.'],'ch6',5,183),
 q('q6-3','ch6','Inductor voltage','A 50 mH inductor current increases at 4 A/s under passive sign convention. Find the voltage across it in V.','V','1/5',
   'vL=L·di/dt','L=0.05 H; vL=(0.05 H)(4 A/s)=0.2 V, positive at the current-entry terminal.',
   ['Use the inductor terminal equation.','Convert mH to H.','The rising current makes vL positive in passive convention.'],'ch6',20,176),
 q('q6-4','ch6','Parallel inductors and energy','Two uncoupled inductors of 12 mH and 6 mH are in parallel. Both start with zero current. After a source establishes a total current of 3 A, find their total stored energy in mJ.','mJ','18',
   'Leq=(12·6)/(12+6)=4 mH; W=½LeqI²','With zero initial currents, the branch currents divide to 1 A in 12 mH and 2 A in 6 mH. Their energies sum to ½(12 mH)(1 A)²+½(6 mH)(2 A)²=18 mJ. Equivalently Leq=4 mH and W=½Leq(3 A)².',
   ['Use the parallel equivalent for uncoupled inductors.','Leq=4 mH.','Use W=½LeqI².'],'ch6',27,188),
 q('q7-1','ch7','Natural RC response','A 100 μF capacitor initially holds 12 V. At t=0 it discharges through 10 kΩ. Find its voltage at t=1 s in V.','V','12/E',
   'τ=RC=1 s; v(t)=12e^(−t/τ)','The time constant is (10,000 Ω)(100 μF)=1 s. v(1)=12e⁻¹≈4.415 V.',
   ['Find the initial capacitor voltage.','Compute τ=RC.','Use v(t)=V0e^(−t/τ).'],'ch7',3,220),
 q('q7-2','ch7','Natural RL response','An inductor L=200 mH initially carries 2 A and then discharges through R=10 Ω. Find i at t=40 ms in A.','A','2/E**2',
   'τ=L/R=20 ms; i(t)=2e^(−t/τ)','τ=0.2/10=0.02 s. At 0.04 s, i=2e⁻²≈0.271 A. Inductor current is continuous at switching.',
   ['The initial inductor current continues through t=0.','Compute τ=L/R.','40 ms is two time constants.'],'ch7',8,214),
 q('q7-3','ch7','RC step response','A 2 kΩ–100 μF RC circuit starts at capacitor voltage 1 V. At t=0 it is connected to a 5 V DC source. Find vC at t=0.2 s in V.','V','5-4/E',
   'vC(t)=V∞+(V0−V∞)e^(−t/RC)','RC=0.2 s, V∞=5 V, and V0=1 V. Thus vC(0.2)=5−4e⁻¹≈3.528 V.',
   ['Identify the initial and final capacitor voltages.','τ=RC=0.2 s.','Use final + (initial−final)e^(−t/τ).'],'ch7',12,224),
 q('q7-4','ch7','RL step response','A series RL branch has R=6 Ω and L=3 H. The current is 0.5 A at t=0, then a 12 V DC source is applied. Find the current at t=0.5 s in A.','A','2-3/(2*E)',
   'i(t)=I∞+(I0−I∞)e^(−tR/L)','I∞=12/6=2 A; τ=L/R=0.5 s. Therefore i(0.5)=2−1.5e⁻¹≈1.448 A.',
   ['Find the new DC steady-state current.','τ=L/R.','Use final + (initial−final)e^(−t/τ).'],'ch7',16,224),
 q('q8-1','ch8','Series RLC damping','A source-free series RLC circuit has R=4 Ω, L=1 H, and C=0.25 F. Compute α/ω0. Then state in your working whether the circuit is overdamped, critically damped, or underdamped.','ratio','1',
   'α=R/(2L)=2 s⁻¹; ω0=1/√(LC)=2 s⁻¹','α/ω0=1, so the circuit is critically damped. Its repeated pole is s=−2 s⁻¹.',
   ['Use the series RLC form of α.','Find ω0 from L and C.','Compare α with ω0.'],'ch8a',6,270),
 q('q8-2','ch8','Parallel RLC damped frequency','A source-free parallel RLC circuit has R=2 Ω, C=0.25 F, and L=1 H. Find its damped angular frequency ωd in rad/s. State the damping case in your working.','rad/s','sqrt(3)',
   'α=1/(2RC)=1 s⁻¹; ω0=1/√(LC)=2 s⁻¹; ωd=√(ω0²−α²)','Since α=1<2=ω0, the circuit is underdamped and ωd=√3≈1.732 rad/s.',
   ['Use the parallel RLC form of α.','Check α against ω0.','For underdamping, ωd=√(ω0²−α²).'],'ch8a',14,266),
 q('q8-3','ch8','Critically damped natural current','A source-free series RLC circuit has R=2 Ω, L=1 H, C=1 F, i(0+)=0 A, and di/dt at 0+ equal to 4 A/s. Find i(1 s) in A.','A','4/E',
   'i(t)=(A1+A2t)e^(−αt), α=1 s⁻¹','α=R/(2L)=1 and ω0=1, so the response is critical. i(0)=0 gives A1=0; i′(0)=4 gives A2=4 A/s. Thus i(t)=4te⁻ᵗ A and i(1)=4/e≈1.472 A.',
   ['Compute α and ω0 first.','Use the repeated-root response form.','Apply i(0) and i′(0) to find A1 and A2.'],'ch8a',9,285),
 q('q8-4','ch8','Series RLC step response','A series RLC circuit has R=2 Ω, L=1 H, C=1 F. Its capacitor starts at 0 V and its inductor current at 0 A. A 10 V DC step is applied at t=0. Find vC(1 s) in V.','V','10*(1-2/E)',
   'vC(t)=10[1−(1+t)e^(−t)] V','The circuit is critically damped (α=ω0=1 s⁻¹). The initial value and slope are zero, and the final value is 10 V. Therefore vC(1)=10(1−2/e)≈2.642 V.',
   ['Find α, ω0, and the DC final capacitor voltage.','Use the critical step-response form.','Apply vC(0)=0 and iC(0)=C vC′(0)=0.'],'ch8b',1,285),
]

# Check the formulas by substitution into the governing equations and expected
# chapter-level physical properties. This catches a typo in an authored result.
def verify():
    assert len({item['id'] for item in QUESTIONS})==len(QUESTIONS)
    assert all(item['source']['pdfPage'] is not None for item in QUESTIONS)
    a,b,i1,i2,t=s.symbols('a b i1 i2 t')
    left,bottom_left,center,right,bottom_right=s.symbols('left bottom_left center right bottom_right')
    book_supermesh=s.solve([(left-center)/6+bottom_left/9,
                            (right-center)/20+bottom_right/30,
                            (center-left)/6+(center-right)/20+4,
                            left-bottom_left-100,bottom_right-right-25],
                           [left,bottom_left,center,right,bottom_right])
    crosschecks={
        'q3-1':s.solve([a/4+(a-b)/2-3,b/6+(b-a)/2+1],[a,b])[a],
        'q3-2':s.solve([a/4+b/2-3,b-a-4],[a,b])[a],
        'q3-3':s.solve([6*(i1-i2)-12,6*(i2-i1)+6*i2],[i1,i2])[i1],
        'q3-4':s.solve([2*i1+6*i2-12,i1-i2-1],[i1,i2])[i2],
        'q3-b1':s.solve((a-24)/100+a/25+s.Rational(40,1000),a)[0],
        'q3-b2':s.solve([a/40+(a-b)/8-6,b/80+b/120+(b-a)/8+1],[a,b])[b],
        'q3-b3':s.solve([a/50+b/150+b/75+2,a-b-25],[a,b])[a],
        'q3-b4':-s.solve([400*i1-200*i2-80,-200*i1+600*i2-140],[i1,i2])[i2],
        'q3-b5':s.simplify((book_supermesh[left]-book_supermesh[center])**2/6+
                              book_supermesh[bottom_left]**2/9+
                              (book_supermesh[right]-book_supermesh[center])**2/20+
                              book_supermesh[bottom_right]**2/30),
        'q4-1':s.solve((a-6)/3+a/6-1,a)[0],
        'q4-2':2*5,'q4-3':s.Rational(12*6,3+6),'q4-4':s.Rational(9,3),
        'q4-5':s.Rational(8**2*1000,4*2000),
        'q6-1':s.Rational(1,2)*s.Rational(6*3,6+3)*12**2,
        'q6-2':s.Rational(4,10**6)*s.Rational(2*1000,1)*1000,
        'q6-3':s.Rational(50,1000)*4,
        'q6-4':s.Rational(1,2)*s.Rational(12*6,12+6)*3**2,
        'q7-1':12*s.exp(-s.Rational(1,10000*s.Rational(100,10**6))),
        'q7-2':2*s.exp(-s.Rational(40,1000)/(s.Rational(200,1000)/10)),
        'q7-3':5+(1-5)*s.exp(-s.Rational(2,10)/(2000*s.Rational(100,10**6))),
        'q7-4':2+(s.Rational(1,2)-2)*s.exp(-s.Rational(1,2)/(s.Rational(3,6))),
        'q8-1':(s.Rational(4,2*1))/(1/s.sqrt(s.Rational(1,4))),
        'q8-2':s.sqrt((1/s.sqrt(s.Rational(1,4)))**2-(1/(2*2*s.Rational(1,4)))**2),
        'q8-3':(4*t*s.exp(-t)).subs(t,1),
        'q8-4':(10*(1-(1+t)*s.exp(-t))).subs(t,1),
    }
    assert len(crosschecks)==len(QUESTIONS)
    assert book_supermesh[left]-book_supermesh[center]==30
    assert book_supermesh[right]-book_supermesh[center]==-20
    assert crosschecks['q3-b1']==4
    assert s.Rational(24*20,100)==s.Rational(20**2,100)+s.Rational(4**2,25)+s.Rational(40*4,1000)
    assert crosschecks['q3-b5']==100*5+25*1-4*book_supermesh[center]
    assert s.Rational(1,2)*12*1**2+s.Rational(1,2)*6*2**2==crosschecks['q6-4']
    for item in QUESTIONS:
        computed=s.simplify(s.sympify(item['expression']))
        assert abs(float(computed)-item['answer'])<1e-12,item['id']
        assert s.simplify(computed-crosschecks[item['id']])==0,item['id']
        assert item['source']['pdfPage'] is None or item['chapter']!='ch3' or item['source']['pdfPage']<=21
    v=10*(1-(1+t)*s.exp(-t)); assert s.simplify(s.diff(v,t,2)+2*s.diff(v,t)+v-10)==0
    assert v.subs(t,0)==0 and s.diff(v,t).subs(t,0)==0
    current=4*t*s.exp(-t);assert s.simplify(s.diff(current,t,2)+2*s.diff(current,t)+current)==0
    assert current.subs(t,0)==0 and s.diff(current,t).subs(t,0)==4
    return True

def export():
    verify()
    out=Path(__file__).parent.parent/'src/data/quiz2.json'
    out.write_text(json.dumps({'chapters':CHAPTERS,'questions':QUESTIONS},ensure_ascii=False,indent=2)+'\n')
    return out

if __name__=='__main__': print(export())
