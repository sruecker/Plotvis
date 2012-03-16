import ApplicationState;
import QueryManager;

// XXX cylinderObjects keeps records of previous structure


enum SortType {
	DepthFirst,
	BreadthFirst,
	CenterTag
}

enum Weight {
	None,
	WordCount
}


public var angle : float = 137.52809;
public var distance : float = 1.0;
public var parentStructure : GameObject;
public var cylinderObject : GameObject;
public var actions : Array;

private var cylinderObjects : GameObject[];
private var cylinderByNode : Hashtable;

// XXX to be removed
private var objectsByTagName : Hashtable;
private var positionsCache : Vector3[];


private var currentId : int = 0; 

private var selectedTags : Hashtable;
private var selectedAttributes : Hashtable;
private var isStructureOpen : boolean = false;
private var currentWeight : Weight = Weight.None;


private var selectedWeight : Weight = Weight.None;


private var currentSort : SortType = SortType.DepthFirst;


private var parents : Array;
private var grandParent : GameObject;
private var currentParent : GameObject;

private var structureBounds : Bounds;

function Awake() {
	grandParent = GameObject();
	parents = Array();
}


function GetWeight() : Weight {
	return selectedWeight;
}

function IsOpen() : boolean {
	return isStructureOpen;
}

function ClearGameObjects() {
	if (cylinderObjects) {
		for (var i:int =0 ;i< cylinderObjects.length; ++i) {
			Destroy(cylinderObjects[i]);
		}
	}	
}

function Build() : void {
	transform.localScale = Vector3.one;
	transform.position = Vector3.zero;
	ClearGameObjects();
	
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	
	positionsCache        = new Vector3[structure["elementCount"]];
	objectsByTagName      = Hashtable();
	

	
	var i : int = 0;
	var currentNodes : Array;
	
	ApplicationState.instance.objectToNode.Clear();
	
	// cache available positions
	

	cylinderObjects = new GameObject[structure["elementCount"]];
	cylinderByNode = new Hashtable();
	var elementIndex : int = 0;
	for (i=0; i < structure["nodeCount"]; i++) {
		
		var currentNode : Hashtable = NodeManager.instance.depthFirstNodes[i];
		var nodeType : NodeTypes = currentNode["type"];
		if(nodeType==NodeTypes.Element) {
			positionsCache[elementIndex] = Vector3();
			positionsCache[elementIndex].x = Mathf.Sqrt(distance * elementIndex) * Mathf.Cos(2.0 * Mathf.PI * (elementIndex) * 0.61804);
			positionsCache[elementIndex].z = Mathf.Sqrt(distance * elementIndex) * Mathf.Sin(2.0 * Mathf.PI * (elementIndex) * 0.61804);		
			
			cylinderObjects[elementIndex] = CreateCylinder(currentNode, elementIndex, positionsCache[elementIndex]);  
			cylinderByNode[NodeManager.instance.depthFirstNodes[i]] = cylinderObjects[elementIndex];
			elementIndex++;
		}
		// if(currentNode['name']=='place')Debug.Log("found place");
	}
	
	//ResetColors();
	ApplyColors();	
	ResetColliderSize();
	selectedTags = structure["selectedTags"];
	selectedAttributes = structure["selectedAttributes"];
	UpdateSelectedTags();
	FocusStructure();
}

public function resetStructure() {
	yield;
	for (var key : String in objectsByTagName.Keys) {
		
		if (! NodeManager.instance.IsTagSelected(key)) {
			ToggleSelectedTag(key);
		}
	}
		
	CloseStructures();
}



public function SetWeightNone() {

	yield;

	for (var currentObject : GameObject in cylinderObjects) {
		var node = ApplicationState.instance.objectToNode[currentObject];
		node["object"].GetComponent(CylinderBehaviour).wordWeight = 1;
	}
	BroadcastMessage("changeWordWeight");
	selectedWeight = Weight.None;
}


public function SetWeightWordCount() {
	Debug.Log("test");
	var spacesRegex : Regex = new Regex("\\s+");
	yield;
	for (var currentObject : GameObject in cylinderObjects) {
		var node = ApplicationState.instance.objectToNode[currentObject];
		var newText = spacesRegex.Replace(node["innerText"], " ");
		var words : Array = newText.Split(" "[0]);
		var newYScale : float = Mathf.Log(words.length, 2) + 1.0;
		
		node["object"].GetComponent(CylinderBehaviour).wordWeight = newYScale;
	
	}
	
	BroadcastMessage("changeWordWeight");
	
	selectedWeight = Weight.WordCount;
}

