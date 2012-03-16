#!/sw/bin/python

import xml;
import sys


fileName = sys.argv[1];
f = open(fileName, 'r');

fileText = f.read()

print fileText;



