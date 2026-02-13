import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StatusBar,
  TextInput,
  Image,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserByEmail } from '../../../apirequest'; // Importa a função da API
import { auth, signOut } from '../../../firebaseConfig'; // Importa funções do Firebase
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function UserProfile({ navigation }) {
  // Estado para armazenar os dados do usuário
  const [user, setUser] = useState({
    name: 'Produtor',
    email: 'carregando...',
    phone: 'carregando...',
  });

  // Estado para controlar o carregamento
  const [loading, setLoading] = useState(true);

  // Efeito para buscar os dados do usuário quando o componente é montado
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setLoading(true);
        try {
          const userData = await getUserByEmail(currentUser.email);
          setUser(userData);
          // Salva os dados frescos no cache
          await AsyncStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(userData));
        } catch (apiError) {
          console.error("Erro ao buscar dados do usuário da API:", apiError);
          try {
            // Se a API falhar, tenta carregar do cache
            const cachedUser = await AsyncStorage.getItem(`user_${currentUser.uid}`);
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
            } else {
              throw new Error("Sem dados em cache disponíveis.");
            }
          } catch (cacheError) {
            console.error("Erro ao carregar dados do cache:", cacheError);
            Alert.alert('Erro Crítico', 'Não foi possível carregar seus dados online ou offline. Por favor, faça login novamente.');
            auth.signOut();
          }
        } finally {
          setLoading(false);
        }
      } else {
        navigation.replace('Login');
      }
    };
    loadUserData();
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: () => signOut(auth) }, // Desloga o usuário do Firebase
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* --- Header Fixo --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#27272A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Seção de Avatar e Boas Vindas --- */}
        <View style={styles.avatarSection}>
          
          {/* Avatar Container */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {/* Placeholder Icon (Person) */}
              <MaterialIcons name="person" size={48} color="#D4D4D8" />
            </View>
            
            {/* Edit Button (Small Green Circle) */}
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Name */}
          <Text style={styles.userName}>Olá, {user.name.split(' ')[0]}!</Text>
          
          {/* Edit Photo Text */}
          <TouchableOpacity>
            <Text style={styles.editPhotoText}>Editar Foto</Text>
          </TouchableOpacity>

        </View>

        {/* --- Formulário de Dados --- */}
        <View style={styles.formContainer}>
          
          {/* Campo 1: Nome Completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.inputText} 
                value={user.name}
                editable={false} // Nomes geralmente não são editáveis diretamente
              />
            </View>
          </View>

          {/* Campo 2: E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.inputText} 
                value={user.email}
                editable={false} // E-mail geralmente não é editável
              />
            </View>
          </View>

          {/* Campo 3: Telefone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.inputText} 
                value={user.phone}
                editable={true} // Telefone pode ser editável
              />
            </View>
          </View>

          {/* Campo 4: Senha (Botão de Alterar) */}
          <View style={styles.inputGroup}>
             <Text style={styles.label}>Senha</Text>
             <TouchableOpacity 
                style={styles.changePasswordButton}
                onPress={() => navigation.navigate('EsqueciSenha')} // Reutiliza a tela ou cria uma nova
             >
                <Text style={styles.changePasswordText}>Alterar Senha</Text>
                <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
             </TouchableOpacity>
          </View>

          {/* Botão Sair */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
             <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>

        </View>

        {/* Espaçamento extra para o conteúdo não ficar atrás da navbar */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* --- Navegação Inferior --- */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
          {/* Item Inativo: Início */}
          <TouchableOpacity style={styles.navItemInactive} onPress={() => navigation.navigate('Dashboard')}>
            <MaterialIcons name="home" size={20} color="#A1A1AA" />
            <Text style={styles.navTextInactive}>Início</Text>
          </TouchableOpacity>
        </View>
        
        {/* Home Indicator */}
        <View style={styles.homeIndicatorWrapper}>
          <View style={styles.homeIndicator} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 49,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      android: {
        elevation: 2,
      },
    }),
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#06402B',
  },

  /* Scroll Content */
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  /* Avatar Section */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    width: 112,
    height: 112,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#F4F4F5',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 5,
      },
    }),
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    backgroundColor: '#06402B',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#06402B',
    marginBottom: 4,
  },
  editPhotoText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#0A5F41',
  },

  /* Form Container */
  formContainer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#71717A',
  },
  inputBox: {
    width: '100%',
    height: 50,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    color: '#27272A',
  },

  /* Change Password Button */
  changePasswordButton: {
    width: '100%',
    height: 56, // Adjusted height for better touch target
    backgroundColor: '#06402B',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center', // Center aligned content vs space-between if desired
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 15px rgba(6, 78, 59, 0.1)',
      },
      android: {
        elevation: 8,
      },
    }),
  changePasswordText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  /* Logout Button */
  logoutButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 16,
  },
  logoutText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    color: '#EF4444',
  },

  /* Bottom Nav */
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingTop: 16,
    paddingBottom: 32, // Safe area padding
    alignItems: 'center',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navItemInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 8,
  },
  navTextInactive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#A1A1AA',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});