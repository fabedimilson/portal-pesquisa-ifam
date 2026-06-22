# ESPECIFICAÇÃO TÉCNICA E FUNCIONAL DE REQUISITOS – PLATAFORMA PAINEL DE PESQUISA

__Destinatário:__ Equipe de Desenvolvimento de Software

__Objetivo:__ Fornecer o detalhamento completo para a arquitetura, engenharia de dados, regras de negócio e fluxos de trabalho para o desenvolvimento da plataforma "Painel de Pesquisa" do Instituto Federal do Amazonas \(IFAM\)\. Este documento servirá como guia para o desenvolvimento do Produto Mínimo Viável \(MVP\) e fases subsequentes\.

## 1\. CONTEXTO, DIAGNÓSTICO E JUSTIFICATIVA DO SISTEMA

O Instituto Federal do Amazonas \(IFAM\) gerencia anualmente um ecossistema complexo de pesquisa científica, composto por múltiplos editais \(como PIBIC e PAIC\), distribuídos por diversos campi do estado\. Atualmente, o fluxo operacional desde a submissão até a prestação de contas final é executado de forma descentralizada e manual \("trabalho artesanal"\), utilizando trocas de e\-mails, mensagens de WhatsApp e armazenamento não padronizado em pastas do Google Drive\.

Este modelo gera graves gargalos administrativos, apelidados de __"dados invisíveis"__: informações financeiras e acadêmicas ficam desatualizadas, o controle de cotas de bolsas por campus torna\-se suscetível a falhas humanas e a consolidação de relatórios de produtividade exige esforço manual hercúleo\. A plataforma Painel de Pesquisa foi concebida para centralizar esse fluxo, tratando dados não estruturados \(PDFs dispersos\) como dados estruturados, automatizando a esteira de governança corporativa e expondo os resultados da pesquisa para o mercado\.

## 2\. REQUISITOS ARQUITETURAIS E INFRAESTRUTURA BASE

### 2\.1 Autenticação e Controle de Acesso \(Single Sign\-On \- SSO\)

O sistema não deve possuir gerenciamento nativo de senhas para evitar passivos de suporte de TI\. A validação de identidade será feita obrigatoriamente via e\-mail institucional corporativo:

- __Servidores e Orientadores:__ Autenticação via padrão institucional \(ex: @ifam\.edu\.br\)\.
- __Discentes \(Bolsistas e Voluntários\):__ Autenticação via padrão discente \(ex: @aluno\.ifam\.edu\.br\)\.

### 2\.2 Parametrização Descentralizada por Campus

Na ausência de uma integração inicial por API com os sistemas acadêmicos centrais \(como o futuro SUAP ou o atual SIPAC\), o sistema adotará o modelo de autonomia local:

- O Coordenador de Pesquisa de cada campus possui perfil de __Administrador Local__\.
- Ele é responsável por cadastrar os cursos ofertados na sua respectiva unidade \(ex: *Técnico em Informática, Licenciatura em Química, Engenharia Civil*\) e os tempos de integralização teóricos \(semestres\)\.
- No primeiro login de um discente, o sistema exige que ele selecione o seu campus e, dinamicamente, filtra apenas os cursos homologados por aquele coordenador local\.

## 3\. ENGENHARIA DE MÓDULOS E REGRAS DE NEGÓCIO \(BACKEND & WORKFLOW\)

### 3\.1 Módulo de Admissão, Triagem e Regras de Fomento \(Filtros Inteligentes\)

O sistema precisa tratar de forma inteligente a origem financeira da cota \(Fomento\)\. No momento em que um projeto é ativado, o sistema aplica uma esteira de validação eletrônica para os documentos enviados pelos discentes:

__Modalidade de Fomento__

__Exigências de Cadastro e Regras de Negócio do Sistema__

 

__FAPEAM \(PAIC\)__

- Validação estrita de Conta Corrente: bloquear se não for Banco Bradesco ou Banco Next\.
- Bloqueio por período acadêmico: o discente não pode estar cursando o 1º período nem o último semestre letivo \(cruzamento com a data de término do edital\)\.
- Verificação do Currículo Lattes: campo de preenchimento obrigatório com validação de atualização exigida para o ano vigente\.
- Upload itemizado de documentos: RG \(frente/verso\), CPF, Certidão de Quitação Eleitoral e Comprovante de Residência com declaração de terceiros se aplicável\.

__CNPq / IFAM__

- Trilha documental padrão exigida pelo edital específico\.
- Exigência de Conta Bancária ativa em nome próprio \(CPF idêntico ao cadastrado\)\.

__Voluntário__

- Isenção de dados bancários\.
- Trilha documental simplificada contendo Termo de Compromisso de Voluntariado e Declaração de Matrícula Regular\.

### 3\.2 Módulo de Execução: Frequência Estruturada e Repositório de Artefatos

O monitoramento mensal dos projetos vigentes abandonará o modelo de upload de arquivos anexos avulsos\. A rotina será composta por inputs de banco de dados:

1. __Input Numérico:__ Carga horária mensal executada pelo discente\.
2. __Input Mapeado \(Dropdown\):__ O discente seleciona a macroatividade realizada no mês conforme opções fixas \(ex: *Revisão Bibliográfica, Coleta de Dados, Testes de Campo, Trabalho de Laboratório, Análise de Resultados, Escrita de Relatório*\)\.
3. __Input de Texto Aberto:__ Descrição detalhada das atividades e metas alcançadas\.
4. __Módulo de Frutos da Pesquisa:__ Campo para cadastro contínuo de produtos gerados pelo projeto \(artigos publicados com campo para URL/DOI, patentes solicitadas, softwares registrados, cartilhas educativas\)\.

### 3\.3 Módulo de Desligamento e Substituição de Bolsistas \(Tratamento de Exceção\)

Para evitar que substituições quebrem o controle financeiro e histórico da Reitoria, o sistema implementará um workflow de esteira transicional:

- O Orientador dispara o pedido de substituição informando o motivo e o e\-mail do substituto\.
- O __Estudante A \(Sainte\)__ é automaticamente congelado na próxima folha de pagamento e o sistema solicita o upload do seu relatório técnico parcial de encerramento de atividades\.
- O __Estudante B \(Entrante\)__ recebe um convite automático no e\-mail corporativo para realizar seu onboarding e anexar seus documentos na respectiva trilha de fomento\.
- O banco de dados armazena o histórico em modelo de trilha temporal: vincula o Estudante A ao período X e o Estudante B ao período Y sob o mesmo Código identificador do projeto\.

### 3\.4 Módulo de Governança de Grupos de Pesquisa \(Resolução nº 026/2014\)

Digitalização completa da regulamentação do CONSUP/IFAM para credenciamento de líderes e grupos:

- Formulário Eletrônico de Proposta de Grupo contendo Linhas de Pesquisa, Membros \(pesquisadores, técnicos e estudantes\) e Indicadores de Eficiência \(metas de publicações, eventos e produtos tecnológicos\)\.
- Esteira de Tramitação: Aprovação em Colegiado do Campus → Homologação da Direção Geral → Certificação na Pró\-Reitoria \(PPGI\) → Espelhamento no Diretório de Grupos do CNPq \(DGP\)\.
- __Regra de Amarração Acadêmica:__ No momento da submissão de qualquer plano de trabalho de editais de iniciação científica, o orientador é obrigado a selecionar a qual Grupo de Pesquisa homologado e a qual Linha de Pesquisa aquele projeto está organicamente vinculado\.
- __Auditoria Automática:__ O sistema realiza uma varredura semestral\. Grupos que não demonstrarem projetos ativos ou produtos cadastrados na plataforma por 12 meses consecutivos mudam automaticamente de status para "Alerta de Inatividade", notificando o líder e a PPGI\.

## 4\. MATRIZ DE GOVERNANÇA, PERMISSÕES E WORKFLOW

As ações de validação mensal de frequência para liberação de pagamento e consolidação de dados seguirão estritamente a matriz abaixo:

__Ator do Sistema__

__Nível de Acesso__

__Workflow Operacional Mensal__

 

__Discente \(Bolsista/Voluntário\)__

Acesso Limitado \(Perfil Próprio\)

Preenche as horas, seleciona as atividades padronizadas do dropdown, descreve o progresso e submete o formulário até a data limite estabelecida cronologicamente\.

__Professor Orientador__

Acesso Intermediário \(Seus Projetos\)

Recebe notificação do envio do aluno\. Acessa a tela gerencial do projeto, revisa o mérito científico e clica em "Homologar Frequência" ou "Devolver para Correção" \(com campo obrigatório de justificativa\)\.

__Coordenador do Campus__

Administrador Local \(Seu Campus\)

Visualiza em tela única o consolidado de todas as frequências homologadas pelos professores da sua unidade\. Clica em "Gerar Lote de Pagamento do Campus", gerando um arquivo de exportação \(Excel/CSV\) limpo e padronizado contendo dados bancários e CPFs dos alunos aptos para inserção manual no SIPAC ou sistema FAPEAM\.

__Coordenação Sistêmica \(PPGI\)__

Administrador Global \(Todos os Campi\)

Não executa tarefas braçais\. Possui visão macro sobre o andamento dos lotes de pagamento de cada campus, controla os orçamentos globais e audita as taxas de adimplência de entrega de relatórios institucionais\.

## 5\. MOTOR DE AUTOMATIZAÇÃO: ALERTA E CERTIFICAÇÃO

### 5\.1 Sistema de Notificações Inteligentes \(Push E\-mail\)

O backend rodará tarefas agendadas \(Cronjobs\) para disparar lembretes e notificações por e\-mail institucional baseados nos seguintes gatilhos temporais:

