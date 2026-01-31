// Firebase Configuration for SRIDEVI HOME FOODS
const firebaseConfig = {
    apiKey: "AIzaSyCTfXqLq8qKq8qKq8qKq8qKq8qKq8qKq8",
    authDomain: "sridevi-home-foods.firebaseapp.com",
    projectId: "sridevi-home-foods",
    storageBucket: "sridevi-home-foods.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345678"
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
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Enable offline persistence
    db.enablePersistence()
        .then(() => {
            console.log('✅ Firestore offline persistence enabled');
        })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('⚠️ The current browser does not support persistence.');
            }
        });
}

// Firebase Collections
const collections = {
    products: 'products',
    orders: 'orders',
    categories: 'categories',
    settings: 'settings',
    users: 'users'
};

// Firebase Manager Class
class FirebaseManager {
    constructor() {
        this.db = db;
        this.auth = auth;
        this.unsubscribeFunctions = [];
    }

    // Generic CRUD Operations
    async createDocument(collection, data, id = null) {
        try {
            const docRef = id ? 
                this.db.collection(collection).doc(id) : 
                this.db.collection(collection).doc();
            
            const document = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await docRef.set(document);
            console.log(`✅ Document created in ${collection}:`, docRef.id);
            return { id: docRef.id, ...document };
        } catch (error) {
            console.error(`❌ Error creating document in ${collection}:`, error);
            throw error;
        }
    }

    async getDocument(collection, id) {
        try {
            const docRef = this.db.collection(collection).doc(id);
            const doc = await docRef.get();
            
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            } else {
                console.log(`⚠️ Document not found in ${collection}:`, id);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error getting document from ${collection}:`, error);
            throw error;
        }
    }

    async getAllDocuments(collection, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            const querySnapshot = await this.db
                .collection(collection)
                .orderBy(orderBy, orderDirection)
                .get();
            
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() });
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
            const docRef = this.db.collection(collection).doc(id);
            const document = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await docRef.update(document);
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
            await this.db.collection(collection).doc(id).delete();
            console.log(`✅ Document deleted from ${collection}:`, id);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting document from ${collection}:`, error);
            throw error;
        }
    }

    // Real-time listeners
    onCollectionChange(collection, callback, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            const unsubscribe = this.db
                .collection(collection)
                .orderBy(orderBy, orderDirection)
                .onSnapshot((snapshot) => {
                    const documents = [];
                    snapshot.forEach((doc) => {
                        documents.push({ id: doc.id, ...doc.data() });
                    });
                    callback(documents);
                });
            
            this.unsubscribeFunctions.push(unsubscribe);
            console.log(`✅ Real-time listener attached to ${collection}`);
            return unsubscribe;
        } catch (error) {
            console.error(`❌ Error setting up listener for ${collection}:`, error);
            throw error;
        }
    }

    onDocumentChange(collection, id, callback) {
        try {
            const unsubscribe = this.db
                .collection(collection)
                .doc(id)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        callback({ id: doc.id, ...doc.data() });
                    } else {
                        callback(null);
                    }
                });
            
            this.unsubscribeFunctions.push(unsubscribe);
            console.log(`✅ Real-time listener attached to ${collection}/${id}`);
            return unsubscribe;
        } catch (error) {
            console.error(`❌ Error setting up document listener for ${collection}/${id}:`, error);
            throw error;
        }
    }

    // Query operations
    async queryDocuments(collection, field, operator, value, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            const querySnapshot = await this.db
                .collection(collection)
                .where(field, operator, value)
                .orderBy(orderBy, orderDirection)
                .get();
            
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() });
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
        this.unsubscribeFunctions.forEach(unsubscribe => {
            unsubscribe();
        });
        this.unsubscribeFunctions = [];
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
