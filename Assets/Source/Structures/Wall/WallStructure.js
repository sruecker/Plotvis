

public var wallSectionPrefab : GameObject;
public var wallMaterial : Material;
public var cylinderObject : GameObject;

//private var wallMesh : Mesh;


private var maxLength : float;
private var maxHeight : float;
private var minHeight : float;
// private var wallNodes : Array;
private var rotationAngle : float;
private var lengthPerWord : float;
private var totalWords : int;

private var storyPoints : Array;
private var lastStoryPoint : float;
private var wallObject : GameObject;
private var gameObjects : Array;
private var structureBounds : Bounds;
private var nodeTypesPosition : NodePosition[];
// private var nodeColliders : GameObject;

class WallNode {
	var position : Vector3;
	var height : float;
	var prevWidth : float;
	var uv : float;
}

class StoryPoint {
	var time : float;
	var words : int;
}

class NodePosition {
	var name : String;
	var position : float;
	var node : Hashtable;
	var gameObject : GameObject;
}

function Update () {

}

function Awake() {

	lastStoryPoint = 0;
	storyPoints = new Array();
	Random.seed = 42.0;
	maxLength = 200.0;
	maxHeight = 9.0;
	minHeight = 3.0;
	rotationAngle = 45.0;
	lastStoryPoint = Mathf.NegativeInfinity;
	totalWords =0;	
}

private function ColorTexture() {
	var wallTexture : Texture2D = wallMaterial.mainTexture;
	var textureWidth : int = wallTexture.width;
	var thisPosition : float = 0;
	var thisName : String = "";
	var i:int;
	for (i=0; i< textureWidth; i++) {
		wallTexture.SetPixel(i,0,Color.white);
		wallTexture.SetPixel(i,1,Color.white);
	}
	
	for (i=0; i< nodeTypesPosition.length;i++) {
		thisPosition = textureWidth* nodeTypesPosition[i].position;
		thisName = ColorManager.instance.GetNodeColorName(nodeTypesPosition[i].node);
		// check why it is an array
		var thisColor : Color = ColorManager.instance.colors[thisName]["color"];
		wallTexture.SetPixel(thisPosition,0,thisColor);
		wallTexture.SetPixel(thisPosition,1,thisColor);
		
	}
	
	wallTexture.Apply();
	wallMaterial.mainTexture = wallTexture;
}

function GetStructureData() {
	ClearGameObjects();
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	
	var wordCountSinceLast : int = 0;
	var nodeType : NodeTypes;
	totalWords = 0;
	
	nodeTypesPosition = new NodePosition[structure["elementCount"]];
	var elementIndex : int =0;
	var newStoryPoint : StoryPoint;
	for (i=0; i < structure["nodeCount"]; i++) {

		nodeType = NodeManager.instance.depthFirstNodes[i]["type"];
		if (nodeType == NodeTypes.Element) {
			var nodeName : String = NodeManager.instance.depthFirstNodes[i]["name"];
			var nameLower = nodeName.ToLower();
			if ((nameLower == "dialogue" || nameLower == "narration" || nameLower == "action") &&
				NodeManager.instance.depthFirstNodes[i]["attributes"].Contains("storyPoint")) {
					newStoryPoint = new StoryPoint();
					var t : String = NodeManager.instance.depthFirstNodes[i]["attributes"]["storyPoint"];
					newStoryPoint.time = parseFloat(t);
					newStoryPoint.words = wordCountSinceLast;
					storyPoints.Push(newStoryPoint);

					if(newStoryPoint.words == 0) newStoryPoint.words = 1; // XXX check for 0 words

					wordCountSinceLast = 0;


			} 
			// add node type position to color later on
			nodeTypesPosition[elementIndex] = new NodePosition();
			nodeTypesPosition[elementIndex].name = nodeName;
			nodeTypesPosition[elementIndex].position = totalWords;
			nodeTypesPosition[elementIndex].node = NodeManager.instance.depthFirstNodes[i];
			
			elementIndex++;
			
		} else if (nodeType == NodeTypes.Text) {
			var words : Array = NodeManager.instance.depthFirstNodes[i]["value"].Split(" "[0]);
			wordCountSinceLast += words.length;
			totalWords += words.length;
		} 
	 	if (i == structure["nodeCount"]-1) {
			newStoryPoint = new StoryPoint();
			newStoryPoint.time = storyPoints[storyPoints.length-1].time;
			newStoryPoint.words = wordCountSinceLast;
			storyPoints.Push(newStoryPoint);
		}
	}
	lengthPerWord = maxLength / totalWords;
	
	// normalize nodes position
	for (var nodePosition : NodePosition in nodeTypesPosition) {
		nodePosition.position = nodePosition.position / totalWords;
	}		
}

