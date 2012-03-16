
var nodeId : int;


function OnMouseEnter() {
	if (ApplicationState.instance.selectedObject != gameObject &&
		ApplicationState.instance.selectedTool == PlotvisTools.Select) {
			
			InformationManager.instance.SetPopUpInformationNode(NodeManager.instance.depthFirstNodes[nodeId]);
			ApplicationState.instance.indicatedObject = this.transform.gameObject;		
	}
}



function OnMouseExit() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		ApplicationState.instance.indicatedObject = null;
	}
}

/*
function OnMouseDown() {
	if (ApplicationState.instance.selectedObject != gameObject &&
		ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		ApplicationState.instance.selectedObject = gameObject;
	}	
}
*/