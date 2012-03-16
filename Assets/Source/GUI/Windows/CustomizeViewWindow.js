
import ApplicationState;
import WindowManager;

var skin : GUISkin;

var acceptTexture : Texture2D;
var cancelTexture : Texture2D;
var testStyle : GUIStyle;

private var scrollPosition : Vector2;

function OnGUI() {
	GUI.skin = skin;
	if (WindowManager.instance.windowShow[WindowID.TAGS_ID]) {
		WindowManager.instance.windowRects[WindowID.TAGS_ID] = 
			GUI.Window (WindowID.TAGS_ID, 
						WindowManager.instance.windowRects[WindowID.TAGS_ID], 
						CreateWindow, 
						"Customize view");
	}
}

function CreateWindow(windowId : int) {
	
	var windowRect : Rect = WindowManager.instance.windowRects[WindowID.TAGS_ID];

	var attributes : Hashtable = ApplicationState.instance.fileStructure["selectedAttributes"];


	scrollPosition = GUILayout.BeginScrollView (
	       scrollPosition, GUILayout.Width(windowRect.width - 33), 
			GUILayout.Height(windowRect.height - 47));
	
	GUILayout.Label("Tags : ");
	
	var currentTexture : Texture2D;
	
	// var tagKeys : String[] = new String[attributes.Keys.Count];
	// attributes.Keys.CopyTo(tagKeys, 0);
	// System.Array.Sort(tagKeys);
	
	for (var tag : String in ApplicationState.instance.tags) {
		
		currentTexture = NodeManager.instance.IsTagSelected(tag) ? acceptTexture : cancelTexture;
			
		if (GUILayout.Button(GUIContent(tag, currentTexture))) {
			//ApplicationState.instance.ToggleSelectedTag(tag);
			//ApplicationState.instance.modelStructure.BroadcastMessage("ToggleSelectedTag", tag);
			NodeManager.instance.ToggleTag(tag);
		}
	
	}
	
	
	GUILayout.Label("Tag attributes : ");
	// XXX changing tag state creates a Unity error
	
	//var tagKeys : String[] = new String[attributes.Keys.Count];
	//attributes.Keys.CopyTo(tagKeys, 0);
	
	for (var tag : String in ApplicationState.instance.tags) {
		if (NodeManager.instance.IsTagSelected(tag)){
			if (attributes[tag].Count) {
				GUILayout.Label(tag + ": ");
				// var attributeKeys : String[] = new String[attributes[tag].Keys.Count];
				// 			
				// 			attributes[tag].Keys.CopyTo(attributeKeys, 0);
				// 			System.Array.Sort(attributeKeys);
				// 			
				for (var attribute : String in ApplicationState.instance.attributes[tag]) {
				
					currentTexture = NodeManager.instance.GetSelectedAttribute(tag, attribute) ? acceptTexture : cancelTexture;
				
					if (GUILayout.Button(GUIContent(attribute, currentTexture))) {
						NodeManager.instance.ToggleSelectedAttribute(tag, attribute);
						ColorManager.instance.ResetColors();
					}
				}
			
			}
		}
	}
		
	GUILayout.Label("Tag colours : ");
	
	for (var tag : String in attributes.Keys) {
		// show colors
		if (NodeManager.instance.IsTagSelected(tag)){
			GUILayout.Label(tag + ": ");
			var colorCount : int = 0;
			GUILayout.BeginHorizontal();
			for (var currentColor : Hashtable in ColorManager.instance.colorsByTag[tag]) {
				testStyle.normal.background = currentColor["texture"];
				GUILayout.Label("", testStyle);
				colorCount++;
			
				if(colorCount == 5) {
					colorCount = 0;
					GUILayout.EndHorizontal();
					GUILayout.BeginHorizontal();
				}
			}
			GUILayout.EndHorizontal();
		}
	}
	
	GUILayout.EndScrollView ();

	GUI.DragWindow();
	
}


