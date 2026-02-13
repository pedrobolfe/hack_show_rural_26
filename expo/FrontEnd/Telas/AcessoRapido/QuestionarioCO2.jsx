import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Mantém a splash screen visível enquanto as fontes carregam
SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

export default function PropertyRegistrationStep2() {
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* --- Header --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#3F3F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro da Propriedade</Text>
      </View>

      {/* --- Conteúdo Scrollável --- */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Barra de Progresso --- */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.stepText}>Passo 2 de 4</Text>
            <Text style={styles.percentText}>50%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '50%' }]} />
          </View>
        </View>

        {/* --- Formulário --- */}
        <View style={styles.formContainer}>
          
          {/* Seção 1: Tipo de Cultura */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Qual o tipo de cultura predominante?</Text>
            <View style={styles.gridOptions}>
              {/* Opção Selecionada: Soja */}
              <TouchableOpacity style={[styles.optionChip, styles.optionChipSelected]}>
                <Text style={styles.optionTextSelected}>Soja</Text>
              </TouchableOpacity>
              
              {/* Opções Não Selecionadas */}
              <TouchableOpacity style={styles.optionChip}>
                <Text style={styles.optionText}>Milho</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionChip}>
                <Text style={styles.optionText}>Café</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionChip}>
                <Text style={styles.optionText}>Gado</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Seção 2: Reserva Legal */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Possui reserva legal preservada?</Text>
            <View style={styles.rowOptions}>
              <TouchableOpacity style={styles.binaryButton}>
                <MaterialIcons name="check" size={18} color="#52525B" />
                <Text style={styles.binaryButtonText}>Sim</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.binaryButton}>
                 <MaterialIcons name="close" size={18} color="#52525B" />
                <Text style={styles.binaryButtonText}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Seção 3: Sensores (Toggle) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Utiliza sensores de monitoramento de solo?</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleOption}>
                <Text style={styles.toggleTextInactive}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleOptionActive}>
                <Text style={styles.toggleTextActive}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Continuar */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Continuar</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

        {/* Espaço para evitar sobreposição da Bottom Nav */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* --- Bottom Navigation --- */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
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

  /* Header */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 49,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    // Shadow simulation
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
    color: '#18181B',
    flex: 1,
  },

  /* Scroll Content */
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },

  /* Progress Bar */
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#71717A',
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
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#06402B',
    borderRadius: 9999,
  },

  /* Form Container */
  formContainer: {
    paddingHorizontal: 24,
    gap: 20, // Espaçamento geral se suportado, ou usar margin
  },

  /* Sections */
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 22,
    color: '#27272A',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#FAFAFA', // Cor do divider no CSS (embora pareça invisível no fundo FAFAFA, mantive fiel)
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF', // Simulando o efeito visual do CSS
    marginVertical: 4,
  },

  /* Grid Options (Cultura) */
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    width: '48%', // Aprox metade menos o gap
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    backgroundColor: '#06402B',
    borderColor: '#06402B',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    color: '#52525B',
  },
  optionTextSelected: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },

  /* Row Options (Reserva Legal) */
  rowOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  binaryButton: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    gap: 8,
  },
  binaryButtonText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 16,
    color: '#52525B',
  },

  /* Toggle Options (Sensores) */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA', // Fundo do container do toggle
    borderRadius: 16,
    padding: 4,
    height: 52,
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleOptionActive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleTextInactive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#71717A',
  },
  toggleTextActive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#06402B',
  },

  /* Submit Button */
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#06402B',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center', // Centralizado conforme layout
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 43, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 9999,
    width: 161,
    gap: 8,
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