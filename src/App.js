import { useState, useEffect  } from 'react';
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

import { db } from "./firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

import Game from "./Game";

provider.setCustomParameters({
  hd: "lewisu.edu"
});

function Profile({ user }) {
  // Added state to display all users 
  const [allUsers, setAllUsers] = useState([]);

  // Added state for file upload
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  // Added save current user info to Firestore 
  const saveUser = async () => {
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
      });
      console.log("User info saved!");
      alert("Saved user info!");
    } catch (err) {
      console.error("Saving error:", err);
    }
  };

    // Added retrieve all users from Firestore 
  const showAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));

      if (querySnapshot.empty) {
        setAllUsers([]);
        return;
      }

      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push(doc.data());
      });
      setAllUsers(usersList);
    } catch (err) {
      console.error("Error retrieving data:", err);
    }
  };

// Added upload file
const uploadFile = async () => {
  if (!file) return;

  try {
    const fileRef = ref(storage, `uploads/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);

    alert("File uploaded!");

    // reload files after upload
    const listRef = ref(storage, `uploads/${user.uid}/`);
    const res = await listAll(listRef);

    const urls = await Promise.all(
      res.items.map((item) => getDownloadURL(item))
    );

    setFiles(urls);
  } catch (err) {
    console.error("Upload error:", err);
  }
};

// Added load files on mount
useEffect(() => {
  const loadFiles = async () => {
    try {
      const listRef = ref(storage, `uploads/${user.uid}/`); 
      const res = await listAll(listRef);

      const urls = await Promise.all(
        res.items.map((item) => getDownloadURL(item))
      );

      setFiles(urls);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  loadFiles();
}, [user.uid]);

  return (
    <div className="user">
      {/* Added logout */} 
      <div style={{ position: 'absolute', top: '10px', left: '20px' }}>
        <p>Welcome, {user.displayName}</p>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>

      <div className="user-info" style={{ marginTop: '100px' }}>
        {/* Added Firestore UI */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={saveUser}>Save My Info</button>
          <button onClick={showAllUsers} style={{ marginLeft: "10px" }}>
            Show All Players
          </button>
        </div>

        {/* Display all users */}
        <div>
          {allUsers.length === 0 ? null : (
            <div>
              <h3>All Players:</h3>
              {allUsers.map((u, index) => (
                <p key={index}>
                  {u.name} - {u.email} 
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Added storage UI */}
        <div style={{ marginTop: "30px" }}>
          <h3>Upload File</h3>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={uploadFile} style={{ marginLeft: "10px" }}>
            Upload
          </button>
        </div>

        {/* Display uploaded files */}
        <div style={{ marginTop: "20px" }}>
          {files.length === 0 ? null : (
            <div>
              <h3>Uploaded Files:</h3>
              {files.map((url, index) => (
                <p key={index}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* AUTH WRAPPER */
export default function App() {
  const [user, setUser] = useState(null);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!currentUser.email.endsWith("@lewisu.edu")) {
          alert("Please use your school email.");
          signOut(auth);
          return;
        }
      }
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  if (!user) {
    return (
      <div>
        <h1>Please Login to Play</h1>
        <button onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setShowGame(false)} style={{ marginTop: "80px" }}>Profile</button>
      <button onClick={() => setShowGame(true)}>Game</button>
      {showGame ? <Game user={user} /> : <Profile user={user} />}
    </div>
  );
}



