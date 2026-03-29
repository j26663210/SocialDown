import fs from 'fs';

async function test() {
  try {
    const response = await fetch('https://api.instagram.com/oembed?url=https://www.instagram.com/p/C2_d2-hN1Z_/');
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

test();
