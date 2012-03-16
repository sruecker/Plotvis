
var toolTipWindowStyle : GUIStyle;
var toolTipTextStyle : GUIStyle;
var toolTipAnnotationTextStyle : GUIStyle;
var toolTipAnnotationStyle : GUIStyle;
var toolTipXOffset : int = 10;
var toolTipYOffset : int = 10;
var delayForTooltip : float = 0.7;

private var toolTipArea : Vector2;
private var elapsedTime : float;
private var starCountTime : float;
private var lastToolTip : String;
private var showToolTip : boolean;
private var startTimer : boolean;
private var text : String;
private var currentTextStyle;

function Awake()
{
	
	showToolTip = false;
	elapsedTime = 0;
	starCountTime = 0;
	startTimer = false;
}


function OnGUI()
{
	

	if (ApplicationState.instance.currentToolTip != "" && ! startTimer) {
		startTimer = true;
		elapsedTime = 0;
		starCountTime = Time.time;
		lastToolTip = ApplicationState.instance.currentToolTip;
	}
	
	if (startTimer) {
		elapsedTime = Time.time - starCountTime;
	}
	
	if (ApplicationState.instance.currentToolTip == "" || 
		ApplicationState.instance.currentToolTip.Contains("_ONMOUSE") ||
		(elapsedTime < delayForTooltip && 
		 lastToolTip != ApplicationState.instance.currentToolTip)) {
	 	startTimer = false;
	 	elapsedTime = 0;
		lastToolTip = ApplicationState.instance.currentToolTip;
	}
	
	if (elapsedTime > delayForTooltip && 
		ApplicationState.instance.currentToolTip != "") {	
		
		var currentGUIStyle : GUIStyle;
		var textToShow : String;
		
		if (ApplicationState.instance.currentToolTip.Contains("ANNOTATION_STYLE")) {
			text = ApplicationState.instance.currentToolTip.Split("_"[0])[3];
			currentGUIStyle = toolTipAnnotationStyle;
			toolTipArea.x = 120;
			toolTipArea.y = 60;
			currentTextStyle = toolTipAnnotationTextStyle;
		} else {
			text = ApplicationState.instance.currentToolTip;
			currentGUIStyle = toolTipWindowStyle;
			toolTipArea = toolTipTextStyle.CalcSize(GUIContent(ApplicationState.instance.currentToolTip));
			toolTipArea.x += 10;
			toolTipArea.y += 5;
			currentTextStyle = toolTipTextStyle;
		
		}
		
		var winRect : Rect = WindowManager.instance.windowRects[WindowID.TOOLTIP_ID];
		
		winRect.x = Input.mousePosition.x + toolTipXOffset;
		winRect.y = Screen.height - Input.mousePosition.y + toolTipYOffset;
		winRect.width = toolTipArea.x;
		winRect.height = toolTipArea.y;
		
		if (Screen.width < winRect.x + winRect.width) {
			winRect.x = Screen.width - winRect.width;
		}
		
		//if (Screen.height)
		
		
		winRect = 
			GUI.Window(WindowID.TOOLTIP_ID,
					   winRect,
					   CreateToolTipWindow,
					   "",
					   currentGUIStyle);
		GUI.BringWindowToFront(WindowID.TOOLTIP_ID);

	}
	
	
}

function CreateToolTipWindow(windowId : int) {

	GUI.Label(Rect(5, 0,toolTipArea.x, toolTipArea.y), text, currentTextStyle);
}