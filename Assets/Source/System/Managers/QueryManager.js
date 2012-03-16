import ApplicationState;

// move to query engine
enum LogicalOp {
	Or,    	// binary
	And,	// binary
	Xor
}

enum LogicalUnaryOp {
	Yes,
	Not
}

enum SearchType {
	Contains,
//	NotContains,
	Exact
}

enum SearchBy {
	Value,
	Attribute
}

static var instance : QueryManager;
static var queries : Array;
static var nodeName : String[];
static var attributeName : Hashtable; // Hashtable of String[]
static var matched : Array;
static var notMatched : Array;
instance = FindObjectOfType(QueryManager);

//static private var fibonacciComponent : FibonacciStructure;
static private var structure : GameObject;

if (instance == null) {
    Debug.Log ("Could not locate an QueryManager object. You have to have exactly one QueryManager in the play.");
}

function Awake() {
	queries = Array();
	matched = Array();
	notMatched = Array();
}

function Start() {
	structure = GameObject.Find("Structures");
	GetNodesAndAttributes();
	
}

static function PushQuery() {
	queries.push(CreateQuery());
}

private function GetNodesAndAttributes()
{
	
	var allAttributesText : String = "[All attributes]";
	var allNodesText : String 	   = "[All nodes]";
	
	var fileStructure : Hashtable = ApplicationState.fileStructure;
	attributeName = Hashtable();
	var tempNodeNames : Array = Array();
	var tempAttributeNames : Array = Array();
	//tempNodeNames.Push("Any");
	var allAttributes : ArrayList = ArrayList();
	
	// get values
	for (var currentNode : String in fileStructure["selectedTags"].Keys) {
		tempNodeNames.Push(currentNode);
		
		tempAttributeNames.Clear();
		//tempAttributeNames.Push("Any");
		for (var currentAttribute : String in fileStructure["selectedAttributes"][currentNode].Keys) {
			tempAttributeNames.Push(currentAttribute);
			if (!allAttributes.Contains(currentAttribute) && currentAttribute != allAttributesText) {
				allAttributes.Add(currentAttribute);
			}
		}
		tempAttributeNames.Sort();
		tempAttributeNames.Unshift(allAttributesText);
		attributeName[currentNode] = tempAttributeNames.ToBuiltin(String);
	}
	// set to builtins and sort
	tempNodeNames.Sort();
	tempNodeNames.Unshift(allNodesText);
	nodeName = tempNodeNames.ToBuiltin(String);

	attributeName[allNodesText] = new String[allAttributes.Count];
	allAttributes.Sort();
	allAttributes.Insert(0, allAttributesText); // unshift
	for (var i : int = 0; i < attributeName[allNodesText].length; i++) {
		attributeName[allNodesText][i] = allAttributes[i];
	}
	
}

static private function CreateQuery() : Hashtable
{
	var result : Hashtable = Hashtable();
	// On the query arrays: 0 holds the value, 1 boolean for showing menu
	
	// the array and false value should be moved to the SearchWindow, their 
	// purpose is to locate which menu should be showing.
	
	result["Logical"]      = Array(LogicalOp.Or, false);
	result["LogicalUnary"] = Array(LogicalUnaryOp.Yes, false);
	result["Node"]         = Array(0, false); // 0 means "Any" on a dynamic list
	result["SearchBy"]     = Array(SearchBy.Value, false);
	result["Attribute"]    = Array(0, false); // 0 means "Any" on a dynamic list
	result["SearchType"]   = Array(SearchType.Contains, false);
	result["IgnoreCase"]   = true;
	result["Value"]        = "";

	
	return result;
}

static function AddQueryAt(i : int) {
	var alpha : Array = queries.Slice(0,i+1);
	alpha.Push(CreateQuery());
	var omega : Array = queries.Slice(i+1, queries.length);
	alpha = alpha.Concat(omega);
	queries = alpha;
}

