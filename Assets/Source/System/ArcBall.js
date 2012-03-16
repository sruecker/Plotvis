

private var isRotatating : boolean;
private var startVector : Vector3;
private var currentVector : Vector3;
private var currentCamera : Camera;
private var startingQuaternion : Quaternion;

private var a : Vector3;
private var b : Vector3;

// should make sure the vectors start from zero

function Awake() {
isRotatating = false;
}

function Start() {
	currentCamera = GameObject.Find("Main Camera").GetComponent(Camera);
}

function OnMouseDown() {
	isRotatating = true;
	startVector =currentCamera.ViewportToWorldPoint(Vector3(Input.mousePosition.x,
														    Input.mousePosition.y, 
														   currentCamera.nearClipPlane));
	a =startVector;
	startVector.Normalize();	
	startingQuaternion = transform.rotation;											
}

function OnMouseUp() {
isRotatating = false;
}

function OnDrawGizmos() {
	if (isRotatating) {
		var p = currentCamera.ScreenToWorldPoint(Vector3 (Input.mousePosition.x,
												 Input.mousePosition.y,
												 currentCamera.nearClipPlane));
	    Gizmos.color = Color.yellow;
	    Gizmos.DrawSphere (p, 10);
	}
}

function Update() {
	
	if (isRotatating) {
		
		
	currentVector =currentCamera.ScreenToWorldPoint(Vector3(Input.mousePosition.x,
								   						    Input.mousePosition.y, 
														   currentCamera.nearClipPlane));
	b =currentVector;
	currentVector.Normalize();	
		
		

		
		//Debug.Log(Input.mousePosition);
	    Debug.DrawLine (Vector3.zero,a, Color.red);
		Debug.DrawLine (Vector3.zero,b, Color.green);
		
		var axis : Vector3 = Vector3.Cross(currentVector,startVector).normalized;
	//	if (currentVector !=startVector) {
		var radians : float = Mathf.Acos(Vector3.Dot(currentVector,startVector));
		// Debug.Log(radians);
		// 		Debug.Log(Vector3.Dot(currentVector,startVector));
		// 		Debug.Log(_startVector);
		// 		Debug.Log(currentVector);
		axis.Scale( Vector3(Mathf.Sin(radians/2.0),Mathf.Sin(radians/2.0),Mathf.Sin(radians/2.0)));
		var w : float = Mathf.Cos(radians/2.0);
	
		var currentRotation : Quaternion = Quaternion(axis.x, axis.y, axis.z, w);
		currentRotation = Quaternion.identity;
		currentRotation.SetFromToRotation(startVector,currentVector); 
		transform.rotation = currentRotation * startingQuaternion;
	//	}
		
	
	}
}


