from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
OUTPUT = ROOT / "docs" / "ReUse-Animacoes-Transicoes-Gamificacao.pdf"
REPO_URL = "https://github.com/tamyresogasawara/reuse-mobile-fiap-sprint-2"
PREVIEW_URL = "https://tamyresogasawara.github.io/reuse-mobile-fiap-sprint-2/"

INK = colors.HexColor("#111713")
FOREST = colors.HexColor("#173F2A")
MUTED = colors.HexColor("#657067")
LEAF = colors.HexColor("#D7FF78")
PAPER = colors.HexColor("#F5F7F2")
SOFT = colors.HexColor("#EAF3E8")
LINE = colors.HexColor("#DDE4DE")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=FOREST, tracking=1.1, spaceAfter=6))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=32, leading=36, textColor=INK, spaceAfter=13))
styles.add(ParagraphStyle(name="CoverSub", fontName="Helvetica", fontSize=13, leading=19, textColor=MUTED, spaceAfter=9))
styles.add(ParagraphStyle(name="H1x", fontName="Helvetica-Bold", fontSize=23, leading=27, textColor=INK, spaceAfter=10))
styles.add(ParagraphStyle(name="H2x", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=INK, spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", fontName="Helvetica", fontSize=9.6, leading=14.5, textColor=MUTED, spaceAfter=7))
styles.add(ParagraphStyle(name="Bulletx", fontName="Helvetica", fontSize=9.3, leading=14, leftIndent=12, firstLineIndent=-7, bulletIndent=4, textColor=MUTED, spaceAfter=3))
styles.add(ParagraphStyle(name="Smallx", fontName="Helvetica", fontSize=7.8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="SmallBold", fontName="Helvetica-Bold", fontSize=7.8, leading=11, textColor=INK))
styles.add(ParagraphStyle(name="Captionx", fontName="Helvetica-Bold", fontSize=8, leading=11, alignment=TA_CENTER, textColor=FOREST, spaceBefore=4))
styles.add(ParagraphStyle(name="Linkx", fontName="Helvetica-Bold", fontSize=9.4, leading=14, textColor=FOREST, spaceAfter=5))
styles.add(ParagraphStyle(name="BigNumber", fontName="Helvetica-Bold", fontSize=26, leading=30, alignment=TA_CENTER, textColor=FOREST))
styles.add(ParagraphStyle(name="Centered", fontName="Helvetica", fontSize=9, leading=13, alignment=TA_CENTER, textColor=MUTED))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, A4[0], 16 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(19 * mm, 16 * mm, 191 * mm, 16 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(19 * mm, 9 * mm, "ReUse - Animacoes, Transicoes e Gamificacao - FIAP - RM552055")
    canvas.drawRightString(191 * mm, 9 * mm, str(doc.page))
    canvas.restoreState()


def p(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(f"• {text}", styles["Bulletx"])


def card(title, body, width=80 * mm, accent=False):
    table = Table([[p(title, "H2x")], [p(body, "Smallx")]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LEAF if accent else WHITE),
        ("BOX", (0, 0), (-1, -1), 0.7, FOREST if accent else LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("TOPPADDING", (0, 0), (-1, 0), 3.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 0),
        ("TOPPADDING", (0, 1), (-1, 1), 0),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 4 * mm),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def fitted_image(filename, max_width=78 * mm, max_height=142 * mm):
    path = ASSETS / filename
    width, height = ImageReader(str(path)).getSize()
    scale = min(max_width / width, max_height / height)
    return Image(str(path), width=width * scale, height=height * scale)


def phone_pair(title, entries, kicker):
    cells = []
    captions = []
    for filename, caption in entries:
        cells.append(fitted_image(filename, 77 * mm, 136 * mm))
        captions.append(p(caption, "Captionx"))
    table = Table([cells, captions], colWidths=[84 * mm] * len(entries), hAlign="CENTER")
    table.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm)]))
    return [p(kicker, "Kicker"), p(title, "H1x"), table, PageBreak()]


def data_table(headers, rows, widths, font=7.6):
    body_style = ParagraphStyle(name=f"T{len(rows)}{font}", fontName="Helvetica", fontSize=font, leading=font + 3, textColor=MUTED)
    head = [p(h, "Kicker") for h in headers]
    data = [head] + [[Paragraph(str(cell), body_style) for cell in row] for row in rows]
    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SOFT),
        ("GRID", (0, 0), (-1, -1), 0.55, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    return table


doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=19 * mm, rightMargin=19 * mm,
    topMargin=18 * mm, bottomMargin=22 * mm,
    title="ReUse - Animacoes, Transicoes e Gamificacao",
    author="Tamy - RM552055",
    subject="Atividade FIAP de animacoes, keyframes, transicoes e gamificacao em React Native",
)
story = []

