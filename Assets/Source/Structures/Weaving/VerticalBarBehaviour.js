

var nodeName : String = "";

function OnMouseEnter() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		InformationManager.instance.SetPopUpInformation(nodeName);
		ApplicationState.instance.indicatedObject = this.transform.gameObject;
	}
}

function OnMouseExit() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		ApplicationState.instance.indicatedObject = null;
	}
}