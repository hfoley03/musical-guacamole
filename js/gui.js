// ------- P5 JS -----

let w = window.innerWidth;
let h = window.innerHeight;
let pulses = pulsesA;
let pulses_2 = pulsesB;
let onset_1 = binaryRhythmA;
let onset_2 = binaryRhythmB;
let onset_3 = binaryRhythmA;

let gen_button;
let play_button;
let stop_button;

let All_Synths = ['AMSynth',
  'DuoSynth',
  'FMSynth',
  'MembraneSynth',
  'MetalSynth',
  'MonoSynth',
  'NoiseSynth',
  'PluckSynth',
  'PolySynth',
  'Sampler',
  'Synth']

var bg;

function preload(){
  bg = loadImage("https://raw.githubusercontent.com/Rabbid76/graphics-snippets/master/resource/texture/background.jpg")
  bg = loadImage("https://cdn.videoplasty.com/animation/merry-christmas-background-and-giftcard-stock-animation-16874-1280x720.jpg")
}
function setup() {
  frameRate(100)
  createCanvas(w,h);

  tr1 = createSelect();
  tr1.position(110, 10);
  tr2 = createSelect();
  tr2.position(110, 30);
  tr3 = createSelect();
  tr3.position(110, 50);
  tr4 = createSelect();
  tr4.position(110, 70);
  for( i = 0; i<All_Synths.length;i++){
    tr1.option(All_Synths[i]);
    tr2.option(All_Synths[i]);
    tr3.option(All_Synths[i]);
    tr4.option(All_Synths[i]);
  }
  tr1.selected('MembraneSynth');
  tr2.selected('PluckSynth');
  tr3.selected('MembraneSynth');
  tr4.selected('PluckSynth');


  gen_button = createButton('Generate');
  gen_button.position(1000, 180);
  gen_button.style('background-color', '#02c39a');
  gen_button.style('border-radius' , 50 + '%');
  gen_button.style('z-index',  100);
  gen_button.mousePressed(function() {
    clear()

    stop_aud();
    phaseShiftAmount = parseInt(phaseShiftAmountInp.value());                   // How many pulses is each shift
    phaseShiftPeriod = parseInt(phaseShiftAmountInp.value());                   // After how many bars does a shift occur
    length = parseInt(lengthInp.value());                            // Length of total piece
    numberOfTracks = parseInt(numberOfTracksInp.value());
    onsetsA = parseInt(inp.value());
    onsetsB = parseInt(inp3.value());
    pulsesA = parseInt(inp2.value());
    pulsesB = parseInt(inp4.value());
    generateMidi(onsetsA, pulsesA, onsetsB, pulsesB);
    pulses = pulsesA;
    pulses_2 = pulsesB;
    onset_1 = binaryRhythmA;
    onset_2 = binaryRhythmB;
    onset_3 = binaryRhythmA;


  });

  play_button= createButton('Play');
  play_button.position(100, 150);
  play_button.mousePressed(start_aud_gui);

  stop_button= createButton('Stop');
  stop_button.position(100, 200);
  stop_button.mousePressed(stop_aud);


  let inp = createInput(onsetsA.toString());
  inp.position(1000, 10);
  inp.size(100);

  let inp2 = createInput(pulsesA.toString());
  inp2.position(1000, 30);
  inp2.size(100);

  let inp3 = createInput(onsetsB.toString());
  inp3.position(1000, 50);
  inp3.size(100);

  let inp4 = createInput(pulsesB.toString());
  inp4.position(1000, 70);
  inp4.size(100);

  let phaseShiftAmountInp = createInput(phaseShiftAmount.toString());
  phaseShiftAmountInp.position(1000, 90);
  phaseShiftAmountInp.size(100);

  let phaseShiftPeriodInp = createInput(phaseShiftPeriod.toString());
  phaseShiftPeriodInp.position(1000, 110);
  phaseShiftPeriodInp.size(100);

  let lengthInp = createInput(length.toString());
  lengthInp.position(1000, 130);
  lengthInp.size(100);

  let numberOfTracksInp = createInput(numberOfTracks.toString());
  numberOfTracksInp.position(1000, 150);
  numberOfTracksInp.size(100);

}

function draw() {
  //background('#141430')
  background(bg)
  textSize(20);
  fill('#0');
  text('1st Track', 5, 18);


  textSize(20);
  text('2nd Track', 5, 38);

  textSize(20);
  text('3rd Track', 5, 58);

  text('4th Track', 5, 78);

  text('Onsets 1st Track', 800, 18);

  text('Pulses 1st Track', 800, 38);

  text('Onsets 2nd Track', 800, 58);

  text('Pulses 2nd Track', 800, 78);

  text('Phase Shift Amount', 800, 98)
  text('Phase Shift Period', 800, 118)
  text('Piece length', 800, 138)
  text('Number of Tracks', 800, 158)



  //background(220);
  let c = w/4; //center
  let r = w/8; // radious main circle
  // main circle
  fill('#003459');
  circle(c, c, 2*r);

  for (let i = 0; i < pulses; i ++){
    //console.log(i)
    let n_x = c+(r*cos(i*2*PI/pulses));
    let n_y = c+(r*sin(i*2*PI/pulses));
    fill(255,255,255);
    circle(n_x,n_y, c/10);
    if (onset_1[i]==1){
      fill('#02c39a');
      circle(n_x,n_y, c/10);
    }
  }

  // Second circle
  fill('#028090');
  circle(c, c, 2*r*0.7);

  for (let i = 0; i < pulses_2; i ++){
    let n_x = c+(r*0.7*cos(i*2*PI/pulses_2));
    let n_y = c+(r*0.7*sin(i*2*PI/pulses_2));

    fill(255,255,255);
    circle(n_x,n_y, c/10);
    if (onset_2[i]==1){
      fill('#fce38a');
      circle(n_x,n_y, c/10);
    }
  }

  // third circle
/*
  fill('#003459');
  circle(c, c, 2*r*0.4);

  for (let i = 0; i < pulses_2; i ++){
    let n_x = c+(r*0.4*cos(i*2*PI/pulses_2));
    let n_y = c+(r*0.4*sin(i*2*PI/pulses_2));

    fill(255,255,255);
    circle(n_x,n_y, c/10);
    if (onset_3[i]==1){
      fill('#02c39a');
      circle(n_x,n_y, c/10);
    }
  }*/
}

function start_aud_gui(){
  SynthTypes = [tr1.value(),tr2.value(),tr3.value(),tr4.value()];
  console.log('audio started');
  start_aud();
}
