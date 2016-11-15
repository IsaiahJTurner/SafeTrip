var latAcclElem = document.getElementById('turning');
var forwardAcclElem = document.getElementById('acceleration');

var drivingScoreNotif = document.getElementById('driving-score-lower');
var drivingScoreElem = document.getElementById('driving-score');

var alertDiv = document.getElementById('warning');
var warningLabel = document.getElementById('warningLabel');

var speedVar = 0;
var wheelVar = 0.00;
var secondsTimestamp = 0;
var lateralAcceleration = 0;
var yaw = 0;
var points = 100;
var grade;

var lastAlertTime = Date.now() - 5 * 1000;

var alerts = [];

//console.log('test date:', Date.now());

  setInterval(cleanupOldAlerts, 1 * 1000);
  // setTimeout(fuckShitUp, 7 * 1000);
  // setTimeout(fuckShitUpAgain, 13 * 1000);
  setInterval(refreshData, 1 * 1000);

  function refreshData() {
    gm.info.getVehicleData(processData, ['gps_speed', 'wheel_angle']);
  }

// Call processData with only 'engine_oil_temp' signal. Callback triggered much faster with fewer signals
  refreshData();
 gm.info.watchVehicleData(processData, ['gps_speed', 'wheel_angle']);


  function fuckShitUp() {
    addDrivingAlert("Took turn too fast--")
  }

  function fuckShitUpAgain() {
    addDrivingAlert("You crashed--")
  }

function processData(data) {
//    console.log('got vehicle data: ', data);

    if (data.wheel_angle != null) {
        wheelVar = data.wheel_angle;
    }

    if (data.gps_speed != null) {

        var deltaT = 0;
        var now = Date.now() / 1000;
        console.log('time before passed into a: ', now, 'other time: ', secondsTimestamp);
        if (now > secondsTimestamp) {
            deltaT = now - secondsTimestamp;
        } else if (now < secondsTimestamp) {
            deltaT = secondsTimestamp - now;
        } else {
            deltaT = 0.00;
        }
        console.log('delta t: ', deltaT);
      //  console.log('seconds: ', now, ' -- deltaT: ', deltaT);

        calculateAcceleration(speedVar, data.gps_speed, deltaT);
        speedVar = data.gps_speed;
        secondsTimestamp = now;
    }

    calculateLateralAcceleration(speedVar);
    //  calcGForce(speedVar, wheelVar);

}

function calculateAcceleration(vi, vf, timeInterval) {
    console.log('vi: ', (vi / 3.6), 'vf: ', (vf / 3.6), 't: ', timeInterval);
    var a = ((vf / 3.6) - (vi / 3.6)) / timeInterval;
    console.log('acceleration: ', a);
    var accelGs = a / 9.8;
    if (accelGs >= 0.5) {
      addDrivingAlert("Dangerous acceleration!")
    }
    else if (accelGs <= - 0.5) {
      addDrivingAlert("Sudden braking!")
    }
    forwardAcclElem.innerHTML = accelGs.toFixed(2) + "G";
}

function calculateLateralAcceleration(v) {
  //  console.log('wheelVar:', wheelVar);
    var r = (2048 * 10) / wheelVar;
    // console.log('r:', r);
    // console.log('v in km/h:', v);
    // console.log('v in m/s:', v / 3.6);
    // console.log('v squared:', Math.pow((v / 3.6), 2.0));
    lateralAcceleration = Math.pow((v / 3.6), 2.0) / Math.abs(r);
    var latGs = lateralAcceleration / 9.8;
    if (latGs >= 0.5) {
        addDrivingAlert("You took that turn too fast!")
    }

    latAcclElem.innerHTML = latGs.toFixed(2) + "G";
}

function cleanupOldAlerts() {
//  console.log('we trynna cleanup...', alerts.length);

  var indicesToSplice = [];
  for (var i = 0; i < alerts.length; i++) {
    console.log('we at num: ', i, ' with: ', alerts[i].alertType);

    if ((Date.now() - alerts[i].secondsTimestamp) > 10 * 1000) {
      console.log('found sumthing old: ', alerts[i].alertType, ' at: ', alerts[i].secondsTimestamp);
      //been time interval since alert, return points
      console.log('array before push: ');

      indicesToSplice.push(i);

//      console.log('stuff', points);

    }
  }

  if (indicesToSplice.length == 1 && alerts.length == 1) {
    alerts = [];
  }


  for (var x = 0; x < indicesToSplice.length; x++) {
    console.log('splicing in alerts: ', indicesToSplice[x], ' at x = ', x, 'array before: ');
    console.log(alerts);
    alerts = alerts.splice(indicesToSplice[x]);

    console.log(alerts);
  }

  updateDrivingRecordBanner();

  points = 100 - (10 * alerts.length);
  if (points > 100) { points = 100; }
  //  console.log('adding points from', points);

  //  points = points + (10 * indicesToSplice.length);
    // drivingScoreElem.innerHTML = points;

    var grade = "A";

    if (points == 100) {
      grade = "A";
    }
    else if (points == 90) {
      grade = "B";
    }
    else if (points == 80) {
      grade = "C";
    }
    else if (points == 70) {
      grade = "D";
    }
    else {
      grade = "-"
    }

    drivingScoreElem.innerHTML = grade;
    drivingScoreElem.style.color = "hsl( 0, 90%, " + points + "%)"; //hsl(320, 50%, 75%);
}

function updateDrivingRecordBanner() {
  var hi = "";
  for (var i = 0; i < alerts.length; i++) {
    hi = hi.concat(alerts[i].alertType + " ");
  }
  drivingScoreNotif.innerHTML = hi;
}

function addDrivingAlert(type) {
  if ((Date.now() - lastAlertTime) > (5 * 1000)) {
  var alert = {
    alertType: type,
    secondsTimestamp: Date.now()
  };

  alerts.push(alert);

  warningLabel.innerHTML = alert.alertType;
  alertDiv.style.display = 'block';
  setTimeout(dismissAlertView, 2 * 1000);

  updateDrivingRecordBanner();

  //todo: UI stuff

  points = 100 - (10 * alerts.length);
  if (points < 0) { points = 0; }

  /*if (points > 0) {
    points = points - 10;
  } */

  grade = percentToGrade;

  drivingScoreElem.innerHTML = points;
   var red = -1 * ((50 * (points / 100)));
  drivingScoreElem.style.color = "hsl( 0, 90%, " + grade + "%)"; //hsl(320, 50%, 75%);
  lastAlertTime = Date.now()
  }
}

function percentToGrade() {
  if (points == 100) {
    return "A";
  }
  else if (points == 90) {
    return "B";
  }
  else if (points == 80) {
    return "C";
  }
  else if (points == 70) {
    return = "D";
  }
  else {
    return "-"
  }
}

function dismissAlertView() {
  alertDiv.style.display = 'none';
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
