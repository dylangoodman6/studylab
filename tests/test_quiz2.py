import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent.parent/'server'))
from quiz2 import CHAPTERS,QUESTIONS,verify

class Quiz2Verification(unittest.TestCase):
    def test_independent_circuit_and_transient_checks(self):
        self.assertTrue(verify())
        self.assertEqual(len(QUESTIONS),26)
        self.assertEqual({chapter['id'] for chapter in CHAPTERS},{'ch3','ch4','ch6','ch7','ch8'})

    def test_chapter_three_quiz_boundary(self):
        quiz2=[question for question in QUESTIONS if question['chapter']=='ch3']
        later=[question for question in QUESTIONS if question['chapter']!='ch3']
        self.assertEqual(len(quiz2),9)
        self.assertEqual(len(later),17)
        self.assertTrue(all(question['source']['pdfPage']<=21 for question in quiz2))
        self.assertNotIn('inspection',' '.join(question['title'].lower() for question in quiz2))
        self.assertTrue(all(question['source']['pdfPage'] is not None for question in later if question['chapter']=='ch6'))
        book=[question for question in quiz2 if question['source']['bookProblem']]
        self.assertEqual({question['source']['bookProblem'] for question in book},
                         {'4.6','4.13','4.22','4.32(a)','4.49'})
        self.assertTrue(all(question['source']['bookPdfPage']==question['source']['bookPrintedPage']+24 for question in book))
        self.assertTrue(all(question['origin'].startswith('Adapted from') for question in book))

if __name__=='__main__':unittest.main()