private function SetWeightWordCountCylinder(node : Hashtable) {
	var spacesRegex : Regex = new Regex("\\s+");
	var newText = spacesRegex.Replace(node["innerText"], " ");
	var words : Array = newText.Split(" "[0]);
	var newYScale : float = Mathf.Log(words.length, 2) + 1.0;
	node["object"].transform.localScale = Vector3(1.0, newYScale, 1.0);
}

// public function ResetColors() {
// 
// 	//ColorManager.instance.ResetColors();
// 	ColorManager.instance.ApplyColors(cylinderObjects);
// }

public function ApplyColors() {
	if (cylinderObjects) {
		for (var currentObject : GameObject in cylinderObjects) {
			var node = ApplicationState.instance.objectToNode[currentObject];
			if (node) {
				var currentName : String = ColorManager.instance.GetNodeColorName(node);
				currentObject.GetComponent(MaterialBehaviour).setMaterial(ColorManager.instance.colors[currentName]["material"]);
			}
		}
	}
}

public function OpenStructures() {
	Debug.Log("opening");
	isStructureOpen = true;

	switch(currentSort) {
		case SortType.DepthFirst:
			SortByDepthFirst();
			break;
		case SortType.BreadthFirst:
			SortByBreadthFirst();
			break;
		case SortType.CenterTag:
			SortByMakeCentre();
			break;
	}

}

public function CloseStructures() {
	isStructureOpen = false;
	
	switch(currentSort) {
		case SortType.DepthFirst:
			closeByDepth();
			break;
		case SortType.BreadthFirst:
			closeByBreadth();
			break;
		case SortType.CenterTag:
			closeByCenter();
			break;
	}

}

private function setObjectHorizontalPosition(object : GameObject , position : Vector3) {
	object.transform.localPosition.x = position.x;
	object.transform.localPosition.z = position.z;
}


private function ResetColliderSize() {
	
	var currentSize : float = 0;
	
	for (var currentObject : GameObject in cylinderObjects) {
	
		if (currentSize < currentObject.transform.localPosition.magnitude) {
			currentSize = currentObject.transform.localPosition.magnitude;
			collider.size.x = currentSize * 2;
			collider.size.z = currentSize * 2;
		}

	}
	collider.size.y = 1;
}

private function CloseStructureBySort(nodesToSort : Hashtable[]) {

	var currentPositionCount : int = 0;
	 
	var i:int;
	var j:int;
	

	var currentPosition : Vector3;
	for ( i = 0 ; i < nodesToSort.length; i++) {
		var nodeType : NodeTypes = nodesToSort[i]["type"];
		
		if (nodeType == NodeTypes.Element) {
			var toSort : GameObject = nodesToSort[i]["object"];
	
			if (toSort.active) {
				currentPosition = positionsCache[currentPositionCount];
				setObjectHorizontalPosition(toSort, currentPosition);
				
			
				currentPositionCount++;
			}
		}
	
	
	}
}

//XXX fix close and sort functions

private function closeByCenter() {
	CloseStructureBySort(NodeManager.instance.centeredNodes);
	ResetColliderSize();
}

private function closeByBreadth() {
	CloseStructureBySort(NodeManager.instance.breadthFirstNodes);
	ResetColliderSize();
}

private function closeByDepth() {
	CloseStructureBySort(NodeManager.instance.depthFirstNodes);
	ResetColliderSize();
}

public function ToggleSelectedTag(key : String) {
	
	var isSelected : boolean = NodeManager.instance.IsTagSelected(key);
	for (var currentObject : GameObject in objectsByTagName[key]) {
		currentObject.active = isSelected;
	}
	
	if (isStructureOpen) {
		OpenStructures();
	} else {
		CloseStructures();
	}
	
}

public function UpdateSelectedTags() {
	// var selectedTags : Hashtable = ApplicationState.instance.fileStructure['selectedTags'];
	for (var key : String in ApplicationState.instance.tags) {
		var isSelected : boolean = NodeManager.instance.IsTagSelected(key);
		for (var currentObject : GameObject in objectsByTagName[key]) {
			currentObject.active = isSelected;
		}
	}
	if (isStructureOpen) {
		OpenStructures();
	} else {
		CloseStructures();
	}
}

