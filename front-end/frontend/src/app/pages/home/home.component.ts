import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RelatorioService } from '../../core/services/relatorio.service';
import { AiAnalysisService, AnalysisInput } from '../../core/services/ai-analysis.service';
import { IRelatorio } from '../../core/models/relatorio.model';
import { IUser } from '../../core/models/user.model';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user = signal<IUser | null>(null);
  relatorios = signal<IRelatorio[]>([]);
  loading = signal(false);
  generatingReport = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private relatorioService: RelatorioService,
    private aiAnalysisService: AiAnalysisService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user.set(this.authService.currentUser());
    this.loadRelatorios();
  }

  loadRelatorios(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.relatorioService.getRelatoriosByUserId(userId).subscribe({
      next: (relatorios) => {
        this.relatorios.set(relatorios);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        if (error.code !== 'not-found' && error.code !== 'permission-denied') {
          this.errorMessage.set('Erro ao carregar relatórios');
        }
      }
    });
  }

  downloadRelatorio(relatorio: IRelatorio): void {
    this.relatorioService.downloadRelatorioPDF(relatorio);
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'pendente': 'badge-warning',
      'processando': 'badge-info',
      'concluido': 'badge-success',
      'erro': 'badge-danger'
    };
    return classes[status] || 'badge-default';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pendente': 'Pendente',
      'processando': 'Processando',
      'concluido': 'Concluído',
      'erro': 'Erro'
    };
    return texts[status] || status;
  }

  editQuestionario(): void {
    this.router.navigate(['/questionario']);
  }

  generateRelatorio(): void {
    const userId = this.user()?.id;
    if (!userId) {
      this.errorMessage.set('Usuário não encontrado');
      return;
    }

    const inputs: AnalysisInput = {
      areaTotal: 5.9,
      coordenadas: [[-53.5, -25.5]]
    };

    this.generatingReport.set(true);
    this.errorMessage.set('');

    console.log('🚀 Gerando relatório completo para usuário:', userId);

    this.aiAnalysisService.generateFullInventory(userId, inputs).subscribe({
      next: (response) => {
        console.log('✅ Relatório gerado com sucesso:', response.relatorioId);
        this.generatingReport.set(false);

        // Recarregar lista de relatórios
        this.loadRelatorios();

        // Mostrar mensagem de sucesso
        alert('✅ Relatório gerado com sucesso! Você pode baixá-lo abaixo.');
      },
      error: (error) => {
        console.error('❌ Erro ao gerar relatório:', error);
        this.generatingReport.set(false);
        this.errorMessage.set('Erro ao gerar relatório. Tente novamente.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