static function RemoveQueryAt(i : int) {
	queries.RemoveAt(i);
}


 
function PerformSearch()  {
	Debug.Log("performing search");
	var query : Hashtable;
	
	
	matched.Clear();
	notMatched.Clear();
	var currentObjectResult : boolean = true;
	//for (var i:int =0 ;i< fibonacciComponent.GetTagCount(); ++i) {
	for (var currentObject : GameObject in ApplicationState.instance.objectToNode.Keys) {
		// test for this cylinder against all queris
		
		currentObjectResult = false;
		
		for (query in  QueryManager.instance.queries) {

			var currentMatchResult : boolean = MatchTag2Query(currentObject, query);
			var logicalUnary : LogicalUnaryOp = query["LogicalUnary"][0];
			
			if (logicalUnary == LogicalUnaryOp.Not)
				currentMatchResult = ! currentMatchResult;
			
			var currentLogicalOp : LogicalOp = query["Logical"][0];
						
			switch(currentLogicalOp) { 
				case LogicalOp.And :
					currentObjectResult = currentObjectResult && currentMatchResult;
					break;
				case LogicalOp.Or :
					currentObjectResult = currentObjectResult || currentMatchResult;
					break;
				case LogicalOp.Xor :
					currentObjectResult = (currentObjectResult && ! currentMatchResult) || (!currentObjectResult && currentMatchResult);
					break;
			}
		}
		
		
		
		if (currentObjectResult == true) { // matches
			//Debug.Log(currentObject + " matched");
			matched.Push(currentObject);
		} else {
			//Debug.Log(currentObject + " did not matched");
			notMatched.Push(currentObject);
		}
	}
	
	structure.BroadcastMessage("UpdateSearchResults");  
}

function ResetSearch() {
	Debug.Log("Resetting search");
	matched = matched.Concat(notMatched);
	notMatched.Clear();
	structure.BroadcastMessage("UpdateSearchResults");  
	
}

private function MatchTag2Query(object : GameObject, query : Hashtable) : boolean {
	
	var node : Hashtable = ApplicationState.instance.objectToNode[object];
	var value;
	
	var qNodeValue : int              = query["Node"][0];
	var qSearchByValue : SearchBy     = query["SearchBy"][0];
	var qAttributeValue : int         = query["Attribute"][0];	
	var qSearchTypeValue : SearchType = query["SearchType"][0];
	var qValue : String               = query["Value"];
	var qIgnoreCase : boolean 		  = query["IgnoreCase"];
	
	var currentNodeName : String = nodeName[qNodeValue];
	if (qNodeValue != 0 && node["name"] != currentNodeName) return false;
	
	if (qSearchByValue == SearchBy.Value) {
		
		return EvalValue(qSearchTypeValue, node["innerText"], qValue, qIgnoreCase);
		// if (qSearchTypeValue == SearchType.Contains) {
		// 			if (node["innerText"].Contains(qValue)) return true;
		// 			else return false;
		// 		} 
		// 		else if (qSearchTypeValue == SearchType.Exact) {
		// 			if (node["innerText"] == qValue) return true;
		// 			else return false;
		// 		}
		
		
	} else if (qSearchByValue == SearchBy.Attribute) {
		var currentAttributeName : String = attributeName[currentNodeName][qAttributeValue];
		
		if (qAttributeValue !=0 && !node["attributes"].ContainsKey(currentAttributeName)) return false;
		
		var attributeResult : boolean = false;
		
		if (qAttributeValue == 0) { // Any
			for (currentAttributeName in node["attributes"].Keys) {
				attributeResult = EvalValue(qSearchTypeValue, node["attributes"][currentAttributeName], qValue, qIgnoreCase);
				if (attributeResult == true) break;
			}
			return attributeResult;
		} else {
			return EvalValue(qSearchTypeValue, node["attributes"][currentAttributeName], qValue, qIgnoreCase);
		}
		
		// if (qSearchTypeValue == SearchType.Contains) {
		// 			//if (! node["attributes"].Contains(currentAttributeName)) return false;
		// 			if (node["attributes"][currentAttributeName].Contains(qValue)) return true;
		// 			else return false;
		// 		} 
		// 		else if (qSearchTypeValue == SearchType.Exact) {
		// 			if (node["attributes"][currentAttributeName] == qValue) return true;
		// 			else return false;
		// 		}
	}
	
	Debug.Log("Should not get here when testing for matches");	
	return false;
}

private function EvalValue(searchType : SearchType, nodeValue : String, value : String, ignoreCase : boolean) {
	

	if (ignoreCase) {
		nodeValue = nodeValue.ToLower();
		value = value.ToLower();
	} 
	
	if (searchType == SearchType.Contains) {
		if (nodeValue.Contains(value)) return true;
		else return false;
	} 
	else if (searchType == SearchType.Exact) {
		if (nodeValue == value) return true;
		else return false;
	}
}

// private function EvalAttribute(searchType : SearchType, attributeValue : String, value : String, ignoreCase : boolean) {
// 	
// 
// 	if (ignoreCase) {
// 		attributeValue = attributeValue.ToLower();
// 		value = value.ToLower();
// 	} 
// 	
// 	if (searchType == SearchType.Contains) {
// 		if (attributeValue.Contains(value)) return true;
// 		else return false;
// 	} 
// 	else if (searchType == SearchType.Exact) {
// 		if (attributeValue == value) return true;
// 		else return false;
// 	}
// }