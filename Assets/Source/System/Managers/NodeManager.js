// #pragma strict
// #pragma downcast

static var instance : NodeManager;

static var depthFirstNodes : Hashtable[];
static var breadthFirstNodes : Hashtable[];
static var centeredNodes : Hashtable[];
static var nodesByTag : Hashtable;

static private var currentId : int;

static var selectedTags : Hashtable;
static var selectedAttributes : Hashtable;

class StoryPointPosition {
	var character : String;
	var position : float;
}

instance = FindObjectOfType(NodeManager);

if (instance == null) {
    Debug.Log ("Could not locate an NodeManager object. You have to have exactly one NodeManager.");
}

static function BuildStructure() : void {
	
	currentId = 0;
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	var nodeCount : int = structure["nodeCount"];
	depthFirstNodes = new Hashtable[nodeCount];
	breadthFirstNodes = new Hashtable[nodeCount];		
	centeredNodes = new Hashtable[nodeCount];

	nodesByTag = Hashtable();
	
	var nodesToVisit : Array = Array(structure["root"]);
	TraverseDepthFirst(nodesToVisit, FillDepthFirstIndex);
	nodesToVisit = Array(structure["root"]);
	currentId = 0;
	TraverseBreadthFirst(nodesToVisit, FillBreadthFirstIndex);
	
}

static public function IsStoryPointValid(node:Hashtable) : boolean {
	var nodeType : NodeTypes;
	nodeType = node["type"];
	
	if (nodeType == NodeTypes.Element && 
		node["attributes"].Contains("storyPoint") &&
		((node["name"].ToLower() == "dialogue" && node["attributes"].Contains("speaker")) || 	
		(node["name"].ToLower() == "narration" && node["attributes"].Contains("narrator")) || 
		(node["name"].ToLower() == "action" && node["attributes"].Contains("agent")))) {
		
			return true;
	}
	return false;
}


static private function FillDepthFirstIndex(node : Hashtable) {
	depthFirstNodes[currentId] = node;

	if (!nodesByTag.Contains(node["name"])) {
		nodesByTag[node["name"]] = Array();
	}

	(nodesByTag[node["name"]] as Array).push(depthFirstNodes[currentId]);

	node["id"] = currentId++;
	
}

static private function FillBreadthFirstIndex(node : Hashtable) {
 	breadthFirstNodes[currentId++] = node;
}


static private function TraverseBreadthFirst(nodes : Array, visit : function(Hashtable)) : void {
	var currentNode : Hashtable;

	while (nodes.length) {
		currentNode = nodes.Shift();

		visit(currentNode);
		
		for (var child : Hashtable in currentNode["children"]) {
			nodes.Push(child);
		}
	}
}

static private function TraverseDepthFirst(nodes : Array, visit : function(Hashtable)) : void {
	for (var node : Hashtable in nodes) {
		visit(node);
		if ((node["children"] as Array).length) {
			TraverseDepthFirst(node["children"] as Array, visit);
		}				
	}
}

static public function TraverseDepthFirst(nodes : Array, visit : function(Hashtable), post : function(Hashtable)) : void {
	for (var node : Hashtable in nodes) {
		visit(node);
		if ((node["children"] as Array).length) {
			TraverseDepthFirst(node["children"] as Array, visit);
		}	
		post(node);			
	}
	
}

static public function TraverseBreadthFirst(nodes : Array, visit : function(Hashtable), post : function(Hashtable)) : void {
	var currentNode : Hashtable;

	while (nodes.length) {
		currentNode = nodes.Shift();

		visit(currentNode);
		
		for (var child : Hashtable in currentNode["children"]) {
			nodes.Push(child);
		}
		post(currentNode);
	}
}

static function SortCenteredInSelected() : void  {
	
	
	var currentObject : GameObject = ApplicationState.instance.selectedObject;
	if (currentObject != null) { 
		
		var selectedTag : Hashtable = NodeManager.instance.GetSelectedTag();
		var startFrom : int  = selectedTag["id"];
		var i : int = 0;

		centeredNodes[i++] = depthFirstNodes[startFrom];
		
		var leftOfPivot : int = startFrom - 1;
		var rightOfPivot : int = startFrom + 1;
		
	
		while (leftOfPivot >= 0 || rightOfPivot < depthFirstNodes.length) {
			if (leftOfPivot >= 0) {
				centeredNodes[i++] = depthFirstNodes[leftOfPivot--];
			}
			if (rightOfPivot < depthFirstNodes.length) {
				centeredNodes[i++] = depthFirstNodes[rightOfPivot++];
			}
		}
		
	}
	
}


