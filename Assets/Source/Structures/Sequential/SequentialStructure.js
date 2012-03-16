

var storyPoint : GameObject;
var connectingLine : GameObject;
var lineMaterial : Material;

// var characters : Hashtable;




private var spaceBetweenActions : float = 0;
private var spaceBetweenPipeSections : float = 0;
private var characters : Array;
private var charactersIndex : Hashtable;
private var storyPoints : Array;
private var storyPointLevels : Hashtable;
private var sequentialObject : GameObject;
private var characterLines : Array;
private var storyPointObjects : Array;
private var structureBounds : Bounds;
//private var characterColors : Hashtable;

function Awake() {
	spaceBetweenActions = 10;
	spaceBetweenPipeSections = 10;
}


private function newCharactersArray() {
	characters = new Array();
	characters.push("Narrator");
	//characterColors = new Hashtable();
	//characterColors["Narrator"] = Color.white;
	ColorManager.instance.colorsByReg["Narrator"] = Color.white;
}

function Update() {
	//ApplicationState.instance.indicatedObject = null;

}

private function ComputeBounds() {
	structureBounds = Bounds(Vector3.zero, Vector3.zero);
	
	for (var i:int =0; i < storyPointObjects.length; i++) {
		var currentBounds : Bounds = storyPointObjects[i].GetComponentInChildren(MeshRenderer).bounds;

		structureBounds.Encapsulate(currentBounds.min);
		structureBounds.Encapsulate(currentBounds.max);
	}
	
}



private function FocusStructure() {
	// scale 
	ComputeBounds();
	var scaling : float = ApplicationState.instance.maxBoundsSize;
	var workingScale : float = structureBounds.size.x > structureBounds.size.z ? structureBounds.size.x : structureBounds.size.z;
	if (workingScale < structureBounds.size.y) workingScale = structureBounds.size.y;
	
	
	var s : float = scaling/workingScale;
	transform.localScale = Vector3(s,s,s);
	
	// center
	


	transform.position -= structureBounds.center * s;
	
	ScaleLines(s, structureBounds.center * s);
}

private function ScaleLines(s:float, t : Vector3) {
	for (var lineObject : GameObject in characterLines) {
		var line : AccessibleLineRenderer = lineObject.GetComponent(AccessibleLineRenderer);
		var w : Vector2 = line.GetWidth() * s;
		line.SetWidth(w[0], w[1]);
		var pointCount : int = line.GetVertexCount();
		for (var i:int =0; i < pointCount; i++) {
			var p : Vector3 = (line.GetPosition(i) * s) - t;
			line.SetPosition(i, p);
		}
	}
}

private function FindCharacters() {
	newCharactersArray();
	
	// find characters
	
	for (var currentNode : Hashtable in NodeManager.instance.nodesByTag["character"]) {
		if (currentNode.Contains("attributes") && currentNode["attributes"].Contains("reg")) {
			
			var valueString : String = currentNode["attributes"]["reg"];
			var values : Array = valueString.Split(","[0]);
			
			for (var currentValue : String in values) {
				var isCharacterRepeat : boolean = false;
				
				for (var j:int=0; j<characters.length;j++){
					if (currentValue == characters[j]) {
						isCharacterRepeat = true;
						break;
					}
				}
				if (! isCharacterRepeat) {
					characters.Push(currentValue);
					//characterColors[currentValue] = Color(Random.value, Random.value, Random.value);
						
				}				
			}
		}
	}
	charactersIndex = new Hashtable();
	for (var i:int=0; i < characters.length; i++) {
		charactersIndex[characters[i]] = i;
	}
	
}

function roundNumber(num, dec) {
	var result = Mathf.Round(num*Mathf.Pow(10,dec))/Mathf.Pow(10,dec);
	return result;
}

private function FindStoryPoints() {
	
	// find actions and narration
	var node : Hashtable;
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	var storyPointIndexes : Array = new Array();
	storyPointLevels = new Hashtable();
	storyPointLevels[Mathf.NegativeInfinity] = 0;
	storyPoints = new Array();
	var found : boolean = false;
	for (var i : int=0; i < structure["nodeCount"]; i++) {
		node = NodeManager.instance.depthFirstNodes[i];
		
		// if node is valid add another notch on the axis
		
		if ( NodeManager.IsStoryPointValid(node) ) {

			found = true;

			var splitAttribute : String = "";
			
			if (node["name"].ToLower() == "narration") {
				splitAttribute = "narrator";
			} else 	if (node["name"].ToLower() == "action") { // if not narration then it is an action
				splitAttribute = "agent";				
			} else if (node["name"].ToLower() == "dialogue") {
				splitAttribute = "speaker";
			}
			var actionCharacters : Array = node["attributes"][splitAttribute].Split(","[0]);
			
			var thisStoryPoint : float = roundNumber(parseFloat(node["attributes"]["storyPoint"]), 3);
			
			if (!storyPointLevels.Contains(thisStoryPoint)) {
				storyPointLevels[thisStoryPoint] = 0;
				storyPointIndexes.Push(thisStoryPoint);
			}

			var axisEntry : Array = new Array();
			
			for (var k:int=0; k<characters.length;k++) {
				var thisCharacter : String = characters[k];
				var characterFound : boolean = false;
				axisEntry.Push(new StoryPointPosition());
				axisEntry[k].character = thisCharacter;
				for (var p:int=0; p<actionCharacters.length; p++) {
					if (thisCharacter == actionCharacters[p]) {
						axisEntry[k].position = thisStoryPoint;
						characterFound = true;
						break;
					}
				}				
				if (!characterFound) {
					if (storyPoints.length != 0) {
						axisEntry[k].position = storyPoints[storyPoints.length-1][k].position;
					} else {
						axisEntry[k].position = Mathf.NegativeInfinity;
					}
				}
			}			
			storyPoints.Push(axisEntry);
		}
		
	}
	if (!found) {
		Debug.Log("NOT A SINGLE ONE");
	}
	// sort results
	for (i=0;i< storyPoints.length; i++) {
		System.Array.Sort(storyPoints[i], CompareStoryPoints);
	}
	
	storyPointIndexes.sort();
	for (i=0;i<storyPointIndexes.length;i++) {
		storyPointLevels[storyPointIndexes[i]] = i;
	}
	
}

