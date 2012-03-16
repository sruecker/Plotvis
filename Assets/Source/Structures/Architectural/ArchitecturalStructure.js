

public var openElement : GameObject;
public var closedElement : GameObject;


private var elements : GameObject[];
private var levelHeight : float = 2.5;
private var levelToName : Array;
private var highestLevels : Hashtable;
private var usedAscending : Array;
private var objectsByTagName : Hashtable;
private var structureBounds : Bounds;

class ElementData {
	var father : GameObject;
	var level : int;
	var count : int;
	var objects : Array;
	var nodeId : Array;
}
private var elementData : Hashtable;

private function GetStructureData() {
	
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	elements = new GameObject[structure["elementCount"]];
	elementData = new Hashtable();
	levelToName = new Array();
	highestLevels = new Hashtable();
	usedAscending = new Array();
	objectsByTagName = new Hashtable();
	var i : int = 0;
	var j : int = 0;
	var lastLevel : int = 0;

	for (i=0; i < structure["nodeCount"]; i++) {
		var currentNode : Hashtable = NodeManager.instance.breadthFirstNodes[i];
		
		var nodeType : NodeTypes = currentNode["type"];
		if(nodeType==NodeTypes.Element) {
			var nodeName : String = currentNode["name"];
			if (!elementData.Contains(nodeName)) {
				elementData[nodeName] = new ElementData();
				
				elementData[nodeName].father = new GameObject();
				elementData[nodeName].objects = new Array();
				elementData[nodeName].nodeId = new Array();
				
				elementData[nodeName].father.name = "Parent_" + currentNode["name"];
				elementData[nodeName].father.transform.parent = this.transform;
				elementData[nodeName].father.transform.position.y = lastLevel * levelHeight;
				
				elementData[nodeName].level = lastLevel++;
				usedAscending.Push(new Hashtable());
				elementData[nodeName].count = 0;
				elementData[nodeName].objects = new Array();
				levelToName.Push(currentNode["name"]);
			}
			
			var newObject : GameObject = Instantiate(openElement);
			newObject.transform.parent = elementData[nodeName].father.transform;
			newObject.transform.localPosition = Vector3(0, 0, 0);
			elementData[nodeName].count += 1;
			newObject.GetComponent(HexagonBehaviour).nodeId = currentNode["id"];
			newObject.name = nodeName + "_" + j; // XXX make more id specific
			var thisColorName : String = ColorManager.instance.GetNodeColorName(currentNode);
			newObject.GetComponentInChildren(MeshRenderer).material.color = ColorManager.instance.colors[thisColorName]["color"];
			elementData[nodeName].objects.Push(newObject);
			elementData[nodeName].nodeId.Push(i);
			highestLevels[currentNode] = elementData[nodeName].level;
			j++;
		}	
	}

	PopulateHighLevels();
	var elementDataObjects :Array;
	for (var k:int = 0; k< levelToName.length; k++) {
		var elementName:String = levelToName[k];
		elementDataObjects = elementData[elementName].objects;
		totalElements = elementDataObjects.length;
		
		
		var elementIndex : int = 0;
		var currentObject : GameObject;
		var currentPosition = Vector2(0,0);
		var currentDistance = 1;
		//positoion zero
		var currentDirection = 1;
		while (elementIndex < totalElements) {
			
			// XXX ugly code FIX THIS
			if (elementIndex == 0) {
				currentObject = elementDataObjects[elementIndex];
				var movedPosition :Vector2 = Vector2(currentPosition.x*1.49, currentPosition.y*Mathf.Sqrt(3));
				if (!usedAscending[elementData[elementName].level][movedPosition]) {
					currentObject.transform.localPosition.x = movedPosition.x;//2
					currentObject.transform.localPosition.z = movedPosition.y;
					
					currentNode = NodeManager.instance.breadthFirstNodes[elementData[elementName].nodeId[elementIndex]];
					var thisHighestLevel : int = highestLevels[currentNode];
					var levelDifference : int = thisHighestLevel - elementData[elementName].level;

					if (levelDifference > 0) {
						var thisClosedElement : GameObject = Instantiate(closedElement);
						thisClosedElement.layer = PlotvisLayer.Architectural; //LayerMask.NameToLayer("LayerArchitectural"); // LayerWall 
						thisColorName = ColorManager.instance.GetNodeColorName(currentNode);
						thisClosedElement.GetComponentInChildren(MeshRenderer).material.color = ColorManager.instance.colors[thisColorName]["color"];
						var scalingFactor = 1 + 1.25 * levelDifference;
						thisClosedElement.GetComponent(HexagonBehaviour).nodeId = currentNode["id"];
						thisClosedElement.transform.localScale = Vector3(0.9,scalingFactor,0.9);
						thisClosedElement.transform.parent = currentObject.transform;
						thisClosedElement.transform.localPosition = Vector3(0,scalingFactor-1,0);
						thisClosedElement.name = "Growth_" + thisHighestLevel + "-" + elementData[elementName].level;
						
						// mark used positions
					
						for (var q:int =0; q<=thisHighestLevel;q++) {
						
							usedAscending[q][movedPosition] = true;
						}
					
					}
					
					elementIndex++;
					
					
				}
			}
			
			// ^^^^
			
			// should turn into function. Check why GetNewPosition did not work
			// up
			for (i=0;i<currentDistance;i++) {

				currentPosition += currentDirection * Vector2.up;
				if (elementIndex < totalElements) {
					currentObject = elementDataObjects[elementIndex];
					movedPosition = Vector2(currentPosition.x*1.49, currentPosition.y*Mathf.Sqrt(3));
					if (!usedAscending[elementData[elementName].level][movedPosition]) {
						currentObject.transform.localPosition.x = movedPosition.x;//2
						currentObject.transform.localPosition.z = movedPosition.y;
						if(currentPosition.x%2.0!=0) {
							currentObject.transform.localPosition.z += 0.866;
						}

						currentNode = NodeManager.instance.breadthFirstNodes[elementData[elementName].nodeId[elementIndex]];
						thisHighestLevel = highestLevels[currentNode];
						levelDifference = thisHighestLevel - elementData[elementName].level;

						if (levelDifference > 0) {
							thisClosedElement = Instantiate(closedElement);
							thisClosedElement.layer = PlotvisLayer.Architectural;// LayerMask.NameToLayer("LayerArchitectural"); // LayerWall 
							thisColorName = ColorManager.instance.GetNodeColorName(currentNode);
							thisClosedElement.GetComponentInChildren(MeshRenderer).material.color = ColorManager.instance.colors[thisColorName]["color"];
							scalingFactor = 1 + 1.25 * levelDifference;
							thisClosedElement.GetComponent(HexagonBehaviour).nodeId = currentNode["id"];
							thisClosedElement.transform.localScale = Vector3(0.9,scalingFactor,0.9);
							thisClosedElement.transform.parent = currentObject.transform;
							thisClosedElement.transform.localPosition = Vector3(0,scalingFactor-1,0);
							thisClosedElement.name = "Growth_" + thisHighestLevel + "-" + elementData[elementName].level;
						
							// mark used positions
						
							for (q=0; q<=thisHighestLevel;q++) {
							
								usedAscending[q][movedPosition] = true;
							}
						
						}
					
						elementIndex++;
					}
				}
			}
			// right
			for (i=0;i<currentDistance;i++) {
			
				currentPosition += currentDirection * Vector2.right;
				if (elementIndex < totalElements) {
					currentObject = elementDataObjects[elementIndex];
					movedPosition = Vector2(currentPosition.x*1.49, currentPosition.y*Mathf.Sqrt(3));
					if (!usedAscending[elementData[elementName].level][movedPosition]) {
						if (elementName == "text") Debug.Log("for the love of god");
						currentObject.transform.localPosition.x = movedPosition.x;//2
						currentObject.transform.localPosition.z = movedPosition.y;
						if(currentPosition.x%2.0!=0) {
							currentObject.transform.localPosition.z += 0.866;
						}

						currentNode = NodeManager.instance.breadthFirstNodes[elementData[elementName].nodeId[elementIndex]];
						thisHighestLevel = highestLevels[currentNode];
						levelDifference = thisHighestLevel - elementData[elementName].level;

						if (levelDifference > 0) {
							thisClosedElement = Instantiate(closedElement);
							thisClosedElement.layer = PlotvisLayer.Architectural; //LayerMask.NameToLayer("LayerArchitectural"); // LayerWall 
							thisColorName = ColorManager.instance.GetNodeColorName(currentNode);
							thisClosedElement.GetComponentInChildren(MeshRenderer).material.color = ColorManager.instance.colors[thisColorName]["color"];
							scalingFactor = 1 + 1.25 * levelDifference;
							thisClosedElement.GetComponent(HexagonBehaviour).nodeId = currentNode["id"];
							thisClosedElement.transform.localScale = Vector3(0.9,scalingFactor,0.9);
							thisClosedElement.transform.parent = currentObject.transform;
							thisClosedElement.transform.localPosition = Vector3(0,scalingFactor-1,0);
							thisClosedElement.name = "Growth_" + thisHighestLevel + "-" + elementData[elementName].level;
						
							// mark used positions
						
							for (q=0; q<=thisHighestLevel;q++) {
							
								usedAscending[q][movedPosition] = true;
							}
						
						}
					
						elementIndex++;
					}
				}
			}
			
			currentDistance +=1;
			currentDirection *= -1;
			
		}
		
		
		
	}
	
}

