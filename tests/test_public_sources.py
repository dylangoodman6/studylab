"""Supplied copyrighted PDFs must never be served in public mode."""
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent / 'server'))
from app import Handler, SOURCE


class PublicSourceAccess(unittest.TestCase):
    def test_public_mode_blocks_every_supplied_pdf(self):
        for key in SOURCE:
            with self.subTest(key=key), patch.dict(os.environ, {'STUDYLAB_PUBLIC': '1'}):
                handler = Handler.__new__(Handler)
                handler.path = f'/source/{key}'
                errors = []
                handler.send_error = lambda status: errors.append(status)
                handler.do_GET()
                self.assertEqual(errors, [404])


if __name__ == '__main__':
    unittest.main()