private function setAscendingPosition(node : Hashtable) {
	cylinderObjects[node["id"]].transform.localPosition = positionsCache[currentId++];
}

function SortByBreadthFirst() {
	currentSort = SortType.BreadthFirst;
	
	//Debug.Log("sorting by breadth");
	
	var breadthNodes : Array = NodeManager.instance.breadthFirstNodes;
	var elementCount : int = 0;
	for (var i:int = 0 ; i < breadthNodes.length; i++) {
		var nodeType : NodeTypes = breadthNodes[i]["type"]; 
		if (nodeType == NodeTypes.Element) {
			setObjectHorizontalPosition(breadthNodes[i]["object"], positionsCache[elementCount++]);
		}
	}
	
	if (! isStructureOpen) {
		closeByBreadth();
	}
	ResetColliderSize();
	
}

function SortByDepthFirst() {
	currentSort = SortType.DepthFirst;
	Debug.Log("sorting by depth");
	
	var depthNodes : Array = NodeManager.instance.depthFirstNodes;
	var elementCount : int = 0;	
	for (var i:int = 0 ; i < depthNodes.length; i++) {
		var nodeType : NodeTypes = depthNodes[i]["type"];
		if (nodeType == NodeTypes.Element) {
			setObjectHorizontalPosition(depthNodes[i]["object"], positionsCache[elementCount++]);	
		}
	}
	
	if (! isStructureOpen) {
		closeByDepth();
	}
	ResetColliderSize();

}



function SortByMakeCentre() {
	currentSort = SortType.CenterTag;
	
	NodeManager.instance.SortCenteredInSelected();
	
	var centeredNodes : Array = NodeManager.instance.centeredNodes;
	var elementCount : int = 0;
	for (var i:int = 0 ; i < centeredNodes.length; i++) {
		var nodeType : NodeTypes = centeredNodes[i]["type"];
		if (nodeType == NodeTypes.Element) {
			setObjectHorizontalPosition(centeredNodes[i]["object"], positionsCache[elementCount++]);	
		}
		
	}
	
	if (! isStructureOpen) {
		closeByCenter();
	}
	ResetColliderSize();
	
}



private function CreateCylinder(node : Hashtable, currentId : int, position : Vector3) {
	
	var currentCylinder : GameObject = Instantiate(cylinderObject) as GameObject;
	currentCylinder.name = "Tag" + currentId;
	currentCylinder.tag = "Tag";
	currentCylinder.layer = PlotvisLayer.Fibonacci; //LayerMask.NameToLayer("LayerFibonacci"); // LayerFibonacci 
	currentCylinder.transform.parent = parentStructure.transform;
	currentCylinder.transform.localPosition = position;

	ApplicationState.instance.objectToNode[currentCylinder] = node;

	if (!objectsByTagName.Contains(node["name"])) {
		objectsByTagName[node["name"]] = Array();
	}
	objectsByTagName[node["name"]].push(currentCylinder);

	node["object"] = currentCylinder;
	//node["behaviour"] = node["object"].GetComponent(CylinderBehaviour);
	//node["id"]     = currentId;
	currentCylinder.GetComponent(CylinderBehaviour).nodeId = node["id"];
	//node["level"]  = 0;
	
	return currentCylinder;

}

function UpdateSearchResults() {
	
	var currentObject : GameObject;
	
	for (currentObject in QueryManager.instance.matched) {
		currentObject.active = true;
	}
	
	for (currentObject in QueryManager.instance.notMatched) {
		currentObject.active = false;
	}
	
}


private function ComputeBounds() {
	structureBounds = Bounds(Vector3.zero, Vector3.zero);
	
	for (var object:GameObject in cylinderObjects) {
		var currentBounds : Bounds = object.GetComponentInChildren(MeshRenderer).bounds;
		structureBounds.Encapsulate(currentBounds.min);
		structureBounds.Encapsulate(currentBounds.max);			
	}
	
	
}


private function FocusStructure() {
	ComputeBounds();
	
	// scale 

	var scaling : float = ApplicationState.instance.maxBoundsSize;
	var workingScale : float = structureBounds.size.x > structureBounds.size.z ? structureBounds.size.x : structureBounds.size.z;
	if (workingScale < structureBounds.size.y) workingScale = structureBounds.size.y;
	//workingScale = 100;
	
	var s : float = scaling/workingScale;
	transform.localScale = Vector3(s,s,s);
	
	// center

	transform.position -= structureBounds.center * s;;


	
	
}

