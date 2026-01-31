// Firebase Configuration for SRIDEVI HOME FOODS
const firebaseConfig = {
    apiKey: "AIzaSyCTfXqLq8qKq8qKq8qKq8qKq8qKq8qKq8",
    authDomain: "sridevi-home-foods.firebaseapp.com",
    projectId: "sridevi-home-foods",
    storageBucket: "sridevi-home-foods.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345678",
    databaseURL: "https://sridevi-home-foods-f6874-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} else {
    console.warn('⚠️ Firebase SDK not loaded');
}

// Firebase services
let db, auth;

if (typeof firebase !== 'undefined') {
    // Use Real-time Database instead of Firestore
    db = firebase.database();
    auth = firebase.auth();
    
    console.log('✅ Real-time Database initialized');
}

// Firebase Collections
const collections = {
    products: 'products',
    orders: 'orders',
    categories: 'categories',
    settings: 'settings',
    users: 'users'
};

// Firebase Manager Class for Real-time Database
class FirebaseManager {
    constructor() {
        this.db = db;
        this.auth = auth;
        this.listeners = [];
    }

    // Generic CRUD Operations for Real-time Database
    async createDocument(collection, data, id = null) {
        try {
            const docId = id || this.db.ref(collection).push().key;
            const document = {
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            await this.db.ref(`${collection}/${docId}`).set(document);
            console.log(`✅ Document created in ${collection}:`, docId);
            return { id: docId, ...document };
        } catch (error) {
            console.error(`❌ Error creating document in ${collection}:`, error);
            throw error;
        }
    }

    async getDocument(collection, id) {
        try {
            const snapshot = await this.db.ref(`${collection}/${id}`).once('value');
            const document = snapshot.val();
            
            if (document) {
                return { id, ...document };
            } else {
                console.log(`⚠️ Document not found in ${collection}:`, id);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error getting document from ${collection}:`, error);
            throw error;
        }
    }

    async getAllDocuments(collection) {
        try {
            const snapshot = await this.db.ref(collection).once('value');
            const documents = [];
            
            snapshot.forEach((childSnapshot) => {
                documents.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            console.log(`✅ Retrieved ${documents.length} documents from ${collection}`);
            return documents;
        } catch (error) {
            console.error(`❌ Error getting documents from ${collection}:`, error);
            throw error;
        }
    }

    async updateDocument(collection, id, data) {
        try {
            const document = {
                ...data,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            await this.db.ref(`${collection}/${id}`).update(document);
            console.log(`✅ Document updated in ${collection}:`, id);
            
            // Return updated document
            const updatedDoc = await this.getDocument(collection, id);
            return updatedDoc;
        } catch (error) {
            console.error(`❌ Error updating document in ${collection}:`, error);
            throw error;
        }
    }

    async deleteDocument(collection, id) {
        try {
            await this.db.ref(`${collection}/${id}`).remove();
            console.log(`✅ Document deleted from ${collection}:`, id);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting document from ${collection}:`, error);
            throw error;
        }
    }

    // Real-time listeners
    onCollectionChange(collection, callback) {
        try {
            const ref = this.db.ref(collection);
            const listener = ref.on('value', (snapshot) => {
                const documents = [];
                snapshot.forEach((childSnapshot) => {
                    documents.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                callback(documents);
            });
            
            this.listeners.push({ ref, listener });
            console.log(`✅ Real-time listener attached to ${collection}`);
            return listener;
        } catch (error) {
            console.error(`❌ Error setting up listener for ${collection}:`, error);
            throw error;
        }
    }

    onDocumentChange(collection, id, callback) {
        try {
            const ref = this.db.ref(`${collection}/${id}`);
            const listener = ref.on('value', (snapshot) => {
                const document = snapshot.val();
                if (document) {
                    callback({ id, ...document });
                } else {
                    callback(null);
                }
            });
            
            this.listeners.push({ ref, listener });
            console.log(`✅ Real-time listener attached to ${collection}/${id}`);
            return listener;
        } catch (error) {
            console.error(`❌ Error setting up document listener for ${collection}/${id}:`, error);
            throw error;
        }
    }

    // Query operations (simplified for Real-time Database)
    async queryDocuments(collection, field, operator, value) {
        try {
            const snapshot = await this.db.ref(collection)
                .orderByChild(field)
                .equalTo(value)
                .once('value');
            
            const documents = [];
            snapshot.forEach((childSnapshot) => {
                documents.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            console.log(`✅ Query returned ${documents.length} documents from ${collection}`);
            return documents;
        } catch (error) {
            console.error(`❌ Error querying ${collection}:`, error);
            throw error;
        }
    }

    // Cleanup listeners
    cleanup() {
        this.listeners.forEach(({ ref, listener }) => {
            ref.off('value', listener);
        });
        this.listeners = [];
        console.log('✅ All Firebase listeners cleaned up');
    }

    // Authentication
    async signIn(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ User signed in:', result.user.email);
            return result.user;
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✅ User signed out');
            return true;
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    }

    onAuthChange(callback) {
        return this.auth.onAuthStateChanged(callback);
    }
}

// Global Firebase Manager instance
let firebaseManager;

// Initialize Firebase Manager
function initializeFirebase() {
    if (typeof firebase !== 'undefined' && db) {
        firebaseManager = new FirebaseManager();
        console.log('✅ Firebase Manager initialized');
        return firebaseManager;
    } else {
        console.warn('⚠️ Firebase not available, falling back to localStorage');
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FirebaseManager, initializeFirebase, firebaseConfig };
}
