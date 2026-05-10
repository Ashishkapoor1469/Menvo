const fs = require('fs');
const path = require('path');

async function test() {
  console.log('Registering user...');
  const regRes = await fetch('http://localhost:3000/menvo/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_upload@menvo.com',
      password: 'password123',
      name: 'Test Upload User'
    })
  });
  let token = '';
  if (regRes.ok) {
    const data = await regRes.json();
    token = data.access_token;
  } else {
    // try login
    const loginRes = await fetch('http://localhost:3000/menvo/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_upload@menvo.com',
        password: 'password123'
      })
    });
    const data = await loginRes.json();
    token = data.accessToken;
    if (!token) console.log('Login failed:', data);
  }

  
  if (!token) throw new Error('Could not get token');
  
  console.log('Got token, creating test image...');
  const imgPath = path.join(__dirname, 'test.png');
  // Create a simple 1x1 png file
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  fs.writeFileSync(imgPath, Buffer.from(base64Png, 'base64'));

  console.log('Uploading test image...');
  const formData = new FormData();
  const blob = new Blob([fs.readFileSync(imgPath)], { type: 'image/png' });
  formData.append('file', blob, 'test.png');

  const uploadRes = await fetch('http://localhost:3000/menvo/v1/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Result:', uploadData);

  if (uploadData.url && uploadData.url.includes('cloudinary')) {
    console.log('SUCCESS: Cloudinary upload is working!');
  } else {
    console.error('FAILED: Cloudinary upload failed!');
  }
}

test().catch(console.error);
