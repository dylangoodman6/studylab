import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent.parent/'server'))
from circuits import PROBLEMS
from verify import equivalent_equations,solution,validate_problem

class CircuitVerification(unittest.TestCase):
    def test_all_authored_problems_have_unique_solutions_and_balance_power(self):
        self.assertEqual(len(PROBLEMS),12)
        for problem in PROBLEMS:
            with self.subTest(problem=problem['id']):
                solved=solution(problem)
                self.assertEqual(solved['powerResidual'],0)
                self.assertIn(problem['target']['unit'],('A','V'))

    def test_negative_reference_direction(self):
        p=next(p for p in PROBLEMS if p['id']=='m07')
        self.assertEqual(solution(p)['answer'],-1)

    def test_supermesh_constraint_sign_and_equivalence(self):
        p=next(p for p in PROBLEMS if p['id']=='m05')
        self.assertTrue(equivalent_equations('i1-i2=1; 2*i1+6*i2=12',p['meshEquations'],['i1','i2','g']))
        self.assertFalse(equivalent_equations('i2-i1=1; 2*i1+6*i2=12',p['meshEquations'],['i1','i2','g']))

    def test_supernode_polarity(self):
        p=next(p for p in PROBLEMS if p['id']=='n08')
        self.assertTrue(equivalent_equations('b-a=4; a/4+b/2=3',p['equations'],p['nodes']))
        self.assertFalse(equivalent_equations('a-b=4; a/4+b/2=3',p['equations'],p['nodes']))

    def test_inconsistent_drawing_or_polarity_is_rejected(self):
        import copy
        base=next(p for p in PROBLEMS if p['id']=='n03')
        mismatched=copy.deepcopy(base)
        mismatched['visual']['nodePositions'].pop('b')
        with self.assertRaises(ValueError):validate_problem(mismatched)
        reversed_source=copy.deepcopy(base)
        voltage=next(b for b in reversed_source['branches'] if b['kind']=='V')
        voltage['n1'],voltage['n2']=voltage['n2'],voltage['n1']
        with self.assertRaises(ValueError):validate_problem(reversed_source)

if __name__=='__main__':unittest.main()