# 1 - Cover
story.extend([
    Spacer(1, 18 * mm),
    p("MOBILE · FIAP · 2026", "Kicker"),
    p("ReUse: animações, transições e gamificação para uma jornada circular.", "CoverTitle"),
    p("Implementação React Native com movimento acessível, feedback de impacto e um sistema ético de pontos, níveis, missões e medalhas.", "CoverSub"),
    Spacer(1, 7 * mm),
    Table([[Paragraph("REUSE", ParagraphStyle(name="Brand", fontName="Helvetica-Bold", fontSize=30, leading=35, alignment=TA_CENTER, textColor=FOREST))]], colWidths=[172 * mm], rowHeights=[43 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), LEAF), ("BOX", (0, 0), (-1, -1), 1, FOREST), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")])),
    Spacer(1, 18 * mm),
    p("TRABALHO INDIVIDUAL", "Kicker"),
    p("Autoria: Tamy<br/>RM: 552055<br/>Atividade: Animações, Keyframes, Transições e Gamificação<br/>Entrega: 23 de setembro de 2026", "Bodyx"),
    PageBreak(),
])

# 2 - Context and score map
rubric_rows = [
    ("20%", "Animações", "5 sequências reais com feedback visual e textual"),
    ("15%", "Keyframes", "Estados 0%, intermediário e 100%, duração, delay e easing"),
    ("15%", "Transições", "Stack, componentes, continuidade, desempenho e movimento reduzido"),
    ("50%", "Gamificação", "Pontos, níveis, progresso, missões, medalhas, regras e ética"),
]
story.extend([
    p("01 · CONTEXTO E OBJETIVOS", "Kicker"), p("Movimento que explica; reconhecimento que orienta", "H1x"),
    p("A ReUse conecta pessoas interessadas em manter objetos em circulação. Esta etapa preserva os fluxos de busca, favoritos, câmera, rascunho e anúncio da Sprint 2 e acrescenta movimento funcional e uma jornada de impacto sustentável.", "Bodyx"),
    p("O princípio de design é simples: animações devem reforçar hierarquia e causa-efeito; gamificação deve tornar progresso compreensível sem criar ansiedade, competição pública ou recompensa financeira.", "Bodyx"),
    Spacer(1, 4 * mm),
    data_table(["PESO", "CRITÉRIO", "EVIDÊNCIA NESTA ENTREGA"], rubric_rows, [22 * mm, 43 * mm, 107 * mm], 8.2),
    Spacer(1, 7 * mm),
    Table([[card("Objetivo de experiência", "Dar resposta imediata para entrada, favorito, progresso e publicação, mantendo o foco no item e na próxima ação."), card("Objetivo de produto", "Reconhecer comportamentos circulares verificáveis e ensinar regras transparentes de progresso.", accent=True)]], colWidths=[86 * mm, 86 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm)])),
    PageBreak(),
])

