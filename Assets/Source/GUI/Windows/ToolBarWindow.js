
import ApplicationState;
import WindowManager;

class ToolBarWindow extends ToolTipSender {


	var skin : GUISkin;
	var menuBarStyle : GUIStyle;
	var menuWindowStyle : GUIStyle;
	var menuItemStyle : GUIStyle;
	var buttonStyle : GUIStyle;
	var buttonStyleOpened : GUIStyle;
	var buttonIconStyle : GUIStyle;
	var selectTextureDark : Texture2D;
	var rotateTextureDark : Texture2D;
	var selectTextureLight : Texture2D;
	var rotateTextureLight: Texture2D;
	var switchStructureRightDark : Texture2D;
	var switchStructureRightLight : Texture2D;
	var switchStructureLeftDark : Texture2D;
	var switchStructureLeftLight : Texture2D;
	var resetCamera : Texture2D;

	private var yPadding = -1;
	private var xPadding = 10;
	private var openRect;
	private var fileBrowser : CTreeView;
	private var buttonSize : int = 16;
	private var xmlValidator : XMLValidator;
	//private var menuInformation : Hashtable;
	private var menuButtonsContent : Array;
	private var menuButtonsIndex : Hashtable;
	private var minMenuWidth : int = 120;
	private var cameraControls : CameraControls;
	private var fibonacciComponent : FibonacciStructure;
	
	function Awake() {
		fileBrowser = gameObject.GetComponentInChildren(CTreeView);
		openRect = Rect(xPadding, yPadding, 50, 25);
		xmlValidator = new XMLValidator();
		populateMenuButtonsContent();
		cameraControls = GameObject.Find("Main Camera").camera.GetComponent(CameraControls);
	}
	
	function populateMenuButtonsContent() {
		menuButtonsContent = new Array();
		menuButtonsIndex = new Hashtable();
		
		menuButtonsIndex['file'] = menuButtonsContent.length;
		var fileButton:Hashtable = new Hashtable();
		fileButton['name'] = "File";
		fileButton['rect'] = Rect();
		fileButton['menuRect'] = Rect();
		fileButton['id'] = 0;
		fileButton['func'] = FileButtonPressed;
		fileButton['windowFunc'] = GUI.WindowFunction(CreateFileWindow);
		menuButtonsContent.Push(fileButton);
		
		menuButtonsIndex['views'] = menuButtonsContent.length;
		var viewsButton:Hashtable = new Hashtable();
		viewsButton['name'] = "Views";
		viewsButton['rect'] = Rect();
		viewsButton['menuRect'] = Rect();
		viewsButton['id'] = 0;
		viewsButton['func'] = ViewsButtonPressed;
		viewsButton['windowFunc'] = GUI.WindowFunction(CreateViewsWindow);
		menuButtonsContent.Push(viewsButton);
		
		menuButtonsIndex['actions'] = menuButtonsContent.length;
		var actionButton:Hashtable = new Hashtable();
		actionButton['name'] = "Actions";
		actionButton['rect'] = Rect();
		actionButton['menuRect'] = Rect();
		actionButton['id'] = 0;
		actionButton['func'] = ActionsButtonPressed;
		actionButton['windowFunc'] = GUI.WindowFunction(CreateActionsWindow);
		menuButtonsContent.Push(actionButton);
		
		
	}
	
	function FileOpen() {
		if (!fileBrowser.visible) {
			fileBrowser.winRect = Rect((Screen.width / 2.0) - 175, Screen.height /2 - 250, 350, 500);
			fileBrowser.visible = true;
		}
	}
	
	function CreateFileWindow(windowID : int) {
		var fileMenuItemsFunc : Array = [
			["Open", FileOpen]
		];
		
		CreateMenu('file', fileMenuItemsFunc, windowID);
	}
	
	private function SetMenuWindowIndex(i:int) {
		menuButtonsContent[i]['menuRect'] = Rect(menuButtonsContent[i]['rect'].x,
		 										 menuButtonsContent[i]['rect'].y + 24, // tool bar height
												 100,100);
												
		menuButtonsContent[i]['id'] = WindowManager.instance.GetIdFromPool();
	}
	
	private function FileButtonPressed() {
		var i:int = menuButtonsIndex['file'];
		SetMenuWindowIndex(i);
		// find correct size of menuRect
		
	}
	
	private function ViewsButtonPressed() {
		var i:int = menuButtonsIndex['views'];
		
		// find correct size of menuRect
		SetMenuWindowIndex(i);
		
	}
	
	private function ActionsButtonPressed() {
		var i:int = menuButtonsIndex['actions'];
		SetMenuWindowIndex(i);
	}
	
