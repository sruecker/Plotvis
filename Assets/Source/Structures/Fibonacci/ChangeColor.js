


function applyMaterial(objectMaterial : Material) {
	var currentMeshRenderer : MeshRenderer;
	var meshRenderers : Array = gameObject.GetComponentsInChildren(MeshRenderer);
	
	for (currentMeshRenderer in meshRenderers) {
		currentMeshRenderer.material = objectMaterial;
	}

	meshRenderers = gameObject.GetComponents(MeshRenderer);
	
	for (currentMeshRenderer in meshRenderers) {
		currentMeshRenderer.material = objectMaterial;
	}
}
