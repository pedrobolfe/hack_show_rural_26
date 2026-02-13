import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { auth, signInWithEmailAndPassword } from '../../../firebaseConfig';
import { getUserByCar } from '../../../apirequest'; // Assumindo que esta função será criada

export default function Login({ navigation }) {
  const [emailOrCar, setEmailOrCar] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrCar || !password) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail/CAR e a senha.');
      return;
    }
    setLoading(true);
    try {
      let userEmail = emailOrCar;

      // Verifica se o input é um CAR (não contém '@') e busca o e-mail correspondente.
      if (!emailOrCar.includes('@')) {
        console.log(`Buscando usuário pelo CAR: ${emailOrCar}`);
        const user = await getUserByCar(emailOrCar);
        if (!user || !user.email) {
          console.log(`Usuário não encontrado para o CAR: ${emailOrCar}`);
          throw new Error('Usuário não encontrado com este CAR.');
        }
        userEmail = user.email;
        console.log(`Email encontrado (${userEmail}) para o CAR ${emailOrCar}. Tentando login no Firebase.`);
      }

      await signInWithEmailAndPassword(auth, userEmail, password);
      // A navegação será tratada pelo listener em App.js
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.message === 'Usuário não encontrado com este CAR.') {
        Alert.alert('Erro no Login', error.message);
      } else {
        Alert.alert('Erro no Login', 'E-mail/CAR ou senha inválidos. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          
          {/* --- Header Section --- */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="eco" size={48} color="#FFFFFF" />
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Ecodex</Text>
            </View>
            
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>Faça login para continuar</Text>
            </View>
          </View>

          {/* --- Form Section --- */}
          <View style={styles.formContainer}>
            
            {/* Input E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail ou CAR</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Seu e-mail ou número do CAR"
                  placeholderTextColor="#A1A1AA"
                  value={emailOrCar}
                  onChangeText={setEmailOrCar}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Input Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Link Esqueceu a Senha */}
            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('EsqueciSenha')}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão Entrar */}
            <TouchableOpacity style={[styles.loginButton, loading && styles.buttonDisabled]} onPress={loading ? undefined : handleLogin}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* --- Divider --- */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text style={styles.dividerText}>ou</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* --- Google Button --- */}
          <TouchableOpacity style={styles.googleButton}>
            <AntDesign name="google" size={20} color="black" style={{marginRight: 12}} />
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          </TouchableOpacity>

          {/* --- Footer --- */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          
          {/* Barra inferior decorativa (Home indicator iOS style) */}
          <View style={styles.bottomIndicatorWrapper}>
            <View style={styles.bottomIndicator} />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: 390,
    maxWidth: '100%',
    minHeight: 844,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    ...Platform.select({
      web: {
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      android: {
        elevation: 5,
      },
    }),
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    position: 'relative',
  },
  
  /* Header Styles */
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#06402B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#06402B',
    letterSpacing: -0.6,
  },
  subtitleContainer: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#71717A',
  },

  /* Form Styles */
  formContainer: {
    width: '100%',
    marginBottom: 16, // Ajuste do gap do form
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
    height: 82, // Altura total reservada para label + input
    position: 'relative',
  },
  label: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#3F3F46',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: '#3F3F46', // Cor do texto digitado
    width: '100%',
    height: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: -10, // Ajuste fino baseado no layout absoluto do CSS original
  },
  forgotPasswordText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#06402B',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#06402B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    backgroundColor: '#0A5F41',
    opacity: 0.7,
  },

  /* Divider Styles */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  dividerTextContainer: {
    paddingHorizontal: 16,
  },
  dividerText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#A1A1AA',
  },

  /* Google Button Styles */
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D4D8',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  googleButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#3F3F46',
  },

  /* Footer Styles */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  footerText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: '#52525B',
  },
  footerLink: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#06402B',
  },

  /* Bottom Indicator */
  bottomIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
    marginTop: 'auto', // Empurra para o final se sobrar espaço
  },
  bottomIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});