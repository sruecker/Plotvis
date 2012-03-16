
import ApplicationState;
import WindowManager;

var skin : GUISkin;

private var scrollPosition : Vector2;
private var fibonacciComponent : FibonacciStructure;
private var currentStructure = 0;
private var localCamera : Camera;


function OnGUI() {
	
	GUI.skin = skin;
	
	WindowManager.instance.windowRects[WindowID.ACTIONS_ID] = 
		GUI.Window (WindowID.ACTIONS_ID, 
					WindowManager.instance.windowRects[WindowID.ACTIONS_ID], 
					CreateWindow, 
					"Actions");
}

function CreateWindow(windowId : int) {
	
	var windowRect : Rect = WindowManager.instance.windowRects[WindowID.ACTIONS_ID];
	
	scrollPosition = GUILayout.BeginScrollView (
	       scrollPosition, GUILayout.Width(windowRect.width - 33), 
			GUILayout.Height(windowRect.height - 47));
	
	/*
	if (GUILayout.Button("Switch structures")) {
		localCamera.GetComponent(CameraControls).MoveToNextStructure();
	}
	
	if (GUILayout.Button("Reset camera")) {
		localCamera.GetComponent(CameraControls).ResetCamera();
	}
	*/
	
	if (GUILayout.Button("Sort Depth first")) {
		fibonacciComponent.SortByDepthFirst();		
	}
	if (GUILayout.Button("Sort Breadth first")) {
		fibonacciComponent.SortByBreadthFirst();
	}
	if (GUILayout.Button("Make current centre")) {
		fibonacciComponent.SortByMakeCentre();
	}
		
	if (fibonacciComponent.IsOpen()) {
		if (GUILayout.Button("Close structure")) {
			fibonacciComponent.CloseStructures();	
		}
	} else {
		if (GUILayout.Button("Open structure")) {
			fibonacciComponent.OpenStructures();	
		}
	}
	
	if (GUILayout.Button("Reset colours")) {
		ColorManager.instance.ResetColors();	
	}	
	
	if (fibonacciComponent.GetWeight() == Weight.None) {
		if (GUILayout.Button("Set word count weight")) {
			fibonacciComponent.SetWeightWordCount();	
		}
	} else if (fibonacciComponent.GetWeight() == Weight.WordCount) {
		if (GUILayout.Button("Remove weight")) {
			fibonacciComponent.SetWeightNone();	
		}
	}
	
	if (GUILayout.Button("Reset structure")) {
		fibonacciComponent.resetStructure();	
	}

	GUILayout.EndScrollView();
	GUI.DragWindow();
	
}

function Awake() {
	// localCamera = GameObject.Find("Main Camera").camera;
	// localCamera.cullingMask = (1 << 8); // start with LayerFibonacci

}

function Start() {
	fibonacciComponent = ApplicationState.instance.modelStructure.GetComponentInChildren(FibonacciStructure);
}