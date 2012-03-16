

var skin : GUISkin;
private var scrollPosition : Vector2;

function OnGUI() {
	var windowRect : Rect = WindowManager.instance.windowRects[WindowID.MESSAGE_ID];
	
	GUI.skin = skin;

	if (WindowManager.instance.windowShow[WindowID.MESSAGE_ID]) {
		windowRect = GUI.Window (WindowID.MESSAGE_ID, 
								windowRect, 
								CreateWindow, 
								LogManager.instance.messageTitle);
	}
	
}

function CreateWindow(windowId : int) {
	
	var windowRect : Rect = WindowManager.instance.windowRects[WindowID.MESSAGE_ID];
	GUILayout.BeginVertical();
	
	scrollPosition = GUILayout.BeginScrollView (
	       scrollPosition, GUILayout.Width(windowRect.width - 33), 
			GUILayout.Height(windowRect.height - 80));
	
	GUILayout.Label(LogManager.instance.messageText);		
			
	GUILayout.EndScrollView();
	
	if(GUILayout.Button("Close")) {
		WindowManager.instance.windowShow[WindowID.MESSAGE_ID] = false;
	}
	GUILayout.EndVertical();
	GUI.DragWindow();

}