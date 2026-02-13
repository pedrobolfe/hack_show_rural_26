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
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import api from '../../../apirequest'; // Importa a instância centralizada do Axios

const { width } = Dimensions.get('window');

export default function SignUp({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [car, setCar] = useState('');
  const [senha, setSenha] = useState('');

  const handleSignUp = async () => {
    if (!nome || !email || !car || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        fullName: nome,
        email: email,
        car: car,
        password: senha,
      });

      // Com axios, uma resposta bem-sucedida (status 2xx) entra aqui
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (error) {
      console.error(error);
      if (error.response) {
        // O servidor respondeu com um status de erro (4xx, 5xx)
        Alert.alert('Erro no Cadastro', error.response.data.message || 'Não foi possível completar o cadastro.');
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor. Verifique sua conexão e o endereço do backend.');
      } else {
        // Algo aconteceu ao configurar a requisição
        Alert.alert('Erro', 'Ocorreu um erro inesperado.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          
          {/* Espaçamento Topo (Rectangle 40px) */}
          <View style={{ height: 40 }} />

          {/* --- Cabeçalho (Logo + Títulos) --- */}
          <View style={styles.headerContainer}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoBackground}>
                <MaterialIcons name="eco" size={36} color="#FFFFFF" />
              </View>
            </View>

            {/* Título Ecodex */}
            <View style={styles.titleWrapper}>
              <Text style={styles.titleText}>Ecodex</Text>
            </View>

            {/* Subtítulo */}
            <View style={styles.subtitleWrapper}>
              <Text style={styles.subtitleText}>Crie sua conta</Text>
            </View>
          </View>

          {/* --- Formulário --- */}
          <View style={styles.formContainer}>
            
            {/* Input: Nome Completo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#A1A1AA"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
            </View>

            {/* Input: E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input: CAR */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CAR (Cadastro Ambiental Rural)</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input}
                  placeholder="Número do seu registro"
                  placeholderTextColor="#A1A1AA"
                  value={car}
                  onChangeText={setCar}
                />
              </View>
            </View>

            {/* Input: Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry={true}
                  value={senha}
                  onChangeText={setSenha}
                />
              </View>
            </View>

            {/* Botão Cadastrar */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
              <Text style={styles.submitButtonText}>Cadastrar</Text>
            </TouchableOpacity>

          </View>

          {/* --- Divisor --- */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextWrapper}>
              <Text style={styles.dividerText}>ou</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* --- Botão Google --- */}
          <TouchableOpacity style={styles.googleButton}>
            {/* Simulando o ícone colorido do Google com AntDesign por simplicidade, 
                ou poderia usar o SVG fornecido se instalar react-native-svg */}
            <AntDesign name="google" size={20} color="black" style={{marginRight: 8}} />
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          </TouchableOpacity>

          {/* --- Rodapé (Login Link) --- */}
          <View style={styles.footerContainer}>
            <View style={styles.footerContent}>
              <Text style={styles.footerText}>Já tem uma conta?</Text>
              <TouchableOpacity style={styles.loginLinkWrapper} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- Indicador Home --- */}
          <View style={styles.homeIndicatorWrapper}>
            <View style={styles.homeIndicator} />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
    // Sombra CSS: 0px 25px 50px -12px rgba(0, 0, 0, 0.25)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 5,
    alignItems: 'center',
    padding: 0,
    position: 'relative',
  },
  
  /* Header Styles */
  headerContainer: {
    width: 324,
    marginTop: 16, // Top position from absolute layout converted to margin
    marginBottom: 32, // Margin bottom defined in container
    alignItems: 'flex-start',
  },
  logoWrapper: {
    marginBottom: 12,
  },
  logoBackground: {
    width: 64,
    height: 64,
    backgroundColor: '#06402B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#06402B',
    letterSpacing: -0.6,
  },
  subtitleWrapper: {
    height: 20,
  },
  subtitleText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#71717A',
  },

  /* Form Styles */
  formContainer: {
    width: 324,
    gap: 16, // Espaçamento entre inputs
    marginBottom: 16,
  },
  inputGroup: {
    width: '100%',
    height: 74,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 4,
    top: 0,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#3F3F46',
    zIndex: 1,
  },
  inputBox: {
    position: 'absolute',
    top: 26,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: '#3F3F46',
  },
  
  /* Botão Cadastrar */
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#06402B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0, // Ajuste se necessário devido ao gap
  },
  submitButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* Divider */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 324,
    height: 68, // Altura reservada no layout absoluto
    paddingVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  dividerTextWrapper: {
    paddingHorizontal: 16,
  },
  dividerText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#A1A1AA',
  },

  /* Google Button */
  googleButton: {
    width: 324,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D4D8',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24, // Espaço para o footer
  },
  googleButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold', // Peso 600 conforme Google style usual ou inferred
    fontSize: 16,
    color: '#3F3F46',
  },

  /* Footer */
  footerContainer: {
    width: 388,
    padding: 32,
    alignItems: 'flex-start',
  },
  footerContent: {
    flexDirection: 'row',
    width: 324,
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: '#52525B',
  },
  loginLinkWrapper: {
    justifyContent: 'flex-start',
  },
  loginLinkText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#06402B',
  },

  /* Home Indicator */
  homeIndicatorWrapper: {
    width: 388,
    height: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 8,
    marginBottom: 8,
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});