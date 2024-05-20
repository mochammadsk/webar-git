import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { storage, db } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Setup dasar Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webglCanvas"),
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const loader = new GLTFLoader();

function uploadFile(file, filePath) {
  const storageRef = ref(storage, filePath);
  return uploadBytes(storageRef, file)
    .then((snapshot) => {
      return getDownloadURL(snapshot.ref);
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      throw error;
    });
}

function loadModel(url) {
  loader.load(
    url,
    (gltf) => {
      scene.add(gltf.scene);
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
}

function saveModelConfig(userId, modelConfig) {
  return setDoc(doc(db, "users", userId), {
    models: modelConfig,
  });
}

function getModelConfig(userId) {
  const docRef = doc(db, "users", userId);
  return getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      return docSnap.data().models;
    } else {
      console.log("No such document!");
      return null;
    }
  });
}

document.getElementById("uploadButton").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (file) {
    const filePath = `models/${file.name}`;
    uploadFile(file, filePath)
      .then((url) => {
        console.log("Model uploaded, URL:", url);
        loadModel(url);
      })
      .catch((error) => {
        console.error("Error during upload and load:", error);
      });
  } else {
    console.error("No file selected");
  }
});

document.getElementById("saveConfigButton").addEventListener("click", () => {
  const posX = parseFloat(document.getElementById("posX").value);
  const posY = parseFloat(document.getElementById("posY").value);
  const posZ = parseFloat(document.getElementById("posZ").value);

  const modelConfig = {
    position: { x: posX, y: posY, z: posZ },
  };

  const userId = "some-unique-user-id";
  saveModelConfig(userId, modelConfig)
    .then(() => {
      console.log("Model configuration saved!");
    })
    .catch((error) => {
      console.error("Error saving model configuration:", error);
    });
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
