import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../../firebaseConfig';
import { getUserByEmail, getRelatoriosByUser } from '../../../apirequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation, userData: initialUserData }) {
  const [user, setUser] = useState(initialUserData || null);
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(!initialUserData);
  const [refreshing, setRefreshing] = useState(false);

  const hasAnsweredQuestions = user?.questionsAndResponses && user.questionsAndResponses.length > 0;

  const loadData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const apiUser = await getUserByEmail(currentUser.email);
      const data = apiUser?.data || apiUser;
      setUser(data);
      await AsyncStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(data));

      // Buscar relatórios do usuário
      if (data?.id) {
        try {
          const resp = await getRelatoriosByUser(data.id);
          const lista = resp?.data || resp || [];
          setRelatorios(Array.isArray(lista) ? lista : []);
        } catch {
          setRelatorios([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      try {
        const cached = await AsyncStorage.getItem(`user_${currentUser.uid}`);
        if (cached) setUser(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Atualizar quando voltar de outra tela
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNavigateToQuestionario = () => {
    navigation.navigate('Questionario');
  };

  const handleNavigateToRelatorio = () => {
    if (!hasAnsweredQuestions) {
      Alert.alert(
        'Questionário Pendente',
        'Você precisa responder o questionário de inventário antes de gerar o relatório.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Responder Agora', onPress: () => navigation.navigate('Questionario') }
        ]
      );
      return;
    }
    navigation.navigate('Relatorio');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#06402B" />
      </View>
    );
  }

  const userName = user?.name?.split(' ')[0] || 'Produtor';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06402B']} />}
      >
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>Bem-vindo de volta,</Text>
            <Text style={styles.headerTitle}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Perfil')}>
            <MaterialIcons name="person" size={24} color="#3F3F46" />
          </TouchableOpacity>
        </View>

        {/* --- Banner de Status --- */}
        {!hasAnsweredQuestions ? (
          <TouchableOpacity style={styles.warningBanner} onPress={handleNavigateToQuestionario}>
            <View style={styles.warningIconContainer}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Questionário Pendente</Text>
              <Text style={styles.warningSubtitle}>Responda para gerar seu inventário de carbono</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#F59E0B" />
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            {/* Decorative Blurs */}
            <View style={[styles.blurCircle, styles.blurTopRight]} />
            <View style={[styles.blurCircle, styles.blurBottomLeft]} />

            <View style={styles.cardHeader}>
              <View style={styles.cardLabelContainer}>
                <Text style={styles.cardLabel}>Inventário de Carbono</Text>
                <MaterialIcons name="check-circle" size={20} color="#6EE7B7" />
              </View>
            </View>

            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>{relatorios.length}</Text>
              <View style={styles.cardChangeContainer}>
                <Text style={styles.cardChangeText}>{relatorios.length === 1 ? 'relatório' : 'relatórios'}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.lastUpdate}>Questionário respondido ✅</Text>
              <TouchableOpacity style={styles.extractButton} onPress={handleNavigateToRelatorio}>
                <Text style={styles.extractButtonText}>Gerar novo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- Quick Access Label --- */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>

        {/* --- Action Grid --- */}
        <View style={styles.gridContainer}>
          
          {/* Button 1: Questionário */}
          <TouchableOpacity style={styles.gridButton} onPress={handleNavigateToQuestionario}>
            <View style={[styles.iconBox, { backgroundColor: hasAnsweredQuestions ? '#ECFDF5' : '#FEF3C7' }]}>
              <MaterialIcons name="assignment" size={24} color={hasAnsweredQuestions ? '#06402B' : '#F59E0B'} />
            </View>
            <Text style={styles.gridButtonTitle}>{hasAnsweredQuestions ? 'Editar Inventário' : 'Questionário'}</Text>
          </TouchableOpacity>

          {/* Button 2: Gerar Relatório */}
          <TouchableOpacity style={styles.gridButton} onPress={handleNavigateToRelatorio}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="description" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Gerar Relatório</Text>
          </TouchableOpacity>

          {/* Button 3: Meus Relatórios */}
          <TouchableOpacity style={styles.gridButton} onPress={() => {
            if (relatorios.length > 0) {
              navigation.navigate('Relatorio', { viewExisting: true, relatorioId: relatorios[0]?.id });
            } else {
              Alert.alert('Sem Relatórios', 'Você ainda não possui relatórios gerados.');
            }
          }}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="file-document-multiple" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Meus Relatórios</Text>
          </TouchableOpacity>

          {/* Button 4: Perfil */}
          <TouchableOpacity style={styles.gridButton} onPress={() => navigation.navigate('Perfil')}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="person" size={24} color="#06402B" />
            </View>
            <Text style={styles.gridButtonTitle}>Perfil</Text>
          </TouchableOpacity>

        </View>

        {/* --- Relatórios Recentes --- */}
        {relatorios.length > 0 && (
          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Relatórios Recentes</Text>
            </View>

            <View style={styles.divider} />

            {relatorios.slice(0, 3).map((rel, index) => (
              <React.Fragment key={rel.id || index}>
                <TouchableOpacity 
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('Relatorio', { viewExisting: true, relatorioId: rel.id })}
                >
                  <View style={styles.activityLeft}>
                    <View style={styles.activityIconContainer}>
                      <MaterialCommunityIcons name="leaf" size={24} color="#52525B" />
                    </View>
                    <View>
                      <Text style={styles.activityItemTitle}>Inventário de Carbono</Text>
                      <Text style={styles.activityItemSubtitle}>
                        {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <MaterialIcons name="chevron-right" size={24} color="#A1A1AA" />
                  </View>
                </TouchableOpacity>
                {index < Math.min(relatorios.length, 3) - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Spacer for Bottom Nav */}
        <View style={{ height: 120 }} />

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
          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToQuestionario}>
            <MaterialIcons name="assignment" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={handleNavigateToRelatorio}>
             <MaterialIcons name="description" size={24} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
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
    marginTop: 60,
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

  /* Warning Banner */
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#92400E',
  },
  warningSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
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
    ...Platform.select({
      ios: {
        shadowColor: '#06402B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
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
    paddingBottom: 6,
    gap: 8,
  },
  cardChangeText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
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
    gap: 16,
    marginBottom: 32,
  },
  gridButton: {
    width: (width - 48 - 16) / 2,
    height: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: 14,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#27272A',
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
    paddingVertical: 4,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
