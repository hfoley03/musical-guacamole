import Midi from "@tonejs/midi";
import fs from 'fs';

// Variables that could change by user
let onsetsA = 4                             // How many hits
let pulsesA = 4                              // How many steps, 4,8 or 16
let onsetsB = 5
let pulsesB = 8

let phaseShiftAmount = 0;                   // How many pulses is each shift
let phaseShiftPeriod = 0;                   // After how many bars does a shift occur
let length = 64;                            // Length of total piece
let numberOfTracks = 2;                     // Number of tracks/players
let mode = 1;                               // Play mode (not used)
let scale = ['F', 'G']                      // Used to add 4th and 5th note of C (see function pitch())
let midiInProgress = new Midi.Midi()        // Midi object
midiInProgress.name = "My Bloody Nightmare"

// Pair 1
let track1 = midiInProgress.addTrack()      // track/player 1, no shifting, base rhythm
track1.name = "track1"
let track2 = midiInProgress.addTrack()      // track/player 2, shifting occurs
track2.name = "track2"

// Pair 2
let track3 = midiInProgress.addTrack()      // track/player 1, no shifting, base rhythm
track3.name = "track3"
let track4 = midiInProgress.addTrack()      // track/player 2, shifting occurs
track4.name = "track4"

let oneBarInTicks = midiInProgress.header.ppq*4 //length of a bar in ticks, normally 1920
let pulseInTicksA = (oneBarInTicks)/pulsesA     //length of one pulse in ticks,normally for a 1/16th note = 120
let pulseInTicksB = (oneBarInTicks)/pulsesB

// Create binary euclidean rhythm
let binaryRhythmA = euclidianPattern(onsetsA, pulsesA)
let binaryRhythmB = euclidianPattern(onsetsB, pulsesB)
console.log(binaryRhythmB)


// Convert into Midi object
let midiObject = binaryRhythmToMidi(binaryRhythmA, midiInProgress, pulseInTicksA, 0)
midiObject = binaryRhythmToMidi(binaryRhythmB, midiObject, pulseInTicksB, 2)

for( let j = 0; j < 4; j++){
  console.log(midiObject.tracks[j].notes.length)
}

// Creates full composition, with phase shifts
let finalMidiObject = phaseAndCompose(midiObject, phaseShiftAmount, phaseShiftPeriod, length, numberOfTracks, mode)

//for( let j = 0; j < 4; j++){
//  console.log(finalMidiObject.tracks[j].notes.length)
//}
// Write midi object to a midi file

howManyTracks(finalMidiObject, numberOfTracks)




fs.writeFileSync("dec28.mid", new Buffer(finalMidiObject.toArray()))




/////////////////////
/// FUNCTIONS :) ////
/////////////////////

// takes onsets (hits) pulses (tatum/steps)
// returns a string version of the rhythm eg 10010010
function euclidianPattern(onsets, pulses) {
  let U = new Array(pulses - onsets).fill([0]);
  let A = new Array(onsets).fill([1]);
  let B = [];

  while (U.length > 1) {
    let ca = A.length;
    let uc = U.length;
    let i = 0;
    while ((ca > 0) && (uc > 0)) {
      B[i] = A[i].concat(U[i]);
      ca = ca - 1;
      uc = uc - 1;
      i = i + 1;
    }
    U = U.slice(i);
    if (uc < ca) {
      U = A.slice(i, A.length);
    }
    A = B;
    B = [];
  }
  let output = A.join().replaceAll(',', '');
  if (U[0]) {
    output = (A.join() + U[0].toString()).replaceAll(',', '');
  }
  console.log("Binary Rhthtm: " + output)
  return output
}


// function takes a string in the format 10101010 and creates a midi object of that rhythm
// will only work as expected for onsets 2,4,8,16
function binaryRhythmToMidi(binaryRhythm, midiInProgress, pulseInTicks, offSet=0){
  let tracka = midiInProgress.tracks[0 + offSet]
  let trackb = midiInProgress.tracks[1 + offSet]
  for ( let i = 0; i < binaryRhythm.length; i++)
  {
    if (binaryRhythm[i]==1){
      createNote(tracka, (i * pulseInTicks), pulseInTicks)
      createNote(trackb, (i * pulseInTicks), pulseInTicks)
      console.log("notes added to tracks: " + tracka.name + "  & " +trackb.name )
    }
  }
  //console.log(midiInProgress.tracks[0].notes)
  return midiInProgress
}

