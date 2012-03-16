
import ApplicationState;
import WindowManager;
import QueryManager;

var skin : GUISkin;
var addTexture : Texture2D;
var removeTexture : Texture2D;
var menuStyle : GUIStyle;
var dropTexture : Texture2D;
var selectionGridStyle : GUIStyle;

private var logicalBinaryOpName : String[];
private var logicalUnaryOpName : String[];
private var searchTypeName : String[];
private var searchByName : String[];


private var currentMenu : String;
private var currentQuery : int;
private var currentOpName : String[];

private var previousSelectedNode : int;

private var showingMenuRect : Rect;
private var showingButtonRect : Rect;
private var showing : Array;

private var buttonHeight : int     = 20;
private var buttonYPadding : int   = 2;
private var buttonXPadding : int   = 2;
private var windowPadding : int    = 20;

private var buttonWidths : Hashtable;
private var subMenuWidths : Hashtable;
private var subMenuHeights : Hashtable;

private var maxSubMenuWidth : int  = 200;
private var maxSubMenuHeight : int = 300;
private var rectZero : Rect        = Rect(0,0,0,0);
private var scrollPosition         = Vector2.zero;
//private var fibonacciComponent : FibonacciStructure;



function Awake() {
	//queries                                = Array();
		
	logicalBinaryOpName                    = new String[3];	
	logicalUnaryOpName					   = new String[2];
	searchTypeName                         = new String[3];
	searchByName                           = new String[2];
	buttonWidths						   = Hashtable();
	subMenuWidths						   = Hashtable();
	subMenuHeights						   = Hashtable();
		
	logicalBinaryOpName[LogicalOp.Or]      = "Or";
	logicalBinaryOpName[LogicalOp.And]     = "And";
	logicalBinaryOpName[LogicalOp.Xor]     = "Xor";
	
	logicalUnaryOpName[LogicalUnaryOp.Yes] = "Does";
	logicalUnaryOpName[LogicalUnaryOp.Not] = "Doesn't";
		
	searchTypeName[SearchType.Contains]    = "Contain";
	//searchTypeName[SearchType.NotContains] = "Does not contain";
	searchTypeName[SearchType.Exact]       = "Match";
	
	searchByName[SearchBy.Value]           = "Value";
	searchByName[SearchBy.Attribute]       = "Attribute";
	
	buttonWidths["Logical"]				   = 50;
	buttonWidths["LogicalUnary"]		   = 60;
	buttonWidths["Node"]				   = 100;
	buttonWidths["SearchBy"]			   = 70;
	buttonWidths["Attribute"]			   = 100;
	buttonWidths["SearchType"]			   = 120;
	buttonWidths["Value"]				   = 120;
	
	previousSelectedNode 				   = 0;
}

function Start() {
	// move to ApplicationState ?
	showingButtonRect = showingMenuRect = rectZero; 
	QueryManager.instance.PushQuery();
	showing = QueryManager.instance.queries[0]["Logical"];

}

// XXX Ugly code. Need to move the [1] from the query manager to this class

function Update()
{
	if ( showing[1] &&
		 ! (WindowManager.IsMouseOverRect(showingButtonRect) || 
		 WindowManager.IsMouseOverRect(showingMenuRect))) {
		showingButtonRect = showingMenuRect = rectZero; 
		showing[1] = false;
	} 
}



function OnGUI() {
	GUI.skin = skin;
	
	WindowManager.instance.windowRects[WindowID.SEARCH_ID] = 
		GUI.Window (WindowID.SEARCH_ID, 
					WindowManager.instance.windowRects[WindowID.SEARCH_ID], 
					CreateWindow, 
					"Search");
	
}


function CreateMenu(rect : Rect, currentName : String[]) {

	var newHeight : int = GUI.skin.GetStyle("button").CalcHeight(GUIContent(currentName[0]), 1.0);
	
	WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID] = Rect(rect.x, 
														   	 rect.y + buttonHeight, 
														     WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID].width, 
			   											     newHeight * currentName.Length);

	
	WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID] = 
		GUI.Window (WindowID.FLOATING_MENU_ID, 
					WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID], 
					CreateMenuWindow, 
					"",
					menuStyle);
					
	showingMenuRect = WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID];
	
	GUI.BringWindowToFront(WindowID.FLOATING_MENU_ID);  
	
}

function CreateMenuWindow(windowId : int) {
	
	var currentRect : Rect = Rect(0,
								  0,
								  WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID].width, 
								  WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID].height);
	
	var somethingPressed : boolean = false;
	GUI.BeginGroup(currentRect);
	var currentWidth = 0;
	
	for (var i : int = 0; i < currentOpName.length; i++) {
		currentWidth = GUI.skin.GetStyle("button").CalcSize(GUIContent(currentOpName[i])).x;
		//Debug.Log(currentWidth);
		if (currentWidth <= maxSubMenuWidth && currentWidth > currentRect.width ) {
			WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID].width = currentWidth;
			//Debug.Log("changing width to " + currentWidth);
		}
	 	if (GUILayout.Button(currentOpName[i], selectionGridStyle)) {
			QueryManager.instance.queries[currentQuery][currentMenu][0] = i;
			pressed = true;
		}
	}
	GUI.EndGroup();
	
	if (pressed) {
		QueryManager.instance.queries[currentQuery][currentMenu][1] = false;
	}
	
}

