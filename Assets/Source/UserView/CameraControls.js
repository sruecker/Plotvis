
import ApplicationState;

//var target : Transform;

var xSpeed : float = 5;
var ySpeed : float = 5;

var yMinLimit = -20;
var yMaxLimit = 80;

var scrollDistanceSpeed : float = 10;
var cameraMinDistance : float = 1;

///
private var currentStructure : int = 0;
private var currentStructureLayer : int  = 8;
private var numberOfStructures : int =5;

///


// private var x = 0.0;
// private var y = 0.0;
// private var distance = 0.0;
// camera pivot transform position=
private var cameraPositions : Hashtable[];

private var canRotate : boolean = true;
// private var cameraPivot : GameObject;
private var horizontalMovement : float = 0;
private var startDistance = 16;
private var startXRot = 0;
private var startYRot = 40;
private var backgroundPlane : GameObject;

function Awake() {
	SetBackgroundPlaneSize();
	// cameraPivot = GameObject.Find("CameraPivot");
	InitializeCameraPositions();
	ResetAllStart();
	// GetComponent(Camera).cullingMask = (1 << 8); // start with LayerFibonacci
	SetVisibleStructure(0);
}

function InitializeCameraPositions() {
	cameraPositions = new Hashtable[numberOfStructures];
	for (var i:int =0; i< numberOfStructures; i++) {
		cameraPositions[i] = new Hashtable();
		cameraPositions[i]['x'] = 0.0;
		cameraPositions[i]['y'] = 0.0;
		cameraPositions[i]['distance'] = 0.0;
		cameraPositions[i]['pivot'] = new GameObject();
		cameraPositions[i]['pivot'].name = "CameraPivot_" + i;
	}
}

function SetBackgroundPlaneSize() {
	backgroundPlane = gameObject.Find("BackgroundPlane");
	backgroundPlane.transform.position.z = 1000;

	backgroundPlane.transform.localScale.z = (Mathf.Tan(Mathf.Deg2Rad*gameObject.GetComponent(Camera).fieldOfView/2.0 ) * (1000/5));//gameObject.GetComponent(Camera).aspect * 1000;
	backgroundPlane.transform.localScale.x = backgroundPlane.transform.localScale.z * gameObject.GetComponent(Camera).aspect * 2;
	//Debug.Log();
}

function SetVisibleStructure(id : int) {
	if (id >=0 && id < numberOfStructures) {
		currentStructure = id; 
		GetComponent(Camera).cullingMask = (1 << 8 + currentStructure); // should pretifi this code
		currentStructureLayer = 8 + currentStructure;
		ApplicationState.instance.currentLayer = currentStructureLayer;
	}
}

function MoveToNextStructure() {
	SetVisibleStructure(++currentStructure % numberOfStructures);
}

function MoveToPrevStructure() {
 	currentStructure = (currentStructure + numberOfStructures - 1) % numberOfStructures;
	SetVisibleStructure(currentStructure);
}

function ResetStart(id : int) {
	cameraPositions[id]['pivot'].transform.position = Vector3.zero;
	cameraPositions[id]['distance'] = startDistance;
	cameraPositions[id]['x'] = startXRot;
    cameraPositions[id]['y'] = startYRot;	
}

function ResetAllStart() {
	for (var i:int =0; i< numberOfStructures; i++) {
		ResetStart(i);
	}
}

function ResetStart() {
	ResetStart(currentStructure);
}

function ResetCamera() {
	ResetStart();
	MoveCamera();
}

function Start () {
    //var angles = transform.eulerAngles;
    //x = 40;//angles.y;
    //y = 40;//angles.x;

}

private function MoveCamera() {
	//scrollDistanceSpeed = distance / 10.0;
	
	if (Input.GetAxis("Distance")) {
		cameraPositions[currentStructure]['distance'] -= Input.GetAxis("Distance") * scrollDistanceSpeed * Time.deltaTime;
		if (cameraPositions[currentStructure]['distance'] < cameraMinDistance) {
			cameraPositions[currentStructure]['distance'] = cameraMinDistance;
		}
	}
	
	if (Input.GetAxis("Horizontal")) {
		cameraPositions[currentStructure]['pivot'].transform.position += transform.right * Input.GetAxis("Horizontal") * scrollDistanceSpeed * Time.deltaTime;
	}
	
	if (Input.GetAxis("Vertical")) {				
		cameraPositions[currentStructure]['pivot'].transform.position += transform.up * Input.GetAxis("Vertical") * scrollDistanceSpeed * Time.deltaTime;
	}
	
	if (Input.GetAxis("Focus")) {

		if (Input.GetAxis("Focus") < 0) {
			MoveToTarget(Vector3(0,0,0));
		} else { // focus on selected
			if (ApplicationState.instance.selectedObject) {
				MoveToTarget(ApplicationState.instance.selectedObject.transform.position);
			}
		}		
	}
	
	if (Input.GetMouseButtonDown(0) && 
	    WindowManager.instance.IsVector2OverGUI(Input.mousePosition)) {
		canRotate = false;
	}
	if (Input.GetMouseButtonUp(0)) {
		canRotate = true;
	}
				
	if(canRotate && Input.GetMouseButton(0)) {
		///Debug.Log("mouse click 1 ");
   	 	cameraPositions[currentStructure]['x'] += Input.GetAxis("Mouse X") * xSpeed;
        cameraPositions[currentStructure]['y'] -= Input.GetAxis("Mouse Y") * ySpeed;
	}
	var rotation = Quaternion.Euler(cameraPositions[currentStructure]['y'], cameraPositions[currentStructure]['x'], 0);
	var position = rotation * Vector3(0.0, 0.0, -cameraPositions[currentStructure]['distance']) + cameraPositions[currentStructure]['pivot'].transform.position;

	transform.rotation = rotation;
	transform.position = position;

	// there is a bug on Mac OS X where the mouse scroll does not work for
	// external input devices
}

function Update () {
	
	
	if ( Input.GetButtonDown("Quit")  ) {
		 
		var isWebPlayer : boolean = Application.platform == RuntimePlatform.OSXWebPlayer || 
									Application.platform == RuntimePlatform.WindowsWebPlayer;
									
		if (!isWebPlayer) {
			Application.Quit();			
		}
	}
	
    if (cameraPositions[currentStructure]['pivot'].transform && ApplicationState.instance.selectedTool == PlotvisTools.Move ) {
		MoveCamera();
    }
	backgroundPlane.layer = currentStructureLayer;

}

static function ClampAngle (angle : float, min : float, max : float) {
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}

function frameStructure() {	
	if (cameraPositions[currentStructure]['pivot'].transform) {
		MoveCamera();
	}
}



function MoveToTarget(target : Vector3) {
    var sourcePos = cameraPositions[currentStructure]['pivot'].transform.position;
	var sourceDist = cameraPositions[currentStructure]['distance'];
    var i = 0.0;
    while (i < 1.0) {
        cameraPositions[currentStructure]['pivot'].transform.position = Vector3.Lerp(sourcePos, target, Mathf.SmoothStep(0,1,i));
		cameraPositions[currentStructure]['distance'] = Mathf.SmoothStep(sourceDist, 10, i);
        i += Time.deltaTime;
        yield;
    }
}

