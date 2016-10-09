// Your code goes here

var vinElem = document.getElementById('vin');
var drivingScoreElem = document.getElementById('driving-score');
var accelerationElem = document.getElementById('acceleration');
var turningElem = document.getElementById('turning');

drivingScoreElem.innerHTML = '90';
accelerationElem.innerHTML = '80%';
turningElem.innerHTML = '100%';

gm.info.getVehicleConfiguration(function(data) {
  vinElem.innerHTML = gm.info.getVIN();
});