function ClearGameObjects() {
	lastStoryPoint = 0;
	storyPoints = new Array();
	
	if (nodeTypesPosition) {
		for (var node : NodePosition in nodeTypesPosition) {
			// Debug.Log(node);
			Destroy(node.gameObject);
		}
	}
	for (var object : GameObject in gameObjects) {
		Destroy(object);
	}
	
	Destroy(wallObject);
}

/*
function CreateFakeData() {
	totalWords = 0;
	// fake data
	for (var i:int =0; i < 100; i++) {
		var newVal = Random.value;
		if (newVal!=lastStoryPoint) {
			lastStoryPoint = newVal;
			var newStoryPoint = new StoryPoint();
			newStoryPoint.time = newVal;
			newStoryPoint.words = Random.Range(10, 100);
			totalWords += newStoryPoint.words;
			storyPoints.Push(newStoryPoint);
		}
	}
	
	lengthPerWord = maxLength / totalWords;
}
*/

function CreateWallSection() : GameObject {
	var thisSection :GameObject = Instantiate(wallSectionPrefab) as GameObject;
	thisSection.layer = PlotvisLayer.Wall; // LayerMask.NameToLayer("LayerWall"); // LayerWall 
	// create mesh
	var wallMesh : Mesh = thisSection.GetComponent(MeshFilter).mesh;
	wallMesh.Clear();
	
	var vertices = new Vector3[4];
	
	vertices[0] = Vector3(0,0,0);
	vertices[1] = Vector3(0,0,1);
	vertices[2] = Vector3(0,1,1);
	vertices[3] = Vector3(0,1,0);		
	
	var triangles = new int[6];
	
	triangles[0] = 0;
	triangles[1] = 1;
	triangles[2] = 2;
	triangles[3] = 2;
	triangles[4] = 0;
	triangles[5] = 3;
	
	var normals = new Vector3[4];
	
	normals[0] = Vector3(0,1,0);
	normals[1] = Vector3(0,1,0);
	normals[2] = Vector3(0,1,0);
	normals[3] = Vector3(0,1,0);
	
	var uv = new Vector2[4];
	
	uv[0] = Vector2(0,0);
	uv[1] = Vector2(1,0);
	uv[2] = Vector2(1,1);
	uv[3] = Vector2(0,1);
		
	wallMesh.vertices = vertices;
	wallMesh.triangles = triangles;
	wallMesh.normals = normals;
	wallMesh.uv = uv;
	
	// set material
	var wallRenderer : MeshRenderer = thisSection.GetComponent(MeshRenderer);
	wallRenderer.material = wallMaterial;
	
	return thisSection;
	
}

