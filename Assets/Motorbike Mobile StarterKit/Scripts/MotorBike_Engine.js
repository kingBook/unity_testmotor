/*Script Programmed by: fieckoapps
////////////////////////////////////////
			    Contact:
	e-mail: fieckoapps@gmail.com
	site: www.fieckoapps.foliohd.com
		  skype: fieckoapps
			GG: 2122393
/////////////////////////////////////
	 	  30 April 2013
*/

private var SteerAngle : float;
private var DirectionTilt : String;
public var AngleToPosition : float;
private var WheelSteerValue : float;
private var MaxEngineRPM : float = 3000.0;
private var RegisterEngineTorque : float;
private var RegisterMaxEngineRPM : float;
private var RegisterEngineAcceleration : int;
private var RegisterSteerAngle : float;
private var Touch0 : String;
private var SteerTouchTime : float;
private var Rear = true;
static var SpeedFloat : float; 

var Speed : int; //Current Speed durning play
var SpeedLimit : int = 62; //Set maximum value of speed
var ReverseLimit : int = 10; //Set maximum value of reverse speed
var EngineTorque : float = 310; //Range 210-400 ! higher value = motorbike is faster
var EngineAcceleration : int = 160;//Range 110-300 ! higher value = slower acceleration 
var WheelSteerAngle : float = 27; //Range 10-50 ! higher value = higher steervalue
var CurrentSteerAngle : float; // Current SteerAngle (FrontWheel.steerAngle)
var EngineRPM : int; //Current Motorbike RPM

var RedLightON : Color; //Choose your own color for turned on RedLight
var RedLightOFF : Color; //Choose your own color for turned off RedLight
var FrontLight : Light; //Select FrontLight object with light component from Hierarchy

var Body : GameObject;
var WheelSteer : GameObject;
var FrontPart : GameObject;
var FrontWheelMesh : GameObject;
var BackWheelMesh : GameObject;
var FrontWheel : WheelCollider;
var BackWheel : WheelCollider;

private var Ztilt : float; //Actual range for Zrotation motorbike <frontwheel>
private var ZtiltAdd : float; //Add value to achieve Ztilt actual range
private var ZtiltString : String; //Information about Position for frontwheel
private var StuntTiltValue : float; //Add value to achieve position rotation when motorbike 
private var StuntString : String;	//Information about Position for backwheel
private var brakeTime : float = -5; //count braketime to put up rear wheel up.
private var rValue : float;	

var ButtonRearUp : Texture;
var ButtonRearDown : Texture;
var GUIAccelerate : GUIStyle;
var GUIBrake : GUIStyle;
var GUIRear : GUIStyle;
var GUIStuntButton : GUIStyle;
var GUIArrowLeft : GUIStyle;
var GUIArrowRight : GUIStyle;
var GUIStyleSpeed : GUIStyle;

var StandaloneCamera : GameObject;
var MobileCamera : GameObject;
var MapTerrain : GameObject;

private var CheckTilt : float;
	
function Start ()
{
	rigidbody.centerOfMass.y = -1.5;
	FrontWheel.brakeTorque = 0;
	BackWheel.brakeTorque = 0;		
	ZtiltString = "nothing";
	StuntString = "";
}

