var latAcclElem = document.getElementById('turning');
var forwardAcclElem = document.getElementById('acceleration');

var drivingScoreNotif = document.getElementById('driving-score-lower');
var drivingScoreElem = document.getElementById('driving-score');


var speedVar = 0;
var wheelVar = 0.00;
var secondsTimestamp = 0;
var lateralAcceleration = 0;
var yaw = 0;
var points = 100;

var alerts = [];

console.log('test date:', Date.now());


// Call processData with only 'engine_oil_temp' signal. Callback triggered much faster with fewer signals
 gm.info.getVehicleData(processData, ['gps_speed', 'wheel_angle']);
 gm.info.watchVehicleData(processData, ['gps_speed', 'wheel_angle']);


  function fuckShitUp() {
    addDrivingAlert("Took turn too fast--")
  }

  function fuckShitUpAgain() {
    addDrivingAlert("You crashed--")
  }

function processData(data) {
    console.log('got vehicle data: ', data);

    if (data.wheel_angle != null) {
        wheelVar = data.wheel_angle;
    }

    if (data.gps_speed != null) {

        var deltaT = 0;
        var now = Math.floor(Date.now() / 1000);
        if (now > secondsTimestamp) {
            deltaT = now - secondsTimestamp;
        } else if (now < secondsTimestamp) {
            deltaT = secondsTimestamp - now;
        } else {
            deltaT = 0.00;
        }

        console.log('seconds: ', now, ' -- deltaT: ', deltaT);

        calculateAcceleration(speedVar, data.gps_speed, deltaT);
        speedVar = data.gps_speed;
        deltaT = now;
    }

    calculateLateralAcceleration(speedVar);
    //  calcGForce(speedVar, wheelVar);

}

function calculateAcceleration(vi, vf, timeInterval) {
    var a = ((vi * 3.6) - (vf * 3.6)) / timeInterval;
    console.log(a);
    var accelGs = a / 9.8;
    forwardAcclElem.innerHTML = accelGs.toFixed(2) + "g";
}

function calculateLateralAcceleration(v) {
    console.log('wheelVar:', wheelVar);
    var r = (2048 * 10) / wheelVar;
    console.log('r:', r);
    console.log('v in km/h:', v);
    console.log('v in m/s:', v / 3.6);
    console.log('v squared:', Math.pow((v / 3.6), 2.0));
    lateralAcceleration = Math.pow((v / 3.6), 2.0) / Math.abs(r);
    var latGs = lateralAcceleration / 9.8;
    latAcclElem.innerHTML = latGs.toFixed(2) + "g";
}

function cleanupOldAlerts() {
  console.log('we trynna cleanup...', alerts.length);

  var indicesToSplice = [];

  for (var i = 0; i < alerts.length; i++) {
    console.log('we at num:', i)
    if ((Date.now() - alerts[i].secondsTimestamp) > 10 * 1000) {
      console.log('found sumthing old');
      //been time interval since alert, return points
      indicesToSplice.push(i);

      console.log('stuff', points);

    }
  }

  for (var x = 0; x < indicesToSplice.length; x++) {
    console.log('indicesToSplice:', indicesToSplice[x]);
    alerts.splice(indicesToSplice[x]);
  }

  updateDrivingRecordBanner();

  if (points < 100) {
    console.log('adding points from', points);
    points = points + (10 * indicesToSplice.length);
    drivingScoreElem.innerHTML = points;
  }
}

function updateDrivingRecordBanner() {
  var hi = "";
  for (var i = 0; i < alerts.length; i++) {
    hi = hi.concat(alerts[i].alertType);
  }
  drivingScoreNotif.innerHTML = hi;
}

function addDrivingAlert(type) {

  var alert = {
    alertType: type,
    secondsTimestamp: Date.now()
  };

  alerts.push(alert);

  updateDrivingRecordBanner();

  //todo: UI stuff

  if (points > 0) {
    points = points - 10;
  }
  drivingScoreElem.innerHTML = points;
}

// function calcGForce(speed, wheelangle) {
//
//     var mps = speed / 3.6;
//     console.log('mps: ', mps);
//     var acceleration = Math.pow(mps, 2) / wheelangle;
//     console.log('acceleration: ', acceleration);
//     var gs = Math.abs(acceleration / 9.8);
//
//     gsElem.innerHTML = gs;
//
// }