function BuildStructure() {
	// Debug.Log("Building wall structure");
	
	
	//wallMesh = GetComponent(MeshFilter).mesh;
	//wallMesh.Clear();
	var posRotation : Quaternion = Quaternion.AngleAxis(rotationAngle, Vector3.up);
	var negRotation : Quaternion = Quaternion.AngleAxis(-rotationAngle, Vector3.up);
	var currentAngle : float = 0;
	var directionVector : Vector3 = Vector3.forward;
	var currentPosition : Vector3 = Vector3(0,0,0);
	
	wallObject = new GameObject();
	wallObject.name = "wallObject";
	wallObject.transform.parent = this.transform;
	// add first point
	
	
	var storyPointCount : int = storyPoints.length;	
	var previousSection : GameObject = null; 
	var prevStoryPoint : float = 0.0;
	var prevNormalizedDistance : float = 0.0;
	var normalizedDistance : float = 0.0;
	var lengthSoFar : float = 0;
	var newNormal : Vector3 = Vector3.up;
	var newBinormal : Vector3 = Vector3.right;

	// collider variables
	var currentNodePosition : int = 0;
	var currentU : float = 0;
	
	gameObjects = new Array();
	ColorTexture();

	for (var i:int =0; i<storyPointCount; i++) {
		var newWallSection : GameObject = CreateWallSection();
		gameObjects.Push(newWallSection);
		newWallSection.name = "wallSection" + i;
						
		if (i!=0){
			newWallSection.transform.parent = previousSection.transform;
		} else {
			newWallSection.transform.parent = wallObject.transform;
		}
		
		// create position, lenght and height modifications
		
		newWallSection.transform.position += currentPosition;
		
		
		// height
		
		var wallMesh : Mesh = newWallSection.GetComponent(MeshFilter).mesh;
		var vertices : Array = wallMesh.vertices;
		var uv : Array = wallMesh.uv;
		var normals : Array = wallMesh.normals;
		// rotation
		
		
		Vector3.OrthoNormalize(directionVector, newNormal, newBinormal); 
		//Debug.Log(newBinormal);
		//directionVector.Normalize();
		
		if (prevStoryPoint > storyPoints[i].time) {
			directionVector = posRotation * directionVector;
			currentAngle += rotationAngle;
		} else {
			directionVector = negRotation * directionVector;
			currentAngle -= rotationAngle;
		}
		
		newWallSection.transform.Rotate(Vector3(0,currentAngle,0));
		
		prevStoryPoint = storyPoints[i].time;
		var newLength : float =  storyPoints[i].words * lengthPerWord;
		
		directionVector.Normalize();
		directionVector = directionVector * newLength;
		lengthSoFar += newLength;
		normalizedDistance = (1.0*(lengthSoFar))/maxLength;
		// Debug.Log(normalizedDistance);
		vertices[1] = Vector3(0,0,newLength);
		vertices[2] = Vector3(0,minHeight+maxHeight*normalizedDistance,newLength);
		vertices[3] = Vector3(0,minHeight+maxHeight*prevNormalizedDistance,0);
		

		uv[0] = Vector2(prevNormalizedDistance,0);
		uv[1] = Vector2(normalizedDistance,0);
		uv[2] = Vector2(normalizedDistance,1);
		uv[3] = Vector2(prevNormalizedDistance,1);
		
		for (var j:int =0; j< normals.length; j++) {
			normals[j] = newBinormal;
		}
		
		
		wallMesh.vertices = vertices;
		wallMesh.uv = uv;
		wallMesh.normals = normals;
		wallMesh.RecalculateBounds();
		
		// add colliders here

		currentNodePosition = CreateNodeColliders(currentNodePosition,												  
											      prevNormalizedDistance, normalizedDistance, 
												  minHeight, maxHeight,
												  currentPosition, currentPosition+directionVector);
		
		prevNormalizedDistance = normalizedDistance;					
		currentPosition += directionVector;
		// Debug.Log(normalizedDistance);
		previousSection = newWallSection;		
	}		
}

private function CreateNodeColliders(currentNodePosition : int, 
									fromU : float, toU : float,
									fromHeight : float, toHeight : float,
									fromPos : Vector3, toPos : Vector3) : int {
	var sectionU : float;
	var direction : Vector3 = toPos - fromPos;
	var currentPos : Vector3;									
	var currentHeight : float;
	while (currentNodePosition < nodeTypesPosition.length && nodeTypesPosition[currentNodePosition].position <= toU) {
		
		sectionU = (nodeTypesPosition[currentNodePosition].position - fromU) / (toU - fromU);
		currentHeight = fromHeight + (nodeTypesPosition[currentNodePosition].position * (toHeight) );
		// Debug.Log(currentHeight);
		currentPos = fromPos + (sectionU * direction);
		
		nodeTypesPosition[currentNodePosition].gameObject = Instantiate(cylinderObject) as GameObject;
		nodeTypesPosition[currentNodePosition].gameObject.layer = PlotvisLayer.Wall;//LayerMask.NameToLayer("LayerWall");
		nodeTypesPosition[currentNodePosition].gameObject.name = "wallNodeCollider" + currentNodePosition;
		nodeTypesPosition[currentNodePosition].gameObject.transform.parent = transform;		
		nodeTypesPosition[currentNodePosition].gameObject.transform.position = currentPos;
		nodeTypesPosition[currentNodePosition].gameObject.transform.position.y += currentHeight /2;
		nodeTypesPosition[currentNodePosition].gameObject.GetComponent(WallNodeColliderBehaviour).nodeId = nodeTypesPosition[currentNodePosition].node["id"];
		nodeTypesPosition[currentNodePosition].gameObject.GetComponent(Collider).size.y = currentHeight;
		
		++currentNodePosition;
	}
	return currentNodePosition;
}

function ComputeBounds() {
	for (var object : GameObject in gameObjects) {
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
	
	
	var s : float = scaling/workingScale;
	transform.localScale = Vector3(s,s,s);
	
	// center

	transform.position -= structureBounds.center * s;

}

function Build() {
	transform.localScale = Vector3.one;
	transform.position = Vector3.zero;
	GetStructureData();
	//CreateFakeData();
	BuildStructure();
	FocusStructure();	
}


