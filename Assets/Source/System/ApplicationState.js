

enum Actions {
	Single,
	Toggle
}

enum PlotvisTools {
	Select,
	Move
}

// layers need to match to layers defined in the editor
enum PlotvisLayer {
	Fibonacci = 8,
	Sequential = 9,
	Wall = 10,
	Architectural = 11,
	Weaving = 12
}

static var instance : ApplicationState;
static var fileStructure : Hashtable;
static var objectToNode : Hashtable;

static var selectedObject : GameObject;
static var indicatedObject : GameObject;
static var modelStructure : GameObject;
static var selectedTool : PlotvisTools = PlotvisTools.Select;
static var defaultFile : String;
static var xsdFile : String;
static var popUpInformation : String;
static var mainCamera : GameObject;
static var currentToolTip : String;
static var tags : String[];
static var attributes : Hashtable;
static var maxBoundsSize : float;
static var currentLayer : PlotvisLayer;

private var fileManager : FileManager;

instance = FindObjectOfType(ApplicationState);

if (instance == null) {
    Debug.Log ("Could not locate an ApplicationState object. You have to have exactly one ApplicationState.");
}

function Awake () {
	
	Application.runInBackground = true;
	Application.backgroundLoadingPriority = ThreadPriority.High;

	
	
	
	fileManager = GameObject.Find("States").GetComponent(FileManager);
	selectedObject = null;
	indicatedObject = null;
	modelStructure = GameObject.Find("Structures");
	//defaultFile = "XML/munro_lgw_v13_modified--storyPointSchema";
	defaultFile = "XML/Hills_v1_temporality--Schema";
	xsdFile = "XML/plotvisSchema2";
	popUpInformation = "";
	currentToolTip = "";
	maxBoundsSize = 10;
	LoadFile(null);
}

function Start () {
	mainCamera = GameObject.Find("Main Camera");
	mainCamera.GetComponent(CameraControls).frameStructure();
}

private function GetSortedTagsAndAttributes() {
	tags = new String[fileStructure['selectedTags'].Keys.Count];
	fileStructure['selectedTags'].Keys.CopyTo(tags, 0);
	System.Array.Sort(tags);
	
	attributes = Hashtable();
	
	for (var tag:String in tags) {
		attributes[tag] = new String[fileStructure["selectedAttributes"][tag].Keys.Count];
		fileStructure["selectedAttributes"][tag].Keys.CopyTo(attributes[tag], 0);
		System.Array.Sort(attributes[tag]);
	}
}

function LoadFile(fileName : String) {
	objectToNode = Hashtable();
	fileStructure = fileManager.Load(fileName);
	NodeManager.instance.BuildStructure();
	GetSortedTagsAndAttributes();
	//NodeManager.instance.ToggleStoryElementsTag();
	ColorManager.instance.ResetColors();
	modelStructure.BroadcastMessage("Build");
}


// Ensure that the instance is destroyed when the game is stopped in the editor.
function OnApplicationQuit() 
{
    instance = null;
}

function getNodeByObject(key:GameObject) {
	if (objectToNode.Contains(key)) {
		return objectToNode[key];
	} else {
		return null;
	}
}
