


var backdrop : Texture2D;
var splashTime : int = 3;
var fadeTime : float = 0.5;
private var backgroundStyle : GUIStyle;

function Awake()
{
backgroundStyle = new GUIStyle();
backgroundStyle.normal.background = backdrop;
}

function OnGUI () 
{
	
	//Screen.showCursor = false;

	
	GUI.Label( Rect( Screen.width /2 - backdrop.width / 2,  	// x
					 Screen.height / 2 - backdrop.height / 2, 	// y
					 backdrop.width, 						// width
					 backdrop.height), 							// height
					 "", backgroundStyle);
	
	if (Time.time > splashTime - fadeTime) {
		CameraFade.FadeOutMain();
	}
	
	if (Time.time > splashTime) {
		Application.LoadLevel(1);
	}
	
}