	private function  ReleaseId(key:String) {
		var i : int = menuButtonsIndex[key];
		menuButtonsContent[i]['id'] = 
			WindowManager.instance.ReleaseIdToPool(menuButtonsContent[i]['id']);
	}
	
	private function ViewStoryElements() {
		NodeManager.instance.ToggleStoryElementsTag();
	}
	
	private function ViewCharacters() {
		NodeManager.instance.ToggleCharacterTag();	
	}
	
	private function ViewObjects() {
		NodeManager.instance.ToggleObjectTag();
	}
	
	private function ViewAllElements() {
		NodeManager.instance.ToggleAllTag();
	}
	
	private function ViewCustom() {
		WindowManager.instance.windowShow[WindowID.TAGS_ID] = 
			! WindowManager.instance.windowShow[WindowID.TAGS_ID];		
	}
	
	function CreateMenu(key : String, namesAndFunctions : Array, windowID : int) {
		var menuSize : Vector2 = Vector2();
		var size : Vector2;
		GUILayout.BeginVertical();
		
		var thisContent : GUIContent;
		
		for (var entry : Array in namesAndFunctions) {
			thisContent = GUIContent(entry[0] as String);
			size = menuItemStyle.CalcSize(thisContent);
			menuSize.y += size.y;
			if (menuSize.x < size.x) menuSize.x = size.x;
			if (GUILayout.Button(thisContent, menuItemStyle)) {
				entry[1]();
				ReleaseId(key);
			}
		}
		//menuSize.y += size.y + 4;
		
		var i : int = menuButtonsIndex[key];
		if (menuSize.x < minMenuWidth)  menuSize.x = minMenuWidth;
		menuButtonsContent[i]['menuRect'].width = menuSize.x;
		menuButtonsContent[i]['menuRect'].height = menuSize.y;
		GUILayout.EndVertical();
	
		GUI.BringWindowToFront(windowID);
		
		// check if we need to close the menu
				
		if (! (WindowManager.instance.IsMouseOverExpandedRect(menuButtonsContent[i]['rect']) || 
			   WindowManager.instance.IsMouseOverExpandedRect(menuButtonsContent[i]['menuRect']))) {
				ReleaseId(key);
		}
	}		
	
	function CreateViewsWindow(windowID : int) {
		
		var viewsMenuItemsFunc : Array = [
			["Story Elements", ViewStoryElements],
			["Characters", ViewCharacters],
			["Objects", ViewObjects],
			["All Elements", ViewAllElements],
			["Customize", ViewCustom]
		];
				
		CreateMenu('views', viewsMenuItemsFunc, windowID);
		
	}
	// needs to be a function for yield to work properly
	private function ActionsFibonacciSetWeightWord() {
		fibonacciComponent.SetWeightWordCount();
	}
	
	// needs to be a function for yield to work properly
	private function ActionsFibonacciSetWeightNone() {
		fibonacciComponent.SetWeightNone();
	}
	
	
	function CreateActionsWindow(WindowID : int) {

		var actionsMenuItemsFunc : Array = [];

		if (ApplicationState.instance.currentLayer == PlotvisLayer.Fibonacci) {
			actionsMenuItemsFunc.push(["Sort by depth first", fibonacciComponent.SortByDepthFirst]);
			actionsMenuItemsFunc.push(["Sort by breadth first", fibonacciComponent.SortByBreadthFirst]);
			actionsMenuItemsFunc.push(["Make current centre", fibonacciComponent.SortByMakeCentre]);
			
			
			if (fibonacciComponent.IsOpen()) {
				actionsMenuItemsFunc.push(["Close structure", fibonacciComponent.CloseStructures]);				
			} else {
				actionsMenuItemsFunc.push(["Open structure", fibonacciComponent.OpenStructures]);			
			}					
			
			if (fibonacciComponent.GetWeight() == Weight.None) {
				actionsMenuItemsFunc.push(["Set word count weight", ActionsFibonacciSetWeightWord]);
			} else if (fibonacciComponent.GetWeight() == Weight.WordCount) {
				actionsMenuItemsFunc.push(["Remove weight", ActionsFibonacciSetWeightNone]);			
			}
			
			actionsMenuItemsFunc.push(["Reset structure", fibonacciComponent.resetStructure]); 
		}
		
		// common items
		/*
		actionsMenuItemsFunc.push(["Reset colours", ColorManager.instance.ResetColors]);
		*/
		CreateMenu('actions', actionsMenuItemsFunc, WindowID);
	}
	
	function Start() {
		fileBrowser.location = "./";
		fileBrowser.winId = WindowID.FILE_BROWSER_ID;
		fileBrowser.winRect = WindowManager.instance.windowRects[WindowID.FILE_BROWSER_ID];
		fileBrowser.visible = false;
		
		fibonacciComponent = ApplicationState.instance.modelStructure.GetComponentInChildren(FibonacciStructure);
		
	}
	
