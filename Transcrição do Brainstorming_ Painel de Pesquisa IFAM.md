# Registro de Ideação e Brainstorming: Plataforma Painel de Pesquisa IFAM

Este documento é um registro cronológico e detalhado de toda a nossa conversa \(brainstorming\) que deu origem à arquitetura, regras de negócio e visão tecnológica da plataforma __Painel de Pesquisa__ do Instituto Federal do Amazonas \(IFAM\)\.

## Fase 1: O Diagnóstico do Problema Atual

__O Cenário \(Visão do Gestor\):__ O IFAM possui diversos editais \(PIBIC, PAIC\) rodando ao longo do ano com critérios diferentes\. Atualmente, o gerenciamento de submissões, avaliações, termos de compromisso e relatórios de alunos e orientadores espalhados por vários campi é feito de forma totalmente artesanal \(e\-mails, WhatsApp, pastas compartilhadas\)\. Isso gera "dados invisíveis" e desatualizados, dificultando o acompanhamento em tempo real do progresso da pesquisa, das entregas e da formalização\.

__A Solução Proposta \(A IA\):__ Centralizar o fluxo saindo da "Era do PDF e E\-mail" para a "Era dos Dados Estruturados", criando um Painel com submissão centralizada, workflow de avaliação digital e métricas em tempo real\.

## Fase 2: O Labirinto do Fomento \(FAPEAM, CNPq, IFAM\)

__O Desafio \(Visão do Gestor\):__ Além da complexidade interna, as bolsas são pagas por agentes diferentes \(FAPEAM, CNPq, IFAM ou Voluntários\)\. A FAPEAM, por exemplo, tem regras rígidas \(como conta exclusiva no Bradesco/Next\) e prazos rigorosos de relatórios\. O IFAM precisa de um "espelho" para não perder de vista as exigências da agência externa\.

__A Solução Proposta \(A IA\):__ Criar Trilhas de Financiamento Personalizadas\. Se o aluno é FAPEAM, o sistema trava o cadastro se o banco não for o Bradesco\. O Painel notifica o orientador sobre relatórios parciais \(6 meses\) e finais, garantindo que o IFAM guarde a cópia institucional das pesquisas\.

## Fase 3: A Revolução dos Dados Estruturados e o Papel do Aluno

__O Desafio \(Visão do Gestor\):__ E se o próprio aluno submetesse item por item? E sobre as frequências, ao invés de anexar um PDF assinado, não seria melhor um formulário estruturado onde o aluno informa a carga horária, seleciona as atividades em um "dropdown" e cadastra os frutos \(produtos\) da pesquisa?

__A Solução Proposta \(A IA\):__ Esta foi a virada de chave do projeto\. Descentralizou\-se o trabalho braçal\. O aluno preenche os dados puros\. O Orientador valida \(Mérito Acadêmico\)\. O Coordenador de Campus consolida\. A Reitoria apenas visualiza o painel final\. O arquivo PDF de frequência foi abolido em prol de um banco de dados inteligente\.

## Fase 4: A Infraestrutura de Acesso e Parametrização

__O Desafio \(Visão do Gestor\):__ O IFAM ainda não usa o SUAP \(usa o SIPAC\)\. O acesso deve ser feito estritamente pelo e\-mail institucional corporativo\. Os coordenadores de campus devem ter autonomia para cadastrar os cursos e semestres das suas unidades\.

__A Solução Proposta \(A IA\):__ Implementação de Single Sign\-On \(SSO\) com o e\-mail institucional, extinguindo a gestão de senhas\. Criação de um Módulo de Configuração de Campus, dando autonomia para os coordenadores prepararem o terreno local\.

## Fase 5: Visão Executiva e Automações \(Dashboard e Alertas\)

__O Desafio \(Visão do Gestor\):__ A alta gestão precisa ver a taxa de projetos vs projetos concluídos, os produtos gerados e filtros por campus e por edição \(cujo ciclo abrange dois anos, ex: 2026/2027\)\. Além disso, precisa de alertas por e\-mail e emissão de certificados automáticos\.

__A Solução Proposta \(A IA\):__ Desenho do "Dashboard Executivo" e do "Motor de Alertas"\. O sistema passará a atuar de forma proativa, cobrando atrasos de professores e lembrando do fechamento da folha\. Os certificados passaram a ter emissão em lote com QR Code de autenticidade\.

## Fase 6: Importação de Dados e Substituição de Bolsistas

__O Desafio \(Visão do Gestor\):__ A plataforma precisa absorver a edição atual 2026\-2027 \(que começa em agosto\) e lidar com algo crítico: a substituição de alunos desistentes no meio do projeto sem quebrar a planilha da Reitoria\.

__A Solução Proposta \(A IA\):__ Criou\-se o "Módulo de Importação", que lerá as planilhas consolidadas do Excel atual da coordenação para ativar os alunos direto na fase de frequência estruturada\. Para desistências, o sistema congelará o aluno A, exigirá relatório e fará o onboarding automático do aluno B, calculando posteriormente o tempo e o certificado de cada um de forma proporcional\.

## Fase 7: A Folha de Pagamento e o MVP

__O Desafio \(Visão do Gestor\):__ O pagamento da bolsa ocorre fora do sistema \(no SIPAC ou FAPEAM\)\. A tela de frequência precisa gerar a exportação para o pagamento\.

__A Solução Proposta \(A IA\):__ Definição do MVP \(Produto Mínimo Viável\) para agosto de 2026: A plataforma atua como ponte\. O aluno preenche a frequência \-> o professor valida \-> o coordenador aperta um botão e baixa um arquivo CSV limpo e mastigado, que é apenas copiado e colado no sistema pagador externo \(SIPAC\)\.

## Fase 8: A Grande Integração \(Grupos de Pesquisa e Open Science\)

__O Desafio \(Visão do Gestor\):__ O IFAM também possui Grupos de Pesquisa regidos pela Resolução nº 026/2014, que precisam de acompanhamento\. Além disso, a plataforma precisa ter uma face pública \(Vitrine\) para exibir os contatos, áreas, patentes e serviços para a sociedade\.

__A Solução Proposta \(A IA\):__ Criação do Módulo de Grupos de Pesquisa, amarrando obrigatoriamente a submissão de projetos aos grupos\. Desenvolvimento do "Portal Público de Inovação Aberta", sem necessidade de login, expondo o catálogo de pesquisadores, o repositório de artigos e patentes, servindo como uma ponte tecnológica entre o IFAM e as indústrias do Polo Industrial de Manaus, mantendo o sigilo financeiro e de dados \(LGPD\)\.

## Conclusão Final

Após toda essa jornada de concepção estratégica, o assistente de IA consolidou todas as ideias em dois documentos formais: o Termo de Referência \(TR\) e o Documento de Especificação Técnica de Requisitos, entregando à coordenação do IFAM o material pronto para iniciar o desenvolvimento da plataforma com a equipe de engenharia de software \(antigrafity\)\.

