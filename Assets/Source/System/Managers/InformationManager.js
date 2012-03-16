import ApplicationState;

static var instance : InformationManager;

private static var maxInnerTextLenght : int = 200;


instance = FindObjectOfType(InformationManager);


if (instance == null) {
    Debug.Log ("Could not locate an InformationManager object. You have to have exactly one InformationManager.");
}


function Awake() {
	
}

static function SetPopUpInformation(text : String) {
	ApplicationState.instance.popUpInformation = text;
}

static function ClearPopUpInformatin() {
	ApplicationState.instance.popUpInformation = "";
}

static function SetPopUpInformationNode(node : Hashtable) {
	
	
	
	if (node != null) {
		var informationString : String = "";
	
		informationString += "Id: " + node["id"] + "\n";
		informationString += "Type: " + node["type"]+ "\n";
	
		var currentNodeType : NodeTypes = node["type"];
		if (currentNodeType == NodeTypes.Element ) {
		
			informationString += "Name: " + node["name"] + "\n";
		
			if (node["attributes"].Count) {
				informationString += "Attributes: " + "\n";
				for (var key : String in node["attributes"].Keys) {
					informationString += key + ": " + node["attributes"][key]+ "\n";
				}
			}
			var innerText : String = node["innerText"];
			if (innerText.length > maxInnerTextLenght) {
				innerText = innerText.Substring(0, maxInnerTextLenght - 3);
				innerText += "...";
			}
		
			informationString += "Inner text: " + innerText + "\n";
		
		
		} else if (currentNodeType == NodeTypes.Text) {
			informationString += "Value: " + node["value"];
		} else {
			Debug.Log("Found a node of unknown type");
		}
		
		ApplicationState.instance.popUpInformation = informationString;
		
		//informationContent = GUIContent(informationString);

	} else {
		Debug.Log("Found a node with no information");
	}
}