private function PopulateHighLevels() {
	for (var elementName:String in elementData.Keys) {
		var elementIds : Array =  elementData[elementName].nodeId;
		var thisLevel : int  = elementData[elementName].level;		

		for (var i:int =0; i< elementIds.length; i++) {
			var thisNode : Hashtable = NodeManager.instance.breadthFirstNodes[elementIds[i]];
			
			var currentParent : Hashtable = thisNode["parent"];
			while (currentParent != null) {
				
				if (highestLevels.Contains(currentParent)) {
					if (highestLevels[currentParent] < thisLevel) {
						highestLevels[currentParent] = thisLevel;
					}
				}
				currentParent = currentParent["parent"];
			}

			
		}
		
	}
}



private function GetNewPosition(currentPosition : Vector2, currentDirection : int, workingAxis : Vector2, elementIndex : int, totalElements : int, elements : Array) {
	currentPosition += currentDirection * workingAxis;
	if (elementIndex < totalElements) {
		currentObject = elements[elementIndex];
		currentObject.transform.localPosition.x = currentPosition.x*1.49;//2
		currentObject.transform.localPosition.z = currentPosition.y*Mathf.Sqrt(3);
		if(currentPosition.x%2.0!=0) {
			currentObject.transform.localPosition.z += 0.866;
		}
	}
}

