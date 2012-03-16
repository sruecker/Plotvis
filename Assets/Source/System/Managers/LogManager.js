
static var instance : LogManager;

static var messageText : String;
static var messageTitle : String;

instance = FindObjectOfType(LogManager);

if (instance == null) {
    Debug.Log ("Could not locate an ApplicationState object. You have to have exactly one LogManager.");
}

function Awake() {
	messageText = "";
	// WindowManager.instance.windowShow[WindowID.MESSAGE_ID] = false;
	messageTitle = "";
}

function DisplayError(message : String) {
	DisplayMessage(message);
	messageTitle = "Error";
}

function DisplayMessage(message : String) {
	messageText = message;
	WindowManager.instance.windowShow[WindowID.MESSAGE_ID] = true;
	messageTitle = "";
}