

var wordWeight : float = 1;
var nodeId : int;

private var myMesh : Mesh;
private var h0 : float;
private var h1 : float;
private var currentHeight: float;
private var currentY : float;
private var changingWeight : boolean;
private var t : float;
private var previousWordWeight : float = 1;
private var cylinderHalo : GameObject;
private var scaleSpeed : float = 1.3;
private var minScale : float = 1.1;
private var maxScale : float = 1.4;
private var currentScaling : float = 0.0;
private var animateForward : boolean;
private var mouseEntered : boolean;

function Update() {
	if (changingWeight) {

		if (t >= 1.0) {
			t = 1.0;
			changingWeight = false;
		}
		var newScaling : float = Mathf.SmoothStep(previousWordWeight, wordWeight,t);

		transform.localScale = Vector3(1.0, newScaling , 1.0);
		h1 = h0 * newScaling;
		transform.localPosition.y = h1/2.0 - h0/2.0;
		
		if (!changingWeight) {
			previousWordWeight = wordWeight;
		}
		t += Time.deltaTime;
	}
	if (ApplicationState.instance.selectedObject != gameObject) {
		if (!mouseEntered)
		cylinderHalo.active = false;
	} else {
		AnimateHalo(Time.deltaTime);
	}
}

function AnimateHalo(t:float) {
	if (animateForward)
		currentScaling += t * scaleSpeed;
	else 
		currentScaling -= t * scaleSpeed;
	
	// for next iteration
	if (currentScaling > 1.0) {
		animateForward = false;
		currentScaling = 1.0;
	} else if (currentScaling < 0.0){
		animateForward = true;
		currentScaling = 0.0;
	}
	
	// scale mas size of halo based on distance to camera
	var distanceVector : Vector3 = ApplicationState.instance.mainCamera.transform.position -
								   gameObject.transform.position;
	var distanceToCamera : Number = distanceVector.magnitude;
	//Debug.Log(distanceToCamera);
	if (distanceToCamera < 5) distanceToCamera = 5;
	else if (distanceToCamera > 25) distanceToCamera = 25;
	
	var maxScaleFactor : Number = ((distanceToCamera - 5.0)  / (25.0 - 5.0) * 0.15) + 0.85;

	var scaleFactor : float = Mathf.Lerp(minScale, maxScaleFactor * maxScale, currentScaling);
	cylinderHalo.transform.localScale = Vector3(scaleFactor, scaleFactor, scaleFactor);
	var thisColor : Color = gameObject.GetComponent(MaterialBehaviour).GetMaterial().color;
	cylinderHalo.GetComponent(MaterialBehaviour).GetMaterial().color = 
		Color.Lerp(thisColor, Color.white, currentScaling * 0.5);
	cylinderHalo.GetComponent(MaterialBehaviour).GetMaterial().color.a = 0.8;
}

function Awake() {
	myMesh                        = GetComponent(MeshFilter).mesh;
	h0                            = myMesh.bounds.size.y;
	changingWeight                = false;
	cylinderHalo                  = Instantiate(Resources.Load("Prefabs/Fibonacci/cylinderHaloPrefab"));
	cylinderHalo.layer            = PlotvisLayer.Fibonacci;
	cylinderHalo.transform.parent = gameObject.transform;
	cylinderHalo.active           = false;
	mouseEntered                  = false;

	
}

function OnMouseDown() {
	if (ApplicationState.instance.selectedObject != gameObject &&
		ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		ApplicationState.instance.selectedObject = gameObject;
		currentScaling = 0;
		animateForward = true;
		AddCylinderHalo();
	}	
}


function OnMouseEnter() {
	if (ApplicationState.instance.selectedObject != gameObject &&
		ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		mouseEntered = true;
		currentScaling = 0;
		animateForward = true;
		AddCylinderHalo();
		InformationManager.instance.SetPopUpInformationNode(NodeManager.instance.depthFirstNodes[nodeId]);
		ApplicationState.instance.indicatedObject = this.transform.gameObject;
	}
}

function OnMouseExit() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		if (ApplicationState.instance.selectedObject != gameObject) {
			cylinderHalo.active = false;
		}
		mouseEntered = false;
		ApplicationState.instance.indicatedObject = null;
	}
}

function AddCylinderHalo() {
	currentScaling = 0;
	animateForward = true;
	// add cylinderHalo
	// activate, place, and color cylinder halo
	cylinderHalo.transform.position = gameObject.transform.position;
	cylinderHalo.transform.rotation = gameObject.transform.rotation;
	cylinderHalo.active = true;
	
	cylinderHalo.GetComponent(MaterialBehaviour).GetMaterial().color = 
		gameObject.GetComponent(MaterialBehaviour).GetMaterial().color;
	cylinderHalo.GetComponent(MaterialBehaviour).GetMaterial().color.a = 0.80;
	AnimateHalo(0);
		
	
}




function changeWordWeight() {
	t = 0;
	changingWeight = true;
	
	//transform.localScale = Vector3(1.0, wordWeight, 1.0);
	//transform.localPosition.y = h1/2.0 - h0/2.0;
}