function Update () 
{	
	CheckTilt = CurrentSteerAngle/10 * Time.deltaTime * (10+EngineAcceleration/2-SpeedFloat);
//Read
	RegisterEngineAcceleration = ( EngineAcceleration - Speed )/10;
	
	var hit : RaycastHit;	
	SpeedFloat = rigidbody.velocity.magnitude*3.2;
	Speed = Mathf.FloorToInt(SpeedFloat);
	rigidbody.drag = rigidbody.velocity.magnitude / 250;
	if(StuntString != "GetUp")EngineRPM = FrontWheel.rpm / 2;
	if( EngineRPM % 2 == 0 ) RegisterMaxEngineRPM = EngineRPM;// This is one of method to check directly when Motorbike is braking or EngineRPM is decreasing.
	
	
//value of steer if speed is higher steering is smaller.	
	if( Speed < 70 )SteerAngle = WheelSteerAngle + rigidbody.velocity.magnitude * -0.7;
	else if( Speed < 70 )SteerAngle = WheelSteerAngle+10 + rigidbody.velocity.magnitude * -0.7;

//SpeedLimit
	if( Speed >= SpeedLimit )
	{
		Speed = SpeedLimit -2;
		RegisterEngineTorque = 0;
		BackWheel.brakeTorque = 35;
		
	}else if( Speed < SpeedLimit )
		{	
			RegisterEngineTorque = EngineTorque;
			BackWheel.brakeTorque = 0;
	}	
//FrontLight
	if(Input.GetKeyDown("l"))		FrontLight.enabled = !FrontLight.enabled;
	
//Stunt Q Button
	if( Input.GetKey("q") )	ZtiltString = "";
	if( ( Input.GetKey("q") ) && ( !Input.GetKey("s") ) )	StuntString = "GetUp";
	if( Input.GetKeyUp("q") )		StuntString = "GetDown";		

//If StuntString = GetUp put frontwheel motorbike up else if = GetDown put frontwheel to ground
	if( ( StuntString == "GetUp" ) || ( StuntString == "GetUpStart" ) )
	{
		if( StuntTiltValue < 30 ) StuntTiltValue += 1;
		if( StuntTiltValue > 30 ) StuntTiltValue -= 1;
		if( StuntTiltValue > 31 ) StuntTiltValue = 29;
		transform.localEulerAngles.z = StuntTiltValue;
		
	}else if( StuntString == "GetDown" )
		{	
			if( StuntTiltValue < 0 ) StuntTiltValue += 1;
			if( StuntTiltValue > 0 ) StuntTiltValue -= 1;
			if( StuntTiltValue <= -1 )  StuntTiltValue = 0;
			transform.localEulerAngles.z = StuntTiltValue;
	}
//If button s is pushed down and button q is Up motorbike is braking
		if( ( Input.GetKeyDown("s") ) && ( !Input.GetKey("q") ) )
		{
			Body.renderer.sharedMaterials[8].color = RedLightON;
			FrontWheel.brakeTorque = 20;
			ZtiltString = "braking";			
			
		}else if( Input.GetKeyUp("s") )
			{
				Body.renderer.sharedMaterials[8].color = RedLightOFF;
				if(!Input.GetKeyDown("w"))FrontWheel.brakeTorque = 12;		
				else FrontWheel.brakeTorque = 2;		
				ZtiltString = "nothing";
				StuntString = "";
				brakeTime = -5;
		}
		
//When Motorbike speed is higher than 40 make Ztilt able to count, because
//if condition is fulfilled and player will brake in this moment rear wheel should be threw up in depend of speed and brakevalue(+brakeTime).	
	if( SpeedFloat > 40 )	
	{
		Ztilt = -( ( SpeedFloat*20 ) * ( FrontWheel.brakeTorque ) );
	}else if( SpeedFloat < 40 )	{
			if( ZtiltAdd < 0 ) ZtiltAdd += 0.2f * Time.deltaTime;
			Ztilt = ZtiltAdd;
	}
	
//If speed is a positive value braking with rearwheel physics is possible
	if( EngineRPM > 0 )
	{					//if Stunt for front wheel is unavailable and  motorbike is braking condition should do:
		if( ( ZtiltString == "braking" ) && ( StuntString != "GetUp" ) )
		{
			brakeTime += 0.5f;
			if( brakeTime > 0 )
			{								//count to wanted value of Zrotation
				if( Ztilt > ZtiltAdd ) ZtiltAdd += 10f * Time.deltaTime * brakeTime*2;
				if( Ztilt < ZtiltAdd ) ZtiltAdd -= 10f * Time.deltaTime * brakeTime*2;
				transform.localEulerAngles.z = ZtiltAdd;
			}
		}
					//if Stunt for front wheel is unavailable and  player of motorbike pushed up brakebutton 
					//condition should back smoothly to standart position
		if( ( ZtiltString == "nothing" ) && ( StuntString != "GetUp" ) )
		{
				//count to wanted value of Zrotation
			if( ZtiltAdd < 0 ) ZtiltAdd += 15f * Time.deltaTime;
			if( ZtiltAdd > -1 ) ZtiltAdd = 0;
			transform.localEulerAngles.z = ZtiltAdd;
		}
	
	}else if( ( EngineRPM < 0 ) && ( StuntString != "GetUp" ) )
		{
			//count to wanted value of Zrotation
			if( ZtiltAdd < 0 ) ZtiltAdd += 15f * Time.deltaTime;
			if( ZtiltAdd > -1 ) ZtiltAdd = 0;
			transform.localEulerAngles.z = ZtiltAdd;
		}
		
		if( ZtiltAdd > 0 ) ZtiltAdd = 0;
	
	//limit of reversing (rear speed)
		if( ( EngineRPM < 0 ) ) 
		{
			if( Speed > ReverseLimit )
			{
				RegisterEngineTorque = 0;
				FrontWheel.brakeTorque = 15;	
				Speed = ReverseLimit-2;	
					}else if( Speed < ReverseLimit )
						{
							RegisterEngineTorque = EngineTorque+100;
						}	
		}else if( EngineRPM > 0 )
		{
			RegisterEngineTorque = EngineTorque;
			FrontWheel.brakeTorque = 5;
		}
	
//dependences of direct values:
	//MotorTorque quals power of engine / acceleration * value of pushed button
	FrontWheel.motorTorque = EngineTorque / RegisterEngineAcceleration * Input.GetAxis("Vertical");
	//WheelSteerAngle quals limited SteerAngle vaule * value of pushed button
	FrontWheel.steerAngle = SteerAngle * Input.GetAxis("Horizontal");
	RegisterSteerAngle = FrontWheel.steerAngle;

	//WheelSteer value of rotate depends of front wheel steerAngle vaule
	WheelSteer.transform.localEulerAngles.z = FrontWheel.steerAngle;
	//FrontPart(Down - fender) is controlled too via front wheel steerAngle value but divided 2
	FrontPart.transform.localEulerAngles.z = FrontWheel.steerAngle/2;
	
//If we using this project of future game on device different of mobile device motorbike uses other values.
	if( ( Application.platform != RuntimePlatform.IPhonePlayer ) && ( Application.platform != RuntimePlatform.Android ) )
	{
		//This condition concerns sideways tilt and here are another condtions what motorbike have to performance of tasks to use tilt durning play.
		if(((( EngineRPM > 0 ) && ( EngineRPM > RegisterMaxEngineRPM )) || (( EngineRPM < 0 ) && ( EngineRPM < RegisterMaxEngineRPM ))) && (( FrontWheel.steerAngle >= -2 ) || ( FrontWheel.steerAngle <= 2 ))) 
		{
			if( Speed != 0 )
			{
		//if FrontWheel.steerAngle > 0 or < 0 we can estimate name of tilt direction
				if( FrontWheel.steerAngle > 0 )
				{
					DirectionTilt = "Right"; 
					CurrentSteerAngle = FrontWheel.steerAngle;
					if( FrontWheel.steerAngle > 0.5f )
					{						
						//Here is a limit for motorbike tilt rotation for x axis
						// X rotation value should be smaller than 25 and higher than -25
						// If you want to make higher tiltes for your motorbike you can put bigger value
						if( ( AngleToPosition < 24 ) && ( AngleToPosition > -24 ) )
						{
							if( FrontWheel.steerAngle > AngleToPosition )
							{
								if( SpeedFloat > 30 )
								{	
									if(CheckTilt > 0 )	AngleToPosition += CurrentSteerAngle/10 * Time.deltaTime * (10+EngineAcceleration/2-SpeedFloat);
									//else AngleToPosition += 0;
								}
							}else if( FrontWheel.steerAngle < AngleToPosition ){
								if( SpeedFloat > 30 )
								{	
									if(CheckTilt > 0 )AngleToPosition += CurrentSteerAngle/20 * Time.deltaTime * (10+EngineAcceleration/2-SpeedFloat);
									//else AngleToPosition += 0;
								}
							}
						}
					}
					transform.localEulerAngles.x = -( AngleToPosition*1.4 );			
				}else{
					DirectionTilt = "Left";
					CurrentSteerAngle = -FrontWheel.steerAngle;
					if( FrontWheel.steerAngle < -0.5f )
					{
						//Here is another limit for motorbike tilt rotation for x axis
						// X rotation value should be smaller than 25 and higher than -25
						// If you want to make higher tiltes for your motorbike you can put bigger value
						if( ( AngleToPosition < 24 ) && ( AngleToPosition > -24 ) )
						{
							if( FrontWheel.steerAngle > AngleToPosition )
							{
								if( SpeedFloat > 30 )
								{	
									if(CheckTilt > 0 )	AngleToPosition -= CurrentSteerAngle/10 * Time.deltaTime * (10+EngineAcceleration/2-SpeedFloat);
									//else AngleToPosition -= 0;
								}
							}else if( FrontWheel.steerAngle < AngleToPosition ){
								if( SpeedFloat > 30 )
								{	
									if(CheckTilt > 0 )	AngleToPosition -= CurrentSteerAngle/10 * Time.deltaTime * (10+EngineAcceleration/2-SpeedFloat);
									//else AngleToPosition -= 0;
								}
							}
						}
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}			
			}
		}
//if sideways tilt is different than 0 ( standart-start position )
		//if Acceleration button is pushed up and steer buttons are pushed down, condition have to navigate current rotation of motorbike to standart postiion ( axis x = 0 )
		if((((( EngineRPM > 0 ) && ( EngineRPM < RegisterMaxEngineRPM )) || (( EngineRPM < 0 ) && ( EngineRPM > RegisterMaxEngineRPM ))) && (( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 )) ) || (((( EngineRPM > 0 ) && ( EngineRPM > RegisterMaxEngineRPM )) || (( EngineRPM < 0 ) && ( EngineRPM < RegisterMaxEngineRPM ))) && (( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 )) ))
		{
			if(( FrontWheel.steerAngle >= -3 ) && ( FrontWheel.steerAngle <= 3 ))
			{
				if(SpeedFloat < 80)
				{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition +=  0.4678901029f * Time.deltaTime * SpeedFloat;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -=  0.4678901029f * Time.deltaTime * SpeedFloat;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}else if(SpeedFloat > 80 )
				{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition +=  80.4678901029f * Time.deltaTime;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -=  80.4678901029f * Time.deltaTime;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}
			}
		}
		//if Acceleration button is pushed down and steer buttons are pushed up, condition have to navigate current rotation of motorbike to standart postiion ( axis x = 0 )
		if(( EngineRPM < RegisterMaxEngineRPM ) && (( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 ))) 
		{
				if(SpeedFloat < 80)
				{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition +=  0.4678901029f * Time.deltaTime * SpeedFloat;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -=  0.4678901029f * Time.deltaTime * SpeedFloat;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}else if(SpeedFloat > 80 )
				{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition +=  80.4678901029f * Time.deltaTime;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -=  80.4678901029f * Time.deltaTime;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}
		}

		if( AngleToPosition > 25 ) AngleToPosition = 24.99998f;
		else if( AngleToPosition < -25 ) AngleToPosition = -24.999998f;
	}
	
//Wheels depenedces using wheel colliders
	//FrontWheel
		var CCPointFrontWheel : Vector3 = FrontWheel.transform.TransformPoint(FrontWheel.center );
				
		FrontWheelMesh.transform.rotation = FrontWheel.transform.rotation * Quaternion.Euler( rValue, FrontWheel.steerAngle, 0 );	
		rValue += FrontWheel.rpm * ( 360/60 ) * Time.deltaTime;	
		
		if ( Physics.Raycast( CCPointFrontWheel, -FrontWheel.transform.up, hit, FrontWheel.suspensionDistance + FrontWheel.radius ) ) 
		{
			FrontWheelMesh.transform.position = hit.point + (FrontWheel.transform.up * FrontWheel.radius);
		}else{	
			FrontWheelMesh.transform.position = CCPointFrontWheel - (FrontWheel.transform.up * FrontWheel.suspensionDistance);
		}	
		
	//BackWheel
		var CCPointBackWheel : Vector3 = BackWheel.transform.TransformPoint(BackWheel.center );
				
		BackWheelMesh.transform.rotation = BackWheel.transform.rotation * Quaternion.Euler( rValue, BackWheel.steerAngle, 0 );	
		rValue += FrontWheel.rpm * ( 360/60 ) * Time.deltaTime;	
		
		if ( Physics.Raycast( CCPointBackWheel, -FrontWheel.transform.up, hit, FrontWheel.suspensionDistance + FrontWheel.radius ) ) 
		{
			BackWheelMesh.transform.position = hit.point + (BackWheel.transform.up * BackWheel.radius);
		}else{	
			BackWheelMesh.transform.position = CCPointBackWheel - (BackWheel.transform.up * BackWheel.suspensionDistance);
		}	
		
////////////////////////////////////////////////////	
///////////////////////////////////////////////////////////////////////////////////////////
///ADDITION FOR MOBILE DEVICES///////////////////////////////////////	
//////////////////////////////////////
	if( ( Application.platform == RuntimePlatform.IPhonePlayer ) || ( Application.platform == RuntimePlatform.Android ) )
	{
			MapTerrain.active = false;
			MobileCamera.active = true;
			StandaloneCamera.active = false;
	////////////////
	//Touchable positions
			for ( var i = 0; i < Input.touchCount; ++i ) 
			{	
				//BUTTON ACCELERATION
				if((Input.GetTouch(i).position.x > Screen.width - 150)&&(Input.GetTouch(i).position.x < Screen.width)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height - 150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height - 50)))
				{
					if (Input.GetTouch(i).phase == TouchPhase.Stationary) 
					{	
					 	if(Rear == true)
					 	{
							FrontWheel.motorTorque = EngineTorque / RegisterEngineAcceleration;
						}else if(Rear == false)	{
				 			FrontWheel.motorTorque = -EngineTorque / RegisterEngineAcceleration;
										if( ( EngineRPM < 0 ) ) 
										{
											if( Speed > 5 )
											{
												RegisterEngineTorque = 0;
												FrontWheel.brakeTorque = 25;	
												Speed = 9;	
													}else if( Speed < 5 )
														{
															RegisterEngineTorque = EngineTorque;
															FrontWheel.brakeTorque = 0;
														}	
										}else if(EngineRPM > 0){
											RegisterEngineTorque = EngineTorque;
											FrontWheel.brakeTorque = 5;
										}			
							}
					}
				}
				
			//BUTTON BRAKE
				if((Input.GetTouch(i).position.x > Screen.width - 150)&&(Input.GetTouch(i).position.x < Screen.width)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height - 300))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height - 150)))
				{
					if(Input.GetTouch(i).phase == TouchPhase.Stationary) 
					{	
						Body.renderer.sharedMaterials[8].color = RedLightON;
						FrontWheel.brakeTorque = 22;
					}
					
					if(Input.GetTouch(i).phase == TouchPhase.Ended)
					{	
						Body.renderer.sharedMaterials[8].color = RedLightOFF;
						FrontWheel.brakeTorque = 10;		
					}
				}
				
			//BUTTON REAR
					if(Rear)
					{
						if((Input.GetTouch(i).position.x > Screen.width/2+160)&&(Input.GetTouch(i).position.x < Screen.width/2+260)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height - 150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height - 30)))
						{
						 	if(Input.GetTouch(i).phase == TouchPhase.Began)
						 	{
								Rear = false;
							}
						}
					}else{
						if((Input.GetTouch(i).position.x > Screen.width/2+160)&&(Input.GetTouch(i).position.x < Screen.width/2+260)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height - 150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height - 30)))
						{
							if(Input.GetTouch(i).phase == TouchPhase.Began)
						 	{
								Rear = true;
							}
						}
					}
					
			//BUTTON STUNT
					if((Input.GetTouch(i).position.x > 20)&&(Input.GetTouch(i).position.x < 170)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height-300))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height-150)))
						 {
						 	if (Input.GetTouch(i).phase == TouchPhase.Stationary) 
						 	{			
						 		StuntString = "GetUp";
						 		ZtiltString = "";
						 	}
						 	
							 if( Input.GetTouch(i).phase == TouchPhase.Ended)
							 {			 
								StuntString = "GetDown";			 		
							 }
						 }
				
				//ARROW LEFT AND RIGHT
				 	 if(((Input.GetTouch(i).position.x > 20)&&(Input.GetTouch(i).position.x < 170)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height-150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height-30))) || ((Input.GetTouch(i).position.x > 200)&&(Input.GetTouch(i).position.x < 320)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height-150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height-30))))
					 {
						 if((Input.GetTouch(i).position.x > 20)&&(Input.GetTouch(i).position.x < 170)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height-150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height-30)))
						 {
						 	if (Input.GetTouch(i).phase == TouchPhase.Stationary) 
						 	{			
						 		Touch0 = "Stationary";		 
						 		if(SteerAngle > SteerTouchTime) SteerTouchTime += 0.834534;	
						 		FrontWheel.steerAngle = -SteerTouchTime;
						 	}
						 	
							 if( Input.GetTouch(i).phase == TouchPhase.Ended)
							 {			 
								Touch0 = "Ended";
								SteerTouchTime = 0;
								FrontWheel.steerAngle = 0; 			 		
							 }
						 }
							
						 if((Input.GetTouch(i).position.x > 200)&&(Input.GetTouch(i).position.x < 320)&&(Input.GetTouch(i).position.y < Screen.height - (Screen.height-150))&&(Input.GetTouch(i).position.y > Screen.height - (Screen.height-30)))
						 {
						 	if (Input.GetTouch(i).phase == TouchPhase.Stationary) 
						 	{	
						 		Touch0 = "Stationary";		 
						 		if(SteerAngle > SteerTouchTime) SteerTouchTime += 0.834534;	
						 		FrontWheel.steerAngle = SteerTouchTime;
						 	}
						 	
							if( Input.GetTouch(i).phase == TouchPhase.Ended)
							{		
								Touch0 = "Ended";
								SteerTouchTime = 0;
								FrontWheel.steerAngle = 0;						 	
							}
						 }	
								 					
					}else{
					 if(Touch0 == "Ended")
					 {
						if(SteerTouchTime > 0)
						{
							SteerTouchTime -= 4;
							FrontWheel.steerAngle = SteerTouchTime;
						}	
						if(SteerTouchTime < 0)
						{
							SteerTouchTime += 4;
							FrontWheel.steerAngle = SteerTouchTime;
						}
					  }	 
					}
		////////////////////////////
		//This same as upper, tiltes for motorbike but with compability for mobile devices
			if(((( EngineRPM > 0 ) && ( EngineRPM > RegisterMaxEngineRPM )) || (( EngineRPM < 0 ) && ( EngineRPM < RegisterMaxEngineRPM ))) && (( FrontWheel.steerAngle >= -2 ) || ( FrontWheel.steerAngle <= 2 ))) 
			{
				if( Speed != 0 )
				{
					if( FrontWheel.steerAngle > 0 )
					{
						DirectionTilt = "Right";
						CurrentSteerAngle = FrontWheel.steerAngle;
						if( FrontWheel.steerAngle > 0.5f )
						{
							if((AngleToPosition < 24) && (AngleToPosition > -24))
							{
								if( FrontWheel.steerAngle > AngleToPosition )
								{
									if(SpeedFloat > 30) 
									{	
										AngleToPosition += 1.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}else if(SpeedFloat < 30)
									{
										AngleToPosition += 0.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}
								}else if( FrontWheel.steerAngle < AngleToPosition ){
									if(SpeedFloat > 30) 
									{	
										AngleToPosition += 1.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}else if(SpeedFloat < 30)
									{
										AngleToPosition += 0.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}
								}
							}
						}
						transform.localEulerAngles.x = -(AngleToPosition*1.4);			
					}else{
						DirectionTilt = "Left";
						CurrentSteerAngle = -FrontWheel.steerAngle;
						if( FrontWheel.steerAngle < -0.5f )
						{
							if((AngleToPosition < 24) && (AngleToPosition > -24))
							{
								if( FrontWheel.steerAngle > AngleToPosition )
								{
									if(SpeedFloat > 30) 
									{	
										AngleToPosition -= 1.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}else if(SpeedFloat < 30)
									{
										AngleToPosition -= 0.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}
								}else if( FrontWheel.steerAngle < AngleToPosition ){
									if(SpeedFloat > 30) 
									{	
										AngleToPosition -= 1.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}else if(SpeedFloat < 30)
									{
										AngleToPosition -= 0.5678901029f * Time.deltaTime * (10+SpeedLimit-SpeedFloat);
									}
								}
							}
						}
						transform.localEulerAngles.x = -(AngleToPosition*1.4);
					}			
				}
			}
			
			if(( EngineRPM > RegisterMaxEngineRPM ) && (( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 ))) 
			{
				if(( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 ))
				{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition += 0.7678901029f * Time.deltaTime * SpeedFloat;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -= 0.7678901029f * Time.deltaTime * SpeedFloat;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
				}
			}
			
			if(( EngineRPM < RegisterMaxEngineRPM ) && (( FrontWheel.steerAngle >= -2 ) && ( FrontWheel.steerAngle <= 2 ))) 
			{
					if( FrontWheel.steerAngle > AngleToPosition )
					{
						AngleToPosition += 0.7678901029f * Time.deltaTime * SpeedFloat;
					}else if( FrontWheel.steerAngle < AngleToPosition ){
						AngleToPosition -= 0.7678901029f * Time.deltaTime * SpeedFloat;
					}
					transform.localEulerAngles.x = -(AngleToPosition*1.4);
			}
	
			if(AngleToPosition > 25) AngleToPosition = 24.8f;
			else if(AngleToPosition < -25) AngleToPosition = -24.8f;
		}
	}
	
	//Audio
	audio.volume = Mathf.Abs(MaxEngineRPM / EngineRPM) - 0.5;
	audio.pitch = Mathf.Abs(EngineRPM + EngineRPM / MaxEngineRPM)/50 + 2;	
	if ( audio.pitch > 2.0 ) audio.pitch -= 0.5;
	
	//Camera
	if(Input.GetKeyDown("1"))
	{
		MobileCamera.active = false;
		StandaloneCamera.active = true;
	}
	if(Input.GetKeyDown("2"))
	{
		MobileCamera.active = true;
		StandaloneCamera.active = false;
	}
}

