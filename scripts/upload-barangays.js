const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// IMPORTANT: 
// 1. Download your service account key file from your Firebase project settings.
// 2. Rename it to 'serviceAccountKey.json'.
// 3. Place it in the same 'scripts' directory as this file.
const serviceAccount = require('./serviceAccountKey.json');

// The name of the collection you want to upload to.
const COLLECTION_NAME = 'barangays';
// The path to the file containing the list of barangays.
const FILE_PATH = path.join(__dirname, 'barangays.txt');
// ---------------------

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Firebase Admin SDK initialization failed.', error);
  console.log('Please make sure you have a valid serviceAccountKey.json file in the scripts directory.');
  process.exit(1);
}


const db = admin.firestore();

async function uploadBarangays() {
  console.log(`Reading barangays from ${FILE_PATH}...`);

  let fileContent;
  try {
    fileContent = fs.readFileSync(FILE_PATH, 'utf8');
  } catch (error) {
    console.error(`Error reading file at ${FILE_PATH}.`, error);
    console.log('Please make sure the barangays.txt file exists in the scripts directory.');
    process.exit(1);
  }
  
  const barangayNames = fileContent.split(/\r?\n/).filter(name => name.trim() !== '' && !name.startsWith('#'));

  if (barangayNames.length === 0) {
    console.log('No barangay names found in the file. Nothing to upload.');
    return;
  }

  console.log(`Found ${barangayNames.length} barangays to upload to the '${COLLECTION_NAME}' collection.`);

  const batch = db.batch();
  let count = 0;

  for (const name of barangayNames) {
    const docRef = db.collection(COLLECTION_NAME).doc(); // Auto-generate document ID
    batch.set(docRef, { name: name.trim() });
    count++;
    console.log(`  - Staging '${name.trim()}' for upload.`);
  }

  try {
    await batch.commit();
    console.log(`\nSuccessfully uploaded ${count} barangays to Firestore!`);
  } catch (error) {
    console.error('Error committing batch to Firestore:', error);
  }
}

console.log('--- Barangay Uploader ---');
uploadBarangays().catch(error => {
  console.error('An unexpected error occurred:', error);
});

/*
Instructions:

1.  **Install Dependencies:**
    If you don't have the 'firebase-admin' package installed, open your terminal in the project root and run:
    npm install firebase-admin

2.  **Get Service Account Key:**
    - Go to your Firebase project console.
    - Click on the gear icon next to 'Project Overview' and select 'Project settings'.
    - Go to the 'Service accounts' tab.
    - Click on 'Generate new private key'. A JSON file will be downloaded.
    - Rename this file to 'serviceAccountKey.json'.
    - Move this file into the 'scripts' directory.

3.  **Populate barangays.txt:**
    - Open the 'scripts/barangays.txt' file.
    - Add the names of your barangays, one name per line.

4.  **Run the script:**
    - Open your terminal in the project root.
    - Run the script using node:
      node scripts/upload-barangays.js
*/