# 3 - Animations overview
story.extend([
    p("02 · ANIMAÇÕES (20%)", "Kicker"), p("Cinco movimentos implementados", "H1x"),
    data_table(["ANIMAÇÃO", "GATILHO", "FUNÇÃO", "IMPLEMENTAÇÃO"], [
        ("Reveal de boas-vindas", "Montagem da tela", "Conduzir da ilustração para a proposta", "Animated.timing · opacity + translateY"),
        ("Reveal do início", "Entrada em Início", "Apresentar impacto antes da grade", "Animated.timing · 520 ms"),
        ("Favorito", "Toque no coração", "Confirmar seleção e pontuação", "Animated.sequence + spring/scale"),
        ("Progresso", "Abertura de Meu impacto", "Explicar avanço no nível", "Animated.timing · largura 0 → progresso"),
        ("Celebração", "Persistência concluída", "Relacionar publicação e missão", "opacity + scale + rotate"),
    ], [38 * mm, 33 * mm, 53 * mm, 48 * mm], 7.4),
    Spacer(1, 6 * mm),
    p("Decisões de movimento", "H2x"),
    bullet("Durações entre 280 e 700 ms: perceptíveis, mas curtas o suficiente para não bloquear a tarefa."),
    bullet("A especificação também funciona como roteiro para Adobe After Effects: cada estado percentual corresponde a um keyframe de posição, escala ou opacidade, preservando duração e curva de easing. A entrega implementa o resultado diretamente no React Native, sem alegar a criação de um arquivo .aep."),
    bullet("Transform e opacity usam driver nativo quando possível; a barra de largura permanece no driver JS por necessidade da propriedade."),
    bullet("Nenhuma ação depende somente de animação: live regions, texto, ícones e cor mantêm o resultado compreensível."),
    bullet("O estado final é estável, evitando loops, distração e consumo contínuo de recursos."),
    Spacer(1, 5 * mm),
    p("A tela inicial abaixo mostra o estado final do reveal: impacto coletivo visível antes da grade, sem alterar a linguagem visual minimalista.", "Bodyx"),
    Table([[fitted_image("s2-02-inicio.png", 72 * mm, 112 * mm), card("Storyboard do reveal", "0%: cartão e grade 16 px abaixo, opacidade 0.<br/><br/>50%: hierarquia já legível, deslocamento reduzido.<br/><br/>100%: posição natural e opacidade total.<br/><br/>Alternativa reduzida: estado final imediato.", 85 * mm)]], colWidths=[80 * mm, 90 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm)])),
    PageBreak(),
])

# 4 - Animation evidence
story.extend(phone_pair("Feedback no momento da ação", [
    ("s3-02-favorito-pontos.png", "Spring no favorito + mensagem acessível de +10 pontos"),
    ("s3-03-missao-concluida.png", "Celebração após o Async Storage confirmar a publicação"),
], "02.1 · EVIDÊNCIAS REAIS"))

# 5 - Keyframes table A
keyframe_rows_a = [
    ("Boas-vindas", "0%", "opacity 0 · translateY 18", "delay 80 ms", "cubic-out"),
    ("", "70%", "opacity 0,70 · translateY 5", "valor = 0,70", "cubic-out"),
    ("", "100%", "opacity 1 · translateY 0", "duration 620 ms", "cubic-out"),
    ("Início", "0%", "opacity 0 · translateY 16", "delay 100 ms", "cubic-out"),
    ("", "75%", "opacity 0,75 · translateY 4", "valor = 0,75", "cubic-out"),
    ("", "100%", "opacity 1 · translateY 0", "duration 520 ms", "cubic-out"),
    ("Favorito", "0%", "scale 1", "spring 22 / 8", "spring"),
    ("", "pico", "scale 1,22", "spring 20 / 5", "spring"),
    ("", "repouso", "scale 1", "duração dinâmica", "spring"),
]
story.extend([
    p("03 · KEYFRAMES (15%)", "Kicker"), p("Especificação: entrada e ação", "H1x"),
    p("Embora React Native Animated não use a sintaxe CSS @keyframes, cada sequência foi modelada e documentada como estados equivalentes. Percentuais representam o progresso do Animated.Value, não tempo de relógio: easing e spring tornam o instante intermediário não linear. A fonte auditável está em <b>src/motion/specs.ts</b>.", "Bodyx"),
    data_table(["SEQUÊNCIA", "ESTADO", "VALORES", "EXECUÇÃO", "EASING"], keyframe_rows_a, [34 * mm, 22 * mm, 58 * mm, 28 * mm, 30 * mm], 8),
    Spacer(1, 7 * mm),
    p("Gatilho e justificativa", "H2x"),
    bullet("Boas-vindas: começa na montagem; cria uma entrada calma e direciona o olhar sem esconder a chamada principal."),
    bullet("Início: começa quando a tela entra; estabelece primeiro o impacto e depois os itens próximos."),
    bullet("Favorito: começa no toque; o overshoot comunica resposta tátil visual sem mudar o layout."),
    Spacer(1, 5 * mm),
    card("Movimento reduzido", "Quando AccessibilityInfo informa reduceMotion, valores assumem imediatamente o estado final. A confirmação de favorito permanece como texto em live region e mudança de ícone/cor.", 172 * mm, True),
    PageBreak(),
])

