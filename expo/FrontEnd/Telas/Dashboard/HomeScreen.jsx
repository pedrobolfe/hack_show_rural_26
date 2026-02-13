import React, { useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Mantém a splash screen visível enquanto as fontes carregam
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
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
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>Bem-vindo de volta,</Text>
            <Text style={styles.headerTitle}>Willyan Walker</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#3F3F46" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* --- Green Hero Card --- */}
        <View style={styles.card}>
          {/* Decorative Blurs */}
          <View style={[styles.blurCircle, styles.blurTopRight]} />
          <View style={[styles.blurCircle, styles.blurBottomLeft]} />

          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardLabel}>Saldo de Carbono</Text>
              <MaterialIcons name="info-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </View>

          {/* Card Value */}
          <View style={styles.cardValueContainer}>
            <Text style={styles.cardValue}>1.234</Text>
            <View style={styles.cardChangeContainer}>
              <Text style={styles.cardChangeText}>tCO2e</Text>
              <View style={styles.percentBadge}>
                 <MaterialIcons name="arrow-upward" size={12} color="#6EE7B7" />
                 <Text style={styles.percentText}>+12%</Text>
              </View>
            </View>
          </View>

          {/* Card Footer/Actions */}
          <View style={styles.cardFooter}>
             <Text style={styles.lastUpdate}>Atualizado hoje, 09:41</Text>
             <TouchableOpacity style={styles.extractButton}>
                <Text style={styles.extractButtonText}>Ver extrato</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* --- Quick Access Label --- */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>

        {/* --- Action Grid --- */}
        <View style={styles.gridContainer}>
          
          {/* Button 1: Vender */}
          <TouchableOpacity style={styles.gridButton}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="monetization-on" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Vender Créditos</Text>
          </TouchableOpacity>

          {/* Button 2: Minhas Áreas */}
          <TouchableOpacity style={styles.gridButton}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="grid-view" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Minhas Áreas</Text>
          </TouchableOpacity>

          {/* Button 3: Nova Área */}
          <TouchableOpacity style={styles.gridButton}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="add-circle-outline" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Nova Área</Text>
          </TouchableOpacity>

          {/* Button 4: Relatórios */}
          <TouchableOpacity style={styles.gridButton}>
             <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="description" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Relatórios</Text>
          </TouchableOpacity>

        </View>

        {/* --- Recent Activity Section --- */}
        <View style={styles.activitySection}>
          
          {/* Activity Header */}
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Atividades Recentes</Text>
            <View style={styles.activityFilters}>
              <TouchableOpacity style={styles.filterActive}>
                <Text style={styles.filterActiveText}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterInactive}>
                <Text style={styles.filterInactiveText}>Vendas</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Activity Item 1 */}
          <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIconContainer}>
                <MaterialCommunityIcons name="leaf" size={24} color="#52525B" />
              </View>
              <View>
                <Text style={styles.activityItemTitle}>Venda de Crédito</Text>
                <Text style={styles.activityItemSubtitle}>Projeto Mata Atlântica</Text>
              </View>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityValuePositive}>+ 120 t</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                 <MaterialIcons name="arrow-upward" size={10} color="#16A34A" />
                 <Text style={styles.activityStatusPositive}>Concluído</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Activity Item 2 */}
          <View style={styles.activityItem}>
             <View style={styles.activityLeft}>
              <View style={styles.activityIconContainer}>
                <MaterialIcons name="assignment-turned-in" size={24} color="#52525B" />
              </View>
              <View>
                <Text style={styles.activityItemTitle}>Certificação</Text>
                <Text style={styles.activityItemSubtitle}>Área Norte #04</Text>
              </View>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityValueNegative}>- R$ 450</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                 <MaterialIcons name="access-time" size={10} color="#EF4444" />
                 <Text style={styles.activityStatusNegative}>Pendente</Text>
              </View>
            </View>
          </View>

          {/* Spacer for Bottom Nav */}
          <View style={{height: 100}} />

        </View>

      </ScrollView>

      {/* --- Bottom Navigation (Fixed) --- */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
          
          {/* Active Item */}
          <TouchableOpacity style={styles.navItemActive}>
            <View style={styles.navIconBackground}>
              <MaterialIcons name="home" size={20} color="#06402B" />
            </View>
            <Text style={styles.navTextActive}>Início</Text>
          </TouchableOpacity>
          
          {/* Inactive Items */}
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="pie-chart-outline" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
             <MaterialIcons name="qr-code-scanner" size={24} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
             <MaterialIcons name="person-outline" size={24} color="#A1A1AA" />
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
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60, // Top margin
    marginBottom: 24,
    height: 52,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerSubtitle: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#71717A',
    marginBottom: 0,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#06402B',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F4F4F5',
  },

  /* Green Hero Card */
  card: {
    backgroundColor: '#06402B',
    borderRadius: 24,
    padding: 24,
    height: 185,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    // Shadows
    shadowColor: '#06402B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
  },
  blurTopRight: {
    width: 128,
    height: 128,
    right: -24,
    top: -24,
  },
  blurBottomLeft: {
    width: 96,
    height: 96,
    left: -24,
    bottom: -24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 6,
  },
  cardValueContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  cardValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: -0.9,
    lineHeight: 40,
  },
  cardChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6, // Align visually with text baseline
    gap: 8,
  },
  cardChangeText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 231, 183, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  percentText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#6EE7B7',
    marginLeft: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    marginTop: 'auto',
  },
  lastUpdate: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  extractButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  extractButtonText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Action Grid */
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#27272A',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16, // Row gap
    marginBottom: 32,
  },
  gridButton: {
    width: (width - 48 - 16) / 2, // Width minus padding minus gap divided by 2
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridButtonTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#3F3F46',
    textAlign: 'center',
  },

  /* Activity Section */
  activitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F4F4F5',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#27272A',
  },
  activityFilters: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 4,
  },
  filterActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterActiveText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    color: '#06402B',
  },
  filterInactive: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  filterInactiveText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#71717A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F4F4F5',
    marginVertical: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItemTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: '#27272A',
  },
  activityItemSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: '#71717A',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityValuePositive: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#27272A',
    marginBottom: 2,
  },
  activityValueNegative: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#27272A',
    marginBottom: 2,
  },
  activityStatusPositive: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10, // Adjusted from 12 to fit design
    color: '#16A34A',
    marginLeft: 4,
  },
  activityStatusNegative: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    color: '#EF4444',
    marginLeft: 4,
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
    paddingBottom: 32, // Safe Area padding roughly
    paddingHorizontal: 24,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 43, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    gap: 8,
  },
  navItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconBackground: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(6, 64, 43, 0.1)',
    borderRadius: 16,
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