function OnGUI()
{
	GUI.Label(Rect(10,10,100,100),""+Speed,GUIStyleSpeed);
	GUI.Label(Rect(10,Screen.height-30,Screen.width,30),"STEER: AWSD, Q - STUNT, L - LIGHT, 1 - CAMERA_STANDALONE, 2-CAMERA_MOBILE, Last Update: 5 May 2013, Created by fieckoapps");
	//Textured buttons for mobile devices
	if( ( Application.platform == RuntimePlatform.IPhonePlayer ) || ( Application.platform == RuntimePlatform.Android ) )
	{
		GUI.RepeatButton(Rect(60,Screen.height-290,100,100), "", GUIStuntButton);	
		GUI.RepeatButton(Rect(60,Screen.height-140,100,100), "", GUIArrowLeft);				
		GUI.RepeatButton(Rect(190,Screen.height-140,100,100), "", GUIArrowRight);
		GUI.RepeatButton(Rect(Screen.width - 150,Screen.height-140,100,100), "", GUIAccelerate);
		GUI.RepeatButton(Rect(Screen.width - 150,Screen.height-290,100,100), "", GUIBrake);
			
		if( Rear == true )
		{
			GUI.Button(Rect(Screen.width/2+170,Screen.height-130,85,100), ButtonRearUp, GUIRear);
		}else if( Rear == false ){
			GUI.Button(Rect(Screen.width/2+170,Screen.height-130,85,100), ButtonRearDown, GUIRear);
		}	
	}	
}