
var plane : GameObject;

private var backgroundMaterial : Material;
private var localPlane : GameObject;

function Start () {
	
	var A : Vector3 = camera.ScreenToWorldPoint(Vector3 (0, 0, camera.farClipPlane));
	var C : Vector3 = camera.ScreenToWorldPoint(Vector3 (Screen.width, Screen.height, camera.farClipPlane));
	
	localPlane = Instantiate(plane, Vector3 (0, 0, 0), Quaternion.Euler(-90,0,0)  );

	localPlane.transform.parent = camera.transform;
	var renderer : MeshRenderer =  localPlane.GetComponent(MeshRenderer);
	var bounds : Bounds = renderer.bounds;
	
	var finalWidth : float = C.x - A.x;
	var finalHeight : float = C.y - A.y;

	localPlane.transform.localScale.x = finalWidth / bounds.size.x; 
	localPlane.transform.localScale.z = finalHeight / bounds.size.y;
	localPlane.transform.position.z = A.z;
}


function Update () {
}