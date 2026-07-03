const firebaseConfig = window.FIRE_DASHBOARD_FIREBASE_CONFIG || {};
const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];
const isConfigured = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));

const cloudBadge = document.getElementById("cloudBadge");
const cloudStatus = document.getElementById("cloudStatus");
const signedOutPanel = document.getElementById("signedOutPanel");
const signedInPanel = document.getElementById("signedInPanel");
const signedInUser = document.getElementById("signedInUser");
const googleSignIn = document.getElementById("googleSignIn");
const emailAuthForm = document.getElementById("emailAuthForm");
const signUpButton = document.querySelector('[data-auth-action="signup"]');
const signOutButton = document.getElementById("signOutButton");

function setCloudStatus(message, state = "idle") {
  cloudStatus.textContent = message;
  cloudBadge.textContent = state === "connected" ? "同期中" : state === "error" ? "エラー" : "未接続";
  cloudBadge.classList.toggle("is-connected", state === "connected");
  cloudBadge.classList.toggle("is-error", state === "error");
}

function setControlsDisabled(disabled) {
  [googleSignIn, ...emailAuthForm.elements, signUpButton, signOutButton].forEach((control) => {
    if (control) control.disabled = disabled;
  });
}

function authErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "このメールアドレスは登録済みです",
    "auth/invalid-credential": "メールアドレスまたはパスワードが違います",
    "auth/invalid-email": "メールアドレスを確認してください",
    "auth/weak-password": "パスワードは6文字以上にしてください",
    "auth/popup-closed-by-user": "ログインがキャンセルされました"
  };
  return messages[error?.code] || "ログインまたは同期に失敗しました";
}

if (!isConfigured) {
  setControlsDisabled(true);
  setCloudStatus("アカウントを作成してデータを同期できます");
} else {
  initializeCloudSync().catch((error) => {
    console.error("Firebase initialization failed", error);
    setControlsDisabled(true);
    setCloudStatus("クラウド同期の初期化に失敗しました", "error");
  });
}

async function initializeCloudSync() {
  const firebaseVersion = "12.7.0";
  const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-firestore.js`)
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  await authModule.setPersistence(auth, authModule.browserLocalPersistence);
  const db = firestoreModule.initializeFirestore(app, {
    localCache: firestoreModule.persistentLocalCache({
      tabManager: firestoreModule.persistentMultipleTabManager()
    })
  });

  let currentUser = null;
  let unsubscribeSnapshot = null;
  let syncTimer = null;

  async function writeState(user, dashboardState) {
    if (!user || !dashboardState) return;
    await firestoreModule.setDoc(
      firestoreModule.doc(db, "users", user.uid),
      { state: dashboardState, updatedAt: firestoreModule.serverTimestamp() },
      { merge: true }
    );
    setCloudStatus("最新データを同期しました", "connected");
  }

  function watchUserData(user) {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    const userRef = firestoreModule.doc(db, "users", user.uid);
    unsubscribeSnapshot = firestoreModule.onSnapshot(userRef, (snapshot) => {
      const remoteState = snapshot.data()?.state;
      if (remoteState && window.fireDashboard) {
        window.fireDashboard.applyCloudState(remoteState);
        setCloudStatus(snapshot.metadata.fromCache ? "端末内データを表示中" : "クラウドと同期済み", "connected");
      }
    }, (error) => {
      console.error("Firestore listener failed", error);
      setCloudStatus("同期データを読み込めませんでした", "error");
    });
  }

  window.addEventListener("fire-dashboard-state-saved", (event) => {
    if (!currentUser) return;
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      writeState(currentUser, event.detail?.state).catch((error) => {
        console.error("Firestore write failed", error);
        setCloudStatus("保存データを同期できませんでした", "error");
      });
    }, 350);
  });

  googleSignIn.addEventListener("click", async () => {
    try {
      const provider = new authModule.GoogleAuthProvider();
      await authModule.signInWithRedirect(auth, provider);
    } catch (error) {
      setCloudStatus(authErrorMessage(error), "error");
    }
  });

  emailAuthForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(emailAuthForm);
    try {
      await authModule.signInWithEmailAndPassword(auth, form.get("email"), form.get("password"));
    } catch (error) {
      setCloudStatus(authErrorMessage(error), "error");
    }
  });

  signUpButton.addEventListener("click", async () => {
    if (!emailAuthForm.reportValidity()) return;
    const form = new FormData(emailAuthForm);
    try {
      await authModule.createUserWithEmailAndPassword(auth, form.get("email"), form.get("password"));
    } catch (error) {
      setCloudStatus(authErrorMessage(error), "error");
    }
  });

  signOutButton.addEventListener("click", () => authModule.signOut(auth));

  authModule.onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    signedOutPanel.hidden = Boolean(user);
    signedInPanel.hidden = !user;
    signedInUser.textContent = user?.email || user?.displayName || "ログイン済み";

    if (!user) {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeSnapshot = null;
      setCloudStatus("ログインすると端末間で同期できます");
      return;
    }

    setCloudStatus("データを確認中", "connected");
    const userRef = firestoreModule.doc(db, "users", user.uid);
    const snapshot = await firestoreModule.getDoc(userRef);
    if (!snapshot.exists()) {
      await writeState(user, window.fireDashboard?.getState());
    } else if (snapshot.data()?.state) {
      window.fireDashboard?.applyCloudState(snapshot.data().state);
    }
    watchUserData(user);
  });
}
