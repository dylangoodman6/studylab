"""English wording for the original, independently verified Chapter 3 circuits."""

CONTENT = {
 'n01':('Two current sources and two nodes','Node voltage a','Two unknown node voltages and current sources give direct KCL equations.',
         ['Inspect the currents entering and leaving a and b.','Write KCL at each node with I=(V1−V2)/R.','a/4+(a-b)/2=3.']),
 'n02':('Voltage-controlled current source','Node voltage b','The controlling variable is the voltage at a; retain the dependent-source term in KCL.',
         ['Identify the controlling voltage between a and ground.','The dependent source current from b to g is a/8.','b/8+(b-a)/4+a/8=0.']),
 'n03':('Voltage source between two nodes','Node voltage b','The voltage source between a and b forms a supernode; add its polarity constraint.',
         ['Enclose both nodes around the voltage source.','Write KCL for the supernode and a separate voltage constraint.','a/3+b/6=3; a-b=6.']),
 'm04':('Two meshes with a shared resistor','Current from a to b','Two clear meshes and a voltage source make mesh currents direct.',
         ['Draw clockwise currents in both meshes.','Use KVL; the shared resistor carries the difference of mesh currents.','6*(i1-i2)=12; 6*(i2-i1)+2*i2+4*i2=0.']),
 'm05':('Current source in a shared branch','Branch current b → c','Use a supermesh around the shared current source plus its current constraint.',
         ['Exclude the current-source branch from the outer KVL path.','The source constraint relates the mesh currents: i1−i2=1 A.','2*i1+6*i2=12; i1-i2=1.']),
 'c06':('Choose the shorter method','Node voltage a','There are two unknown node voltages versus three meshes; current sources favor KCL.',
         ['Count unknown node voltages and mesh currents.','Choose the method with fewer equations that fits the current sources.','Using nodes: a/2+(a-b)/4=3.']),
 'm07':('Reversed reference current','Reference current a → b','Two clear meshes favor KVL; the voltage source positive terminal is at g.',
         ['Choose a reference direction and keep it even if the result is negative.','KVL in the source mesh gives a negative voltage at a.','9*(i1-i2)=-9; 9*(i2-i1)+3*i2+6*i2=0.']),
 'n08':('Reversed supernode polarity','Node voltage a','The source connects two nonreference nodes, with its positive terminal at b.',
         ['Combine a and b into one supernode.','Apply KCL around it, then write the source constraint using polarity.','a/4+b/2=3; b-a=4.']),
 'n09':('Dependent source with a known voltage','Current from a to b','The voltage source fixes a; then use KCL at b with the dependent-source current.',
         ['The source sets node voltage a directly.','The controlling voltage is V(a)−V(g).','a=8; (b-a)/4+b/4+a/8=0.']),
 'n10':('Three-node conductance matrix','Node voltage b','Three node voltages and current sources lead to a conductance matrix.',
         ['Build one row for each nonreference node.','Diagonal terms sum connected conductances; off-diagonal terms are negative shared conductances.','Row b: -a/4+b*(1/4+1/4+1/2)-c/2=0.']),
 'e11':('Find the wrong supermesh constraint','Node voltage c','Use outer-loop KVL plus the current-source direction constraint.',
         ['Observe the upward source arrow.','The upward shared-branch current is i2−i1.','The correct constraint is i2−i1=0.5 A.']),
 'e12':('Find the wrong source polarity','Node voltage b','The source positive terminal is at b, so its constraint must reflect that.',
         ['Read the + terminal in the diagram.','Source voltage is positive-terminal voltage minus negative-terminal voltage.','The correct constraint is b−a=3 V.'])
}

ERRORS = {
 'e11':('A worked solution states i1−i2=+0.5 A for two clockwise mesh currents. Identify and correct the mistake.',
        'The shared current source points from g to b. This direction agrees with i2 and opposes i1, so i2−i1=0.5 A.',
        'i2-i1=0.5'),
 'e12':('A worked solution states a−b=3 V for the supernode. Identify and correct the mistake.',
        'The positive source terminal is at b, so b−a=3 V.',
        'b-a=3')
}

def english_problem(problem):
    title,label,reason,hints=CONTENT[problem['id']]
    problem['reasonAr']=problem['reason']
    problem['hintsAr']=problem['hints']
    problem.update(title=title,reason=reason,hints=hints)
    problem['target']['label']=label
    problem['source']['origin']='Original problem based on the lecture topic; not copied from the source'
    if problem['id'] in ERRORS:
        question,explanation,expected=ERRORS[problem['id']]
        problem['error']['explanationAr']=problem['error']['explanation']
        problem['error'].update(question=question,explanation=explanation,expected=expected,options=[])
    return problem
