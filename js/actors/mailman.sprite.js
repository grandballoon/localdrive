// The mailman, as editable pixel grids. One character = one scene pixel,
// "." is transparent, every other character is a key into PALETTE.
// All rows in a grid must be the same width (bakeSprite enforces this).
//
// He faces the viewer. The raised, waving arm is a separate overlay (ARM) so
// it can animate; BODY simply leaves that arm off below the shoulder.

export const PALETTE = {
  K: '#2a1a2e', // outline
  B: '#8db7d9', // uniform blue
  L: '#b5d6ec', // uniform highlight
  b: '#6692bb', // uniform shade
  d: '#44688f', // uniform deep shade, cap visor
  N: '#2c3e63', // navy: cap band, tie, belt
  G: '#f2b33d', // brass: cap badge, buttons, buckle
  S: '#f2bd95', // skin
  s: '#d4936c', // skin shade
  R: '#e77f6e', // cold-rosy cheeks
  M: '#8a7f86', // grey brows and moustache
  W: '#fff6e0', // shirt collar, teeth
  F: '#efe3c8', // ear-flap fleece
  f: '#cdbb9a', // fleece shade
  T: '#9a5526', // satchel leather
  t: '#653417', // satchel leather shade
  O: '#1f1520', // shoes
  r: '#b8342f', // mitten
  q: '#7f1f22', // mitten cuff
};

// Rows [0, LEG_ROW) breathe up and down by a pixel; the legs stay planted.
export const LEG_ROW = 32;

export const BODY = [
  '........KKKKKKKKKK........',
  '......KKLLLLLLLLLLKK......',
  '.....KLBBBBBBBBBBBBbK.....',
  '.....KBBBBBBBBBBBBBbK.....',
  '.....KbBBBBBGGBBBBbbK.....',
  '.....KNNNNNNGGNNNNNNK.....',
  '....KBFNNNNNNNNNNNNFBK....',
  '....KBFddddddddddddFBK....',
  '....KBFsSMMSSSSMMSsFBK....',
  '....KBFSSSKSSSSKSSSFBK....',
  '....KBFSSSKSSSSKSSSFBK....',
  '....KBFSRRSSssSSRRSFBK....',
  '....KBFSSSMMMMMMSSSFBK....',
  '....KBFSSMMSWWSMMSSFBK....',
  '....KbFfsSSSSSSSSsfFbK....',
  '.....KFFKsSSSSSSsKFFK.....',
  '......KKKKWWNNWWKKKK......',
  '...KKLBBBBbWNNWbBBBBbKK...',
  '..KLBBBTTBbWNNWbBBBBBBbK..',
  '......KBTTbbNNbBBBBdBBbK..',
  '......KLBTTbNNBBBBBdBBbK..',
  '......KLBBTTNNBBBBBdBBbK..',
  '......KLBBBTTBBBBBBdBBbK..',
  '......KLBBBBTTBBBBBdBBbK..',
  '......KLBBBBGTTBBBBdBBbK..',
  '......KNNNNNGNTTNNNdBBbK..',
  '......KLBBBBBBKKKKKdBBbKK.',
  '......KLBBBBBBKTTTTdBBbTK.',
  '......KLBBBBGBKTTTTKSSKTK.',
  '......KLBBBBBBKTTTTKSSKTK.',
  '......KLBBBBBBKttttTKKTtK.',
  '......KbbbbbbbKTTGTTTTTtK.',
  '......KbBBBdKbKTTTTTTTTtK.',
  '......KbBBBdKbKTTTTTTTTtK.',
  '......KbBBBdKbKtttttttttK.',
  '......KbBBBdKbKKKKKKKKKK..',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '......KbBBBdKbBBBdK.......',
  '.....KKOOOOOKOOOOOKK......',
  '....KOOOOOOOKOOOOOOOK.....',
  '....KKKKKKKKKKKKKKKKK.....',
];

// Eye pixels (x, y within BODY), painted over with skin to blink.
export const EYES = [[10, 9], [15, 9]];

// Where his breath fogs from, within BODY.
export const MOUTH = { x: 18, y: 13 };

// The waving arm: two frames, drawn at BODY's origin plus this offset.
export const ARM = {
  dx: -4,
  dy: 6,
  frames: [
    [
      '.KKK......',
      'KrrrK.....',
      'KrrrrK....',
      'KrrrrK....',
      '.KqqK.....',
      '.KLBbK....',
      '..KLBbK...',
      '..KLBBbK..',
      '...KLBBbK.',
      '....KLBBbK',
      '.....KLBBb',
      '......KLBB',
      '.......KLB',
      '........KK',
    ],
    [
      '...KKK....',
      '..KrrrK...',
      '..KrrrrK..',
      '..KrrrrK..',
      '...KqqK...',
      '...KLBbK..',
      '...KLBbK..',
      '...KLBBbK.',
      '...KLBBbK.',
      '....KLBBbK',
      '.....KLBBb',
      '......KLBB',
      '.......KLB',
      '........KK',
    ],
  ],
};
