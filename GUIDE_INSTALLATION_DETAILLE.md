# 🚀 Guide d'Installation NonoTalk - Étape par Étape

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### **Windows :**
- **Python 3.8+** : [Télécharger ici](https://www.python.org/downloads/)
- **Node.js 18+** : [Télécharger ici](https://nodejs.org/)
- **Git** (optionnel) : [Télécharger ici](https://git-scm.com/)

### **Mac :**
- **Python 3.8+** : Déjà installé ou via Homebrew `brew install python`
- **Node.js 18+** : [Télécharger ici](https://nodejs.org/) ou `brew install node`

### **Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm
```

---

## 📦 Installation de NonoTalk

### **Étape 1 : Télécharger et extraire**

1. **Télécharger** le fichier `nonotalk-final-optimized.zip`
2. **Extraire** le contenu dans un dossier (ex: `C:\NonoTalk\` ou `~/NonoTalk/`)
3. **Ouvrir** deux terminaux/invites de commande

---

### **Étape 2 : Configuration du Backend (Terminal 1)**

#### **Windows :**
```cmd
cd C:\NonoTalk\nonotalk-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

#### **Mac/Linux :**
```bash
cd ~/NonoTalk/nonotalk-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

**✅ Résultat attendu :**
```
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[votre-ip]:5000
```

**⚠️ IMPORTANT :** Laissez ce terminal ouvert !

---

### **Étape 3 : Configuration du Frontend (Terminal 2)**

#### **Windows :**
```cmd
cd C:\NonoTalk\nonotalk-frontend
npm install -g pnpm
pnpm install
pnpm run dev --host
```

#### **Mac/Linux :**
```bash
cd c:/NonoTalk/nonotalk-frontend
npm install -g pnpm
pnpm install
pnpm run dev --host
```

**✅ Résultat attendu :**
```
VITE v6.3.5  ready in 1234 ms
➜  Local:   http://localhost:5174/
➜  Network: http://192.168.x.x:5174/
```

---

### **Étape 4 : Accéder à l'application**

1. **Ouvrir votre navigateur** (Chrome, Firefox, Safari, Edge)
2. **Aller à l'adresse :** `http://localhost:5174`
3. **L'application NonoTalk** devrait s'afficher !

---

## 🧪 Test de l'Application

### **Test 1 : Création de compte**
1. Cliquer sur **"Créer un compte"**
2. Saisir un nom d'utilisateur (ex: `test`)
3. Saisir un PIN 4 chiffres (ex: `1234`)
4. Cliquer sur **"Créer mon compte"**
5. ✅ Vous devriez être redirigé vers la page de connexion

### **Test 2 : Connexion**
1. Saisir votre nom d'utilisateur
2. Saisir votre PIN
3. Cliquer sur **"Se connecter"**
4. ✅ Vous devriez voir l'interface de chat avec l'avatar d'accueil

### **Test 3 : Chat vocal** 🎤
1. Cliquer sur le bouton **microphone** 🎤
2. **Parler** dans votre micro (ex: "Bonjour Nono")
3. **Attendre 2 secondes** de silence
4. ✅ L'enregistrement s'arrête automatiquement
5. ✅ Votre message apparaît et l'IA répond

### **Test 4 : Upload d'image** 📎
1. Cliquer sur le bouton **pièce jointe** 📎
2. Sélectionner une image
3. ✅ L'image s'affiche dans le chat
4. ✅ L'IA analyse et répond

---

## 🔧 Résolution de Problèmes

### **Problème : "Port 5000 déjà utilisé"**
**Solution :** Arrêter les autres applications sur le port 5000 ou modifier le port dans `src/main.py`

### **Problème : "pnpm command not found"**
**Solution :** 
```bash
npm install -g pnpm
```

### **Problème : "Module not found"**
**Solution :** Réinstaller les dépendances
```bash
# Backend
pip install -r requirements.txt

# Frontend  
pnpm install
```

### **Problème : Microphone ne fonctionne pas**
**Solution :** 
- Autoriser l'accès au microphone dans votre navigateur
- Utiliser HTTPS ou localhost (requis pour l'API microphone)

---

## 📱 Test sur Mobile

### **Étape 1 : Trouver votre IP**

#### **Windows :**
```cmd
ipconfig
```
Chercher "Adresse IPv4"

#### **Mac/Linux :**
```bash
ifconfig | grep inet
```

### **Étape 2 : Accès mobile**
1. **Connecter** votre téléphone au même WiFi
2. **Ouvrir** le navigateur mobile
3. **Aller à :** `http://[votre-ip]:5174`
4. ✅ L'application fonctionne sur mobile !

---

## 🛑 Arrêter l'Application

1. **Terminal Backend :** Appuyer sur `Ctrl+C`
2. **Terminal Frontend :** Appuyer sur `Ctrl+C`

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier** que les deux terminaux sont ouverts
2. **Vérifier** les URLs : 
   - Backend : http://localhost:5000
   - Frontend : http://localhost:5174
3. **Redémarrer** les serveurs si nécessaire

---

## 🎯 Prêt pour la Production !

Une fois les tests validés, l'application est prête à être intégrée dans votre WebView Android !

**Bon test ! 🚀**

