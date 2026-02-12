# Configuração do Firebase

## 🔥 Setup do Firebase

Este projeto usa o Firebase Admin SDK para operações server-side.

### Variáveis de Ambiente

As seguintes variáveis devem estar configuradas no arquivo `.env`:

```env
FIREBASE_API_KEY=sua-api-key
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
FIREBASE_APP_ID=seu-app-id
FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

### Service Account Key (Opcional - Recomendado para Produção)

Para uso em produção, é recomendado usar um Service Account Key:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** > **Contas de Serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo JSON em um local seguro (ex: `src/config/serviceAccountKey.json`)
6. Adicione o caminho no `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY=./src/config/serviceAccountKey.json
   ```
7. **IMPORTANTE**: Adicione o arquivo no `.gitignore` para não commitá-lo!

### Serviços Disponíveis

O arquivo `firebase.config.js` exporta os seguintes serviços:

- `db` - Firestore Database
- `auth` - Authentication
- `storage` - Cloud Storage
- `admin` - Firebase Admin completo

### Exemplo de Uso

```javascript
const { db, auth } = require('../config/firebase.config');

// Firestore
const usersRef = db.collection('users');
const snapshot = await usersRef.get();

// Authentication
const user = await auth.getUser(uid);

// Storage
const bucket = storage.bucket();
```

## 📚 Documentação

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)
