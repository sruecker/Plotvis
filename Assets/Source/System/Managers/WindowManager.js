
static var instance : WindowManager;
static var windowRects : Rect[];
static var windowShow : boolean[];
static private var iDPool : Array;

enum WindowID
{
	TOOLS_ID,
	TAGS_ID,
	TAG_INFORMATION_ID,
	ACTIONS_ID,
	POPUP_INFORMATION_ID,
	SEARCH_ID,
	FLOATING_MENU_ID,
	TOOLBAR_ID,
	FILE_BROWSER_ID,
	MESSAGE_ID,
	TOOLTIP_ID,
	LAST_ID
}

instance = FindObjectOfType(WindowManager);

if (instance == null) {
    Debug.Log ("Could not locate an WindowManager object. You have to have exactly one WindowManager in the play.");
}


function Awake() {
	
	var actionsHeight : int = 185;
	var toolbarHeight : int = 24;
	var searchWindowWidth : int = 700;
	windowRects = new Rect[WindowID.LAST_ID]; 
	
	windowRects[WindowID.TOOLS_ID] = Rect(220,100,100,100);
	windowRects[WindowID.TAGS_ID] = Rect(10,toolbarHeight + 10,200,(Screen.height - actionsHeight - 30) / 2);
	windowRects[WindowID.ACTIONS_ID] = Rect(10, windowRects[WindowID.TAGS_ID].y + windowRects[WindowID.TAGS_ID].height + 10 ,200,actionsHeight);
	windowRects[WindowID.TAG_INFORMATION_ID] = Rect(10,windowRects[WindowID.ACTIONS_ID].y + windowRects[WindowID.ACTIONS_ID].height + 10,200, Screen.height - (windowRects[WindowID.ACTIONS_ID].y + windowRects[WindowID.ACTIONS_ID].height ) - 20 );
	
	windowRects[WindowID.SEARCH_ID] = Rect(Screen.width - searchWindowWidth - 10, toolbarHeight + 10, searchWindowWidth, 0);
	//windowRects[WindowID.SEARCH_ID] = Rect(0,0,0,0);
	
	windowRects[WindowID.FLOATING_MENU_ID] = Rect(0, 0, 0, 0);
	windowRects[WindowID.POPUP_INFORMATION_ID] = Rect(0, 0, 200, 400);
	windowRects[WindowID.TOOLBAR_ID] = Rect(0,0, Screen.width, toolbarHeight);
	//windowRects[WindowID.FILE_BROWSER_ID] = Rect((Screen.width / 2.0) - 175, Screen.height /2 - 250, 350, 500);
	windowRects[WindowID.FILE_BROWSER_ID] = Rect(0,0,0,0);
	windowRects[WindowID.MESSAGE_ID] = Rect(Screen.width / 2 - (400/2), Screen.height / 2 - (200/2), 400, 200);

	windowShow = new boolean[WindowID.LAST_ID];
	for (var i:int =0; i < WindowID.LAST_ID; i++) {
		windowShow[i] = true;
	}
	windowShow[WindowID.MESSAGE_ID] = false;
	windowShow[WindowID.TAGS_ID] = false;
	
	
	iDPool = new Array();
	for (i= WindowID.LAST_ID; i< WindowID.LAST_ID +100; i++) {
		iDPool.Push(i);
	}
	

}

function GetIdFromPool() : int {
	if (iDPool.length > 0) {
		return iDPool.Shift();
	} else {
		return 0;
	}
}

function ReleaseIdToPool(id : int) : int {
	iDPool.Push(id);
	return 0;
}

function OnApplicationQuit() 
{
    instance = null;
}


static function IsMouseOverExpandedRect(area:Rect) {
	var expansion : int = 5;
	var expandedRect : Rect = area;
	expandedRect.x +=expansion;
	expandedRect.y +=expansion;
	expandedRect.width +=expansion;
	expandedRect.height +=expansion;
	return IsVector2OverRect(Input.mousePosition, expandedRect);
}

static function IsMouseOverRect(area:Rect) {
	
	return IsVector2OverRect(Input.mousePosition, area);
}

// static function IsMouseOverGUI() {
// 	return IsVector2OverGUI(Input.mousePosition);
// }

static function IsVector2OverRect(mouseCoords : Vector2, area : Rect) {
	
	if (mouseCoords.x >= area.x &&
		mouseCoords.x <= area.x + area.width &&
		Screen.height - mouseCoords.y >= area.y &&
		Screen.height - mouseCoords.y <= area.y + area.height
		) {
		return true;		
	}
	
	return false;
}

static function IsVector2OverGUI(mouseCoords : Vector2)
{
	// return false;
	for (var i:int =0; i < WindowID.LAST_ID; i++) {
		if (windowShow[i] && WindowManager.IsVector2OverRect(mouseCoords, windowRects[i])) {
			return true;
		}
	}
	return false;
}



