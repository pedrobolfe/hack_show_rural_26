import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';

interface User {
  id: string;
  name: string;
  email: string;
  googleId?: string;
}

// Mock de um serviço de usuário. Substitua pela sua implementação real
// que interage com o banco de dados.
const userService = {
  findUserByEmail: async (email: string): Promise<User | null> => {
    // Lógica para encontrar um usuário pelo email no seu banco de dados
    console.log(`Procurando usuário: ${email}`);
    return null; // Retorne o usuário se encontrado
  },
  createUser: async (userData: { name: string; email: string; googleId?: string }): Promise<User> => {
    // Lógica para criar um novo usuário no seu banco de dados
    console.log('Criando novo usuário:', userData);
    return { id: 'new-user-id', ...userData }; // Retorne o novo usuário
  },
  findUserById: async (id: string): Promise<User> => {
    // Lógica para encontrar um usuário pelo ID
    console.log(`Procurando usuário por ID: ${id}`);
    return { id, name: 'Usuário Teste', email: 'teste@example.com' };
  },
};

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('As variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET precisam ser definidas.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: (err: Error | null, user?: User) => void) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email não encontrado no perfil do Google.'));
        }

        let user = await userService.findUserByEmail(email);

        if (!user) {
          // Se o usuário não existe, cria um novo.
          // É uma boa prática adicionar o campo 'googleId' ao seu modelo de usuário.
          user = await userService.createUser({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
          });
        }
        return done(null, user);
      } catch (error: any) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: string | undefined) => void) => {
  done(null, (user as User).id);
    
});

passport.deserializeUser(async (id: string, done: (err: any, user?: User | null) => void) => {
  try {
    const user = await userService.findUserById(id);
    done(null, user);
  } catch (error: any) {
    done(error, null);
  }
});