/**
 * Script para gerar imagem de satélite com polígono desenhado
 * a partir do arquivo coordenadas.json
 */

import satelliteService from '../src/services/satellite.service';
import * as path from 'path';

async function testarPoligonoDoJSON() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  GERADOR DE IMAGEM COM POLÍGONO DA PROPRIEDADE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    try {
        // Caminho para o arquivo JSON de coordenadas
        const jsonPath = path.join(__dirname, '..', 'src', 'services', 'coordenadas.json');
        
        console.log('📂 Arquivo JSON:', jsonPath);
        console.log('🔑 Polígono: poligono_propriedade_1');
        console.log('');

        // Definir período (último ano)
        const hoje = new Date();
        const umAnoAtras = new Date();
        umAnoAtras.setFullYear(hoje.getFullYear() - 1);

        const dateFrom = umAnoAtras.toISOString();
        const dateTo = hoje.toISOString();

        console.log('📅 Período da imagem:');
        console.log(`   De: ${dateFrom.split('T')[0]}`);
        console.log(`   Até: ${dateTo.split('T')[0]}`);
        console.log('');

        console.log('🛰️ Processando...');
        console.log('⏳ Isso pode levar alguns segundos...');
        console.log('');

        // GERAR IMAGEM COM POLÍGONO
        const imagePath = await satelliteService.processPolygonFromJson(
            jsonPath,
            'poligono_propriedade_1',
            dateFrom,
            {
                width: 1024,
                height: 1024,
                label: 'Propriedade 1',
                polygonColor: '#FF0000',  // Vermelho
                fillOpacity: 0.3          // 30% transparente
            }
        );

        console.log('');
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║               ✅ SUCESSO!                            ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📁 Imagem salva em:');
        console.log(`   ${imagePath}`);
        console.log('');
        console.log('🎨 A imagem contém:');
        console.log('   ✓ Imagem de satélite de alta qualidade');
        console.log('   ✓ Polígono vermelho desenhado sobre a propriedade');
        console.log('   ✓ Preenchimento semi-transparente');
        console.log('   ✓ Pontos marcando os vértices');
        console.log('   ✓ Label com o nome da propriedade');
        console.log('   ✓ Informações de data e número de vértices');
        console.log('');
        console.log('💡 Abra a imagem para visualizar o resultado!');
        console.log('');

        return imagePath;

    } catch (error) {
        console.error('');
        console.error('╔═══════════════════════════════════════════════════════╗');
        console.error('║               ❌ ERRO!                               ║');
        console.error('╚═══════════════════════════════════════════════════════╝');
        console.error('');
        console.error('Erro:', (error as Error).message);
        console.error('');
        console.error('Possíveis causas:');
        console.error('  1. Arquivo coordenadas.json não encontrado');
        console.error('  2. Credenciais do Sentinel Hub não configuradas');
        console.error('  3. Problema de conexão com a API');
        console.error('  4. Formato inválido no JSON');
        console.error('');

        throw error;
    }
}

async function testarVariasOpcoes() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TESTE COM DIFERENTES OPÇÕES DE VISUALIZAÇÃO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    const jsonPath = path.join(__dirname, '..', 'src', 'services', 'coordenadas.json');
    const dateFrom = "2024-06-01T00:00:00Z";
    const dateTo = "2024-12-31T23:59:59Z";

    // Opção 1: Vermelho com transparência
    console.log('🎨 Opção 1: Polígono vermelho semi-transparente');
    console.log('──────────────────────────────────────────────────────');
    try {
        const img1 = await satelliteService.processPolygonFromJson(
            jsonPath,
            'poligono_propriedade_1',
            dateFrom,
            {
                width: 800,
                height: 800,
                label: 'Propriedade - Vermelho',
                polygonColor: '#FF0000',
                fillOpacity: 0.3
            }
        );
        console.log('✅ Sucesso:', img1);
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');

    // Aguardar 3 segundos entre requisições
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Opção 2: Verde com mais opacidade
    console.log('🎨 Opção 2: Polígono verde com mais destaque');
    console.log('──────────────────────────────────────────────────────');
    try {
        const img2 = await satelliteService.processPolygonFromJson(
            jsonPath,
            'poligono_propriedade_1',
            dateFrom,
            {
                width: 800,
                height: 800,
                label: 'Propriedade - Verde',
                polygonColor: '#00FF00',
                fillOpacity: 0.5
            }
        );
        console.log('✅ Sucesso:', img2);
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');

    // Aguardar 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Opção 3: Azul apenas contorno
    console.log('🎨 Opção 3: Apenas contorno azul (sem preenchimento)');
    console.log('──────────────────────────────────────────────────────');
    try {
        const img3 = await satelliteService.processPolygonFromJson(
            jsonPath,
            'poligono_propriedade_1',
            dateFrom,
            {
                width: 800,
                height: 800,
                label: 'Propriedade - Contorno',
                polygonColor: '#0000FF',
                fillOpacity: 0.1
            }
        );
        console.log('✅ Sucesso:', img3);
    } catch (error) {
        console.error('❌ Erro:', (error as Error).message);
    }
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('  TODOS OS TESTES CONCLUÍDOS!');
    console.log('═══════════════════════════════════════════════════════');
}

// Executar
if (require.main === module) {
    const tipoTeste = process.argv[2] || '1';

    if (tipoTeste === '2') {
        console.log('');
        testarVariasOpcoes()
            .then(() => {
                console.log('\n✅ Processo concluído!');
                console.log('📁 Verifique a pasta temp_images/ para ver as imagens geradas');
            })
            .catch(err => {
                console.error('\n❌ Erro:', err.message);
                process.exit(1);
            });
    } else {
        console.log('');
        testarPoligonoDoJSON()
            .then(() => {
                console.log('═══════════════════════════════════════════════════════');
                process.exit(0);
            })
            .catch(err => {
                console.error('═══════════════════════════════════════════════════════');
                process.exit(1);
            });
    }
}

export { testarPoligonoDoJSON, testarVariasOpcoes };