# 6 - Keyframes table B
keyframe_rows_b = [
    ("Progresso", "0%", "width 0%", "delay 120 ms", "cubic-out"),
    ("", "72%", "width 72% da meta calculada", "valor = 0,72", "cubic-out"),
    ("", "100%", "width = progresso real", "duration 700 ms", "cubic-out"),
    ("Celebração", "0%", "opacity 0 · scale 0,72 · rotate -5°", "0 ms", "back-out"),
    ("", "70%", "opacity 1 · scale 1,08 · rotate 2°", "valor = 0,70", "back-out"),
    ("", "100%", "opacity 1 · scale 1 · rotate 0°", "duration 560 ms", "back-out"),
]
story.extend([
    p("03.1 · KEYFRAMES", "Kicker"), p("Especificação: progresso e celebração", "H1x"),
    data_table(["SEQUÊNCIA", "ESTADO", "VALORES", "EXECUÇÃO", "EASING"], keyframe_rows_b, [34 * mm, 22 * mm, 72 * mm, 25 * mm, 19 * mm], 7.7),
    Spacer(1, 7 * mm),
    p("Gatilho e justificativa", "H2x"),
    bullet("Progresso: executa ao abrir Meu impacto ou recalcular dados persistidos. A barra traduz pontos em distância para o próximo nível."),
    bullet("Celebração: só começa depois que a gravação de @reuse/listings resolve com sucesso. Falhas nunca exibem recompensa."),
    bullet("O overshoot de 1,08 e a rotação de 2° criam ênfase breve; o estado final volta a 1 e 0° para leitura estável."),
    Spacer(1, 6 * mm),
    Table([[p("0%", "BigNumber"), p("70%", "BigNumber"), p("100%", "BigNumber")], [p("surge e orienta", "Centered"), p("pico de ênfase", "Centered"), p("repouso legível", "Centered")]], colWidths=[57 * mm] * 3, style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), SOFT), ("BOX", (0, 0), (-1, -1), 0.7, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("TOPPADDING", (0, 0), (-1, -1), 7 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 7 * mm), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")])),
    Spacer(1, 7 * mm),
    p("Critério de sucesso: movimento percebido em velocidade normal, resultado compreendido sem movimento e nenhuma divergência entre sucesso visual e persistência real.", "Bodyx"),
    PageBreak(),
])

# 7 - Transitions
story.extend([
    p("04 · TRANSIÇÕES (15%)", "Kicker"), p("Continuidade entre contexto, detalhe e resultado", "H1x"),
    data_table(["CAMADA", "TRANSIÇÃO", "DURAÇÃO", "PROPÓSITO", "REDUZIDA"], [
        ("Stack", "fade_from_bottom", "280 ms iOS; padrão demais", "Relacionar lista, detalhe, perfil e impacto", "none / 0 ms"),
        ("Conteúdo", "fade + translateY", "520-620 ms", "Revelar hierarquia sem salto", "estado final"),
        ("Ação", "spring scale", "dinâmica (2 springs)", "Confirmar favorito", "ícone + texto"),
        ("Modal/feedback", "scale + rotate + fade", "560 ms", "Celebrar publicação persistida", "cartão estático"),
        ("Progresso", "width interpolada", "700 ms", "Mostrar distância até o nível", "largura final"),
    ], [28 * mm, 39 * mm, 25 * mm, 55 * mm, 25 * mm], 7.2),
    Spacer(1, 7 * mm),
    p("Princípios", "H2x"),
    bullet("Continuidade: o stack preserva direção e contexto; voltar retorna ao ponto anterior sem reiniciar dados."),
    bullet("Hierarquia: transições de tela são mais discretas que o feedback de uma ação concluída."),
    bullet("Lista e cards: o reveal agrupa o carregamento visual; cards não se movem continuamente durante a leitura."),
    bullet("Modal e feedback: o cartão de missão concluída entra no fluxo da página e não bloqueia navegação ou leitor de tela."),
    bullet("Desempenho: opacity e transform usam driver nativo; imagens e layout não são recalculados em loop."),
    bullet("Acessibilidade: reduceMotionChanged é observado em tempo real; texto, cor, ícones e progressbar mantêm semântica."),
    Spacer(1, 7 * mm),
    Table([[card("Entrada", "A pessoa reconhece imediatamente a tela e recebe o conteúdo em ordem.", 47 * mm), card("Ação", "O movimento acontece onde houve toque, reduzindo ambiguidade.", 47 * mm), card("Resultado", "A confirmação aparece somente após o efeito persistente terminar.", 47 * mm, accent=True)]], colWidths=[57 * mm] * 3, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm)])),
    PageBreak(),
])

