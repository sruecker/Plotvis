
import ApplicationState;
import WindowManager;
var skin : GUISkin;

var arrowTexture : Texture2D;
var handTexture : Texture2D;
var buttonSize : int = 24;
var buttonStart : int = 20;

function Start() {
	WindowManager.instance.windowRects[WindowID.TOOLS_ID].height = buttonStart + buttonSize * 2 + 5;
	WindowManager.instance.windowRects[WindowID.TOOLS_ID].width = buttonSize + 30;
}

function CreateWindow(windowId : int) {
	
	var currentStep : int = buttonStart;
	
	if (GUI.Button(Rect(5, currentStep, buttonSize, buttonSize), 
				   GUIContent(arrowTexture, "Select item"))) {
					ApplicationState.instance.selectedTool = PlotvisTools.Select;
	}
	currentStep += buttonSize;
	
	if (GUI.Button(Rect(5, currentStep, buttonSize, buttonSize), 
				   GUIContent(handTexture, "Free rotate"))) {
		ApplicationState.instance.selectedTool = PlotvisTools.Move;
		
	}
	
	GUI.DragWindow();
	
}

function OnGUI() {
	
	// GUI.skin = skin;
	// 
	// WindowManager.instance.windowRects[WindowID.TOOLS_ID] = 
	// 	GUI.Window (WindowID.TOOLS_ID, 
	// 				WindowManager.instance.windowRects[WindowID.TOOLS_ID], 
	// 				CreateWindow, 
	// 				"");
}



