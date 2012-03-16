
var skin : GUISkin;

private var scrollPosition : Vector2;

function OnGUI() {
	
	GUI.skin = skin;
	
	
	WindowManager.instance.windowRects[WindowID.TAG_INFORMATION_ID] = 
		GUI.Window (WindowID.TAG_INFORMATION_ID, 
					WindowManager.instance.windowRects[WindowID.TAG_INFORMATION_ID], 
					CreateWindow, 
					"Selected tag information");
}

function CreateWindow(windowId : int) {
	
	
	var windowRect : Rect = WindowManager.instance.windowRects[WindowID.TAG_INFORMATION_ID];
	
	if (ApplicationState.instance.selectedObject) {
		
		var information : Hashtable = NodeManager.instance.GetSelectedTag();
		//GUILayout.BeginHorizontal("box");
		scrollPosition = GUILayout.BeginScrollView (
		       scrollPosition, GUILayout.Width(windowRect.width - 33), 
				GUILayout.Height(windowRect.height - 47));
		if (information != null) {
			GUILayout.Label("Id: " + information["id"]);
			GUILayout.Label("Type: " + information["type"]);
			
			var currentNodeType : NodeTypes = information["type"];
			if (currentNodeType == NodeTypes.Element ) {
				
				GUILayout.Label("Name: " + information["name"]);
				
				if (information["attributes"].Count()) {
					GUILayout.Label("Attributes: ");
					for (var key : String in information["attributes"].Keys) {
						GUILayout.Label(key + ": " + information["attributes"][key]);
					}
				}
				
				GUILayout.Label("Inner text: " + information["innerText"]);
				
				
			} else if (currentNodeType == NodeTypes.Text) {
				GUILayout.Label("Value: " + information["value"]);
			} else {
				Debug.Log("Found a node of unknown type");
			}
		} else {
			Debug.Log("Found a node with no information");
		}
		
		GUILayout.EndScrollView ();
	//	GUILayout.EndHorizontal();
		
	} 
	

	GUI.DragWindow();
	
}