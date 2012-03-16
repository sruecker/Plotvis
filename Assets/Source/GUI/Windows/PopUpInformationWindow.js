var skin : GUISkin;

var windowStyle : GUIStyle;

var xWindowShift : int = 10;
var yWindowShift : int = 0;

private var scrollPosition : Vector2;
private var informationContent : GUIContent;

function OnGUI() {
	GUI.skin = skin;
	
	if (ApplicationState.instance.selectedTool == PlotvisTools.Select &&
		ApplicationState.instance.indicatedObject != null) {
		
		var windowRect : Rect = WindowManager.instance.windowRects[WindowID.POPUP_INFORMATION_ID];
		
		//if ( ! WindowManager.instance.IsVector2OverGUI(Input.mousePosition)) {
		windowRect.x = Input.mousePosition.x + xWindowShift;
		windowRect.y = Screen.height - (Input.mousePosition.y + yWindowShift);
	
		//PrepareInformationString();
		informationContent = GUIContent(ApplicationState.instance.popUpInformation);
		
		
		
		windowRect.height =  GUI.skin.GetStyle("label").CalcHeight(informationContent, windowRect.width) + 20;

		windowRect = GUI.Window (WindowID.POPUP_INFORMATION_ID, 
								 windowRect, 
								 CreateWindow, 
								 "",
								 windowStyle);
	//	}
		
		
	}
}


// from the fibonacci cylinders
// public function PrepareInformationString( node : Hashtable) {
// 	
// 	//var information : Hashtable = ApplicationState.instance.objectToNode[ApplicationState.instance.indicatedObject];
// 
// }

function CreateWindow(windowId : int) {	
	GUILayout.BeginVertical("box");
	GUILayout.Label(informationContent);
	GUILayout.EndVertical();
}