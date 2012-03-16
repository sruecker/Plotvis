
static var instance : ColorManager;

public var baseMaterial : Material;
public var baseTexture : Texture2D;

public var colors : Hashtable;
public var colorsByTag : Hashtable;
public var colorsByReg : Hashtable;
private var addedToColorsByTag : Hashtable;
private var structures : GameObject;

function Awake() {
	
	instance = FindObjectOfType(ColorManager);

	if (instance == null) {
	    Debug.Log ("Could not locate an ColorManager object. You have to have exactly one ColorManager in the play.");
	}
	
	colors = Hashtable();
	colorsByTag = Hashtable();
	colorsByReg = Hashtable();
	addedToColorsByTag = Hashtable();
	structures = GameObject.Find("Structures");
	
}


// Ensure that the instance is destroyed when the game is stopped in the editor.
function OnApplicationQuit() 
{
    instance = null;
}

function createMaterial(key : String, color : Color) {
	
	colors[key] = Hashtable();
	// material
	colors[key]["material"] = Material(baseMaterial);
	colors[key]["material"].color = color;
	
	// texture
	var tex : Texture2D = Instantiate(baseTexture);
	
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {
			var newColor : Color = tex.GetPixel(i,j);
			
			if(newColor.a > 0) {
				newColor *= color;
			}
			tex.SetPixel(i, j, newColor);
		}
	}
	tex.Apply();
	
	colors[key]["texture"] = tex;
	
	// color
	colors[key]["color"] = color;
}

function GetNodeColorName(node : Hashtable) : String {
	var currentName = node["name"] + "!";
	
	var structure : Hashtable = ApplicationState.instance.fileStructure;
	if (! structure["selectedAttributes"].Contains(node['name'])) {
		Debug.Log(node['name']);
	}
	for (var attribute : String in structure["selectedAttributes"][node["name"]].Keys) {
		if (structure["selectedAttributes"][node["name"]][attribute]) {

			if (node["attributes"].Contains(attribute)) {
				currentName += "-" + node["attributes"][attribute];
			// 				currentName += "-";
			// 				var keywords : Array = node["attributes"][attribute].Split(","[0]);
			// 				for (var currentKeyword : String in keywords) {
			// 					currentKeyword.Trim();
			// 				}
			// 				keywords.sort();
			// 				for (var currentKeyword : String in keywords) {
			// 					currentName += currentKeyword + ",";
			// 				}
				
			} else {
				currentName += "-NiLL*7&";
			}
		}
	}
	
	return currentName;
}

// function ApplyColors(objectArray : GameObject[]) {
// 	for (var currentObject in objectArray) {
// 		var node = ApplicationState.instance.objectToNode[currentObject];
// 		var currentName : String = ColorManager.instance.GetNodeColorName(node);
// 		currentObject.GetComponent(MaterialBehaviour).setMaterial(colors[currentName]["material"]);
// 	}
// }

function ResetColors() {
	
	colors.Clear();
	colorsByTag.Clear();
	colorsByReg.Clear();
	addedToColorsByTag.Clear();
	Random.seed = 4865; // magic number for colour generation
	
	for (var node : Hashtable in  NodeManager.instance.depthFirstNodes) {

		// var node = ApplicationState.instance.objectToNode[currentObject];
		var currentName : String = ColorManager.instance.GetNodeColorName(node);

		if (!colorsByTag.Contains(node["name"])) {
			colorsByTag[node["name"]] = Array();
		}

		if (! colors.Contains(currentName)) {
		 	createMaterial(currentName, Color(Random.value, 
											  Random.value, 
											  Random.value));
		}

		if (!addedToColorsByTag.Contains(currentName)) {
			addedToColorsByTag[currentName] = true;
			colorsByTag[node["name"]].Push(ColorManager.instance.colors[currentName]);
		}
	
	
		if (node["attributes"]["reg"]) {
			var charactersString : String = node["attributes"]["reg"];
			var charactersSplit : Array = charactersString.Split(","[0]);
			for (var thisCharacter : String in charactersSplit) {
				if (!colorsByReg.Contains(thisCharacter)) {
					colorsByReg[thisCharacter] = Color(Random.value, 
												   	   Random.value, 
													   Random.value);
				}
			}
			
		}
		
		// if (node["attributes"]["reg"] && !colorsByReg.Contains(node["attributes"]["reg"])) {
		// 		colorsByReg[node["attributes"]["reg"]] = Color(Random.value, 
		// 										  			   Random.value, 
		// 										  			   Random.value);
		// 	}
		
	}
	structures.BroadcastMessage("ApplyColors");
}

// 
// function setShader (newShader : Shader) {
// objectMaterial.CopyPropertiesFromMaterial(gameObject.GetComponentInChildren(MeshRenderer).material);
// objectMaterial.shader = newShader;
// 	applyMaterial();
// }
// 
// function setBodyColor( newColor : Color ) 
// {
// 	
// 	// This should change from model to model
// objectMaterial.CopyPropertiesFromMaterial(gameObject.GetComponentInChildren(MeshRenderer).material);
// objectMaterial.color = newColor;
// 	
// 	applyMaterial();
// 		
// }