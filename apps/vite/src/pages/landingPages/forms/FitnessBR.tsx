import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import './Forms.css';

// TypeScript interfaces
interface Question {
  id: string;
  type: 'welcome' | 'text' | 'number' | 'email' | 'textarea' | 'yes_no' | 'multiple_choice' | 'multiple_select' | 'checkbox' | 'thank_you';
  title: string;
  description?: string;
  buttonText?: string;
  options?: string[];
  required?: boolean;
  condition?: {
    id: string;
    value: string;
  };
}

interface Answers {
  [key: string]: string | string[] | number;
}

interface EmailTemplateParams {
  to_email: string;
  client_name: string;
  client_email: string;
  email_body: string;
  [key: string]: unknown;
}

const FitnessBR: React.FC = () => {
  console.log('FitnessBR component is rendering...');
  
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>('');
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(() => [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Questionário Profissional para Consultoria Fitness & Fisiculturismo',
      description: 'Adaptável para qualquer nível: do iniciante ao atleta de palco',
      buttonText: 'Começar'
    },
    // BLOCO 1 — INFORMAÇÕES PESSOAIS E BÁSICAS
    {
      id: 'block1_header',
      type: 'welcome',
      title: 'BLOCO 1 — INFORMAÇÕES PESSOAIS E BÁSICAS',
      description: 'Vamos começar com algumas informações básicas sobre você.',
      buttonText: 'Continuar'
    },
    { id: 'nome_completo', type: 'text', title: '1. Nome completo:', required: true },
    { id: 'data_nascimento', type: 'text', title: '2. Data de nascimento:', required: true },
    { id: 'altura', type: 'number', title: '3. Altura (em cm):', required: true },
    { id: 'peso', type: 'number', title: '4. Peso atual (em kg):', required: true },
    { id: 'percentual_gordura', type: 'text', title: '5. Percentual de gordura corporal (se souber):', required: false },
    { id: 'localizacao', type: 'text', title: '6. Localização (cidade e país):', required: true },
    { id: 'profissao', type: 'textarea', title: '7. Profissão e rotina de trabalho (turnos, carga horária, sedentarismo ou atividade):', required: true },
    { id: 'horario_sono', type: 'text', title: '8. Horário habitual de sono:', required: true },
    { 
      id: 'horas_sono', 
      type: 'multiple_choice', 
      title: '9. Quantas horas dorme por noite, em média?',
      options: ['Menos de 5h', '5h', '6h', '7h', '8h', 'Mais de 8h'],
      required: true 
    },
    { 
      id: 'tipo_sono', 
      type: 'multiple_choice', 
      title: '10. Seu sono é:',
      options: ['Leve', 'Médio', 'Profundo'],
      required: true 
    },
    { id: 'acorda_descansado', type: 'yes_no', title: '11. Costuma acordar descansado(a)?', required: true },
    { id: 'energia_dia', type: 'textarea', title: '12. Como descreveria sua energia ao longo do dia?', required: true },
    { id: 'fuma', type: 'yes_no', title: '13. Você fuma?', required: true },
    { id: 'alcool', type: 'yes_no', title: '14. Consome bebidas alcoólicas?', required: true },
    { id: 'alcool_detalhes', type: 'textarea', title: 'Frequência e quantidade:', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'gestante', type: 'yes_no', title: '15. Está gestante ou tentando engravidar? (se aplicável)', required: false },

    // BLOCO 2 — HISTÓRICO DE SAÚDE
    {
      id: 'block2_header',
      type: 'welcome',
      title: 'BLOCO 2 — HISTÓRICO DE SAÚDE',
      description: 'Vamos conhecer um pouco sobre sua saúde e histórico médico.',
      buttonText: 'Continuar'
    },
    { id: 'doencas', type: 'textarea', title: '16. Possui alguma doença diagnosticada? (ex: hipotireoidismo, SOP, resistência insulínica, etc)', required: false },
    { id: 'lesoes', type: 'textarea', title: '17. Já sofreu alguma lesão? Detalhe local e ano:', required: false },
    { id: 'cirurgias', type: 'textarea', title: '18. Já passou por alguma cirurgia? Qual e quando?', required: false },
    { id: 'medicacao', type: 'textarea', title: '19. Usa alguma medicação contínua? Qual?', required: false },
    { id: 'alergias', type: 'textarea', title: '20. Possui alergias alimentares ou intolerâncias?', required: false },
    { id: 'anticoncepcional', type: 'textarea', title: '21. Faz uso de anticoncepcional? (especifique tipo e forma)', required: false },
    { id: 'exames_sangue', type: 'yes_no', title: '22. Já realizou exames de sangue nos últimos 6 meses?', required: true },
    { id: 'exames_alteracoes', type: 'textarea', title: 'Se sim, possui alterações?', condition: { id: 'exames_sangue', value: 'Yes' }, required: true },

    // BLOCO 3 — HISTÓRICO DE TREINOS E NÍVEL
    {
      id: 'block3_header',
      type: 'welcome',
      title: 'BLOCO 3 — HISTÓRICO DE TREINOS E NÍVEL',
      description: 'Conte-nos sobre sua experiência com treinos.',
      buttonText: 'Continuar'
    },
    { id: 'tempo_treino', type: 'text', title: '23. Há quanto tempo você treina de forma consistente?', required: true },
    { id: 'fases_cutting_bulking', type: 'textarea', title: '24. Já passou por fases de cutting ou bulking? Quantas vezes?', required: false },
    { id: 'acompanhamento', type: 'textarea', title: '25. Já teve acompanhamento profissional? (Treinador ou nutricionista esportivo?)', required: false },
    { 
      id: 'tipo_treino', 
      type: 'multiple_select', 
      title: '26. Você treina atualmente com:',
      options: ['Musculação clássica', 'Funcional', 'Crossfit', 'Cardio livre', 'Outros'],
      required: true 
    },
    { id: 'tipo_treino_outros', type: 'text', title: 'Se outros, especifique:', condition: { id: 'tipo_treino', value: 'Outros' }, required: true },
    { id: 'dias_treino', type: 'text', title: '27. Quantos dias por semana você consegue treinar com qualidade?', required: true },
    { id: 'tempo_treino_dia', type: 'text', title: '28. Quanto tempo disponível por treino?', required: true },
    { 
      id: 'local_treino', 
      type: 'multiple_choice', 
      title: '29. Tem preferência por treinar em casa ou academia?',
      options: ['Casa', 'Academia', 'Ambos'],
      required: true 
    },
    { id: 'restricao_equipamento', type: 'textarea', title: '30. Possui restrição de equipamento?', required: false },

    // BLOCO 4 — OBJETIVOS E FOCO ESTÉTICO
    {
      id: 'block4_header',
      type: 'welcome',
      title: 'BLOCO 4 — OBJETIVOS E FOCO ESTÉTICO',
      description: 'Quais são seus objetivos e metas estéticas?',
      buttonText: 'Continuar'
    },
    { 
      id: 'objetivo_principal', 
      type: 'multiple_choice', 
      title: '31. Qual seu objetivo principal?',
      options: ['Perder gordura', 'Ganhar massa muscular', 'Recomposição corporal', 'Melhorar performance', 'Estética de palco'],
      required: true 
    },
    { id: 'objetivo_secundario', type: 'textarea', title: '32. Qual seu objetivo secundário?', required: false },
    { id: 'competir', type: 'textarea', title: '33. Pretende competir? Se sim, em qual categoria e federação?', required: false },
    { id: 'prazo_objetivo', type: 'text', title: '34. Qual o prazo para alcançar esse objetivo?', required: true },
    { id: 'dieta_restrita', type: 'yes_no', title: '35. Está disposto(a) a fazer dieta restrita se necessário?', required: true },
    { id: 'protocolos_avancados', type: 'yes_no', title: '36. Aceita protocolos de estratégias avançadas (depleção, carga, jejum estratégico, etc)?', required: true },
    { id: 'enfase_corpo', type: 'textarea', title: '37. Possui alguma área do corpo que deseja dar maior ênfase?', required: false },
    { id: 'dificuldade_desenvolver', type: 'textarea', title: '38. Existe alguma parte que sente dificuldade de ativar ou desenvolver?', required: false },
    { id: 'anabolizantes', type: 'textarea', title: '39. Já usou anabolizantes ou ergogênicos? Quais e quando?', required: false },
    { id: 'estrategia_farmacologica', type: 'yes_no', title: '40. Pretende usar alguma estratégia farmacológica sob orientação profissional?', required: false },

    // BLOCO 5 — TREINO: GOSTOS, LIMITAÇÕES E BIOFEEDBACK
    {
      id: 'block5_header',
      type: 'welcome',
      title: 'BLOCO 5 — TREINO: GOSTOS, LIMITAÇÕES E BIOFEEDBACK',
      description: 'Vamos entender suas preferências e limitações de treino.',
      buttonText: 'Continuar'
    },
    { id: 'exercicios_gosta', type: 'textarea', title: '41. Quais exercícios você mais gosta? Por quê?', required: true },
    { id: 'exercicios_detesta', type: 'textarea', title: '42. Quais exercícios você detesta? Por quê?', required: true },
    { id: 'exercicios_lesao', type: 'textarea', title: '43. Tem algum exercício que você não pode fazer por lesão ou desconforto?', required: false },
    { 
      id: 'facilidade_treino', 
      type: 'multiple_choice', 
      title: '44. Você sente mais facilidade com:',
      options: ['Cargas altas', 'Volume alto (mais repetições)', 'Técnicas avançadas (drop-set, rest-pause)'],
      required: true 
    },
    { id: 'dificuldade_grupo', type: 'textarea', title: '45. Sente dificuldade de sentir algum grupo muscular? Qual?', required: false },
    { id: 'grupo_responde_facil', type: 'textarea', title: '46. Qual grupo muscular sente que responde mais fácil?', required: true },
    { id: 'dores_articulares', type: 'textarea', title: '47. Costuma ter dores articulares? Onde e com que frequência?', required: false },
    { 
      id: 'reacao_treino', 
      type: 'multiple_choice', 
      title: '48. Como reage após o treino?',
      options: ['Energizado', 'Exausto', 'Sonolento', 'Irritado ou com fome'],
      required: true 
    },
    { id: 'dificuldade_ficha', type: 'yes_no', title: '49. Tem dificuldade de seguir ficha sozinha(o)?', required: true },
    { 
      id: 'preferencia_treino', 
      type: 'multiple_choice', 
      title: '50. Gosta de treinos com variação constante ou sequência repetida com progressão?',
      options: ['Variação constante', 'Sequência repetida com progressão', 'Ambos'],
      required: true 
    },

    // BLOCO 6 — CARDIO, FLEXIBILIDADE E CONDICIONAMENTO
    {
      id: 'block6_header',
      type: 'welcome',
      title: 'BLOCO 6 — CARDIO, FLEXIBILIDADE E CONDICIONAMENTO',
      description: 'Informações sobre sua capacidade cardiovascular e flexibilidade.',
      buttonText: 'Continuar'
    },
    { id: 'resistencia_aerobica', type: 'textarea', title: '51. Qual sua resistência para atividades aeróbicas?', required: true },
    { id: 'hiit', type: 'textarea', title: '52. Já praticou HIIT? Gosta ou sente mal-estar?', required: true },
    { id: 'cardio_jejum', type: 'yes_no', title: '53. Está disposto(a) a incluir cardio em jejum, se necessário?', required: true },
    { id: 'limitacao_respiratoria', type: 'textarea', title: '54. Tem alguma limitação respiratória ou cardiovascular?', required: false },
    { id: 'mobilidade', type: 'textarea', title: '55. Consegue realizar exercícios de mobilidade e alongamento? Faz atualmente?', required: true },

    // BLOCO 7 — ROTINA, ADERÊNCIA E MENTALIDADE
    {
      id: 'block7_header',
      type: 'welcome',
      title: 'BLOCO 7 — ROTINA, ADERÊNCIA E MENTALIDADE',
      description: 'Vamos entender sua rotina e mentalidade.',
      buttonText: 'Continuar'
    },
    { id: 'dias_treino_facilidade', type: 'textarea', title: '56. Quais dias da semana são mais fáceis para treinar? E quais são os mais difíceis?', required: true },
    { id: 'desafio_constancia', type: 'textarea', title: '57. Qual o maior desafio hoje para manter constância nos treinos?', required: true },
    { id: 'apoio_familia', type: 'yes_no', title: '58. Tem apoio da família ou pessoas próximas para seguir sua rotina fitness?', required: true },
    { id: 'motivo_desistencia', type: 'textarea', title: '59. O que te desanima ou te faz desistir de planos anteriores?', required: true },
    { 
      id: 'comprometimento', 
      type: 'multiple_choice', 
      title: '60. De 0 a 10, qual seu grau de comprometimento atual com seus objetivos?',
      options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      required: true 
    },

    // BLOCO 8 — FOTOS E ACOMPANHAMENTO
    {
      id: 'block8_header',
      type: 'welcome',
      title: 'BLOCO 8 — FOTOS E ACOMPANHAMENTO (opcional)',
      description: 'Como podemos acompanhar sua evolução?',
      buttonText: 'Continuar'
    },
    { id: 'fotos_corporais', type: 'yes_no', title: '61. Está disposto(a) a enviar fotos corporais para evolução?', required: false },
    { id: 'fotos_anteriores', type: 'yes_no', title: '62. Já tem fotos comparativas anteriores?', required: false },
    { 
      id: 'checkins', 
      type: 'multiple_choice', 
      title: '63. Deseja fazer check-ins semanais ou quinzenais?',
      options: ['Semanais', 'Quinzenais', 'Mensais', 'Não desejo check-ins regulares'],
      required: true 
    },
    { id: 'apps_registro', type: 'yes_no', title: '64. Gosta de usar apps para registrar treinos ou alimentação?', required: true },

    // BLOCO 9 — SUPLEMENTAÇÃO E DIETA
    {
      id: 'block9_header',
      type: 'welcome',
      title: 'BLOCO 9 — SUPLEMENTAÇÃO E DIETA (resumo inicial)',
      description: 'Informações sobre sua alimentação e suplementação.',
      buttonText: 'Continuar'
    },
    { id: 'plano_alimentar', type: 'textarea', title: '65. Está com plano alimentar ativo? Feito por quem?', required: false },
    { id: 'suplementos', type: 'textarea', title: '66. Quais suplementos você usa atualmente (marca e dose)?', required: false },
    { id: 'ajuste_dieta', type: 'yes_no', title: '67. Está disposto(a) a ajustar sua dieta conforme o treino periodizado?', required: true },
    { id: 'facilidade_cozinhar', type: 'yes_no', title: '68. Tem facilidade de cozinhar/preparar suas refeições?', required: true },
    { 
      id: 'preferencia_dieta', 
      type: 'multiple_choice', 
      title: '69. Prefere dieta fixa ou com opções e substituições?',
      options: ['Dieta fixa', 'Com opções e substituições'],
      required: true 
    },
    
    // BLOCO 10 — HIDRATAÇÃO
    {
      id: 'block10_header',
      type: 'welcome',
      title: 'BLOCO 10 — HIDRATAÇÃO',
      description: 'Informações sobre seus hábitos de hidratação.',
      buttonText: 'Continuar'
    },
    { id: 'consumo_agua', type: 'text', title: '70. Quanta água você bebe por dia (em litros)?', required: true },
    { id: 'monitora_agua', type: 'yes_no', title: '71. Você monitora sua ingestão de água?', required: true },
    { id: 'sede_dia', type: 'textarea', title: '72. Você sente sede ao longo do dia ou durante os treinos?', required: true },
    { id: 'eletrolitos', type: 'yes_no', title: '73. Você adiciona eletrólitos ou usa suplementos de hidratação?', required: false },
    
    // BLOCO 11 — PAD (Padrão de Ativação e Dor)
    {
      id: 'block11_header',
      type: 'welcome',
      title: 'BLOCO 11 — PAD (Padrão de Ativação e Dor)',
      description: 'Informações sobre sua conexão neuromuscular e padrões de dor.',
      buttonText: 'Continuar'
    },
    { id: 'ativacao_muscular', type: 'textarea', title: '74. Você sente o músculo-alvo trabalhando na maioria dos exercícios? Se não, em quais exercícios tem dificuldade de ativação?', required: true },
    { id: 'dor_muscular', type: 'textarea', title: '75. Você costuma sentir dor muscular após o treino? Quais grupos musculares respondem mais?', required: true },
    { id: 'dor_articular', type: 'textarea', title: '76. Você sente dor nas articulações durante o treino? Se sim, onde e quando?', required: false },
    
    // Email e Conclusão
    {
      id: 'informacao_adicional',
      type: 'textarea',
      title: '77. Existe algo a mais que gostaria de compartilhar comigo, e que não consta neste form?',
      required: false
    },
    {
      id: 'email',
      type: 'email',
      title: 'Por favor, forneça seu e-mail para receber seu plano personalizado',
      required: true
    },
    {
      id: 'thankYou',
      type: 'thank_you',
      title: 'Obrigado por completar o questionário!',
      description: 'Analisaremos suas respostas e enviaremos seu plano personalizado em breve.'
    }
  ], []);

  const shouldDisplayQuestion = useCallback((question: Question): boolean => {
    if (!question.condition) return true;
    const { id, value } = question.condition;
    return answers[id] === value;
  }, [answers]);

  const getNextQuestion = useCallback((currentIndex: number): number => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (shouldDisplayQuestion(questions[i])) {
        return i;
      }
    }
    return questions.length - 1;
  }, [questions, shouldDisplayQuestion]);

  const handleAnswer = useCallback((questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (questionId === 'email') {
      setClientEmail(String(answer));
    }

    // Find the current question
    const currentQ = questions.find(q => q.id === questionId);
    
    if (!currentQ) return;
    
    // If it's a yes/no question
    if (currentQ.type === 'yes_no') {
      // If answer is 'No', find the next non-conditional question
      if (answer === 'No') {
        const nextIndex = getNextQuestion(currentQuestion);
        setCurrentQuestion(nextIndex);
        if (nextIndex === questions.length - 1) {
          setFormCompleted(true);
        }
        return;
      }
      // If answer is 'Yes', find the next conditional question
      if (answer === 'Yes') {
        const nextIndex = questions.findIndex((q, index) => 
          index > currentQuestion && 
          q.condition && 
          q.condition.id === questionId && 
          q.condition.value === 'Yes'
        );
        if (nextIndex !== -1) {
          setCurrentQuestion(nextIndex);
          return;
        }
      }
    }

    // For all other questions, proceed to next question
    const nextIndex = getNextQuestion(currentQuestion);
    setCurrentQuestion(nextIndex);
    if (nextIndex === questions.length - 1) {
      setFormCompleted(true);
    }
  }, [currentQuestion, getNextQuestion, questions]);

  const generatePDFAndSendEmail = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    console.log('Starting generatePDFAndSendEmail...');
    try {
      console.log('Building email body...');
      let emailBody = '<h1>Fitness Assessment</h1>';
      emailBody += '<h2>Client Details</h2>';
      emailBody += `<p><strong>Name:</strong> ${answers.nome_completo || 'N/A'}</p>`;
      emailBody += `<p><strong>Birth Date:</strong> ${answers.data_nascimento || 'N/A'}</p>`;
      emailBody += `<p><strong>Height:</strong> ${answers.altura || 'N/A'} cm</p>`;
      emailBody += `<p><strong>Weight:</strong> ${answers.peso || 'N/A'} kg</p>`;
      emailBody += `<p><strong>Main Goal:</strong> ${answers.objetivo_principal || 'N/A'}</p>`;
      emailBody += '<h2>Questionnaire Responses</h2>';
      
      questions.forEach((question) => {
        if (question.type === 'welcome' || question.type === 'thank_you' || 
            ['nome_completo', 'data_nascimento', 'altura', 'peso', 'objetivo_principal', 'email'].includes(question.id)) {
          return;
        }
        if (!shouldDisplayQuestion(question)) {
          return;
        }
        if (!answers[question.id] && answers[question.id] !== 0) {
          return;
        }
        let answerText = answers[question.id];
        if (Array.isArray(answerText)) {
          answerText = answerText.join(', ');
        }
        emailBody += `<p><strong>${question.title}</strong><br>${answerText}</p>`;
      });

      const templateParams: EmailTemplateParams = {
        to_email: 'jacksouto7@gmail.com',
        client_name: String(answers.nome_completo || 'Client'),
        client_email: clientEmail || 'N/A',
        email_body: emailBody
      };
      console.log('Email params prepared:', templateParams);

      console.log('Sending email via EmailJS...');
      const response = await emailjs.send(
        'service_28v1fvr',   // Service ID
        'template_48ud7sn',  // Template ID
        templateParams,
        'ezbPPmM_lDMistyGT' // Public Key
      );
      console.log('EmailJS response:', response);

      setEmailSent(true);
      console.log('Email sent successfully, state updated');
    } catch (error) {
      console.error('Error in generatePDFAndSendEmail:', error);
      alert('Failed to send email. Please check the console for details and try again.');
    } finally {
      setIsLoading(false);
      console.log('Process completed, loading state reset');
    }
  }, [answers, clientEmail, questions, shouldDisplayQuestion]);

  useEffect(() => {
    if (formCompleted) {
      generatePDFAndSendEmail();
    }
  }, [formCompleted, generatePDFAndSendEmail]);

  const renderQuestion = (): React.ReactElement => {
    console.log('renderQuestion called, currentQuestion:', currentQuestion);
    console.log('questions.length:', questions.length);
    console.log('questions[0]:', questions[0]);
    
    const currentQ = questions[currentQuestion];
    console.log('currentQ:', currentQ);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, value: string | string[] | number | undefined) => {
      if (e.key === 'Enter' && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || '');
      }
    };

    const handleBack = (): void => {
      // Find the previous visible question
      for (let i = currentQuestion - 1; i >= 0; i--) {
        if (shouldDisplayQuestion(questions[i])) {
          setCurrentQuestion(i);
          break;
        }
      }
    };

    if (currentQ.type === 'welcome') {
      return (
        <div className="question-card welcome">
          <h1>{currentQ.title}</h1>
          <p>{currentQ.description}</p>
          <button 
            className="typeform-btn"
            onClick={() => setCurrentQuestion(getNextQuestion(currentQuestion))}
          >
            {currentQ.buttonText}
          </button>
        </div>
      );
    }

    if (currentQ.type === 'thank_you') {
      return (
        <div className="question-card thank-you">
          <h1>{currentQ.title}</h1>
          <p>{currentQ.description}</p>
          {isLoading && <p className="processing">Processing your responses...</p>}
          {emailSent && <p className="success">Successfully submitted! Check your email soon.</p>}
        </div>
      );
    }

    return (
      <div className="question-card" ref={formRef}>
        <h2>{currentQ.title}</h2>
        {currentQ.description && <p className="description">{currentQ.description}</p>}

        {['text', 'number', 'email'].includes(currentQ.type) && (
          <div className="input-group">
            <input
              type={currentQ.type}
              placeholder="Type your answer..."
              value={String(answers[currentQ.id] || '')}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
            />
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button 
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'textarea' && (
          <div className="input-group">
            <textarea
              placeholder="Type your answer..."
              value={String(answers[currentQ.id] || '')}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
            />
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button 
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'yes_no' && (
          <div className="input-group">
            <div className="options-group">
              <button
                className={`typeform-option ${answers[currentQ.id] === 'Yes' ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, 'Yes')}
              >
                Yes
              </button>
              <button
                className={`typeform-option ${answers[currentQ.id] === 'No' ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, 'No')}
              >
                No
              </button>
            </div>
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_choice' && (
          <div className="input-group">
            <div className="options-group">
              {currentQ.options?.map((option) => (
                <button
                  key={option}
                  className={`typeform-option ${answers[currentQ.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_select' && (
          <div className="options-group">
            {currentQ.options?.map((option) => (
              <button
                key={option}
                className={`typeform-option ${
                  Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).includes(option) ? 'selected' : ''
                }`}
                onClick={() => {
                  const currentSelection = (answers[currentQ.id] as string[]) || [];
                  const newSelection = currentSelection.includes(option)
                    ? currentSelection.filter(item => item !== option)
                    : [...currentSelection, option];
                  setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                }}
              >
                {option}
              </button>
            ))}
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                disabled={currentQ.required && (!answers[currentQ.id] || (Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).length === 0))}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'checkbox' && (
          <div className="input-group">
            <div className="options-group">
              {currentQ.options?.map((option) => (
                <button
                  key={option}
                  className={`typeform-option ${
                    Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).includes(option) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    const currentSelection = (answers[currentQ.id] as string[]) || [];
                    const newSelection = currentSelection.includes(option)
                      ? currentSelection.filter(item => item !== option)
                      : [...currentSelection, option];
                    setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="button-group">
              <div className="button-left">
                {currentQuestion > 0 && (
                  <button 
                    className="typeform-btn back-btn"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="button-right">
                <button
                  className="typeform-btn"
                  onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressTimeline = () => {
    if (currentQuestion === 1 || isLoading || emailSent) return null;

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length - 1; // Exclude welcome question
    const timelineProgress = (answeredQuestions / totalQuestions) * 100;

    // Sample timeline data - customize based on your question structure
    const timelineSteps = [
      { id: 1, title: "Informações Pessoais", description: "Dados pessoais e de contato" },
      { id: 2, title: "Histórico de Saúde", description: "Informações sobre sua saúde" },
      { id: 3, title: "Histórico de Treinos", description: "Experiência com treinos" },
      { id: 4, title: "Objetivos", description: "Metas e objetivos desejados" },
      { id: 5, title: "Treino: Gostos e Limitações", description: "Preferências e restrições" },
      { id: 6, title: "Cardio e Flexibilidade", description: "Capacidade cardiovascular e flexibilidade" },
      { id: 7, title: "Rotina e Mentalidade", description: "Adaptação e desafios" },
      { id: 8, title: "Fotos e Acompanhamento", description: "Registro de evolução" },
      { id: 9, title: "Suplementação e Dieta", description: "Informações sobre dieta e suplementos" },
      { id: 10, title: "Hidratação", description: "Hábitos de hidratação" },
      { id: 11, title: "PAD", description: "Padrão de ativação e dor" },
    ];

    return (
      <div 
        className="progress-timeline"
        style={{ '--timeline-progress': `${timelineProgress}%` } as React.CSSProperties}
      >
        <div className="timeline-header">
          <h3>Seu Progresso</h3>
          <p>Acompanhe o preenchimento do formulário</p>
        </div>
        
        <div className="timeline-container">
          <div className="timeline-line"></div>
          <div className="timeline-items">
            {timelineSteps.map((step, index) => {
              const isCompleted = index < Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
              const isCurrent = index === Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
              
              return (
                <div 
                  key={step.id} 
                  className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="question-stats">
          <div className="stat-item">
            <span className="stat-number">{answeredQuestions}</span>
            <span className="stat-label">Respondidas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalQuestions - answeredQuestions}</span>
            <span className="stat-label">Restantes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
            <span className="stat-label">Completo</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-form-container">
      <div className="form-content-wrapper">
        {/* Progress bar at top */}
        {currentQuestion > 1 && !isLoading && !emailSent && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${((currentQuestion - 1) / (questions.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        )}
        
        {/* Main question card - centered */}
        <div className="question-card">
          {renderQuestion()}
        </div>
        
        {/* Progress timeline below */}
        {renderProgressTimeline()}
      </div>
    </div>
  );
};

export default FitnessBR;