# 8 - Gamification system
story.extend([
    p("05 · GAMIFICAÇÃO (50%)", "Kicker"), p("Impacto reconhecido, não competição", "H1x"),
    p("O sistema chama atenção para escolhas sustentáveis verificáveis. Não existe placar público, compra de pontos, perda por pausa ou recompensa por cliques repetidos.", "Bodyx"),
    Table([[card("1 · Descobrir", "Salvar um item relevante vale 10 pontos e ensina a usar favoritos com intenção.", 47 * mm), card("2 · Circular", "Publicar um item com foto e dados persistidos vale 100 pontos.", 47 * mm), card("3 · Evoluir", "Missões e níveis tornam a próxima ação legível sem impor prazo.", 47 * mm, accent=True)]], colWidths=[57 * mm] * 3, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm)])),
    Spacer(1, 7 * mm),
    p("Economia de pontos", "H2x"),
    data_table(["AÇÃO", "PONTOS", "VALIDAÇÃO", "ANTIABUSO"], [
        ("Favoritar item único", "10", "ID presente em @reuse/favorites", "Array de IDs não duplica; remover recalcula"),
        ("Publicar anúncio", "100", "write de @reuse/listings concluído", "Sem pontos em erro, rascunho ou campo inválido"),
        ("Sequência semanal", "reconhecimento", "conceito documentado", "Sem perda de pontos ou punição por pausa"),
    ], [43 * mm, 23 * mm, 54 * mm, 52 * mm], 7.7),
    Spacer(1, 4 * mm),
    p("Sem dupla contagem", "H2x"),
    bullet("Os pontos exibidos nas missões resumem as ações já contabilizadas; não são bônus adicionais."),
    bullet("A missão de primeira publicação conclui uma vez. Anúncios seguintes recebem 'Novo impacto registrado' e continuam valendo 100 pontos por item distinto."),
    Spacer(1, 7 * mm),
    p("Níveis", "H2x"),
    data_table(["NÍVEL", "FAIXA", "SIGNIFICADO"], [
        ("Semente", "0-99", "Primeiros sinais de intenção circular"),
        ("Broto", "100-249", "Primeiro item colocado em circulação"),
        ("Guardião", "250-499", "Participação consistente e curadoria consciente"),
        ("Embaixador", "500+", "Referência pessoal de práticas circulares; sem privilégio financeiro"),
    ], [37 * mm, 35 * mm, 100 * mm], 8),
    PageBreak(),
])

