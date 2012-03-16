
private var lr : LineRenderer;
private var vertices : Vector3[];
private var lineWidth : Vector2;

function Awake () {
	lr = gameObject.AddComponent(LineRenderer);
	// Debug.Log(lr);
	vertices = new Vector3[1];
	lineWidth = Vector3.one;
}

public function SetMaterial(material : Material) {
	lr.material = material;
}

public function GetVertexCount() : int {
	return vertices.length;
}

public function SetVertexCount(count : int) {
	vertices = new Vector3[count];
	lr.SetVertexCount(count);
}

public function SetPosition(index : int, position : Vector3) {
	vertices[index] = position;
	lr.SetPosition(index, position);
}

public function GetPosition(index : int) : Vector3 {
	return vertices[index];
}

public function SetWidth(start : float, end : float) {
	lineWidth[0] = start;
	lineWidth[1] = end;
	lr.SetWidth(start, end);
}

public function GetWidth() : Vector2 {
	return lineWidth;
}

public function SetColors(c1 : Color, c2 : Color) {
	lr.SetColors(c1, c2);
}

function OnDestroy() {
	Destroy(lr);
	vertices = null;
}