	function OnGUI() {
	
		GUI.skin = skin;
	
		WindowManager.instance.windowRects[WindowID.TOOLBAR_ID] = 
			GUI.Window (WindowID.TOOLBAR_ID, 
						WindowManager.instance.windowRects[WindowID.TOOLBAR_ID], 
						CreateWindow, 
						"",
						menuBarStyle);
		// for window handling purposes
		WindowManager.instance.windowRects[WindowID.FILE_BROWSER_ID] = fileBrowser.winRect;
		for (var key:Hashtable in menuButtonsContent) {
			var currentWindowFunc : GUI.WindowFunction = key['windowFunc'] as GUI.WindowFunction;
		
			if (key['id'] != 0) {
				key['menuRect'] = GUI.Window(key['id'], 
											 key['menuRect'], 
											 key['windowFunc'],
											 "",	
											 menuWindowStyle);
			}
		}
	}
	
	
	function CreateWindow(windowId : int) {
		addMenuButtons();
		addIconButtons();
		UpdateToolTip();
	}
	
	function addMenuButtons() {
		// open button
		
		var currentPos : Vector2 = Vector2(10, 0);
		var currentSize : Vector2 = Vector2();
		
		for (var i:int=0; i<menuButtonsContent.length; i++) {
			
			var currentStyle : GUIStyle = menuButtonsContent[i]['id'] == 0 ? buttonStyle : buttonStyleOpened;
			
			var content:GUIContent = GUIContent(menuButtonsContent[i]['name'] as String);
			currentSize = currentStyle.CalcSize(content);
			var currentRect : Rect = Rect(currentPos.x, currentPos.y, currentSize.x, currentSize.y);
			if (GUI.Button(currentRect,
						   content,
						   currentStyle)) {
					menuButtonsContent[i]['rect'] = currentRect; 
					menuButtonsContent[i]['func']();
			}
			currentPos.x += currentSize.x;
		}
	}
	
	function addIconButtons() {
			var currentSelectTexture : Texture2D = selectTextureLight; 
			var currentRotateTexture : Texture2D = rotateTextureLight;
	
			switch (ApplicationState.instance.selectedTool) {
				case PlotvisTools.Select: 
					currentSelectTexture = selectTextureDark;
					break;
				case PlotvisTools.Move:
					currentRotateTexture = rotateTextureDark;
					break;
			}
	
			// reset camera
			if (GUI.Button(Rect(Screen.width - 90, 4, buttonSize, buttonSize), 
						   GUIContent(resetCamera, "Reset camera" ), buttonIconStyle)) {
				cameraControls.ResetCamera();
			}
	
			// switch structure buttons
			if (GUI.Button(Rect(Screen.width - 70, 4, buttonSize, buttonSize), 
						   GUIContent(switchStructureLeftDark, "Switch structure left" ), buttonIconStyle)) {
				cameraControls.MoveToPrevStructure();
			}
	
			if (GUI.Button(Rect(Screen.width - 55, 4, buttonSize, buttonSize), 
						   GUIContent(switchStructureRightDark, "Switch structure right" ), buttonIconStyle)) {
				cameraControls.MoveToNextStructure();
			}
	
			// radio function buttons
	
			if (GUI.Button(Rect(Screen.width - 38, 4, buttonSize, buttonSize), 
						   GUIContent(currentSelectTexture, "Select item" ), buttonIconStyle)) {
							ApplicationState.instance.selectedTool = PlotvisTools.Select;
			}
	
			if (GUI.Button(Rect(Screen.width - 20, 4, buttonSize, buttonSize), 
						   GUIContent(currentRotateTexture, "Free rotate" ), buttonIconStyle)) {
				ApplicationState.instance.selectedTool = PlotvisTools.Move;	
			}
	}
	
	function CloseBrowser() {
		fileBrowser.visible = false;
		fileBrowser.winRect = Rect(0,0,0,0);
	}
	
	function OpenFile(filename : String) {
	
		var xsdData : TextAsset = Resources.Load(ApplicationState.instance.xsdFile, TextAsset);
		var xsdString : String = xsdData.text;	
		var errorLog : String = "";
	
		var valid : boolean = xmlValidator.ValidateXml(filename, xsdString, errorLog);
		if (valid) {
			ApplicationState.instance.LoadFile(filename);
		} else {
			LogManager.instance.DisplayError(errorLog);
			//LogManager.instance.messageText = errorLog;
			//LogManager.instance.showMessage = true;
		}
		CloseBrowser();
	
	
	
	}
}