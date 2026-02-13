import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { from, Observable, switchMap } from 'rxjs';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { LoginRequest, RegisterRequest, IUser } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'user_data';

  currentUser = signal<IUser | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
    this.initAuthListener();
  }

  // Carregar usuário do localStorage na inicialização
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log('✅ Usuário restaurado do localStorage:', user.email);
      } catch (error) {
        console.error('❌ Erro ao restaurar usuário do localStorage:', error);
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }

  // Listener para mudanças no estado de autenticação
  private initAuthListener(): void {
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('🔥 Firebase Auth: Usuário autenticado', firebaseUser.email);
        await this.loadUserData(firebaseUser.uid);
      } else {
        console.log('🔥 Firebase Auth: Usuário deslogado');
        // Não limpar o localStorage aqui para manter persistência
        // O logout manual que vai limpar
      }
    });
  }

  // Login com Firebase Authentication
  login(credentials: LoginRequest): Observable<IUser> {
    return from(
      signInWithEmailAndPassword(auth, credentials.email, credentials.password)
    ).pipe(
      switchMap(async (userCredential) => {
        const userData = await this.loadUserData(userCredential.user.uid);
        return userData!;
      })
    );
  }

  // Registro com Firebase Authentication
  register(data: RegisterRequest): Observable<IUser> {
    return from(
      createUserWithEmailAndPassword(auth, data.email, data.password)
    ).pipe(
      switchMap(async (userCredential) => {
        const firebaseUser = userCredential.user;

        // Atualizar perfil do Firebase
        await updateProfile(firebaseUser, {
          displayName: data.name
        });

        // Criar documento do usuário no Firestore
        const userData: IUser = {
          id: firebaseUser.uid,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: 'user',
          userType: 'produtor',
          numCRA: data.numCRA,
          questionsAndResponses: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);

        this.currentUser.set(userData);
        this.isAuthenticated.set(true);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

        return userData;
      })
    );
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem(this.USER_KEY);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Obter token do usuário atual
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Carregar dados do usuário do Firestore
  private async loadUserData(uid: string): Promise<IUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = { id: uid, ...userDoc.data() } as IUser;
        this.currentUser.set(userData);
        this.isAuthenticated.set(true);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        console.log('💾 Dados do usuário salvos no localStorage');
        return userData;
      } else {
        // Se o documento não existe, criar um básico com os dados do Firebase Auth
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const userData: IUser = {
            id: uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            role: 'user',
            userType: 'produtor',
            numCRA: '', // Será preenchido no registro completo
            questionsAndResponses: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Criar documento no Firestore
          await setDoc(doc(db, 'users', uid), userData);

          this.currentUser.set(userData);
          this.isAuthenticated.set(true);
          localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
          return userData;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  // Atualizar dados do usuário
  updateUser(user: IUser): void {
    console.log('🔄 Atualizando usuário:', user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    console.log('✅ Usuário atualizado com sucesso');
  }

  // Recarregar dados do usuário do Firestore
  async reloadUserData(): Promise<void> {
    const user = this.currentUser();
    if (user?.id) {
      await this.loadUserData(user.id);
    }
  }

  // Obter usuário atual do Firebase
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