public function UpdateSelectedTags() {
	for (var key : String in ApplicationState.instance.tags) {
		ToggleSelectedTag(key);
	}
}

public function ToggleSelectedTag(key : String) {

	var isSelected : boolean = NodeManager.instance.IsTagSelected(key);
	for (var currentObject : GameObject in elementData[key].objects) {

		currentObject.SetActiveRecursively(isSelected);
	}	

	// if (isStructureOpen) {
	// 	OpenStructures();
	// } else {
	// 	CloseStructures();
	// }
}

private function ComputeBounds() {
	structureBounds = Bounds(Vector3.zero, Vector3.zero);
	
	for (var key in elementData.Keys) {
		for (var object:GameObject in elementData[key].objects) {
			var currentBounds : Bounds = object.GetComponentInChildren(MeshRenderer).bounds;
			structureBounds.Encapsulate(currentBounds.min);
			structureBounds.Encapsulate(currentBounds.max);			
		}
	}
	
}



private function FocusStructure() {
	ComputeBounds();
	
	// scale 

	var scaling : float = ApplicationState.instance.maxBoundsSize;
	var workingScale : float = structureBounds.size.x > structureBounds.size.z ? structureBounds.size.x : structureBounds.size.z;
	if (workingScale < structureBounds.size.y) workingScale = structureBounds.size.y;
	
	
	var s : float = scaling/workingScale;
	transform.localScale = Vector3(s,s,s);
	
	// center
	
	transform.position -= structureBounds.center * s;

}

function ClearStructureData() {
	if (elementData) {
		for (var k:String in elementData.Keys) {
			for( var element : GameObject in elementData[k].objects) {
				Destroy(element);
			}
		}
	}
	// if (elements && elements.length > 0) {
	// 	for (var element : GameObject in elements) {
	// 		Destroy(element);
	// 	}
	// }
}

function Build() {
	transform.localScale = Vector3.one;
	transform.position = Vector3.zero;
	ClearStructureData();
	GetStructureData();
	FocusStructure();
	
}

function Update () {
}