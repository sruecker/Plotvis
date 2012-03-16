
function setMaterial(objectMaterial : Material) {
	var currentMeshRenderer : MeshRenderer = GetComponent(MeshRenderer);
	//var meshRenderers : Array = GetComponent(MeshRenderer);
	
	//for (currentMeshRenderer in meshRenderers) {
		currentMeshRenderer.material = objectMaterial;
	//}

	//meshRenderers = gameObject.GetComponents(MeshRenderer);
	
	//for (currentMeshRenderer in meshRenderers) {
	//	currentMeshRenderer.material = objectMaterial;
	//}
}

function GetMaterial() {
	
	return gameObject.GetComponentInChildren(MeshRenderer).material ;
	
}