// function takes a midi object containing two tracks with each track of length 1 bar
// creates full "composition" by extending these tracks, track 1 with no shifting (base rhythm), track 2 with shifting
function phaseAndCompose(midiInProgress,phaseShiftAmount, phaseShiftPeriod,length, numberOfTracks, mode){
  console.log("Phase and Compose")
  let newTicks;
  let track1_ = midiInProgress.tracks[0]
  let track2_ = midiInProgress.tracks[1]
  let track3_ = midiInProgress.tracks[2]
  let track4_ = midiInProgress.tracks[3]
  var players = [track1_, track2_, track3_,track4_]

  for(var t in players) {
    var trackSpecificPulseInTicks = players[t].notes[0].durationTicks
    var trackSpecificOnsets = players[t].notes.length
    var trackSpecificPulses = oneBarInTicks/trackSpecificPulseInTicks

    console.log("player " + players[t].name + " onsets: " + trackSpecificOnsets + " pulses: " + trackSpecificPulses +" values of pulse: " + trackSpecificPulseInTicks)

    for (let barNumber = 0; barNumber < length; barNumber++) {   // For each bar in the total length of composition
      //console.log("bar no.: " + barNumber)
      if (barNumber > 0) { // Make next bar

        //Create an array of the ticks of the previous bar
        //REFACTOR?
        var previousBar = players[t].notes.slice(((barNumber - 1) * trackSpecificOnsets), ((barNumber - 1) * trackSpecificOnsets) + (trackSpecificOnsets))
        const previousBarTicks = Array()
        for (let x = 0; x < previousBar.length; x++) {
          previousBarTicks.push(previousBar[x].ticks)
        }
        //console.log(previousBarTicks)
        if ( (barNumber % phaseShiftPeriod == 0) && (players[t].name == ("track2") || players[t].name == ("track4")) ) { // Shift notes in next bar
          for (let noteIndex = 0; noteIndex < previousBarTicks.length; noteIndex++) {
            newTicks = previousBarTicks[noteIndex] + oneBarInTicks + phaseShiftAmount * trackSpecificPulseInTicks
            //console.log("new ticks: " + newTicks + " limit " + (oneBarInTicks + oneBarInTicks * barNumber))
            if (newTicks >= (oneBarInTicks + oneBarInTicks * barNumber)) { // New position of onset is beyond the limits of this bar
              newTicks = newTicks - oneBarInTicks            // Circshift
            }
            createNote(players[t], newTicks, trackSpecificPulseInTicks)
          }
        } else { //no shift, just copy previous bar
          for (let noteIndex = 0; noteIndex < previousBarTicks.length; noteIndex++) {
            newTicks = previousBar[noteIndex].ticks + oneBarInTicks
            createNote(players[t], newTicks, trackSpecificPulseInTicks)
          }
        }
      }
    }
  }
  return midiInProgress
}


function pitch(){
  if (Math.random() > 0.1){
    return get_random(scale)
  }
  else {return 'C'}
}

function get_random (list) {
  return list[Math.floor((Math.random()*list.length))];
}


function createNote(track_, timeTicks, pulseInTicks_){
  track_.addNote({
    pitch: pitch(),
    octave: 4,
    ticks: timeTicks,
    durationTicks: pulseInTicks_,
    velocity: vel()
  })
}

// creates random velocity,
function vel(){
  var vel_ = Math.random()
  if (vel_ < 0.5){ // needed as a velocity of zero means no note
    vel_ = vel_ + 0.4
  }

  return vel_
}


function howManyTracks(midiObject, num){
  if( num < 4){
    num = 4 - num
    for(let i = 0; i < num; i++ ){
      midiObject.tracks.pop();
    }
  }
}