# 9 - Gamification screenshot top
story.extend([
    p("05.1 · GAMIFICAÇÃO", "Kicker"), p("Progresso e missões no app", "H1x"),
    Table([[fitted_image("s3-04-impacto-gamificacao.png", 79 * mm, 145 * mm), [p("FATIA IMPLEMENTADA", "Kicker"), p("A tela calcula 110 pontos a partir de um favorito e um anúncio persistido. O nível Broto e a barra de progresso mostram 140 pontos restantes para Guardião.", "Bodyx"), p("Missões visíveis", "H2x"), bullet("Primeira escolha consciente: 1 de 1."), bullet("Compartilhe para circular: 1 de 1."), bullet("Curadoria com propósito: 1 de 3."), p("Feedback loop", "H2x"), p("Ação real → persistência → pontos → missão → progresso. Em caso de falha de armazenamento, o ciclo interrompe antes da recompensa.", "Bodyx"), p("Estado vazio", "H2x"), p("Com zero ações, a pessoa permanece em Semente, barra em 0%, medalhas bloqueadas e uma primeira missão clara.", "Bodyx")]]], colWidths=[88 * mm, 82 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm)])),
    PageBreak(),
])

# 10 - Badges and rules
story.extend([
    p("05.2 · GAMIFICAÇÃO", "Kicker"), p("Medalhas, reconhecimento e regras", "H1x"),
    Table([[fitted_image("s3-05-impacto-medalhas.png", 79 * mm, 145 * mm), [p("MEDALHAS", "Kicker"), bullet("Olhar consciente: primeiro favorito relevante."), bullet("Item em circulação: primeiro anúncio persistido."), bullet("Curadoria circular: cinco favoritos únicos."), p("Recompensas", "H2x"), p("As recompensas são reconhecimento, narrativa de nível e visibilidade do impacto. Não há desconto, dinheiro, escassez artificial ou compra de vantagem.", "Bodyx"), p("Retenção responsável", "H2x"), p("Missões sugerem ações úteis. A consistência semanal é reflexiva e não remove progresso quando a pessoa se afasta. Notificações, se adicionadas no futuro, devem ser opt-in e silenciosas por padrão.", "Bodyx"), p("Erro e recuperação", "H2x"), p("Falhas mantêm os dados editáveis, não concedem pontos e orientam liberar espaço ou tentar novamente.", "Bodyx")]]], colWidths=[88 * mm, 82 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm)])),
    PageBreak(),
])

# 11 - Ethical and metrics
story.extend([
    p("05.3 · GAMIFICAÇÃO", "Kicker"), p("Ética, acessibilidade, privacidade e métricas", "H1x"),
    Table([[card("Justiça", "Pontuação determinística, regras públicas, sem multiplicador pago, ranking ou vantagem por frequência artificial."), card("Privacidade", "Cálculo local baseado somente em favoritos e anúncios do dispositivo; nenhum perfil comportamental externo.", accent=True)], [card("Acessibilidade", "Progressbar semântica, live regions, labels, contraste e alternativa completa para movimento reduzido."), card("Autonomia", "Sem punição por pausa, contagem regressiva, streak quebrável ou linguagem de culpa.")]], colWidths=[86 * mm, 86 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm), ("TOPPADDING", (0, 0), (-1, -1), 2 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm)])),
    Spacer(1, 7 * mm),
    p("Métricas para evolução", "H2x"),
    data_table(["MÉTRICA", "PERGUNTA", "CUIDADO"], [
        ("Conclusão de missão", "A pessoa entendeu e completou uma ação útil?", "Não otimizar cliques vazios"),
        ("Itens em circulação", "Quantos anúncios válidos foram persistidos?", "Separar criação de remoção/erro"),
        ("Conversão favorito → ação", "Favoritos ajudam decisões posteriores?", "Não pressionar contato ou compra"),
        ("Uso com reduce motion", "A experiência continua compreensível?", "Medir falhas, não identificar pessoas"),
        ("Retorno voluntário", "A pessoa volta por utilidade?", "Sem streak punitiva ou notificação compulsória"),
    ], [45 * mm, 72 * mm, 55 * mm], 7.7),
    Spacer(1, 6 * mm),
    p("Hipótese mensurável", "H2x"),
    p("Tornar regras e progresso visíveis deve aumentar a conclusão de anúncios válidos e o retorno à área de impacto, sem aumentar ações repetidas, abandono por pressão ou erros de acessibilidade.", "Bodyx"),
    PageBreak(),
])

