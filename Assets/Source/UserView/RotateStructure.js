// original from http://forum.unity3d.com//viewtopic.php?t=14293

var numberAverages : int = 3; 

private var originalRotation : Quaternion; 
private var offsetRotation : Quaternion; 

// Make sure there is always a Rigidbody 
@script RequireComponent (Rigidbody) 
@script RequireComponent (SphereCollider) 


function Awake () { 
    
   numberAverages = Mathf.Clamp (numberAverages, 1, numberAverages); 
    
} 


function OnMouseDown () { 
   var hit : RaycastHit; 
   var dir : Vector3; 
    
   // Stop spinning 
   rigidbody.angularVelocity = Vector3.zero; 
    
   // Record initial variables 
   if (Physics.Raycast (camera.main.ScreenPointToRay(Input.mousePosition), hit)) { 
      originalRotation = transform.rotation; 
      dir = hit.point - transform.position; 
      offsetRotation = Quaternion.Inverse (Quaternion.LookRotation (dir)); 
      Spin (dir); 
   } 
} 


function Spin (dir : Vector3) { 
   var hit : RaycastHit; 
   var previousDirList : Array = new Array (); 
   var currentDir : Vector3; 
    
   // Initialize previous dir list 
   for (var i : int = 0; i < numberAverages; i++) { 
      previousDirList.Add (currentDir); 
   } 
    
   currentDir = dir; 
   // Make the object rotate with the cursor while we are grabbing it 
   while (Input.GetMouseButton(0) && Physics.Raycast (camera.main.ScreenPointToRay(Input.mousePosition), hit)) { 
      // Remove first element of the array 
      previousDirList.RemoveAt(0); 
      // Add current dir to the end 
      previousDirList.Add (currentDir); 
      currentDir = hit.point - transform.position; 
      transform.rotation =  Quaternion.LookRotation (currentDir) * offsetRotation * originalRotation; 
      yield; 
   } 
    
   // User let go of the mouse so make the object spin on its own 
   // var avgPreviousDir : Vector3 = Vector3.zero; 
   // for (dir in previousDirList) { 
   //    avgPreviousDir += dir; 
   // } 
   // avgPreviousDir /= numberAverages; 
   // Kick (currentDir, avgPreviousDir); 
} 


function Kick (r2 : Vector3, r1 : Vector3) { 
   var linearVelocity : Vector3; 
   var angVelocity : Vector3; 
    
   // Calculate the angular velocity:  omega = r x v / r^2 
   linearVelocity = (r2 - r1) / Time.deltaTime; 
   rigidbody.angularVelocity = Vector3.Cross (r2, linearVelocity) / r2.sqrMagnitude; 

}