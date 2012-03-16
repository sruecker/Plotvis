

//XXX FIXME Make it so that it recognizes different characters on REG attributes

public var totemPrefab : GameObject;

// class StoryPointPosition {
// 	var character : String;
// 	var position : float;
// }
// 
class Totem {
	var totem : GameObject;
	//var storyPoints : Array;
	var lines : Hashtable;
	//var color : Color;
}

private var totems : Hashtable;
private var storyPoints : Array;
private var structureBounds : Bounds;
//private var sortedStoryPoints : Hashtable[];
//private var weavingLine : GameObject;
//private var weavingLineRenderer : LineRenderer;

//private var lastStoryPoint : Number;
//private var prevLastStoryPoint : Number;
private var storyPointsSoFar : Array;


function Build() {
	transform.localScale = Vector3.one;
	transform.position = Vector3.zero;
	GetStructureData();
	BuildStructure();
	FocusStructure();
}

function ComputeBounds() {
	for (var reg:String in totems.Keys) {
		var currentBounds : Bounds = totems[reg].totem.GetComponentInChildren(MeshRenderer).bounds;
		structureBounds.Encapsulate(currentBounds.max);
		structureBounds.Encapsulate(currentBounds.min);
	}
}

private function FocusStructure() {
	ComputeBounds();
	
	// scale 

	var scaling : float = ApplicationState.instance.maxBoundsSize;
	var workingScale : float = structureBounds.size.x > structureBounds.size.z ? structureBounds.size.x : structureBounds.size.z;
	//if (workingScale < structureBounds.size.y) workingScale = structureBounds.size.y;
	
	
	var s : float = scaling/workingScale;
	var sy : float = scaling / structureBounds.size.y;
	transform.localScale = Vector3(s,sy,s);
	
	// center
	// in world coordinates
	// Debug.Log(structureBounds);

	transform.position -= Vector3(structureBounds.center.x * s,
								  structureBounds.center.y * sy,
								  structureBounds.center.z * s);

	// scale line renderers seperately

	for (var reg : String in totems.Keys) {
		for (var alr : AccessibleLineRenderer in totems[reg].lines["start"]) {
			for (var i:int =0; i<2; i++){
				var p : Vector3 = Vector3(alr.GetPosition(i).x * s, 
										  alr.GetPosition(i).y * sy,
										  alr.GetPosition(i).z * s);
				alr.SetPosition(i, p + transform.position);
			}
			// alr.SetPosition(1, p1 - transform.position);
		}
	}
	
}

private function ClearGameObjects() {
	if (totems) {
		for (var reg:String in totems.Keys) {
			for (var alr : AccessibleLineRenderer in totems[reg].lines["start"]) {
				//alr.Clear();
				Destroy(alr);
			}
			Destroy(totems[reg].totem);
		}
	}
	totems = new Hashtable();
}

private function GetStructureData() {
	
	ClearGameObjects();
	
	//weavingLine = new GameObject();
	//weavingLine.transform.parent = this.transform;
	//weavingLineRenderer = weavingLine.AddComponent(LineRenderer);
	
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	
	storyPointsSoFar = new Array();
	storyPoints = new Array();
	NodeManager.TraverseDepthFirst(Array(structure["root"]), GetStoryPointTime, PostStoryPointTime);
	storyPoints.Sort(CompareStoryPoints);
}

private function CompareStoryPoints(a : StoryPointPosition, b : StoryPointPosition) {
	if (a.position > b.position) return 1;
	if (a.position < b.position) return -1;
	return 0;
	//return System.String.Compare(a.character, b.character);
}

private function GetStoryPointTime(node : Hashtable) {

	if (storyPointsSoFar.length != 0) {
		var nodeName : String = node["name"].ToLower();
		
		if ((nodeName == "object" || nodeName == "character") &&  node["attributes"]["reg"]) {
			// add storyPoint to this node
			
			var charactersString : String = node["attributes"]["reg"];
			var charactersSplit : Array = charactersString.Split(","[0]);
			for (var reg : String in charactersSplit) {
			
				var storyPoint : Number = storyPointsSoFar[storyPointsSoFar.length-1];
				var newEntry : StoryPointPosition = new StoryPointPosition(); 
				newEntry.character = reg;
				newEntry.position = storyPoint;
			
				storyPoints.Push(newEntry);
			}
			
			
			// var storyPoint : Number = storyPointsSoFar[storyPointsSoFar.length-1];
			// var reg : String = node["attributes"]["reg"];
			// var newEntry : StoryPointPosition = new StoryPointPosition(); 
			// newEntry.character = reg;
			// newEntry.position = storyPoint;
			// 
			// storyPoints.Push(newEntry);
			
			
		}
	}
	
	if (NodeManager.IsStoryPointValid(node)) {
		
		// get storyPoint 
	 	storyPointsSoFar.Push(parseFloat(node["attributes"]["storyPoint"]));
	
		// should it be applied to the narrator ? 
	}
	
}