# 12 - Technical mapping
story.extend([
    p("06 · IMPLEMENTAÇÃO TÉCNICA", "Kicker"), p("Mapeamento entre experiência e código", "H1x"),
    data_table(["ARQUIVO", "RESPONSABILIDADE"], [
        ("App.tsx", "Transição do native stack e alternativa sem movimento."),
        ("src/motion/useReducedMotion.ts", "Consulta e observa AccessibilityInfo.reduceMotionChanged."),
        ("src/motion/specs.ts", "Fonte das especificações de keyframes, duração, delay e easing."),
        ("src/gamification/impact.ts", "Função pura de pontos, níveis, progresso, missões e medalhas."),
        ("src/screens/ImpactScreen.tsx", "UI acessível, progressbar animada, missões, medalhas e regras."),
        ("src/screens/WelcomeScreen.tsx", "Reveal de entrada."),
        ("src/screens/HomeScreen.tsx", "Reveal de cartão e grade."),
        ("src/screens/DetailScreen.tsx", "Spring do favorito e feedback de pontos."),
        ("src/screens/CreateListingScreen.tsx", "Celebração somente após persistência confirmada."),
        ("src/state/AppContext.tsx", "Async Storage, favoritos, rascunho, anúncios e resultado explícito de publicação."),
    ], [62 * mm, 110 * mm], 7.7),
    Spacer(1, 6 * mm),
    p("Contrato de dados", "H2x"),
    bullet("Pontos são derivados; não existe saldo separado que possa divergir dos dados reais."),
    bullet("Favoritos únicos valem 10 pontos; anúncios persistidos valem 100 pontos."),
    bullet("A gravação termina antes do sucesso, da limpeza do formulário e da recompensa."),
    bullet("Câmera, cópia de URI durável, fallback web, rascunho e telas anteriores foram preservados."),
    Spacer(1, 5 * mm),
    card("Decisão arquitetural", "A lógica de gamificação é pura e testável; a tela apenas apresenta o resultado. Isso reduz acoplamento, facilita novas missões e impede regras escondidas em componentes visuais.", 172 * mm, True),
    PageBreak(),
])

# 13 - Verification and conclusion
story.extend([
    p("07 · TESTES E VALIDAÇÃO", "Kicker"), p("Entrega executada e verificável", "H1x"),
    data_table(["VERIFICAÇÃO", "RESULTADO"], [
        ("Jest", "3 suítes · 19 testes aprovados"),
        ("TypeScript", "tsc --noEmit sem erros"),
        ("Expo Doctor", "21/21 verificações aprovadas"),
        ("npm audit", "0 alto/crítico; 10 moderados transitivos no ferramental Expo, sem autofix compatível"),
        ("Exportação web", "Build de produção Expo concluído"),
        ("Playwright", "14 capturas em viewport 390 × 844 @2x"),
        ("Inspeção visual", "Sem telas vazias, assets quebrados, sobreposição ou clipping bloqueante"),
        ("PDF", "Texto extraído, páginas renderizadas e links anotados verificados"),
    ], [56 * mm, 116 * mm], 8.2),
    Spacer(1, 7 * mm),
    p("Conclusão", "H2x"),
    p("A ReUse agora demonstra movimento real, transições coerentes e uma camada de gamificação completa em conceito e representativa em código. O sistema conecta ações persistidas a feedback, pontos, níveis, missões e medalhas, mantendo privacidade, justiça, acessibilidade e autonomia.", "Bodyx"),
    p("A implementação atende ao peso da rubrica: animações e keyframes são explícitos e verificáveis; transições preservam continuidade e redução de movimento; gamificação recebe o maior detalhamento, com jornada, economia, feedback loops, retenção responsável, antiabuso, métricas e mapeamento técnico.", "Bodyx"),
    Spacer(1, 5 * mm),
    p("REPOSITÓRIO", "Kicker"),
    p(f'<link href="{REPO_URL}" color="#173F2A">{REPO_URL}</link>', "Linkx"),
    p("PREVIEW WEB", "Kicker"),
    p(f'<link href="{PREVIEW_URL}" color="#173F2A">{PREVIEW_URL}</link>', "Linkx"),
    Spacer(1, 7 * mm),
    card("Arquivo para entrega no FIAP ON", "ReUse-Animacoes-Transicoes-Gamificacao.pdf", 172 * mm, True),
])

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
