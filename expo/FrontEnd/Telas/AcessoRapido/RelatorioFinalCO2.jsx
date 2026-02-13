import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Share
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../../firebaseConfig';
import { generateInventory, getRelatorioById, getUserByEmail } from '../../../apirequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RelatorioFinalCO2({ navigation, route, userData: initialUserData }) {
  const [user, setUser] = useState(initialUserData || null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [etapa1, setEtapa1] = useState(null);
  const [inventarioFinal, setInventarioFinal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Verificar se veio para visualizar um relatório existente
  const viewExisting = route?.params?.viewExisting;
  const relatorioId = route?.params?.relatorioId;

  useEffect(() => {
    const init = async () => {
      // Carregar dados do usuário se não tiver
      if (!user) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const apiUser = await getUserByEmail(currentUser.email);
            const data = apiUser?.data || apiUser;
            setUser(data);
          } catch {
            try {
              const cached = await AsyncStorage.getItem(`user_${currentUser.uid}`);
              if (cached) setUser(JSON.parse(cached));
            } catch {}
          }
        }
      }

      // Se veio para visualizar relatório existente, buscar
      if (viewExisting && relatorioId) {
        try {
          const resp = await getRelatorioById(relatorioId);
          const data = resp?.data || resp;
          setRelatorio(data);
          // Tentar parsear o conteúdo do relatório
          if (data?.response) {
            setInventarioFinal(data.response);
          }
        } catch (error) {
          console.error('Erro ao buscar relatório:', error);
          setErrorMsg('Não foi possível carregar o relatório.');
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleGenerateInventory = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Dados do usuário não encontrados. Faça login novamente.');
      return;
    }

    const hasAnswered = user?.questionsAndResponses && user.questionsAndResponses.length > 0;
    if (!hasAnswered) {
      Alert.alert(
        'Questionário Pendente',
        'Você precisa responder o questionário antes de gerar o relatório.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Responder Agora', onPress: () => navigation.navigate('Questionario') }
        ]
      );
      return;
    }

    setGenerating(true);
    setErrorMsg(null);

    try {
      const result = await generateInventory(user.id);

      if (result?.success) {
        setEtapa1(result.etapa1_analise_imagem || null);
        setInventarioFinal(result.inventario_final || null);
        setRelatorio({
          id: result.relatorioId,
          response: result.inventario_final,
          createdAt: result.timestamp || new Date().toISOString(),
        });

        Alert.alert('Sucesso!', 'Seu inventário de carbono foi gerado e salvo com sucesso.');
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao gerar inventário:', error);
      const msg = error?.response?.data?.detalhes || error?.message || 'Erro desconhecido';
      setErrorMsg(`Erro ao gerar inventário: ${msg}`);
      Alert.alert('Erro', `Não foi possível gerar o inventário.\n\n${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!inventarioFinal) return;
    try {
      await Share.share({
        message: inventarioFinal,
        title: 'Inventário de Carbono - Ecodex',
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centered]}>
        <ActivityIndicator size="large" color="#06402B" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* --- Header Fixo --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#3F3F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventário de Carbono</Text>
        {inventarioFinal && (
          <TouchableOpacity onPress={handleShare}>
            <MaterialIcons name="share" size={24} color="#06402B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Nenhum relatório gerado ainda */}
        {!inventarioFinal && !generating && !errorMsg && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={64} color="#D4D4D8" />
            </View>
            <Text style={styles.emptyTitle}>Gerar Inventário</Text>
            <Text style={styles.emptySubtitle}>
              Clique no botão abaixo para gerar seu inventário de carbono baseado em análise de imagem de satélite e suas respostas do questionário.
            </Text>

            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateInventory}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Gerar Inventário de Carbono</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gerando... */}
        {generating && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#06402B" style={{ marginBottom: 24 }} />
            <Text style={styles.emptyTitle}>Gerando Inventário...</Text>
            <Text style={styles.emptySubtitle}>
              Estamos analisando a imagem de satélite da sua propriedade e cruzando com os dados do seu questionário. Isso pode levar alguns segundos.
            </Text>

            {/* Progress Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <MaterialIcons name="satellite" size={20} color="#06402B" />
                <Text style={styles.stepText}>Etapa 1: Análise de imagem de satélite...</Text>
              </View>
              <View style={styles.stepRow}>
                <MaterialIcons name="quiz" size={20} color="#A1A1AA" />
                <Text style={[styles.stepText, { color: '#A1A1AA' }]}>Etapa 2: Cruzamento com questionário</Text>
              </View>
              <View style={styles.stepRow}>
                <MaterialIcons name="description" size={20} color="#A1A1AA" />
                <Text style={[styles.stepText, { color: '#A1A1AA' }]}>Etapa 3: Geração do inventário final</Text>
              </View>
            </View>
          </View>
        )}

        {/* Erro */}
        {errorMsg && !generating && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={[styles.generateButton, { marginTop: 16 }]} onPress={handleGenerateInventory}>
              <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Etapa 1: Resumo da Análise de Imagem */}
        {etapa1 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="satellite" size={20} color="#06402B" />
              <Text style={styles.sectionTitle}>Análise de Imagem de Satélite</Text>
            </View>
            <Text style={styles.sectionContent}>{etapa1}</Text>
          </View>
        )}

        {/* Inventário Final */}
        {inventarioFinal && (
          <>
            {/* Hero Card */}
            <View style={styles.heroCard}>
              <View style={[styles.blurCircle, styles.blurTopRight]} />
              <View style={[styles.blurCircle, styles.blurBottomLeft]} />

              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#6EE7B7" />
                <Text style={styles.statusText}>Inventário Gerado</Text>
              </View>

              <View style={styles.heroValueContainer}>
                <MaterialCommunityIcons name="leaf" size={48} color="#6EE7B7" />
                <Text style={styles.heroUnit}>Inventário de Carbono</Text>
              </View>

              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {relatorio?.createdAt 
                    ? `Gerado em ${new Date(relatorio.createdAt).toLocaleDateString('pt-BR')}`
                    : 'Gerado agora'
                  }
                </Text>
              </View>
            </View>

            {/* Conteúdo do Relatório */}
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <MaterialIcons name="description" size={20} color="#06402B" />
                <Text style={styles.reportTitle}>Relatório Completo</Text>
              </View>
              <Text style={styles.reportContent}>{inventarioFinal}</Text>
            </View>

            {/* Ações */}
            <View style={styles.actionsContainer}>
              {/* Gerar novo */}
              <TouchableOpacity style={styles.actionButton} onPress={handleGenerateInventory}>
                <View style={styles.actionIconContainer}>
                  <MaterialIcons name="refresh" size={24} color="#059669" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Gerar Novo Inventário</Text>
                  <Text style={styles.actionSubtitle}>Atualizar análise de carbono</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="#059669" />
              </TouchableOpacity>

              {/* Compartilhar */}
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <View style={styles.actionIconContainer}>
                  <MaterialIcons name="share" size={24} color="#059669" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Compartilhar</Text>
                  <Text style={styles.actionSubtitle}>Enviar relatório</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="#059669" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Spacer */}
        <View style={{ height: 120 }} />

      </ScrollView>

      {/* --- Bottom Nav --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.submitButtonText}>Voltar ao Início</Text>
          <MaterialIcons name="home" size={20} color="#FFFFFF" />
        </TouchableOpacity>

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#06402B',
    flex: 1,
  },

  /* Scroll Content */
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: '#27272A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06402B',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  generateButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  /* Steps */
  stepsContainer: {
    width: '100%',
    gap: 16,
    marginTop: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  stepText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#06402B',
  },

  /* Error */
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F4F4F5',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#06402B',
  },
  sectionContent: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: '#52525B',
    lineHeight: 20,
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: '#06402B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
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
    minHeight: 200,
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
    gap: 12,
  },
  heroUnit: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: '#6EE7B7',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 'auto',
  },
  confidenceText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Report Card */
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F4F4F5',
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
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  reportTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#06402B',
  },
  reportContent: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: '#3F3F46',
    lineHeight: 22,
  },

  /* Actions */
  actionsContainer: {
    gap: 12,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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

  /* Bottom Section */
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
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