private function PostStoryPointTime(node : Hashtable) {
	storyPointsSoFar.Pop();
}


private function BuildStructure() {
	
	Random.seed = 42;
	var maxSize : Number = 12;
	var totemHeight : Number = 0;
	
	var tempTotem : GameObject = Instantiate(totemPrefab) as GameObject;
	totemHeight = tempTotem.GetComponentInChildren(MeshRenderer).bounds.max.y - 
					tempTotem.GetComponentInChildren(MeshRenderer).bounds.min.y;
	Destroy(tempTotem);

	var currentHeight = totemHeight;
	var stepHeight = -1 * totemHeight / storyPoints.length;
	var prevPosition : Vector3 = Vector3.zero;
	var thisPosition : Vector3 = Vector3.zero;
	var prevReg : String = "";
	for (var i:int =0; i < storyPoints.length; i++) {
		// add if it does not exist

		var reg : String = storyPoints[i].character;
		var storyPoint : Number = storyPoints[i].position;

		
		if (!totems.Contains(reg)) {
			totems[reg] = new Totem();
			totems[reg].totem = Instantiate(totemPrefab) as GameObject;
			totems[reg].totem.layer = PlotvisLayer.Weaving;// LayerMask.NameToLayer("LayerWeaving");
			totems[reg].totem.transform.parent = this.transform;
			totems[reg].totem.name = "totem_" + reg;
			totems[reg].totem.GetComponent(VerticalBarBehaviour).nodeName = reg;
			var newPosition : Vector3 = Vector3(Random.value * maxSize - maxSize/2.0, 
												0, 
												Random.value * maxSize - maxSize/2.0);
			totems[reg].totem.transform.position = newPosition;
			totems[reg].lines = new Hashtable();
			totems[reg].lines["start"] = new Array();
			totems[reg].lines["end"] = new Array();
			
			// get colors from another place
//			totems[reg].totem.GetComponentInChildren(MeshRenderer).materials[0] = 
//				new Material (Shader.Find("Particles/Alpha Blended Premultiply"));

			//totems[reg].color = c; //Color(Random.value, Random.value, Random.value);
			
			totems[reg].totem.GetComponentInChildren(MeshRenderer).materials[0].color = ColorManager.instance.colorsByReg[reg]; 


			// color the totem
			
		}
		
		thisPosition = totems[reg].totem.transform.position;
		thisPosition.y = currentHeight;
		currentHeight += stepHeight;
		
		if (i>0){
			var thisLine : GameObject = new GameObject();
			thisLine.name = "lineRenderer_" + i;
			thisLine.layer = PlotvisLayer.Weaving;// LayerMask.NameToLayer("LayerWeaving");
			thisLine.transform.parent = this.transform;
			var thisLineRenderer : AccessibleLineRenderer = thisLine.AddComponent(AccessibleLineRenderer);
			thisLineRenderer.SetVertexCount(2);
			thisLineRenderer.SetPosition(0, prevPosition);
			thisLineRenderer.SetPosition(1, thisPosition);
			thisLineRenderer.SetWidth(.05,.05);
			thisLineRenderer.SetMaterial(new Material (Shader.Find("Particles/Alpha Blended Premultiply")));
			thisLineRenderer.SetColors(ColorManager.instance.colorsByReg[prevReg], 
									   ColorManager.instance.colorsByReg[reg]);
			totems[prevReg].lines["start"].Push(thisLineRenderer);
			totems[reg].lines["end"].Push(thisLineRenderer);
						
		}
		
		prevPosition = thisPosition;
		prevReg = reg;
	}
	
}

function Update () {
}