private function createMenuButton(rect : Rect, 
								  currentName : String[],
								  queryName : String,
								  queryIndex : int) {
	
	var baseRect : Rect = WindowManager.instance.windowRects[WindowID.SEARCH_ID];
	
	if (GUI.Button(rect, currentName[QueryManager.instance.queries[queryIndex][queryName][0]])) {
		QueryManager.instance.queries[queryIndex][queryName][1] = ! QueryManager.instance.queries[queryIndex][queryName][1];
	}
	
	if (QueryManager.instance.queries[queryIndex][queryName][1]) {
		currentMenu = queryName;
		currentQuery = queryIndex;
		currentOpName = currentName;
		
		rect.x += baseRect.x;
		rect.y += baseRect.y;
		
		CreateMenu(rect, currentName);
		showingButtonRect = rect;
		showing = QueryManager.instance.queries[queryIndex][queryName];
	} 
}

function CreateWindow(windowId : int) {
	
	var baseRect : Rect     = WindowManager.instance.windowRects[windowId];
	var currentXPos : int   = 0;
	var currentHeight : int = 10;	

	for (var i:int = 0; i < QueryManager.instance.queries.length; i++) {
		currentXPos = windowPadding;
		currentHeight += (buttonHeight + buttonYPadding);
		
		// LogicalAndOr if not zero
		if (i != 0) {
			createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["Logical"],buttonHeight), logicalBinaryOpName, "Logical", i);
		}
		currentXPos += buttonWidths["Logical"] + buttonXPadding;
		
	
				
		// Node
		createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["Node"],buttonHeight), QueryManager.instance.nodeName, "Node", i);
		
		if (previousSelectedNode != QueryManager.instance.queries[i]["Node"][0]) {
			previousSelectedNode = QueryManager.instance.queries[i]["Node"][0];
			QueryManager.instance.queries[i]["Attribute"][0] = 0; // "Any"
		}
		currentXPos += buttonWidths["Node"] + buttonXPadding;
		
		
		// SearchBy
		// if the node has attributes
		var currentNodeName : String = QueryManager.instance.nodeName[QueryManager.instance.queries[i]["Node"][0]];
		if (QueryManager.instance.attributeName[currentNodeName].length > 1) {
			createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["SearchBy"],buttonHeight), searchByName, "SearchBy", i);
			currentXPos += buttonWidths["SearchBy"] + buttonXPadding;
			
			// Attribute
			var temp : SearchBy = QueryManager.instance.queries[i]["SearchBy"][0];
			if ( temp == SearchBy.Attribute) {
				createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["Attribute"],buttonHeight), QueryManager.instance.attributeName[currentNodeName], "Attribute", i);
			}
		} else {
			//label value
			GUI.Label(Rect(currentXPos,currentHeight,buttonWidths["SearchBy"],buttonHeight), searchByName[SearchBy.Value]);
			currentXPos += buttonWidths["SearchBy"] + buttonXPadding;
			
		}
		currentXPos += buttonWidths["Attribute"] + buttonXPadding;
		
		// logical unary
		createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["LogicalUnary"],buttonHeight), logicalUnaryOpName, "LogicalUnary", i);
		currentXPos += buttonWidths["LogicalUnary"] + buttonXPadding;
					
		// SearchType
		createMenuButton(Rect(currentXPos,currentHeight,buttonWidths["SearchType"],buttonHeight), searchTypeName, "SearchType", i);
		currentXPos += buttonWidths["SearchType"] + buttonXPadding;
		
		
		// Value
		QueryManager.instance.queries[i]["Value"] = GUI.TextField(Rect(currentXPos,currentHeight,buttonWidths["Value"],buttonHeight), QueryManager.instance.queries[i]["Value"]); 
		currentXPos += buttonWidths["Value"] + buttonXPadding;

		// Ignorecase
		//QueryManager.instance.queries[i]["IgnoreCase"] = 
		//	GUI.Toggle(Rect(currentXPos, currentHeight, 100, 30), QueryManager.instance.queries[i]["IgnoreCase"], "Ignore case");
		
		currentXPos += 10;
		
		if(GUI.Button(Rect(currentXPos, currentHeight, buttonHeight, buttonHeight), GUIContent(addTexture))) {	
			if (i < QueryManager.instance.queries.length-1) {
				QueryManager.instance.AddQueryAt(i);
							
			} else {
				QueryManager.instance.PushQuery();	
			}
		}
		currentXPos += buttonHeight + buttonXPadding;
		
		if (i != 0) {
			if(GUI.Button(Rect(currentXPos, currentHeight, buttonHeight, buttonHeight), GUIContent(removeTexture))) {
				QueryManager.instance.RemoveQueryAt(i);
			}
		}
		currentXPos += buttonHeight; // last one
		
	}
	
	var newWidth : float = currentXPos + windowPadding;
	
	WindowManager.instance.windowRects[WindowID.SEARCH_ID].height = QueryManager.instance.queries.length * (buttonHeight + buttonYPadding) + 75;
	WindowManager.instance.windowRects[WindowID.SEARCH_ID].width  = newWidth;
	
	GUI.BeginGroup(Rect(newWidth - 435, currentHeight - 5, 450, 50 ));
	GUILayout.BeginHorizontal();	
	GUILayout.FlexibleSpace();
	if (GUILayout.Button("Reset")) {
		QueryManager.instance.ResetSearch();
	}
	if (GUILayout.Button("Search")) {
		QueryManager.instance.PerformSearch();
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUI.EndGroup();
	
	// XXX temp testing resizing, should change to exact meassure

	GUI.DragWindow();
	
}



