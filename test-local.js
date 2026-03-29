import fs from 'fs';

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        format: 'mp4',
        quality: '1080p',
        platform: 'youtube'
      })
    });
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}

test();