static function GetSelectedTag() : Hashtable {
	if (objectToNode.Contains(selectedObject)) {
		return objectToNode[selectedObject];
	} else {
		return null;
	}
}

static private function ToggleSelectedTagInStructure(key : String) {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedTags"].Contains(key)) {
		fileStructure["selectedTags"][key] = ! fileStructure["selectedTags"][key];
	}
}

static private function SetSelectedTagInStructure(key : String, value : boolean) {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedTags"].Contains(key)) {
		fileStructure["selectedTags"][key] = value;
	}
}

static function IsTagSelected(key : String) : boolean {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedTags"].Contains(key)) {
		return fileStructure["selectedTags"][key];
	}
}

static function ToggleSelectedAttribute(currentTag : String, currentAttribute : String) {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedAttributes"].Contains(currentTag) && 
		fileStructure["selectedAttributes"][currentTag].Contains(currentAttribute)) {
		fileStructure["selectedAttributes"][currentTag][currentAttribute] = ! fileStructure["selectedAttributes"][currentTag][currentAttribute];
	}
}

static function SetSelectedAttribute(currentTag : String, currentAttribute : String, value : boolean) {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedAttributes"].Contains(currentTag) && 
		fileStructure["selectedAttributes"][currentTag].Contains(currentAttribute)) {
		fileStructure["selectedAttributes"][currentTag][currentAttribute] = value;
	}
}

static function GetSelectedAttribute(currentTag : String, currentAttribute : String) : boolean {
	var fileStructure : Hashtable = ApplicationState.instance.fileStructure;
	if (fileStructure["selectedAttributes"].Contains(currentTag) && 
		fileStructure["selectedAttributes"][currentTag].Contains(currentAttribute)) {
		return fileStructure["selectedAttributes"][currentTag][currentAttribute];
	}
}

static private function SetAllTagsInStructure(value : boolean) {
	var selectedTags : Hashtable = ApplicationState.instance.fileStructure['selectedTags'];
	var keys : Array = Array();
	for (var key : String in selectedTags.Keys) {
		keys.Push(key);
	}
	for (var key : String in keys) {
		selectedTags[key] = value;
	}
}

static function ToggleTag(tag : String) {
	ToggleSelectedTagInStructure(tag);
	ApplicationState.instance.modelStructure.BroadcastMessage("ToggleSelectedTag", tag);
}

static function ToggleObjectTag() {
	ResetDifferentiatingAttributes();
	SetAllTagsInStructure(false);
	SetSelectedTagInStructure('object', true);
	ApplicationState.instance.modelStructure.BroadcastMessage("UpdateSelectedTags");
	
}

static function ToggleAllTag() {
	ResetDifferentiatingAttributes();
	SetAllTagsInStructure(true);
	ApplicationState.instance.modelStructure.BroadcastMessage("UpdateSelectedTags");
}

static function ToggleCharacterTag() {
	ResetDifferentiatingAttributes();
	SetAllTagsInStructure(false);
	SetSelectedTagInStructure('character', true);
	ApplicationState.instance.modelStructure.BroadcastMessage("UpdateSelectedTags");
}

static function ToggleStoryElementsTag() {
	ResetDifferentiatingAttributes();
	SetAllTagsInStructure(true);
	SetSelectedTagInStructure('text', false);
	SetSelectedTagInStructure('head', false);
	SetSelectedTagInStructure('title', false);
	SetSelectedTagInStructure('author', false);
	SetSelectedTagInStructure('resp', false);
	SetSelectedTagInStructure('section', false);
	SetSelectedTagInStructure('p', false);
	ApplicationState.instance.modelStructure.BroadcastMessage("UpdateSelectedTags");
}

static function ResetDifferentiatingAttributes() {
	for (var tag in ApplicationState.instance.tags) {
		for (var attribute in ApplicationState.instance.attributes[tag]) {
			SetSelectedAttribute(tag, attribute, false);
		}
	}
}



