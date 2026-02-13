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
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../apirequest'; // Importa a instância centralizada do Axios

const { width } = Dimensions.get('window');

export default function ForgotPassword({ navigation }) {
  const [emailOrCar, setEmailOrCar] = useState('');

  const handleForgotPassword = async () => {
    if (!emailOrCar) {
      Alert.alert('Entrada Inválida', 'Por favor, insira seu e-mail ou CAR.');
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', {
        emailOrCar: emailOrCar,
      });

      // Com axios, uma resposta bem-sucedida (status 2xx) entra aqui
      Alert.alert('Verifique seu E-mail', 'Se uma conta com este e-mail ou CAR existir, um link para redefinição de senha foi enviado.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (error) {
      console.error(error);
      if (error.response) {
        // O servidor respondeu com um status de erro (4xx, 5xx)
        Alert.alert('Erro', error.response.data.message || 'Não foi possível processar sua solicitação.');
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor.');
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
          
          {/* --- Espaçamento Superior (Rectangle 40px) --- */}
          <View style={{ height: 40, width: '100%' }} />

          {/* --- Conteúdo Principal --- */}
          <View style={styles.contentContainer}>
            
            {/* Header Section */}
            <View style={styles.headerSection}>
              
              {/* Logo Box */}
              <View style={styles.logoWrapper}>
                <View style={styles.logoBackground}>
                  <MaterialIcons name="eco" size={36} color="#FFFFFF" />
                </View>
              </View>

              {/* Título Ecodex */}
              <View style={styles.brandContainer}>
                <Text style={styles.brandText}>Ecodex</Text>
              </View>

              {/* Subtítulo (Heading) */}
              <View style={styles.headingContainer}>
                <Text style={styles.headingText}>Redefinir senha</Text>
              </View>

              {/* Texto de Instrução */}
              <View style={styles.instructionContainer}>
                <View style={styles.instructionTextWrapper}>
                  <Text style={styles.instructionText}>
                    Insira o e-mail associado à sua conta ou o número do CAR para receber um link de redefinição.
                  </Text>
                </View>
              </View>

            </View>

            {/* Form Section */}
            <View style={styles.formContainerWrapper}>
              <View style={styles.formContent}>
                
                {/* Input Group */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail ou CAR</Text>
                  <View style={styles.inputBox}>
                    <TextInput 
                      style={styles.input}
                      placeholder="Digite seu e-mail ou CAR"
                      placeholderTextColor="#A1A1AA"
                      autoCapitalize="none"
                      value={emailOrCar}
                      onChangeText={setEmailOrCar}
                    />
                  </View>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                  {/* Camada de sombra simulada via View absoluta se necessário, 
                      mas shadow properties do RN funcionam bem no botão */}
                  <Text style={styles.buttonText}>Enviar link</Text>
                </TouchableOpacity>

              </View>
            </View>

          </View>

          {/* --- Espaçamento Flexível (Rectangle placeholder) --- */}
          <View style={styles.spacerFlex} />

          {/* --- Footer (Link Voltar) --- */}
          <View style={styles.footerContainer}>
            <TouchableOpacity style={styles.backLinkWrapper} onPress={() => navigation.goBack()}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="arrow-back" size={18} color="#06402B" />
              </View>
              <Text style={styles.backLinkText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>

          {/* --- Home Indicator --- */}
          <View style={styles.homeIndicatorContainer}>
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
    height: 844, // Altura fixa conforme CSS, mas em RN flexível é melhor. Mantido 844 para fidelidade.
    maxHeight: 844,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    // Shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
    alignItems: 'flex-start',
    padding: 0,
    overflow: 'hidden', // Opcional, dependendo se a sombra deve vazar ou não
  },

  /* Content Container (Padding 32px 32px 0px) */
  contentContainer: {
    width: '100%',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 0,
    alignItems: 'flex-start',
  },

  /* Header Section */
  headerSection: {
    width: '100%',
    marginBottom: 24, // Margin do container pai do logo/texto
  },
  
  /* Logo */
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

  /* Heading 1 (Ecodex) */
  brandContainer: {
    marginBottom: 0, // Ajustado conforme ordem visual
  },
  brandText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#06402B',
    letterSpacing: -0.6,
  },

  /* Subtitle (Redefinir senha) */
  headingContainer: {
    marginTop: 24,
    marginBottom: 0,
  },
  headingText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#18181B',
  },

  /* Instruction Text */
  instructionContainer: {
    marginTop: 7.25,
    maxWidth: 280,
    marginBottom: 0,
  },
  instructionTextWrapper: {
    paddingHorizontal: 9, // aprox 8.92px
  },
  instructionText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center', // O CSS diz center, mas o layout pai é flex-start.
    // O container pai width=280 e align-items=center sugere centralização do bloco de texto
    color: '#71717A',
  },

  /* Form Section */
  formContainerWrapper: {
    width: '100%',
    paddingVertical: 16,
  },
  formContent: {
    width: '100%',
    gap: 24, // Propriedade gap funciona no RN moderno
  },
  
  /* Input */
  inputGroup: {
    width: '100%',
    height: 74, // Altura total reservada
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
    height: 48, // CSS especifica 48px aqui (diferente do login que era 56)
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

  /* Button */
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#06402B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Button Shadow: 0px 10px 15px -3px rgba(6, 64, 43, 0.2)
    shadowColor: '#06402B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 24, // Gap manual se 'gap' não for suportado na versão
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* Spacer to push footer down */
  spacerFlex: {
    flex: 1,
    minHeight: 100, // Garante espaço visual
  },

  /* Footer */
  footerContainer: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  backLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
  },
  iconContainer: {
    marginRight: 8,
  },
  backLinkText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    lineHeight: 24,
    color: '#06402B',
    textAlign: 'center',
  },

  /* Home Indicator */
  homeIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});