private function ClearData() {
	
}

function GetStructureData() {
	// Debug.Log("building sequential");
	ClearData();
	FindCharacters();
	FindStoryPoints();

	
}
private function CompareStoryPoints(a : StoryPointPosition, b : StoryPointPosition) {
	if (a.position > b.position) return 1;
	if (a.position < b.position) return -1;
	return System.String.Compare(a.character, b.character);
}


function BuildStructure() {
	transform.localScale = Vector3.one;
	transform.position = Vector3.zero;
	Destroy(sequentialObject);
	sequentialObject = new GameObject();
	sequentialObject.name = "sequentialObject";
	sequentialObject.transform.parent = this.transform;
	
	characterLines = new Array();
	
	for (var k:int=0;k<characters.length;k++) {
		characterLines.Push(new GameObject());
		characterLines[k].name = "Line_" + characters[k];
		characterLines[k].layer = PlotvisLayer.Sequential;//LayerMask.NameToLayer("LayerSequential");
		characterLines[k].transform.parent = sequentialObject.transform;
		var thisLineRenderer : AccessibleLineRenderer = characterLines[k].AddComponent(AccessibleLineRenderer);
		thisLineRenderer.SetVertexCount(storyPoints.length);
		thisLineRenderer.SetWidth(1.0,1.0);
		// Debug.Log("vvv");
		// Debug.Log(characters[k]);
		// Debug.Log(ColorManager.instance.colorsByReg[characters[k]]);
		if (! ColorManager.instance.colorsByReg.Contains(characters[k])) {
			Debug.Log(characters[k]);
		}
		var c1 : Color = ColorManager.instance.colorsByReg[characters[k]];//characterColors[characters[k]];
		
		var newMaterial = new Material (Shader.Find("VertexLit"));
		newMaterial.color = c1;
		thisLineRenderer.SetMaterial(newMaterial);
		thisLineRenderer.SetColors(c1, c1);

	}
	
	storyPointObjects = Array();
	for (var i:int=0; i< storyPoints.length; i++) {
		var thisAction : StoryPointPosition[] = storyPoints[i];
		//Debug.Log("Comenzando otra i on j.length= " + thisAction.length);
		for (var j:int = 0; j< thisAction.length; j++) {
			var newStoryPoint : GameObject = GameObject.Instantiate(storyPoint);
			newStoryPoint.layer = PlotvisLayer.Sequential;//LayerMask.NameToLayer("LayerSequential");
			var thisCharacterIndex : int = charactersIndex[thisAction[j].character];
			newStoryPoint.GetComponent(PlotPointBehaviour).character = thisAction[j].character;
			newStoryPoint.GetComponent(PlotPointBehaviour).position = thisAction[j].position;
			
			newStoryPoint.transform.parent = characterLines[thisCharacterIndex].transform;
			var thisPosition : float = storyPointLevels[thisAction[j].position] * spaceBetweenPipeSections;
			//Debug.Log(storyPointLevels[thisAction[j].position]);
			
			var newPos : Vector3 = Vector3(i*spaceBetweenActions, thisPosition, thisCharacterIndex * 2);
			
			newStoryPoint.name = "Action_" + thisAction[j].character + "_" + i.ToString() + "_" + thisPosition.ToString();
			// Debug.Log(thisAction[j].character);
			characterLines[thisCharacterIndex].GetComponent(AccessibleLineRenderer).SetPosition(i, newPos);
			newStoryPoint.GetComponentInChildren(MeshRenderer).material.color = ColorManager.instance.colorsByReg[thisAction[j].character];//characterColors[thisAction[j].character];
			newStoryPoint.transform.position = newPos;
			storyPointObjects.Push(newStoryPoint);
		}
		
	}
}

function Build() {
	
	GetStructureData();
	BuildStructure();
	FocusStructure();	
	
}