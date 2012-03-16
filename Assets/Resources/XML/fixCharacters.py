#!/sw/bin/python

from xml.dom.minidom import parse, parseString
import sys

def visitNode(node):
	for n in node.childNodes:
		visitNode(n)
	#print node.nodeType, node
	if node.nodeType == node.ELEMENT_NODE and node.tagName == "character" and node.getAttribute("reg") != "":
		for n in node.childNodes:
			if n.nodeType == n.ELEMENT_NODE and n.tagName == "character" and n.getAttribute("reg") != "":
				node.attributes["reg"].value += "," + n.attributes["reg"].value	
				for n2 in n.childNodes:
					node.appendChild(n2)
				node.removeChild(n)
				n.unlink()
		#print node.attributes.keys()
		print node.attributes["reg"].value

filename = sys.argv[1]
dom = parse(filename)

visitNode(dom)
f = open('./testFile.xml', 'w')
dom.writexml(f)
