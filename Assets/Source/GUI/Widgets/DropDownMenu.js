

// Cant be done this way because it requires a method to set the window's 
// content which will be the buttons to select from.

// 
// static function Draw(rect : Rect, entries : GUIContent[], selectedItem : int) : int
// {
// 	
// 	var windowRect : Rect = Rect(0,0,0,0);
// 	
// 	if (GUI.Button(rect, entries[selectedItem])) {
// 		// create drop down inside a window a bit further down
// 		
// 		var windowId : int = windowManager.GetFreeWindowId();
// 		// set menu position
// 		windowRect.x = position.x;
// 		// lower it
// 		windowRect.y = position.y + 10;
// 		// set width
// 		windowRect.width = 100;
// 		// set height
// 		windowRect.height = 100;
// 		
// 		
// 		
// 	}
// 	
// }





// static function Draw(position : Rect, 
// 					 parameters : Array, 
// 					 entries : GUIContent[],
// 					 dropTexture : Texture2D,
// 					 func : Function) : int {
// 	
// 	if(GUI.Button(position, GUIContent(entries[parameters[0]].text, dropTexture) )) {
// 		parameters[1] = ! parameters[1];
// 	}
// 	
// 	if (parameters[1]) { // show list
// 		
// 		
// 		var newHeight : int = GUI.skin.GetStyle("button").CalcHeight(entries[0], 1.0);
//         WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID] = Rect(position.x, 
// 																			   position.y, 
// 																			   position.width,
// 								//											   50);
// 								   											   newHeight * entries.Length);
// 		var thisF : Function = func as Function;
// 		//thisF();
// 		
// 		WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID] = 
// 			GUI.Window (WindowID.FLOATING_MENU_ID, 
// 						WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID], 
// 						om, 
// 						"");
// 		
// 		// var listRect : Rect = WindowManager.instance.windowRects[WindowID.FLOATING_MENU_ID];
// 		// 		GUI.Box(listRect, "");	
// 		// 		//GUI.Button(listRect, "isidro");
// 		// 
// 		// 		parameters[0] = GUI.SelectionGrid(listRect, parameters[0], entries, 1);
// 
// 	} 
// 	
// }
// 
// static function om(windowId : int ) {
// 	GUI.Button(Rect(0,0,100,30), "otro");
// }