- __Fechamento Mensal:__ Disparado para discentes 3 dias antes do fim do mês letivo relembrando o preenchimento da frequência\.
- __Aviso de Inadimplência Docente:__ Disparado para o orientador caso a frequência enviada pelo discente passe 48 horas úteis sem avaliação, alertando sobre o risco de exclusão do aluno da folha de pagamento corrente\.
- __Alerta de Lote Pendente:__ Disparado para o coordenador do campus informando que todas as frequências dos professores foram homologadas e o lote está pronto para consolidação e envio ao setor financeiro externo\.
- __Prestações de Contas \(Relatórios\):__ Disparado para discentes e orientadores 15 dias antes de completar 6 meses de vigência \(Relatório Parcial \- Exigência estrita FAPEAM\) e no último dia de vigência \(Relatório Final de Fechamento de Ciclo\)\.

### 5\.2 Módulo de Certificação Eletrônica Automatizada

Assim que o Relatório Técnico Final de um projeto recebe aprovação com status de "Concluído com Êxito" pela coordenação, o sistema executa automaticamente os seguintes passos:

1. Gera dinamicamente os Certificados de Conclusão individuais para o discente \(com papel e carga horária total somada de todas as frequências\) e para o orientador\.
2. Grava no rodapé do documento uma Chave de Autenticação Alfanumérica Única \(Hash\) e um QR Code de verificação\.
3. Cria uma página pública de consulta de autenticidade no domínio do IFAM\. Se o QR Code for escaneado por terceiros, a página confirma os dados acadêmicos oficiais do certificado\.

## 6\. VISUALIZAÇÃO DE DADOS: DASHBOARD E VITRINE PÚBLICA

### 6\.1 Dashboard Executivo \(Uso Interno de Alta Gestão\)

Interface visual gráfica rica voltada para a Reitoria e Pró\-Reitorias\. Deve conter filtros globais inteligentes por __Edição do Edital__ \(visto que os ciclos cruzam os anos civis, executando do segundo semestre de um ano até o primeiro semestre do ano seguinte\)\. Os indicadores principais destacados na tela inicial serão:

- __Eficiência do Ciclo:__ Gráfico comparativo de funil exibindo o número de Projetos Aprovados versus Projetos Concluídos com Relatório Final Entregue por Edição\.
- __Painel Dimensional de Artefatos:__ Contadores estatísticos em tempo real consolidando os frutos cadastrados pelos alunos \(Quantidade de artigos publicados, patentes registradas, produtos tecnológicos e soluções de software desenvolvidas\)\.
- __Gráfico Comparativo de Desempenho por Campus:__ Volume total de bolsas e projetos geridos por cada unidade geográfica do IFAM, parametrizável por tipo de fomento \(FAPEAM, CNPq, IFAM, Voluntários\)\.

### 6\.2 Portal de Inovação Aberta \(Vitrine Pública\)

Interface web aberta a visitantes e sem necessidade de credenciais de login\. O objetivo é dar transparência à produção científica e aproximar os laboratórios do IFAM das indústrias e empresas do Polo Industrial de Manaus\. Respeitando estritamente a LGPD \(omitindo dados pessoais como CPF e dados bancários\), exibirá:

- __Buscador Global de Projetos:__ Barra de pesquisa por palavras\-chave, campus e área de conhecimento \(códigos CNPq\), dando acesso aos resumos acadêmicos e links para download dos relatórios e artigos resultantes\.
- __Catálogo de Especialistas:__ Lista pública de pesquisadores do IFAM dividida por área de atuação e vinculada aos seus respectivos Grupos de Pesquisa oficiais, exibindo apenas o e\-mail institucional corporativo como canal de contato profissional\.
- __Portfólio de Serviços Tecnológicos:__ Aba mapeando as soluções, consultorias e ensaios técnicos que os laboratórios e grupos de pesquisa homologados do IFAM possuem capacidade técnica de prestar para a comunidade externa\.

## 7\. ESTRATÉGIA DE LANÇAMENTO E MIGRAÇÃO DO LEGADO \(MVP\)

Para garantir alívio administrativo imediato à coordenação e viabilizar a implantação célere da ferramenta, o desenvolvimento adotará a seguinte estratégia para o lançamento previsto para __Agosto de 2026__:

- O MVP unificará o __Módulo de Importação__ e o __Módulo de Frequência Mensal__ simultaneamente\.
- O sistema disponibilizará uma ferramenta de leitura e processamento de arquivos CSV/Excel estruturados com base no modelo de planilhas de acompanhamento da Reitoria\. O sistema lerá todas as abas dos campi \(CMDI, CMZL, CMC, CITA, etc\.\), consolidando as linhas e gerando automaticamente a carga inicial de dados da __Edição 2026/2027__\.
- Os alunos e professores aprovados nesta edição não passarão pela fase de submissão documental retrógrada: eles serão importados com o status de "Projeto Ativo" e iniciarão o uso do sistema diretamente na etapa de preenchimento de frequências estruturadas e registro de produtos a partir de agosto de 2026\.
- Dados históricos de edições finalizadas \(ciclos anteriores a 2026\) serão importados de forma "fria" apenas para alimentar as linhas temporais dos gráficos gerenciais da Reitoria e viabilizar a emissão retroativa de segundas vias de certificados digitais\.

