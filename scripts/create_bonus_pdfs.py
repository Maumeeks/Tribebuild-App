#!/usr/bin/env python3
"""
Gerador de PDFs de Bônus - TribeBuild
Cria 3 PDFs profissionais para os bônus dos clientes
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# Cores da marca TribeBuild
BRAND_BLUE = HexColor('#2563EB')
BRAND_CORAL = HexColor('#FF6B6B')
BRAND_DARK = HexColor('#0f172a')
BRAND_LIGHT = HexColor('#f8fafc')

def create_styles():
    """Cria estilos personalizados para os PDFs"""
    styles = getSampleStyleSheet()
    
    # Título principal
    styles.add(ParagraphStyle(
        name='MainTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=BRAND_DARK,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Subtítulo
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#64748b'),
        spaceAfter=30,
        alignment=TA_CENTER
    ))
    
    # Heading 1
    styles.add(ParagraphStyle(
        name='H1',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=BRAND_BLUE,
        spaceBefore=25,
        spaceAfter=15,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 2
    styles.add(ParagraphStyle(
        name='H2',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=BRAND_DARK,
        spaceBefore=20,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 3
    styles.add(ParagraphStyle(
        name='H3',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=BRAND_CORAL,
        spaceBefore=15,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    
    # Texto normal
    styles.add(ParagraphStyle(
        name='Body',
        parent=styles['Normal'],
        fontSize=11,
        textColor=BRAND_DARK,
        spaceAfter=10,
        alignment=TA_JUSTIFY,
        leading=16
    ))
    
    # Texto destacado
    styles.add(ParagraphStyle(
        name='Highlight',
        parent=styles['Normal'],
        fontSize=12,
        textColor=BRAND_BLUE,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    ))
    
    # Dica/Tip
    styles.add(ParagraphStyle(
        name='Tip',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#059669'),
        spaceBefore=10,
        spaceAfter=10,
        leftIndent=20,
        fontName='Helvetica-Oblique'
    ))
    
    # Item de lista
    styles.add(ParagraphStyle(
        name='ListItem',
        parent=styles['Normal'],
        fontSize=11,
        textColor=BRAND_DARK,
        spaceAfter=6,
        leftIndent=15,
        bulletIndent=5
    ))
    
    return styles

def add_header_footer(canvas, doc):
    """Adiciona header e footer em cada página"""
    canvas.saveState()
    
    # Header - linha azul
    canvas.setStrokeColor(BRAND_BLUE)
    canvas.setLineWidth(3)
    canvas.line(2*cm, A4[1] - 1.5*cm, A4[0] - 2*cm, A4[1] - 1.5*cm)
    
    # Footer
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(HexColor('#94a3b8'))
    canvas.drawString(2*cm, 1.5*cm, "TribeBuild - Transforme seu conhecimento em um app exclusivo")
    canvas.drawRightString(A4[0] - 2*cm, 1.5*cm, f"Página {doc.page}")
    
    canvas.restoreState()

def create_templates_pdf():
    """Cria o PDF de Templates Prontos"""
    doc = SimpleDocTemplate(
        "/home/claude/tribebuild-project/public/downloads/templates-prontos-tribebuild.pdf",
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm
    )
    
    styles = create_styles()
    story = []
    
    # Capa
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("📋 TEMPLATES PRONTOS", styles['MainTitle']))
    story.append(Paragraph("Copie, cole e personalize para seu negócio", styles['Subtitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Valor: R$197 | Seu bônus exclusivo TribeBuild", styles['Highlight']))
    story.append(PageBreak())
    
    # Índice
    story.append(Paragraph("📑 O QUE VOCÊ VAI ENCONTRAR", styles['H1']))
    story.append(Paragraph("1. Emails de Boas-Vindas (3 modelos)", styles['Body']))
    story.append(Paragraph("2. Mensagens de WhatsApp (5 modelos)", styles['Body']))
    story.append(Paragraph("3. Descrições de Produtos (3 modelos)", styles['Body']))
    story.append(Paragraph("4. Posts para Redes Sociais (5 modelos)", styles['Body']))
    story.append(Paragraph("5. Scripts de Vídeo de Vendas (2 modelos)", styles['Body']))
    story.append(PageBreak())
    
    # Seção 1 - Emails
    story.append(Paragraph("1. EMAILS DE BOAS-VINDAS", styles['H1']))
    
    story.append(Paragraph("📧 Modelo 1: Boas-vindas Calorosas", styles['H2']))
    story.append(Paragraph("""
    <b>Assunto:</b> Bem-vindo(a) à família [NOME DO CURSO]! 🎉<br/><br/>
    Olá, [NOME]!<br/><br/>
    Que alegria ter você aqui! Você acabou de dar o primeiro passo para [TRANSFORMAÇÃO].<br/><br/>
    Seu acesso ao app já está liberado. Para começar:<br/>
    1. Baixe o app: [LINK]<br/>
    2. Faça login com este email<br/>
    3. Comece pelo módulo "Primeiros Passos"<br/><br/>
    Qualquer dúvida, estou aqui!<br/><br/>
    Um abraço,<br/>
    [SEU NOME]
    """, styles['Body']))
    story.append(Paragraph("💡 Dica: Personalize o campo [TRANSFORMAÇÃO] com o resultado principal do seu curso.", styles['Tip']))
    
    story.append(Paragraph("📧 Modelo 2: Orientação de Início", styles['H2']))
    story.append(Paragraph("""
    <b>Assunto:</b> Por onde começar? Seu guia rápido está aqui<br/><br/>
    E aí, [NOME]!<br/><br/>
    Sei que às vezes bate aquela dúvida: "Por onde começo?"<br/><br/>
    Relaxa, preparei um caminho certeiro pra você:<br/><br/>
    📱 <b>PASSO 1:</b> Instale o app na tela inicial do seu celular<br/>
    📚 <b>PASSO 2:</b> Assista a aula "Bem-vindo" (5 min)<br/>
    ✅ <b>PASSO 3:</b> Complete o exercício do dia 1<br/><br/>
    Em 7 dias você já vai ver os primeiros resultados!<br/><br/>
    Bora?<br/>
    [SEU NOME]
    """, styles['Body']))
    
    story.append(Paragraph("📧 Modelo 3: Reengajamento (7 dias)", styles['H2']))
    story.append(Paragraph("""
    <b>Assunto:</b> [NOME], sentimos sua falta! 💙<br/><br/>
    Oi, [NOME]!<br/><br/>
    Percebi que faz alguns dias que você não acessa o app.<br/><br/>
    Tudo bem por aí? Se tiver alguma dificuldade, me conta que eu ajudo!<br/><br/>
    Enquanto isso, deixei uma aula especial liberada pra você: [LINK DA AULA]<br/><br/>
    É sobre [TEMA INTERESSANTE] e dura só 8 minutos.<br/><br/>
    Te espero lá!<br/>
    [SEU NOME]
    """, styles['Body']))
    story.append(PageBreak())
    
    # Seção 2 - WhatsApp
    story.append(Paragraph("2. MENSAGENS DE WHATSAPP", styles['H1']))
    
    story.append(Paragraph("💬 Modelo 1: Confirmação de Compra", styles['H2']))
    story.append(Paragraph("""
    🎉 *Parabéns pela sua decisão, [NOME]!*<br/><br/>
    Seu acesso ao [NOME DO CURSO] já está liberado!<br/><br/>
    📱 *Próximo passo:*<br/>
    Acesse o app pelo link: [LINK]<br/><br/>
    Qualquer dúvida, é só me chamar aqui!<br/><br/>
    Bem-vindo(a) à família! 💙
    """, styles['Body']))
    
    story.append(Paragraph("💬 Modelo 2: Lembrete de Aula", styles['H2']))
    story.append(Paragraph("""
    Ei, [NOME]! 👋<br/><br/>
    Só passando pra lembrar que tem aula nova no app!<br/><br/>
    📚 *[NOME DA AULA]*<br/>
    ⏱️ Duração: X minutos<br/><br/>
    Essa aula é sobre [TEMA] e vai te ajudar a [BENEFÍCIO].<br/><br/>
    Bora assistir? 🚀
    """, styles['Body']))
    
    story.append(Paragraph("💬 Modelo 3: Pedido de Feedback", styles['H2']))
    story.append(Paragraph("""
    Oi, [NOME]! Tudo bem?<br/><br/>
    Vi que você já completou [X]% do curso! 🎯<br/><br/>
    Queria saber: o que você está achando até agora?<br/><br/>
    Seu feedback é super importante pra eu melhorar cada vez mais!<br/><br/>
    Me conta aí! 💙
    """, styles['Body']))
    
    story.append(Paragraph("💬 Modelo 4: Oferta de Upgrade", styles['H2']))
    story.append(Paragraph("""
    [NOME], tenho uma novidade! 🎁<br/><br/>
    Como você é aluno(a) do [CURSO BÁSICO], liberei uma condição especial pra você:<br/><br/>
    *[NOME DO UPGRADE]* com *30% OFF*!<br/><br/>
    ✅ [Benefício 1]<br/>
    ✅ [Benefício 2]<br/>
    ✅ [Benefício 3]<br/><br/>
    Válido só até [DATA].<br/><br/>
    Quer saber mais? Me chama! 🚀
    """, styles['Body']))
    
    story.append(Paragraph("💬 Modelo 5: Suporte Proativo", styles['H2']))
    story.append(Paragraph("""
    Oi, [NOME]! 👋<br/><br/>
    Passando pra ver se está tudo ok com seu acesso ao app.<br/><br/>
    Se tiver qualquer dúvida sobre:<br/>
    • Como acessar as aulas<br/>
    • Como usar a comunidade<br/>
    • Qualquer outra coisa<br/><br/>
    É só me chamar, tá? Estou aqui pra ajudar! 💙
    """, styles['Body']))
    story.append(PageBreak())
    
    # Seção 3 - Descrições de Produtos
    story.append(Paragraph("3. DESCRIÇÕES DE PRODUTOS", styles['H1']))
    
    story.append(Paragraph("📝 Modelo 1: Curso Online", styles['H2']))
    story.append(Paragraph("""
    <b>[NOME DO CURSO]</b><br/><br/>
    Você está a um passo de [TRANSFORMAÇÃO PRINCIPAL].<br/><br/>
    <b>O que você vai aprender:</b><br/>
    ✅ [Benefício 1 com resultado específico]<br/>
    ✅ [Benefício 2 com resultado específico]<br/>
    ✅ [Benefício 3 com resultado específico]<br/>
    ✅ [Benefício 4 com resultado específico]<br/><br/>
    <b>O que está incluso:</b><br/>
    📱 App exclusivo com sua marca<br/>
    📚 [X] módulos com [Y] aulas<br/>
    👥 Acesso à comunidade de alunos<br/>
    📲 Notificações de novos conteúdos<br/>
    🎁 [Bônus especial]<br/><br/>
    <b>Para quem é:</b><br/>
    • [Perfil 1]<br/>
    • [Perfil 2]<br/>
    • [Perfil 3]<br/><br/>
    <b>Garantia:</b> 7 dias para testar. Se não gostar, devolvemos seu dinheiro.
    """, styles['Body']))
    
    story.append(Paragraph("📝 Modelo 2: Mentoria", styles['H2']))
    story.append(Paragraph("""
    <b>Mentoria [NOME]</b><br/><br/>
    Acompanhamento personalizado para você [RESULTADO].<br/><br/>
    <b>Como funciona:</b><br/>
    🗓️ [X] encontros ao vivo por mês<br/>
    📱 App exclusivo com todo o conteúdo<br/>
    💬 Grupo privado para dúvidas<br/>
    📋 Tarefas semanais com feedback<br/><br/>
    <b>Resultados dos mentorados:</b><br/>
    "[Depoimento 1]" - Nome<br/>
    "[Depoimento 2]" - Nome<br/><br/>
    <b>Vagas limitadas:</b> Apenas [X] vagas por turma.
    """, styles['Body']))
    
    story.append(Paragraph("📝 Modelo 3: Comunidade/Assinatura", styles['H2']))
    story.append(Paragraph("""
    <b>Comunidade [NOME]</b><br/><br/>
    O lugar onde [PÚBLICO-ALVO] se conectam para [OBJETIVO COMUM].<br/><br/>
    <b>O que você ganha como membro:</b><br/>
    📱 App exclusivo da comunidade<br/>
    🔴 Lives semanais sobre [TEMA]<br/>
    📚 Biblioteca de conteúdos<br/>
    👥 Networking com [X]+ membros<br/>
    🎁 Descontos em produtos e eventos<br/><br/>
    <b>Investimento:</b><br/>
    Apenas R$[X]/mês ou R$[Y]/ano (economia de R$[Z])<br/><br/>
    <b>Cancele quando quiser.</b> Sem multa, sem burocracia.
    """, styles['Body']))
    story.append(PageBreak())
    
    # Seção 4 - Posts Redes Sociais
    story.append(Paragraph("4. POSTS PARA REDES SOCIAIS", styles['H1']))
    
    story.append(Paragraph("📱 Modelo 1: Anúncio de Lançamento", styles['H2']))
    story.append(Paragraph("""
    🚀 É OFICIAL!<br/><br/>
    Depois de [X meses/anos] trabalhando nisso, finalmente posso anunciar:<br/><br/>
    [NOME DO PRODUTO] está no ar! 🎉<br/><br/>
    E o melhor: agora você acessa tudo pelo APP exclusivo!<br/><br/>
    📱 Seu celular vira sua sala de aula<br/>
    🔔 Notificações para nunca perder nada<br/>
    👥 Comunidade direto no app<br/><br/>
    Link na bio para garantir sua vaga! ⬆️<br/><br/>
    #lancamento #cursonline #[suanicho]
    """, styles['Body']))
    
    story.append(Paragraph("📱 Modelo 2: Prova Social", styles['H2']))
    story.append(Paragraph("""
    Olha o que a [NOME] me mandou hoje 😍<br/><br/>
    "[Depoimento do aluno com resultado]"<br/><br/>
    Isso me deixa TÃO feliz! 💙<br/><br/>
    Ver meus alunos conquistando [RESULTADO] é o que me motiva a continuar.<br/><br/>
    Quer ser o(a) próximo(a)?<br/>
    Link na bio! ⬆️<br/><br/>
    #resultado #depoimento #transformacao
    """, styles['Body']))
    
    story.append(Paragraph("📱 Modelo 3: Conteúdo de Valor + CTA", styles['H2']))
    story.append(Paragraph("""
    3 erros que [SEU PÚBLICO] comete e que impedem [RESULTADO]:<br/><br/>
    ❌ Erro 1: [Descreva o erro]<br/>
    ✅ Solução: [Dê a solução]<br/><br/>
    ❌ Erro 2: [Descreva o erro]<br/>
    ✅ Solução: [Dê a solução]<br/><br/>
    ❌ Erro 3: [Descreva o erro]<br/>
    ✅ Solução: [Dê a solução]<br/><br/>
    Salva esse post! 📌<br/><br/>
    E se quiser ir mais fundo, meu curso [NOME] tem um módulo inteiro sobre isso.<br/>
    Link na bio! ⬆️
    """, styles['Body']))
    
    story.append(Paragraph("📱 Modelo 4: Stories - Bastidores", styles['H2']))
    story.append(Paragraph("""
    <b>Story 1:</b> "Vocês pediram, eu ouvi! 👀"<br/>
    <b>Story 2:</b> [Foto/vídeo dos bastidores]<br/>
    <b>Story 3:</b> "Estou preparando algo MUITO especial pra vocês..."<br/>
    <b>Story 4:</b> "Quer saber primeiro? Me manda um 🔥 que eu te aviso!"<br/>
    <b>Story 5:</b> Enquete: "Qual tema vocês querem que eu aborde primeiro?"
    """, styles['Body']))
    
    story.append(Paragraph("📱 Modelo 5: Oferta Relâmpago", styles['H2']))
    story.append(Paragraph("""
    ⚡ OFERTA RELÂMPAGO ⚡<br/><br/>
    Só nas próximas [X] horas!<br/><br/>
    [NOME DO PRODUTO] com [X]% OFF<br/><br/>
    De R$[PREÇO CHEIO]<br/>
    Por apenas R$[PREÇO COM DESCONTO]<br/><br/>
    + Bônus exclusivo: [NOME DO BÔNUS]<br/><br/>
    ⏰ Termina hoje às [HORÁRIO]<br/><br/>
    Corre! Link na bio ⬆️
    """, styles['Body']))
    story.append(PageBreak())
    
    # Seção 5 - Scripts de Vídeo
    story.append(Paragraph("5. SCRIPTS DE VÍDEO DE VENDAS", styles['H1']))
    
    story.append(Paragraph("🎬 Modelo 1: VSL Curta (3-5 min)", styles['H2']))
    story.append(Paragraph("""
    <b>[GANCHO - 0:00 a 0:15]</b><br/>
    "Se você [DOR/PROBLEMA], esse vídeo pode mudar tudo pra você."<br/><br/>
    
    <b>[IDENTIFICAÇÃO - 0:15 a 0:45]</b><br/>
    "Eu sei como é [DESCREVA A DOR]. Eu também já passei por isso. [SUA HISTÓRIA BREVE]"<br/><br/>
    
    <b>[SOLUÇÃO - 0:45 a 1:30]</b><br/>
    "Depois de [X TEMPO/EXPERIÊNCIA], descobri um método que [RESULTADO]. E é exatamente isso que eu ensino no [NOME DO PRODUTO]."<br/><br/>
    
    <b>[O QUE É - 1:30 a 2:30]</b><br/>
    "O [NOME] é [DESCRIÇÃO]. Você vai aprender:<br/>
    • [Módulo/Benefício 1]<br/>
    • [Módulo/Benefício 2]<br/>
    • [Módulo/Benefício 3]"<br/><br/>
    
    <b>[DIFERENCIAL - 2:30 a 3:00]</b><br/>
    "E o melhor: tudo isso em um APP EXCLUSIVO com a minha marca. Você acessa do celular, recebe notificações, participa da comunidade..."<br/><br/>
    
    <b>[PROVA - 3:00 a 3:30]</b><br/>
    "Veja o que os alunos estão falando: [DEPOIMENTOS]"<br/><br/>
    
    <b>[OFERTA - 3:30 a 4:00]</b><br/>
    "Normalmente o investimento seria R$[PREÇO ALTO]. Mas hoje, você leva tudo isso por apenas R$[PREÇO]. E ainda ganha [BÔNUS]."<br/><br/>
    
    <b>[CTA - 4:00 a 4:30]</b><br/>
    "Clica no botão abaixo e garante sua vaga agora. Lembre-se: você tem [X] dias de garantia. Se não gostar, devolvo seu dinheiro."<br/><br/>
    
    <b>[URGÊNCIA - 4:30 a 5:00]</b><br/>
    "Essa condição especial é por tempo limitado. Não deixa pra depois. Clica agora e começa sua transformação hoje!"
    """, styles['Body']))
    
    story.append(Paragraph("🎬 Modelo 2: Vídeo de Boas-Vindas (App)", styles['H2']))
    story.append(Paragraph("""
    <b>[ABERTURA - 0:00 a 0:10]</b><br/>
    "E aí! Bem-vindo(a) ao seu app! Que bom ter você aqui!"<br/><br/>
    
    <b>[ORIENTAÇÃO - 0:10 a 0:40]</b><br/>
    "Deixa eu te mostrar rapidinho como funciona:<br/>
    • Aqui embaixo você tem o menu principal<br/>
    • Em 'Aulas' você encontra todo o conteúdo<br/>
    • Em 'Comunidade' você pode interagir com outros alunos<br/>
    • E em 'Perfil' você acompanha seu progresso"<br/><br/>
    
    <b>[PRIMEIRO PASSO - 0:40 a 1:00]</b><br/>
    "Minha sugestão: comece pela aula '[NOME DA PRIMEIRA AULA]'. Ela dura só [X] minutos e vai te dar a base pra todo o resto."<br/><br/>
    
    <b>[ENCERRAMENTO - 1:00 a 1:15]</b><br/>
    "Qualquer dúvida, me chama lá na comunidade ou no suporte. Bora começar? Te vejo na primeira aula!"
    """, styles['Body']))
    story.append(PageBreak())
    
    # Página final
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("🎉 PARABÉNS!", styles['MainTitle']))
    story.append(Paragraph("Você tem em mãos templates testados e aprovados.", styles['Subtitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Agora é só personalizar e usar!", styles['Body']))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("Feito com 💙 pelo TribeBuild", styles['Highlight']))
    
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print("✅ templates-prontos-tribebuild.pdf criado!")

def create_guia_lancamento_pdf():
    """Cria o PDF do Guia de Lançamento"""
    doc = SimpleDocTemplate(
        "/home/claude/tribebuild-project/public/downloads/guia-lancamento-tribebuild.pdf",
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm
    )
    
    styles = create_styles()
    story = []
    
    # Capa
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("🚀 GUIA DE LANÇAMENTO", styles['MainTitle']))
    story.append(Paragraph("Passo a passo para lançar seu app com sucesso", styles['Subtitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Valor: R$147 | Seu bônus exclusivo TribeBuild", styles['Highlight']))
    story.append(PageBreak())
    
    # Visão Geral
    story.append(Paragraph("📋 VISÃO GERAL DO LANÇAMENTO", styles['H1']))
    story.append(Paragraph("""
    Este guia vai te levar do zero ao app publicado em 7 etapas simples. 
    Siga na ordem e você terá seu app funcionando e vendendo em poucos dias!
    """, styles['Body']))
    
    story.append(Paragraph("As 7 Etapas:", styles['H2']))
    story.append(Paragraph("1. Preparação (Dia 1)", styles['Body']))
    story.append(Paragraph("2. Configuração do App (Dia 1-2)", styles['Body']))
    story.append(Paragraph("3. Upload de Conteúdo (Dia 2-3)", styles['Body']))
    story.append(Paragraph("4. Integração de Pagamentos (Dia 3)", styles['Body']))
    story.append(Paragraph("5. Testes (Dia 4)", styles['Body']))
    story.append(Paragraph("6. Pré-lançamento (Dia 5-6)", styles['Body']))
    story.append(Paragraph("7. Lançamento! (Dia 7)", styles['Body']))
    story.append(PageBreak())
    
    # Etapa 1
    story.append(Paragraph("ETAPA 1: PREPARAÇÃO", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 2-3 horas", styles['Tip']))
    
    story.append(Paragraph("O que você precisa ter pronto:", styles['H2']))
    story.append(Paragraph("✅ Logo da sua marca (PNG, fundo transparente, mínimo 512x512px)", styles['Body']))
    story.append(Paragraph("✅ Cores da sua marca (código hexadecimal, ex: #2563EB)", styles['Body']))
    story.append(Paragraph("✅ Nome do app (curto, memorável)", styles['Body']))
    story.append(Paragraph("✅ Descrição curta (1 frase sobre o que é)", styles['Body']))
    story.append(Paragraph("✅ Seu conteúdo organizado (aulas, PDFs, etc)", styles['Body']))
    
    story.append(Paragraph("Checklist de conteúdo:", styles['H2']))
    story.append(Paragraph("□ Quantos módulos você terá?", styles['Body']))
    story.append(Paragraph("□ Quantas aulas por módulo?", styles['Body']))
    story.append(Paragraph("□ Vídeos já gravados e editados?", styles['Body']))
    story.append(Paragraph("□ PDFs/materiais de apoio prontos?", styles['Body']))
    story.append(Paragraph("□ Thumbnails das aulas?", styles['Body']))
    
    story.append(Paragraph("💡 Dica: Não precisa ter TUDO pronto. Comece com pelo menos o primeiro módulo completo.", styles['Tip']))
    story.append(PageBreak())
    
    # Etapa 2
    story.append(Paragraph("ETAPA 2: CONFIGURAÇÃO DO APP", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 30-60 minutos", styles['Tip']))
    
    story.append(Paragraph("Passo a passo:", styles['H2']))
    story.append(Paragraph("""
    <b>1. Acesse seu painel TribeBuild</b><br/>
    → Vá em "Meus Apps" → "Criar Novo App"<br/><br/>
    
    <b>2. Informações básicas</b><br/>
    → Nome do app<br/>
    → Descrição curta<br/>
    → Categoria (educação, fitness, etc)<br/><br/>
    
    <b>3. Identidade visual</b><br/>
    → Upload do logo<br/>
    → Cor primária (seu azul/verde/etc)<br/>
    → Cor secundária (para destaques)<br/><br/>
    
    <b>4. Configurações avançadas</b><br/>
    → Idioma principal<br/>
    → Timezone<br/>
    → Domínio personalizado (opcional)
    """, styles['Body']))
    
    story.append(Paragraph("💡 Dica: Use cores que combinem com sua marca existente. Consistência gera confiança!", styles['Tip']))
    story.append(PageBreak())
    
    # Etapa 3
    story.append(Paragraph("ETAPA 3: UPLOAD DE CONTEÚDO", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 2-4 horas (depende da quantidade)", styles['Tip']))
    
    story.append(Paragraph("Estrutura recomendada:", styles['H2']))
    story.append(Paragraph("""
    <b>Módulo de Boas-Vindas (obrigatório)</b><br/>
    → Vídeo de boas-vindas (1-2 min)<br/>
    → Como usar o app (1-2 min)<br/>
    → O que esperar do curso<br/><br/>
    
    <b>Módulos de Conteúdo</b><br/>
    → 3-7 aulas por módulo (ideal)<br/>
    → Aulas de 5-15 minutos (melhor retenção)<br/>
    → Material de apoio quando relevante<br/><br/>
    
    <b>Módulo Bônus (opcional, mas poderoso)</b><br/>
    → Conteúdo extra exclusivo<br/>
    → Templates, checklists, etc<br/>
    → Aumenta valor percebido!
    """, styles['Body']))
    
    story.append(Paragraph("Boas práticas para upload:", styles['H2']))
    story.append(Paragraph("✅ Nomeie os arquivos de forma clara (ex: 01-introducao.mp4)", styles['Body']))
    story.append(Paragraph("✅ Use thumbnails atraentes", styles['Body']))
    story.append(Paragraph("✅ Escreva descrições que gerem curiosidade", styles['Body']))
    story.append(Paragraph("✅ Marque aulas gratuitas como 'preview' para atrair leads", styles['Body']))
    story.append(PageBreak())
    
    # Etapa 4
    story.append(Paragraph("ETAPA 4: INTEGRAÇÃO DE PAGAMENTOS", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 15-30 minutos", styles['Tip']))
    
    story.append(Paragraph("Como conectar sua plataforma:", styles['H2']))
    story.append(Paragraph("""
    <b>No TribeBuild:</b><br/>
    1. Vá em "Integrações"<br/>
    2. Escolha sua plataforma (Kiwify, Hotmart, Eduzz, etc)<br/>
    3. Copie a URL do Webhook<br/><br/>
    
    <b>Na sua plataforma de pagamento:</b><br/>
    1. Acesse configurações do produto<br/>
    2. Procure "Webhook" ou "Postback"<br/>
    3. Cole a URL do TribeBuild<br/>
    4. Salve<br/><br/>
    
    <b>Teste:</b><br/>
    1. Faça uma compra teste (ou peça para alguém)<br/>
    2. Verifique se o acesso foi liberado automaticamente<br/>
    3. Se não funcionar, verifique a URL e tente novamente
    """, styles['Body']))
    
    story.append(Paragraph("💡 Dica: A maioria das plataformas processa o webhook em segundos. Se demorar mais de 5 minutos, algo está errado.", styles['Tip']))
    story.append(PageBreak())
    
    # Etapa 5
    story.append(Paragraph("ETAPA 5: TESTES", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 1-2 horas", styles['Tip']))
    
    story.append(Paragraph("Checklist de testes:", styles['H2']))
    story.append(Paragraph("""
    <b>Acesso:</b><br/>
    □ Login funciona?<br/>
    □ Recuperação de senha funciona?<br/>
    □ Novo usuário consegue se cadastrar?<br/><br/>
    
    <b>Conteúdo:</b><br/>
    □ Todos os vídeos carregam?<br/>
    □ PDFs abrem corretamente?<br/>
    □ Ordem das aulas está certa?<br/>
    □ Progresso é salvo?<br/><br/>
    
    <b>App:</b><br/>
    □ Instala na tela inicial (iOS e Android)?<br/>
    □ Notificações chegam?<br/>
    □ Comunidade funciona?<br/>
    □ Visual está bonito em diferentes telas?<br/><br/>
    
    <b>Pagamento:</b><br/>
    □ Compra teste libera acesso?<br/>
    □ Email de boas-vindas é enviado?<br/>
    □ Usuário consegue acessar após compra?
    """, styles['Body']))
    
    story.append(Paragraph("💡 Dica: Peça para 2-3 pessoas de confiança testarem. Olhos frescos encontram bugs que você não vê.", styles['Tip']))
    story.append(PageBreak())
    
    # Etapa 6
    story.append(Paragraph("ETAPA 6: PRÉ-LANÇAMENTO", styles['H1']))
    story.append(Paragraph("⏱️ Tempo estimado: 2-3 dias", styles['Tip']))
    
    story.append(Paragraph("Aquecimento da audiência:", styles['H2']))
    story.append(Paragraph("""
    <b>Dia 1 - Curiosidade:</b><br/>
    → Post: "Estou preparando algo especial..."<br/>
    → Stories: Bastidores sem revelar tudo<br/>
    → Objetivo: Gerar curiosidade<br/><br/>
    
    <b>Dia 2 - Revelação parcial:</b><br/>
    → Revele do que se trata<br/>
    → Mostre um preview do app<br/>
    → Colete interessados (lista VIP)<br/><br/>
    
    <b>Dia 3 - Contagem regressiva:</b><br/>
    → "Amanhã abre!"<br/>
    → Mostre depoimentos (se tiver betas)<br/>
    → Reforce a oferta de lançamento
    """, styles['Body']))
    
    story.append(Paragraph("Prepare seus materiais:", styles['H2']))
    story.append(Paragraph("□ Página de vendas revisada", styles['Body']))
    story.append(Paragraph("□ Emails de lançamento escritos", styles['Body']))
    story.append(Paragraph("□ Posts de redes sociais agendados", styles['Body']))
    story.append(Paragraph("□ Grupo/lista de lançamento pronta", styles['Body']))
    story.append(Paragraph("□ FAQ com objeções respondidas", styles['Body']))
    story.append(PageBreak())
    
    # Etapa 7
    story.append(Paragraph("ETAPA 7: LANÇAMENTO! 🚀", styles['H1']))
    story.append(Paragraph("O grande dia chegou!", styles['Tip']))
    
    story.append(Paragraph("Cronograma do dia:", styles['H2']))
    story.append(Paragraph("""
    <b>Manhã (8h-9h):</b><br/>
    → Verifique se tudo está funcionando<br/>
    → Abra o carrinho/vendas<br/>
    → Envie email para lista VIP<br/><br/>
    
    <b>Manhã (9h-12h):</b><br/>
    → Post de lançamento nas redes<br/>
    → Stories em sequência<br/>
    → Responda comentários rapidamente<br/><br/>
    
    <b>Tarde (14h-18h):</b><br/>
    → Mais conteúdo nas redes<br/>
    → Lives/vídeos ao vivo<br/>
    → Responda DMs e dúvidas<br/><br/>
    
    <b>Noite (19h-22h):</b><br/>
    → Último push de vendas<br/>
    → Lembrete de encerramento (se for oferta limitada)<br/>
    → Agradeça quem comprou
    """, styles['Body']))
    
    story.append(Paragraph("Após o lançamento:", styles['H2']))
    story.append(Paragraph("✅ Dê as boas-vindas aos novos alunos", styles['Body']))
    story.append(Paragraph("✅ Envie instruções de acesso ao app", styles['Body']))
    story.append(Paragraph("✅ Monitore o suporte nas primeiras 48h", styles['Body']))
    story.append(Paragraph("✅ Peça feedback e depoimentos", styles['Body']))
    story.append(Paragraph("✅ Comemore! Você merece! 🎉", styles['Body']))
    story.append(PageBreak())
    
    # Página final
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("🎉 VOCÊ CONSEGUE!", styles['MainTitle']))
    story.append(Paragraph("Siga o passo a passo e seu app estará no ar em 7 dias.", styles['Subtitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Lembre-se: feito é melhor que perfeito!", styles['Body']))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("Feito com 💙 pelo TribeBuild", styles['Highlight']))
    
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print("✅ guia-lancamento-tribebuild.pdf criado!")

def create_checklist_pdf():
    """Cria o PDF do Checklist de Configuração"""
    doc = SimpleDocTemplate(
        "/home/claude/tribebuild-project/public/downloads/checklist-configuracao-tribebuild.pdf",
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm
    )
    
    styles = create_styles()
    story = []
    
    # Capa
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("✅ CHECKLIST DE CONFIGURAÇÃO", styles['MainTitle']))
    story.append(Paragraph("Nada esquecido, tudo funcionando", styles['Subtitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Valor: R$97 | Seu bônus exclusivo TribeBuild", styles['Highlight']))
    story.append(PageBreak())
    
    # Instruções
    story.append(Paragraph("📋 COMO USAR ESTE CHECKLIST", styles['H1']))
    story.append(Paragraph("""
    Imprima este documento ou use no tablet/computador.<br/><br/>
    Marque cada item conforme for completando.<br/><br/>
    Não pule etapas - a ordem importa!<br/><br/>
    Ao final, você terá seu app 100% configurado e pronto para receber alunos.
    """, styles['Body']))
    story.append(PageBreak())
    
    # Checklist 1 - Conta e Acesso
    story.append(Paragraph("1️⃣ CONTA E ACESSO", styles['H1']))
    story.append(Paragraph("""
    □ Criar conta no TribeBuild<br/>
    □ Confirmar email<br/>
    □ Completar perfil (foto, nome, bio)<br/>
    □ Configurar autenticação 2FA (segurança)<br/>
    □ Salvar credenciais em local seguro
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    
    # Checklist 2 - Criação do App
    story.append(Paragraph("2️⃣ CRIAÇÃO DO APP", styles['H1']))
    story.append(Paragraph("""
    □ Clicar em "Criar Novo App"<br/>
    □ Definir nome do app<br/>
    □ Escrever descrição curta (até 100 caracteres)<br/>
    □ Escrever descrição completa<br/>
    □ Selecionar categoria principal<br/>
    □ Definir idioma padrão
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    
    # Checklist 3 - Identidade Visual
    story.append(Paragraph("3️⃣ IDENTIDADE VISUAL", styles['H1']))
    story.append(Paragraph("""
    □ Upload do logo (512x512px mínimo, PNG)<br/>
    □ Upload do ícone do app (192x192px)<br/>
    □ Definir cor primária (código hex)<br/>
    □ Definir cor secundária<br/>
    □ Upload da imagem de capa/banner<br/>
    □ Configurar splash screen<br/>
    □ Revisar preview em diferentes dispositivos
    """, styles['Body']))
    story.append(PageBreak())
    
    # Checklist 4 - Estrutura de Conteúdo
    story.append(Paragraph("4️⃣ ESTRUTURA DE CONTEÚDO", styles['H1']))
    story.append(Paragraph("""
    <b>Módulos:</b><br/>
    □ Criar módulo de boas-vindas<br/>
    □ Criar módulos de conteúdo principal<br/>
    □ Definir ordem dos módulos<br/>
    □ Adicionar descrição em cada módulo<br/>
    □ Adicionar thumbnail em cada módulo<br/><br/>
    
    <b>Aulas:</b><br/>
    □ Upload de todas as videoaulas<br/>
    □ Adicionar títulos descritivos<br/>
    □ Adicionar descrição/resumo<br/>
    □ Definir duração de cada aula<br/>
    □ Marcar aulas gratuitas (preview)<br/>
    □ Adicionar materiais complementares<br/>
    □ Verificar ordem das aulas
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    
    # Checklist 5 - Comunidade
    story.append(Paragraph("5️⃣ COMUNIDADE (se aplicável)", styles['H1']))
    story.append(Paragraph("""
    □ Ativar módulo de comunidade<br/>
    □ Criar categorias/tópicos<br/>
    □ Definir regras da comunidade<br/>
    □ Criar post de boas-vindas<br/>
    □ Configurar notificações<br/>
    □ Definir moderadores (se houver)
    """, styles['Body']))
    story.append(PageBreak())
    
    # Checklist 6 - Integrações
    story.append(Paragraph("6️⃣ INTEGRAÇÕES DE PAGAMENTO", styles['H1']))
    story.append(Paragraph("""
    □ Acessar área de integrações<br/>
    □ Selecionar plataforma (Kiwify, Hotmart, etc)<br/>
    □ Copiar URL do webhook<br/>
    □ Colar webhook na plataforma de pagamento<br/>
    □ Salvar configuração<br/>
    □ Fazer compra teste<br/>
    □ Verificar se acesso foi liberado<br/>
    □ Verificar se email foi enviado
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    
    # Checklist 7 - Notificações
    story.append(Paragraph("7️⃣ NOTIFICAÇÕES", styles['H1']))
    story.append(Paragraph("""
    □ Configurar notificação de boas-vindas<br/>
    □ Configurar lembrete de aulas não assistidas<br/>
    □ Configurar notificação de novo conteúdo<br/>
    □ Testar envio de notificação<br/>
    □ Verificar se chegou no celular
    """, styles['Body']))
    story.append(PageBreak())
    
    # Checklist 8 - Testes Finais
    story.append(Paragraph("8️⃣ TESTES FINAIS", styles['H1']))
    story.append(Paragraph("""
    <b>Teste no celular (iOS):</b><br/>
    □ Acessar app pelo Safari<br/>
    □ Adicionar à tela inicial<br/>
    □ Abrir como app<br/>
    □ Fazer login<br/>
    □ Assistir uma aula<br/>
    □ Verificar se progresso salvou<br/>
    □ Testar notificação<br/><br/>
    
    <b>Teste no celular (Android):</b><br/>
    □ Acessar app pelo Chrome<br/>
    □ Instalar app (prompt automático)<br/>
    □ Abrir como app<br/>
    □ Fazer login<br/>
    □ Assistir uma aula<br/>
    □ Verificar se progresso salvou<br/>
    □ Testar notificação<br/><br/>
    
    <b>Teste de compra:</b><br/>
    □ Fazer compra teste<br/>
    □ Verificar liberação automática<br/>
    □ Verificar email de boas-vindas<br/>
    □ Acessar como novo aluno
    """, styles['Body']))
    story.append(PageBreak())
    
    # Checklist 9 - Pré-Lançamento
    story.append(Paragraph("9️⃣ PRÉ-LANÇAMENTO", styles['H1']))
    story.append(Paragraph("""
    □ Revisar página de vendas<br/>
    □ Verificar links de pagamento<br/>
    □ Preparar emails de lançamento<br/>
    □ Preparar posts de redes sociais<br/>
    □ Avisar lista VIP<br/>
    □ Definir data e hora de abertura<br/>
    □ Configurar oferta de lançamento (se houver)
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    
    # Checklist 10 - Lançamento
    story.append(Paragraph("🔟 DIA DO LANÇAMENTO", styles['H1']))
    story.append(Paragraph("""
    □ Verificar se tudo está funcionando (manhã)<br/>
    □ Abrir vendas/carrinho<br/>
    □ Enviar email de lançamento<br/>
    □ Publicar posts nas redes<br/>
    □ Monitorar vendas e acessos<br/>
    □ Responder dúvidas rapidamente<br/>
    □ Dar boas-vindas aos novos alunos<br/>
    □ Enviar instruções de acesso<br/>
    □ Comemorar! 🎉
    """, styles['Body']))
    story.append(PageBreak())
    
    # Página final
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("✅ CHECKLIST COMPLETO!", styles['MainTitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("""
    Se você marcou todos os itens, seu app está 100% configurado e pronto para receber alunos!
    """, styles['Body']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Guarde este checklist - ele serve para todos os seus próximos apps também!", styles['Tip']))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("Feito com 💙 pelo TribeBuild", styles['Highlight']))
    
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print("✅ checklist-configuracao-tribebuild.pdf criado!")

# Executar criação dos PDFs
if __name__ == "__main__":
    print("🚀 Criando PDFs de bônus...")
    create_templates_pdf()
    create_guia_lancamento_pdf()
    create_checklist_pdf()
    print("\n✅ Todos os 3 PDFs criados com sucesso!")
