import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IQuestionAndResponse } from '../../core/models/user.model';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface Question {
  num: number;
  question: string;
  placeholder: string;
  type?: 'text' | 'number' | 'date';
  section?: string;
  subsection?: string;
}

@Component({
  selector: 'app-questionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './questionario.component.html',
  styleUrls: ['./questionario.component.css']
})
export class QuestionarioComponent implements OnInit {
  questionForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  currentStep = signal(0);

  // Signals para garantir reatividade
  currentQuestion = signal<Question>({
    num: 1,
    question: '',
    placeholder: ''
  });
  totalSteps = signal(30);
  progress = signal(0);

  questions: Question[] = [
    { num: 1, question: 'Data de plantio', placeholder: 'DD/MM/AAAA', type: 'date', section: 'Tabela 1. Sistema de cultivo' },
    { num: 2, question: 'Data de colheita', placeholder: 'DD/MM/AAAA', type: 'date', section: 'Tabela 1. Sistema de cultivo' },
    { num: 3, question: 'Classe textural do solo', placeholder: 'Ex: Argiloso, Arenoso, etc.', section: 'Tabela 1. Sistema de cultivo' },
    { num: 4, question: 'Teor de argila no solo', placeholder: 'Ex: 35', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 5, question: 'Uso anterior da terra', placeholder: 'Ex: Pastagem, Floresta, etc.', section: 'Tabela 1. Sistema de cultivo' },
    { num: 6, question: 'Sistema de cultivo atual', placeholder: 'Ex: Plantio direto, Convencional, etc.', section: 'Tabela 1. Sistema de cultivo' },
    { num: 7, question: 'Tempo de adoção do sistema', placeholder: 'Ex: 5', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 8, question: 'Área de queima de resíduos da cultura (hectare)', placeholder: 'Ex: 10', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 9, question: 'Área de manejo de solos orgânicos (hectare)', placeholder: 'Ex: 5', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 10, question: 'Área cultivada (hectare)', placeholder: 'Ex: 50', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 11, question: 'Produtividade média (tonelada/hectare)', placeholder: 'Ex: 3.5', type: 'number', section: 'Tabela 1. Sistema de cultivo' },
    { num: 12, question: 'Adubação nitrogenada sintética (Exceto ureia) (kg/hectare)', placeholder: 'Ex: 120', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação sintética' },
    { num: 13, question: 'Teor de nitrogênio no adubo sintético (%)', placeholder: 'Ex: 45', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação sintética' },
    { num: 14, question: 'Ureia (kg/hectare)', placeholder: 'Ex: 100', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação sintética' },
    { num: 15, question: 'Calcário calcítico (kg/hectare)', placeholder: 'Ex: 2000', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Correção e condicionamento de solo' },
    { num: 16, question: 'Calcário dolomítico (kg/hectare)', placeholder: 'Ex: 1500', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Correção e condicionamento de solo' },
    { num: 17, question: 'Gesso agrícola (kg/hectare)', placeholder: 'Ex: 500', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Correção e condicionamento de solo' },
    { num: 18, question: 'Composto orgânico (kg/hectare)', placeholder: 'Ex: 300', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação orgânica' },
    { num: 19, question: 'Esterco (Bovino, equino, suino ou ovino) (kg/hectare)', placeholder: 'Ex: 500', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação orgânica' },
    { num: 20, question: 'Esterco (Avícola) (kg/hectare)', placeholder: 'Ex: 400', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação orgânica' },
    { num: 21, question: 'Outros (kg/hectare)', placeholder: 'Ex: 200', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação orgânica' },
    { num: 22, question: 'Leguminosa (kg/hectare)', placeholder: 'Ex: 80', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação verde' },
    { num: 23, question: 'Gramínea (kg/hectare)', placeholder: 'Ex: 100', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação verde' },
    { num: 24, question: 'Outros (kg/hectare)', placeholder: 'Ex: 50', type: 'number', section: 'Tabela 2. Adubação', subsection: 'Adubação verde' },
    { num: 25, question: 'Tipo de combustível', placeholder: 'Ex: Diesel, Biodiesel, etc.', section: 'Tabela 3. Consumo de combustível das operações mecanizadas' },
    { num: 26, question: 'Tipo de quantificação de consumo', placeholder: 'Ex: Medido, Estimado', section: 'Tabela 3. Consumo de combustível das operações mecanizadas' },
    { num: 27, question: 'Gasolina (litro)', placeholder: 'Ex: 500', type: 'number', section: 'Tabela 4. Consumo de combustível nas operações internas da propriedade' },
    { num: 28, question: 'Etanol hidratado (litro)', placeholder: 'Ex: 300', type: 'number', section: 'Tabela 4. Consumo de combustível nas operações internas da propriedade' },
    { num: 29, question: 'Tipo de combustível', placeholder: 'Ex: Diesel S-10', section: 'Tabela 5. Consumo de combustível no transporte da produção' },
    { num: 30, question: 'Quantidade consumida (litro)', placeholder: 'Ex: 1000', type: 'number', section: 'Tabela 5. Consumo de combustível no transporte da produção' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    const controls = this.questions.map(() => new FormControl(''));
    this.questionForm = this.fb.group({ responses: this.fb.array(controls) });

    // Inicializa valores
    this.totalSteps.set(this.questions.length);
    this.updateCurrentQuestion();

    // Effect para atualizar automaticamente quando currentStep mudar
    effect(() => {
      const step = this.currentStep();
      this.updateCurrentQuestion();
      this.progress.set(((step + 1) / this.questions.length) * 100);
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserResponses();
  }

  get responsesArray(): FormArray {
    return this.questionForm.get('responses') as FormArray;
  }

  get currentControl(): FormControl {
    return this.responsesArray.at(this.currentStep()) as FormControl;
  }

  private updateCurrentQuestion(): void {
    this.currentQuestion.set(this.questions[this.currentStep()]);
  }

  private loadUserResponses(): void {
    const user = this.authService.currentUser();
    if (user?.questionsAndResponses && user.questionsAndResponses.length > 0) {
      user.questionsAndResponses.forEach(item => {
        const index = item.num - 1;
        if (index >= 0 && index < this.responsesArray.length && item.response) {
          this.responsesArray.at(index).setValue(item.response);
        }
      });
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.questions.length - 1) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    const user = this.authService.currentUser();
    if (!user?.id) {
      this.errorMessage.set('Usuário não encontrado');
      this.loading.set(false);
      return;
    }

    const questionsAndResponses: IQuestionAndResponse[] = this.questions.map((q, index) => {
      const response = this.responsesArray.at(index).value || '';
      return { num: q.num, question: q.question, response };
    });

    const answeredCount = questionsAndResponses.filter(q => q.response !== '').length;

    this.userService.updateQuestionsAndResponses(user.id, questionsAndResponses).subscribe({
      next: (updatedUser) => {
        console.log(' Respostas salvas via API');
        this.authService.updateUser(updatedUser);
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error(' Erro:', error);
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Erro ao salvar');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
