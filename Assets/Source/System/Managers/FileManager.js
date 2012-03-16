import System.Xml;

private var resultStructure : Hashtable;
// private var nodeCount : int = 0;
private var elementCount : int = 0;
private var textCount : int = 0;
private var attributesInfo : Hashtable;

enum NodeTypes {
	Element,
	Text
}


function Load(fileName : String) : Hashtable {

	resultStructure = Hashtable();
	attributesInfo = Hashtable();
	elementCount = 0;
	textCount = 0;
	
	var xmlDocument : System.Xml.XmlDocument = System.Xml.XmlDocument();
	
	if (fileName == null) {
		var fileData : TextAsset = Resources.Load(ApplicationState.instance.defaultFile, TextAsset);
		xmlDocument.LoadXml(fileData.text);
	} else {
		var file : System.IO.StreamReader = System.IO.File.OpenText(fileName);
		//var info : String = file.ReadToEnd();
		xmlDocument.Load(file);
		file.Close();
		file.Finalize();
	}
	
	if (xmlDocument.HasChildNodes) {
		resultStructure["root"] = ProcessChildNodes(xmlDocument.ChildNodes, null);
	}	
	
	attributesInfo["text"] = Hashtable();
	
	resultStructure["elementCount"] = elementCount;
	resultStructure["textCount"] = textCount;
	resultStructure["nodeCount"] = elementCount+textCount;
	resultStructure["selectedAttributes"] = attributesInfo;
	resultStructure["selectedTags"] = Hashtable();
	for (var currentTag : String in attributesInfo.Keys) {
		resultStructure["selectedTags"][currentTag] = true;
	}
	
	return resultStructure;
	
}

private function ProcessChildNodes(children : System.Xml.XmlNodeList, parent : Hashtable) : Array{
	
	var result : Array = Array();
	var newNode : Hashtable;	
	var nodes = children.GetEnumerator();
	
	while(nodes.MoveNext()) {
		
		var node : System.Xml.XmlNode =  nodes.Current;
		
		if (node.NodeType == System.Xml.XmlNodeType.Element) {

			// create new node and process
			newNode = CreateNode();
			elementCount++;
			newNode["name"] = node.Name;
			newNode["type"] = NodeTypes.Element;
			newNode["parent"] = parent;
			newNode["attributes"] = new Hashtable();
			newNode["innerText"] = node.InnerText;
			if (!attributesInfo.Contains(newNode["name"])) {
				attributesInfo[ node.Name ] = Hashtable();
			}
			// value ?
			// attributes
			
			var attributes = node.Attributes.GetEnumerator();
			
			while(attributes.MoveNext()) {
				var attribute : System.Xml.XmlAttribute = attributes.Current;
				(newNode["attributes"] as Hashtable).Add(attribute.Name, attribute.Value);
				// for now get the possible attributes
				
				if (! (attributesInfo[node.Name] as Hashtable).Contains(attribute.Name) ) {
					(attributesInfo[node.Name] as Hashtable).Add(attribute.Name, false);
				}
				
			}
		
			if (node.HasChildNodes) {
				newNode["children"] = ProcessChildNodes(node.ChildNodes, newNode);
			}
			result.Push(newNode);
				
		} else if (node.NodeType == System.Xml.XmlNodeType.Text) {
		
			newNode = CreateNode();
			newNode["name"] = "text";
			newNode["type"] = NodeTypes.Text;
			textCount++;
			newNode["value"] = node.InnerText;
			result.Push(newNode);

		}
		//Debug.Log(node.Name);
		//Debug.Log(node.NodeType);
		
	}
	
	return result;
}

private function CreateNode() : Hashtable {
	
	var result : Hashtable = Hashtable();
	result["name"] = "";
	result["type"] = "";
	result["value"] = "";
	result["attributes"] = Hashtable();
	result["children"] = Array();
	
	return result;
	
}