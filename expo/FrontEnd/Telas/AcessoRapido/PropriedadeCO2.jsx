import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Mantém a splash screen visível enquanto as fontes carregam
SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

export default function PropertyRegistration() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.mainContainer} onLayout={onLayoutRootView}>
      
      {/* --- Header Fixo --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#3F3F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro da Propriedade</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Barra de Progresso --- */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.stepText}>Passo 3 de 4</Text>
            <Text style={styles.percentText}>75%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '75%' }]} />
          </View>
        </View>

        {/* --- Formulário --- */}
        <View style={styles.formContainer}>
          
          {/* Input 1: Nome da Propriedade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Propriedade</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input}
                placeholder="Ex: Fazenda Santa Maria"
                placeholderTextColor="#A1A1AA"
              />
            </View>
          </View>

          {/* Input 2: Número do CAR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do CAR (Cadastro Ambiental Rural)</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input}
                placeholder="XX-9999999-XXXX.XXXX.XXXX"
                placeholderTextColor="#A1A1AA"
              />
            </View>
          </View>

          {/* Input 3: Área Total (com sufixo 'ha') */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área Total (Hectares)</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={[styles.input, { paddingRight: 40 }]} // Espaço para o sufixo
                placeholder="0.00"
                placeholderTextColor="#A1A1AA"
                keyboardType="numeric"
              />
              <Text style={styles.suffixText}>ha</Text>
            </View>
          </View>

          {/* Área de Upload (Tracejada) */}
          <View style={styles.uploadContainer}>
            <Text style={styles.label}>Anexar Documento do CAR</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <View style={styles.uploadIconBackground}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#A1A1AA" />
              </View>
              <Text style={styles.uploadTitle}>Toque para fazer upload</Text>
              <Text style={styles.uploadSubtitle}>PDF, JPG ou PNG (max. 5MB)</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Continuar */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Continuar</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

        {/* Espaçamento para o conteúdo não ficar escondido atrás da Bottom Nav */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* --- Bottom Navigation --- */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
          {/* Item Ativo: Início */}
          <TouchableOpacity style={styles.navItemActive}>
            <View style={styles.navIconBackground}>
              <MaterialIcons name="home" size={20} color="#06402B" />
            </View>
            <Text style={styles.navTextActive}>Início</Text>
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
  
  /* --- Header Styles --- */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 49, // Top offset from absolute CSS
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#06402B',
    flex: 1,
  },

  /* --- Scroll Content --- */
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32, // Gap from header
    paddingBottom: 24,
  },

  /* --- Progress Section --- */
  progressSection: {
    marginBottom: 32,
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#27272A',
  },
  percentText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#71717A',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#F4F4F5',
    borderRadius: 9999,
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 8,
    backgroundColor: '#06402B',
    borderRadius: 9999,
  },

  /* --- Form Styles --- */
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#3F3F46',
  },
  inputBox: {
    width: '100%',
    height: 50, // Ajustado para 50px conforme CSS da área total (49px nos outros, unificado para consistência)
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative', // Para o sufixo absoluto
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: '#3F3F46',
  },
  suffixText: {
    position: 'absolute',
    right: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#A1A1AA',
  },

  /* --- Upload Section --- */
  uploadContainer: {
    gap: 8,
    marginTop: 8,
  },
  uploadBox: {
    width: '100%',
    height: 152,
    borderWidth: 2,
    borderColor: '#D4D4D8',
    borderStyle: 'dashed',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA', // Background implícito do container pai, ou transparente
  },
  uploadIconBackground: {
    width: 48,
    height: 48,
    backgroundColor: '#F4F4F5',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#3F3F46',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },

  /* --- Submit Button --- */
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#06402B',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    // Shadow
    shadowColor: '#06402B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },

  /* --- Bottom Navigation --- */
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // Padding inferior para simular área segura
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center', // Centralizado pois só tem um item no CSS fornecido (ou start)
    marginBottom: 8,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 43, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 9999,
    gap: 8,
    width: 161, // Largura fixa do CSS
    justifyContent: 'flex-start',
  },
  navIconBackground: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTextActive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#06402B',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});