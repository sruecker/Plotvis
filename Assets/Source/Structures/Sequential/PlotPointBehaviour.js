
// var nodeId : int;
var character : String;
var position : Number;



function OnMouseEnter() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		//InformationManager.instance.SetPopUpInformationNode(NodeManager.instance.depthFirstNodes[nodeId]);
		var result : String = "Character: " +character + "\n" +  "Position: ";
		
		if (position == Mathf.NegativeInfinity) {
			result += "N/A";
		} else {
			result += position;
		}

		InformationManager.instance.SetPopUpInformation(result);
		ApplicationState.instance.indicatedObject = this.transform.gameObject;
	}
}

function OnMouseExit() {
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select) {
		ApplicationState.instance.indicatedObject = null;
	}
}