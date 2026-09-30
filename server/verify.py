"""Independent SymPy MNA solver and safe linear equation comparison."""
from __future__ import annotations
import ast
import math
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent/'vendor'))
import sympy as s

def number(value): return s.Rational(str(value))

def expression(source: str, symbols: dict[str, s.Symbol]):
    """Restricted arithmetic parser; no eval, calls, attributes or subscripts."""
    tree=ast.parse(source.replace('^','**'),mode='eval')
    def walk(node):
        if isinstance(node,ast.Expression): return walk(node.body)
        if isinstance(node,ast.Name) and node.id in symbols: return symbols[node.id]
        if isinstance(node,ast.Constant) and type(node.value) in (int,float): return number(node.value)
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            x=walk(node.operand); return x if isinstance(node.op,ast.UAdd) else -x
        if isinstance(node,ast.BinOp) and isinstance(node.op,(ast.Add,ast.Sub,ast.Mult,ast.Div,ast.Pow)):
            a,b=walk(node.left),walk(node.right)
            if isinstance(node.op,ast.Add): return a+b
            if isinstance(node.op,ast.Sub): return a-b
            if isinstance(node.op,ast.Mult): return a*b
            if isinstance(node.op,ast.Div): return a/b
            if isinstance(node.op,ast.Pow) and b.is_integer and abs(b)<=2: return a**b
        raise ValueError('Unsupported expression; use node names, numbers, + - * / and parentheses.')
    return s.simplify(walk(tree))

def equations(text: str, symbols):
    parts=[x.strip() for x in text.replace('\n',';').split(';') if x.strip()]
    out=[]
    for part in parts:
        if part.count('=')!=1: raise ValueError('Use one = per equation and separate equations with ;')
        left,right=part.split('=')
        out.append(expression(left.strip(),symbols)-expression(right.strip(),symbols))
    return out

def solution(problem):
    nodes=[n for n in problem['nodes'] if n!='g']
    x={n:s.Symbol(n) for n in nodes}; volts={**x,'g':s.Integer(0)}
    currents={n:s.Integer(0) for n in nodes}
    sources=[b for b in problem['branches'] if b['kind']=='V']
    j={b['id']:s.Symbol('j_'+b['id']) for b in sources}
    branch_currents={}
    constraints=[]
    for b in problem['branches']:
        kind=b['kind']; a,z=b['n1'],b['n2']
        if kind=='R': branch= (volts[a]-volts[z])/number(b['value'])
        elif kind=='I': branch=number(b['value'])
        elif kind=='G': branch=number(b['value'])*(volts[b['controlPlus']]-volts[b['controlMinus']])
        elif kind=='V':
            branch=j[b['id']]
            constraints.append(volts[a]-volts[z]-number(b['value']))
        else: raise ValueError('unknown component')
        branch_currents[b['id']]=branch
        if a!='g': currents[a]+=branch
        if z!='g': currents[z]-=branch
    unknowns=[*x.values(),*j.values()]
    eqs=[*currents.values(),*constraints]
    solved=s.solve(eqs,unknowns,dict=True)
    if len(solved)!=1 or set(solved[0])!=set(unknowns): raise ValueError(f"{problem['id']}: singular or inconsistent circuit")
    values=solved[0]
    target=expression(problem['target']['expr'],volts).subs(values)
    powers={b['id']:s.simplify(((volts[b['n1']]-volts[b['n2']])*branch_currents[b['id']]).subs(values)) for b in problem['branches']}
    if s.simplify(sum(powers.values()))!=0: raise ValueError(f"{problem['id']}: power balance failure")
    if any(s.simplify(e.subs(values))!=0 for e in eqs): raise ValueError(f"{problem['id']}: MNA residual")
    declared=equations(';'.join(problem['equations']),x)
    if any(s.simplify(e.subs(values))!=0 for e in declared): raise ValueError(f"{problem['id']}: authored equation residual")
    mesh_values={}
    if problem.get('meshEquations'):
        mesh_symbols={k:s.Symbol(k) for k in ('i1','i2')}
        mesh_eq=equations(';'.join(problem['meshEquations']),mesh_symbols)
        if len(nodes)==2:
            i2=s.simplify(branch_currents['R1'].subs(values))
            i1=s.simplify(i2+branch_currents['R3'].subs(values))
        else:
            i1=s.simplify(branch_currents['R1'].subs(values))
            i2=s.simplify(branch_currents['R2'].subs(values))
        mesh_values={mesh_symbols['i1']:i1,mesh_symbols['i2']:i2}
        if any(s.simplify(e.subs(mesh_values))!=0 for e in mesh_eq): raise ValueError(f"{problem['id']}: mesh equation residual")
        if s.solve(mesh_eq,list(mesh_symbols.values()),dict=True)!=[mesh_values]: raise ValueError(f"{problem['id']}: mesh equations not unique")
    if problem['target']['unit'] not in ('A','V'): raise ValueError('bad target unit')
    return {'nodes':{n:float(values[sym]) for n,sym in x.items()},'meshCurrents':{str(k):float(v) for k,v in mesh_values.items()},'sourceCurrents':{k:float(values[sym]) for k,sym in j.items()},
            'answer':float(target),'answerExact':str(target),'powers':{k:float(v) for k,v in powers.items()},
            'powerResidual':float(sum(powers.values())), 'meshCount':len(problem['branches'])-len(problem['nodes'])+1}

