import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Mantém a splash screen visível enquanto as fontes carregam
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

export default function PropertyRegistrationStep3() {
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
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* --- Conteúdo Principal (Scrollável para telas pequenas) --- */}
      <View style={styles.contentContainer}>
        
        {/* --- Header --- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
             <MaterialIcons name="arrow-back" size={24} color="#3F3F46" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastro da Propriedade</Text>
        </View>

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

        {/* --- Área do Mapa --- */}
        <View style={styles.mapContainer}>
          {/* Imagem de Fundo (Satélite Placeholder) */}
          <ImageBackground 
            source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-51.9253, -14.2350,15,0/600x600?access_token=pk.eyJ1IjoiZGVtb3MiLCJhIjoiY2xnZ3J5eG5iMGRrdTNzbG54dGF5aG52OCJ9.O3q6vH_yXdF5dCqf-rw6aw' }} 
            style={styles.mapImage}
            imageStyle={{ borderRadius: 0 }}
          >
            {/* Overlay Escuro */}
            <View style={styles.mapOverlay} />

            {/* Vetores (Simulação das bordas do CSS) */}
            {/* Vector Principal (Verde - Seleção) */}
            <View style={styles.vectorSelection} />
            
            {/* Vetores Secundários (Grid - Apenas visual conforme CSS) */}
            <View style={[styles.vectorGrid, { top: '23%', left: '18%', width: '60%', height: '50%' }]} />
            <View style={[styles.vectorGrid, { top: '8%', left: '78%', width: '4%', height: '80%' }]} />

            {/* Controles de Zoom */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton}>
                <MaterialIcons name="add" size={24} color="#52525B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton}>
                <MaterialIcons name="remove" size={24} color="#52525B" />
              </TouchableOpacity>
            </View>

            {/* Card Flutuante de Informações */}
            <View style={styles.infoCard}>
              
              {/* Header do Card (Status) */}
              <View style={styles.cardHeader}>
                <View style={styles.statusBadge}>
                  <MaterialIcons name="check" size={16} color="#047857" />
                  <Text style={styles.statusText}>Validada</Text>
                </View>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="calendar_today" size={12} color="#059669" />
                  <Text style={styles.dateText}>12 Fev 2026</Text>
                </View>
              </View>

              {/* Dados (Área e Perímetro) */}
              <View style={styles.cardDataRow}>
                {/* Coluna Área */}
                <View style={styles.dataColumn}>
                  <Text style={styles.dataLabel}>Área Detectada</Text>
                  <View style={styles.dataValueRow}>
                    <Text style={styles.dataValue}>33.89</Text>
                    <Text style={styles.dataUnit}>ha</Text>
                  </View>
                </View>

                {/* Divisor Vertical */}
                <View style={styles.verticalDivider} />

                {/* Coluna Perímetro */}
                <View style={styles.dataColumn}>
                  <Text style={styles.dataLabel}>Perímetro</Text>
                  <View style={styles.dataValueRow}>
                    <Text style={styles.dataValue}>30.69</Text>
                    <Text style={styles.dataUnit}>km</Text>
                  </View>
                </View>
              </View>

            </View>
          </ImageBackground>
        </View>

      </View>

      {/* --- Seção Inferior Fixa --- */}
      <View style={styles.bottomSection}>
        
        {/* Botão Continuar */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Continuar</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Navigation */}
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

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 50, // Ajuste para Status Bar
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
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
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#18181B',
  },

  /* Progress Bar */
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
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
    color: '#71717A',
  },
  percentText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
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

  /* Map Container */
  mapContainer: {
    flex: 1, // Ocupa o restante do espaço até o bottom section
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    // O CSS define limites absolutos (top 151, bottom 196). 
    // Usando flex para adaptação responsiva.
  },
  mapImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  /* Vetores do Mapa (Simulados) */
  vectorSelection: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '15%',
    backgroundColor: 'rgba(6, 64, 43, 0.4)',
    borderWidth: 3.84,
    borderColor: '#10B981',
  },
  vectorGrid: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2.56,
    borderColor: '#06402B',
    opacity: 0.5,
  },

  /* Zoom Controls */
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  /* Info Card (Glassmorphism Like) */
  infoCard: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: '#047857',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#059669',
  },
  cardDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataColumn: {
    flex: 1,
  },
  dataLabel: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  dataValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  dataValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#27272A',
    lineHeight: 28,
  },
  dataUnit: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#52525B',
    marginBottom: 2,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F4F4F5',
    marginHorizontal: 16,
  },

  /* Bottom Section */
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32, // Safe area
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#06402B',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    // Shadow
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  submitButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16, // CSS diz 18 em alguns lugares, mas header de card diz 16. Ajustado para 16 pelo tamanho 56h
    color: '#FFFFFF',
  },

  /* Bottom Nav (Simplificada) */
  bottomNav: {
    alignItems: 'center',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    width: 161,
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
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});