import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
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

export default function PotentialReport() {
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

      {/* --- Header Fixo --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#3F3F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório de Potencial</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Card de Destaque (Verde) --- */}
        <View style={styles.heroCard}>
          {/* Decorative Blurs */}
          <View style={[styles.blurCircle, styles.blurTopRight]} />
          <View style={[styles.blurCircle, styles.blurBottomLeft]} />

          {/* Badge de Status */}
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={18} color="#6EE7B7" />
            <Text style={styles.statusText}>Potencial Estimado</Text>
          </View>

          {/* Valor Principal */}
          <View style={styles.heroValueContainer}>
            <Text style={styles.heroValue}>1.234</Text>
            <Text style={styles.heroUnit}>tCO2e/ano</Text>
          </View>

          {/* Badge Inferior */}
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>Alta Confiabilidade (98%)</Text>
          </View>
        </View>

        {/* --- Seção de Impacto Ambiental --- */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Impacto Ambiental</Text>

          {/* Card Branco com Métricas */}
          <View style={styles.metricsCard}>
            
            {/* Linha 1: Preservação */}
            <View style={styles.metricRow}>
              <View style={styles.metricLabelContainer}>
                <Text style={styles.metricLabel}>Preservação</Text>
                <Text style={styles.metricValue}>81.3%</Text>
              </View>
              {/* Barra de Progresso */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '81.3%', backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Linha 2: Recuperação */}
            <View style={styles.metricRow}>
               <View style={styles.metricLabelContainer}>
                <Text style={styles.metricLabel}>Recuperação</Text>
                <Text style={styles.metricValue}>14.7%</Text>
              </View>
              {/* Barra de Progresso */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '14.7%', backgroundColor: '#34D399' }]} />
              </View>
            </View>

            {/* Linha 3: Uso Sustentável */}
            <View style={styles.metricRow}>
               <View style={styles.metricLabelContainer}>
                <Text style={styles.metricLabel}>Uso Sustentável</Text>
                <Text style={styles.metricValue}>4.0%</Text>
              </View>
              {/* Barra de Progresso */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '4%', backgroundColor: '#14B8A6' }]} />
              </View>
            </View>

          </View>
        </View>

        {/* Espaçamento para o conteúdo não ficar escondido */}
        <View style={{ height: 160 }} />

      </ScrollView>

      {/* --- Footer (Botões e Navegação) --- */}
      {/* Container Absoluto para simular o layout fixo inferior */}
      <View style={styles.bottomSheetContainer}>
        
        {/* Botão de Ação: Gerar Créditos */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.actionButton}>
             <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="star-four-points" size={24} color="#059669" />
             </View>
             <View style={styles.actionTextContainer}>
               <Text style={styles.actionTitle}>Gerar Créditos</Text>
               <Text style={styles.actionSubtitle}>Iniciar processo de certificação</Text>
             </View>
             <MaterialIcons name="arrow-forward" size={24} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Botão Principal: Finalizar */}
        <TouchableOpacity style={styles.submitButton}>
           <Text style={styles.submitButtonText}>Finalizar Cadastro</Text>
           <MaterialIcons name="check" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Navegação Inferior */}
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
  
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 49,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    width: 40, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // O CSS original tem um botão com margem negativa ou ajuste fino, simplificado aqui
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  /* Hero Card (Verde) */
  heroCard: {
    backgroundColor: '#06402B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#06402B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    minHeight: 234, // Conforme CSS
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
  },
  blurTopRight: {
    width: 160,
    height: 160,
    right: -32,
    top: -32,
  },
  blurBottomLeft: {
    width: 128,
    height: 128,
    left: -32,
    bottom: -32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  heroValueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
    lineHeight: 40,
    color: '#FFFFFF',
    letterSpacing: -0.9,
  },
  heroUnit: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 24,
    lineHeight: 32,
    color: '#6EE7B7',
    letterSpacing: -0.9,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 'auto', // Empurra para baixo se houver espaço extra
  },
  confidenceText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Impact Section */
  impactSection: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#27272A',
    marginBottom: 16,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F4F4F5',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 20,
  },
  metricRow: {
    gap: 6,
  },
  metricLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#52525B',
  },
  metricValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#06402B',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#F4F4F5',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },

  /* Bottom Sheet Container (Action Button + Submit + Nav) */
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // Fundo branco cobrindo o scroll
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingTop: 16,
    paddingHorizontal: 24,
  },

  /* Action Button (Verde Claro) */
  actionButtonContainer: {
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#27272A',
  },
  actionSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: '#71717A',
  },

  /* Submit Button (Verde Escuro) */
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#06402B',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    // Shadow
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  /* Bottom Nav */
  bottomNav: {
    paddingBottom: 32, // Safe area padding
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
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 100,
  },
});