def validate_problem(problem):
    """Reject inconsistent circuit data before publishing or importing a problem."""
    if not isinstance(problem,dict) or not isinstance(problem.get('nodes'),list) or not isinstance(problem.get('branches'),list):raise ValueError('missing circuit graph')
    nodes=problem['nodes'];upper=[n for n in nodes if n!='g']
    if len(nodes) not in (3,4) or len(set(nodes))!=len(nodes) or 'g' not in nodes or any(n not in ('a','b','c','g') for n in nodes):raise ValueError('unsupported node labels or count')
    visual=problem.get('visual')
    if not isinstance(visual,dict) or visual.get('layout')!='top-bus' or set(visual.get('nodePositions',{}))!=set(upper):raise ValueError('drawing nodes do not match electrical nodes')
    if any(not isinstance(x,(int,float)) or not math.isfinite(x) or not 50<=x<=590 for x in visual['nodePositions'].values()):raise ValueError('drawing position outside canvas')
    if not 1<=len(problem['branches'])<=12:raise ValueError('invalid branch count')
    ids=set();top_pairs=set()
    for branch in problem['branches']:
        if not isinstance(branch,dict) or branch.get('id') in ids or branch.get('kind') not in ('R','I','V','G'):raise ValueError('invalid or duplicate branch')
        ids.add(branch['id']);a,b=branch.get('n1'),branch.get('n2')
        if a not in nodes or b not in nodes or a==b:raise ValueError('branch endpoint not in drawing')
        if not isinstance(branch.get('value'),(int,float)) or not math.isfinite(branch['value']) or (branch['kind']=='R' and branch['value']<=0):raise ValueError('invalid component value')
        if branch['kind']=='G' and (branch.get('controlPlus') not in nodes or branch.get('controlMinus') not in nodes):raise ValueError('dependent source control not in drawing')
        if a!='g' and b!='g':
            pair=tuple(sorted((a,b)))
            if pair in top_pairs or abs(upper.index(a)-upper.index(b))!=1:raise ValueError('drawing would overlap or pass through another node')
            top_pairs.add(pair)
    if not isinstance(problem.get('equations'),list) or not problem['equations'] or problem.get('target',{}).get('unit') not in ('A','V'):raise ValueError('missing equations or unit')
    source=problem.get('source') or {}
    if not isinstance(source.get('page'),int) or source['page']<1:raise ValueError('source page required')
    return solution(problem)

def equivalent_equations(answer: str, authored: list[str], nodes: list[str]):
    symbols={n:s.Symbol(n) for n in nodes if n!='g'}
    user=equations(answer,symbols); correct=equations(';'.join(authored),symbols)
    variables=list(symbols.values())
    def rows(eqs):
        A,b=s.linear_eq_to_matrix(eqs,variables)
        return A.row_join(b)
    u,c=rows(user),rows(correct)
    return u.rank()==c.rank()==len(variables) and u.col_join(c).rank()==c.rank()
