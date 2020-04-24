// A simple smooth follow camera,
// that follows the targets forward direction

var target : Transform;
var smooth = 0.3;
var distance = 5.0;
var height = 0;
var xAngle : float;
private var yVelocity = 0.0;

var zAngle : float;

function Update () {
	
	var MBEngine : MotorBike_Engine = gameObject.GetComponent(MotorBike_Engine);
    // Damp angle from current y-angle towards target y-angle
    var yAngle : float = Mathf.SmoothDampAngle(transform.eulerAngles.y,
	                          target.eulerAngles.y, yVelocity, smooth);
                                
    /// Position at the target
    var position : Vector3 = target.position;
    // Then offset by distance behind the new angle
    position += Quaternion.Euler(xAngle, yAngle, zAngle) * Vector3 (0, height, -(distance + (MBEngine.SpeedFloat/15)));
    // Apply the position
    transform.position = position;

    // Look at the target
    transform.LookAt(target);

}