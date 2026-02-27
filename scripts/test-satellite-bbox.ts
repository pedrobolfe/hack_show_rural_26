/**
 * Script de Teste - Obter Imagem de Satélite por BBOX
 * 
 * Este script demonstra como obter uma imagem de satélite
 * de um território específico usando apenas os limites (bbox).
 */

import satelliteService from '../src/services/satellite.service';

async function testarImagemPorBbox() {
    console.log('🛰️ Teste: Obter Imagem de Satélite por BBOX\n');
    
    try {
        // DEFINA AQUI OS LIMITES DO SEU TERRITÓRIO
        // Formato: [oeste, sul, leste, norte] ou [minLon, minLat, maxLon, maxLat]
        
        // Exemplo 1: Área em Cascavel, PR
        const bbox1 = [-53.5, -25.0, -53.4, -24.9];
        
        // Exemplo 2: Área maior
        const bbox2 = [-53.6, -25.1, -53.3, -24.8];
        
        // ESCOLHA QUAL BBOX USAR
        const bboxEscolhido = bbox1;
        
        console.log('📍 BBOX selecionado:', bboxEscolhido);
        console.log('   Oeste:', bboxEscolhido[0]);
        console.log('   Sul:', bboxEscolhido[1]);
        console.log('   Leste:', bboxEscolhido[2]);
        console.log('   Norte:', bboxEscolhido[3]);
        console.log('');
        
        // Definir período (último ano)
        const hoje = new Date();
        const umAnoAtras = new Date();
        umAnoAtras.setFullYear(hoje.getFullYear() - 1);
        
        const dateFrom = umAnoAtras.toISOString();
        const dateTo = hoje.toISOString();
        
        console.log('📅 Período:');
        console.log('   De:', dateFrom.split('T')[0]);
        console.log('   Até:', dateTo.split('T')[0]);
        console.log('');
        
        console.log('🔄 Solicitando imagem ao Sentinel Hub...');
        console.log('⏳ Isso pode levar alguns segundos...\n');
        
        // OBTER IMAGEM COM ÁREA DESTACADA
        const imagePath = await satelliteService.getImageByBbox(
            bboxEscolhido,
            dateFrom,
            dateTo,
            {
                width: 1024,
                height: 1024,
                label: 'Área de Teste - Cascavel, PR'
            }
        );
        
        console.log('✅ SUCESSO! Imagem obtida e salva!');
        console.log('📁 Caminho:', imagePath);
        console.log('');
        console.log('🎨 A imagem possui:');
        console.log('   ✓ Borda vermelha tracejada');
        console.log('   ✓ Pontos vermelhos nos 4 cantos');
        console.log('   ✓ Informações do BBOX');
        console.log('   ✓ Label personalizado');
        console.log('');
        console.log('💡 Abra a imagem para visualizar a área destacada!');
        
        return imagePath;
        
    } catch (error) {
        console.error('❌ ERRO:', (error as Error).message);
        console.error('');
        console.error('Possíveis causas:');
        console.error('  1. Credenciais do Sentinel Hub não configuradas');
        console.error('  2. BBOX inválido');
        console.error('  3. Sem imagens disponíveis no período');
        console.error('  4. Problema de conexão');
        
        throw error;
    }
}

async function testarVariasSituacoes() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TESTE DE IMAGENS DE SATÉLITE POR BBOX');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // Situação 1: Área pequena
    console.log('📍 SITUAÇÃO 1: Área Pequena (Propriedade individual)');
    console.log('──────────────────────────────────────────────────────');
    try {
        const bbox1 = [-53.45, -24.95, -53.44, -24.94];
        const img1 = await satelliteService.getImageByBbox(
            bbox1,
            "2024-06-01T00:00:00Z",
            "2024-12-31T23:59:59Z",
            { label: "Propriedade Pequena", width: 512, height: 512 }
        );
        console.log('✅ Sucesso:', img1);
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');
    
    // Situação 2: Área média
    console.log('📍 SITUAÇÃO 2: Área Média (Cluster de propriedades)');
    console.log('──────────────────────────────────────────────────────');
    try {
        const bbox2 = [-53.5, -25.0, -53.4, -24.9];
        const img2 = await satelliteService.getImageByBbox(
            bbox2,
            "2024-01-01T00:00:00Z",
            "2024-12-31T23:59:59Z",
            { label: "Cluster de Propriedades", width: 1024, height: 1024 }
        );
        console.log('✅ Sucesso:', img2);
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');
    
    // Situação 3: Comparação temporal
    console.log('📍 SITUAÇÃO 3: Comparação Temporal');
    console.log('──────────────────────────────────────────────────────');
    try {
        const bbox3 = [-53.48, -24.96, -53.42, -24.92];
        
        console.log('   🔹 Período 1: Jan-Jun 2024');
        const imgAntes = await satelliteService.getImageByBbox(
            bbox3,
            "2024-01-01T00:00:00Z",
            "2024-06-30T23:59:59Z",
            { label: "Jan-Jun 2024", width: 800, height: 800 }
        );
        console.log('   ✅ Antes:', imgAntes);
        
        // Aguardar 2 segundos (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('   🔹 Período 2: Jul-Dez 2024');
        const imgDepois = await satelliteService.getImageByBbox(
            bbox3,
            "2024-07-01T00:00:00Z",
            "2024-12-31T23:59:59Z",
            { label: "Jul-Dez 2024", width: 800, height: 800 }
        );
        console.log('   ✅ Depois:', imgDepois);
        
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TESTES CONCLUÍDOS!');
    console.log('═══════════════════════════════════════════════════════');
}

// Executar teste simples
if (require.main === module) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  INICIAR TESTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Escolha o teste:');
    console.log('  1 - Teste Simples (apenas uma imagem)');
    console.log('  2 - Teste Completo (várias situações)');
    console.log('');
    
    const tipoTeste = process.argv[2] || '1';
    
    if (tipoTeste === '2') {
        testarVariasSituacoes()
            .then(() => console.log('\n✅ Todos os testes concluídos!'))
            .catch(err => console.error('\n❌ Erro nos testes:', err.message));
    } else {
        testarImagemPorBbox()
            .then(() => console.log('\n✅ Teste concluído com sucesso!'))
            .catch(err => console.error('\n❌ Erro no teste:', err.message));
    }
}

export { testarImagemPorBbox, testarVariasSituacoes };
