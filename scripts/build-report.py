from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
OUTPUT = ROOT / "docs" / "ReUse-Mobile-Sprint-2.pdf"
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
styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=FOREST, tracking=1.2, spaceAfter=7))
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=36, leading=40, alignment=TA_LEFT, textColor=INK, spaceAfter=15))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["BodyText"], fontName="Helvetica", fontSize=14, leading=21, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=INK, spaceBefore=7, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.5, leading=16, textColor=MUTED, spaceAfter=8))
styles.add(ParagraphStyle(name="Bulletx", parent=styles["BodyText"], fontName="Helvetica", fontSize=10, leading=15, leftIndent=12, firstLineIndent=-7, bulletIndent=4, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="Captionx", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=12, alignment=TA_CENTER, textColor=FOREST, spaceBefore=5))
styles.add(ParagraphStyle(name="Smallx", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=MUTED))
styles.add(ParagraphStyle(name="Linkx", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10.5, leading=16, textColor=FOREST, spaceAfter=5))
styles.add(ParagraphStyle(name="CardTitlex", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="CardBodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=MUTED))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, A4[0], 17 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 17 * mm, 190 * mm, 17 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(20 * mm, 10 * mm, "ReUse Mobile - Sprint 2 - FIAP - RM552055")
    canvas.drawRightString(190 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def bullet(text):
    return Paragraph(f"• {text}", styles["Bulletx"])


def card(title, body, width=78 * mm):
    table = Table([[Paragraph(title, styles["CardTitlex"])], [Paragraph(body, styles["CardBodyx"])]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6 * mm),
        ("TOPPADDING", (0, 0), (-1, 0), 5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 1 * mm),
        ("TOPPADDING", (0, 1), (-1, 1), 0),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 5 * mm),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def fitted_image(filename, max_width=72 * mm, max_height=132 * mm):
    path = ASSETS / filename
    width, height = ImageReader(str(path)).getSize()
    scale = min(max_width / width, max_height / height)
    return Image(str(path), width=width * scale, height=height * scale)


def screenshots_page(kicker, title, entries):
    cells = []
    for filename, caption in entries:
        cells.append([fitted_image(filename), Paragraph(caption, styles["Captionx"])])
    data = [[cells[i][0] for i in range(len(cells))], [cells[i][1] for i in range(len(cells))]]
    table = Table(data, colWidths=[82 * mm] * len(cells), hAlign="CENTER")
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm)]))
    return [Paragraph(kicker, styles["Kicker"]), Paragraph(title, styles["H1x"]), table, PageBreak()]


doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=19 * mm, bottomMargin=23 * mm, title="ReUse Mobile - Sprint 2",
    author="Tamy", subject="React Native, UI/UX, Async Storage e câmera",
)
story = []

# Cover
story.extend([
    Spacer(1, 22 * mm),
    Paragraph("SPRINT 2 · MOBILE · FIAP", styles["Kicker"]),
    Paragraph("ReUse: uma experiência mobile que mantém objetos em circulação.", styles["CoverTitle"]),
    Paragraph("Aplicação React Native com navegação real, persistência local e fluxo de anúncio com câmera/galeria.", styles["CoverSub"]),
    Spacer(1, 8 * mm),
    Table([[Paragraph("REUSE", ParagraphStyle(name="Brand", fontName="Helvetica-Bold", fontSize=30, leading=35, alignment=TA_CENTER, textColor=FOREST))]], colWidths=[170 * mm], rowHeights=[48 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), LEAF), ("BOX", (0, 0), (-1, -1), 1, FOREST), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")])),
    Spacer(1, 20 * mm),
    Paragraph("Trabalho individual", styles["Kicker"]),
    Paragraph("Autoria: Tamy<br/>RM: 552055<br/>Ano: 2026<br/>Entrega: 18 de setembro de 2026", styles["Bodyx"]),
    PageBreak(),
])

# Section 1 intro
story.extend([
    Paragraph("01 · TELAS (40%)", styles["Kicker"]),
    Paragraph("Um fluxo completo e coerente", styles["H1x"]),
    Paragraph("A Sprint 2 evolui a linguagem visual da primeira entrega para nove telas conectadas por React Navigation. Os controles demonstrados são funcionais: busca filtra itens, cards abrem detalhes, favoritos são persistidos e anúncios locais aparecem no perfil.", styles["Bodyx"]),
    Table([[card("Descobrir", "Boas-vindas, início, busca e detalhes apresentam a proposta, itens próximos e informações para decidir."), card("Guardar", "Favoritos e rascunhos permanecem disponíveis após recarregar ou reabrir o app.")], [card("Anunciar", "Foto, título, valor e descrição compõem um anúncio local com feedback de validação."), card("Acompanhar", "Perfil e Meus anúncios consolidam estado persistido e deixam a privacidade explícita.")]], colWidths=[84 * mm, 84 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm), ("TOPPADDING", (0, 0), (-1, -1), 2 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm)])),
    Spacer(1, 7 * mm),
    Paragraph("REPOSITÓRIO PÚBLICO", styles["Kicker"]),
    Paragraph(f'<link href="{REPO_URL}" color="#173F2A">{REPO_URL}</link>', styles["Linkx"]),
    Paragraph("PREVIEW WEB", styles["Kicker"]),
    Paragraph(f'<link href="{PREVIEW_URL}" color="#173F2A">{PREVIEW_URL}</link>', styles["Linkx"]),
    PageBreak(),
])

story.extend(screenshots_page("01.1 · TELAS", "Entrada e descoberta", [("s2-01-boas-vindas.png", "Boas-vindas: proposta e chamada principal"), ("s2-02-inicio.png", "Início: impacto e itens próximos")]))
story.extend(screenshots_page("01.2 · TELAS", "Busca e decisão", [("s2-03-busca.png", "Busca textual com resultado filtrado"), ("s2-04-detalhes.png", "Detalhes, condição, localização e favorito")]))
story.extend(screenshots_page("01.3 · TELAS", "Guardar e anunciar", [("s2-05-favoritos.png", "Favoritos persistidos localmente"), ("s2-06-anunciar-vazio.png", "Formulário e estado inicial da foto")]))
story.extend(screenshots_page("01.4 · TELAS", "Foto e perfil", [("s2-07-foto-e-rascunho.png", "Prévia, substituição e rascunho preenchido"), ("s2-08-perfil.png", "Perfil com contadores e aviso de privacidade")]))

story.extend([
    Paragraph("01.5 · TELAS", styles["Kicker"]), Paragraph("Anúncios criados no dispositivo", styles["H1x"]),
    Table([[fitted_image("s2-09-meus-anuncios.png", 78 * mm, 150 * mm), Paragraph("<b>Meus anúncios</b><br/><br/>O item criado no fluxo de anúncio é recuperado do Async Storage. A tela diferencia conteúdo local, mostra status, valor e origem dos dados.", styles["Bodyx"])]], colWidths=[88 * mm, 77 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm)])),
    PageBreak(),
])

# UI/UX
story.extend([
    Paragraph("02 · MOBILE UI/UX (30%)", styles["Kicker"]), Paragraph("Clareza, toque e feedback", styles["H1x"]),
    bullet("Hierarquia visual: títulos fortes, rótulos curtos e conteúdo secundário em cinza sem perder contraste."),
    bullet("Consistência: fundo claro, tipografia preta, verde escuro institucional e verde-lima usado somente como destaque."),
    bullet("Navegação: stack para detalhes e Meus anúncios; cinco abas persistentes para os fluxos principais."),
    bullet("Alvos de toque: botões e ícones com áreas amplas e rótulos de acessibilidade descritivos."),
    bullet("Formulários: rolagem, KeyboardAvoidingView, teclados adequados por campo e texto auxiliar."),
    bullet("Feedback: mensagens para foto adicionada, permissão negada, validação incompleta e publicação concluída."),
    bullet("Estados vazios: busca, favoritos e anúncios explicam o estado e indicam a próxima ação."),
    bullet("Responsividade: conteúdo centralizado com largura máxima em telas grandes e grid fluido no mobile."),
    bullet("Privacidade: aviso no perfil e ausência de dados reais, segredo, backend ou envio externo."),
    Spacer(1, 7 * mm),
    Table([[card("Componentes reutilizáveis", "ProductCard centraliza imagem, condição, categoria, preço, cidade, acessibilidade e resposta ao toque."), card("Conteúdo acessível", "Labels de câmera, busca, foto, navegação, favorito e anúncio permitem uso por tecnologias assistivas.")]], colWidths=[84 * mm, 84 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm)])),
    PageBreak(),
])

# Storage
storage_data = [
    [Paragraph("CHAVE", styles["Kicker"]), Paragraph("CONTEÚDO", styles["Kicker"]), Paragraph("COMPORTAMENTO", styles["Kicker"])],
    [Paragraph("@reuse/favorites", styles["Smallx"]), Paragraph("Array de IDs", styles["Smallx"]), Paragraph("Favoritos sobrevivem a reload/reinício.", styles["Smallx"])],
    [Paragraph("@reuse/draft", styles["Smallx"]), Paragraph("Título, valor, descrição e URI", styles["Smallx"]), Paragraph("Cada edição salva o rascunho automaticamente.", styles["Smallx"])],
    [Paragraph("@reuse/listings", styles["Smallx"]), Paragraph("Anúncios com ID e data", styles["Smallx"]), Paragraph("Perfil e Meus anúncios leem itens locais.", styles["Smallx"])],
]
story.extend([
    Paragraph("03 · ASYNC STORAGE (15%)", styles["Kicker"]), Paragraph("Persistência que muda a experiência", styles["H1x"]),
    Paragraph("O AppProvider carrega os três conjuntos de dados ao iniciar. As alterações são escritas imediatamente, sem depender de servidor. Ao publicar, o rascunho vira um anúncio local e sua chave temporária é removida.", styles["Bodyx"]),
    Spacer(1, 5 * mm),
    Table(storage_data, colWidths=[47 * mm, 50 * mm, 70 * mm], repeatRows=1, style=TableStyle([("BACKGROUND", (0, 0), (-1, 0), SOFT), ("GRID", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm)])),
    Spacer(1, 9 * mm),
    Paragraph("VERIFICAÇÃO", styles["Kicker"]),
    bullet("Testes automatizados confirmam gravação de favorito e anúncio, incluindo URI da foto."),
    bullet("A captura automatizada publica um item, navega ao perfil e comprova que ele aparece em Meus anúncios."),
    bullet("O README documenta formato, finalidade e limites de cada chave."),
    Spacer(1, 7 * mm),
    card("Privacidade e escopo", "O protótipo não transmite dados. A persistência é local e pode ser apagada ao limpar os dados do aplicativo ou navegador.", 167 * mm),
    PageBreak(),
])

# Camera
story.extend([
    Paragraph("04 · CÂMERA (15%)", styles["Kicker"]), Paragraph("Da captura à prévia do anúncio", styles["H1x"]),
    Paragraph("A integração usa expo-image-picker porque o mesmo módulo oferece captura nativa e seleção da galeria, mantendo uma experiência coerente entre dispositivo, simulador e navegador.", styles["Bodyx"]),
    bullet("Android/iOS: solicita permissão, abre a câmera e retorna a URI da imagem capturada."),
    bullet("Permissão negada: exibe orientação clara e mantém a galeria como alternativa."),
    bullet("Galeria: permite selecionar uma imagem existente sem exigir câmera."),
    bullet("Prévia: mostra a imagem dentro do formulário e oferece Substituir foto."),
    bullet("Web/simulador: o botão de câmera usa seleção de arquivo e explica a limitação do navegador."),
    bullet("Validação: foto, título e valor são obrigatórios antes de publicar."),
    Spacer(1, 7 * mm),
    Table([[card("Configuração nativa", "app.json declara textos de permissão específicos para câmera e fotos, explicando o uso somente no anúncio."), card("Fallback demonstrável", "O roteiro Playwright escolhe uma imagem real no build web, confirma a prévia e publica o item.")]], colWidths=[84 * mm, 84 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm)])),
    PageBreak(),
])

# Validation
story.extend([
    Paragraph("05 · ESTRUTURA E VALIDAÇÃO", styles["Kicker"]), Paragraph("Entrega testada e reproduzível", styles["H1x"]),
    Paragraph("A aplicação separa dados, estado, navegação, componentes e telas. O AppContext concentra persistência e ações; React Navigation organiza stack e abas; os scripts reproduzem exportação e evidências visuais.", styles["Bodyx"]),
    Paragraph("VALIDAÇÕES EXECUTADAS", styles["Kicker"]),
    bullet("11 testes de comportamento: entrada, detalhes, interesse local, busca e categorias, câmera, falhas de permissão/persistência, favoritos e perfil/Meus anúncios."),
    bullet("TypeScript sem erros com tsc --noEmit."),
    bullet("Expo Doctor para compatibilidade com o SDK 57."),
    bullet("Exportação web de produção e roteiro Playwright em viewport mobile de 390 × 844 px."),
    bullet("Inspeção visual de todas as nove capturas, sem assets quebrados, sobreposição ou texto de placeholder indevido."),
    Spacer(1, 6 * mm),
    Paragraph("CONCLUSÃO", styles["Kicker"]),
    Paragraph("A ReUse Sprint 2 cobre os quatro blocos avaliados: telas conectadas, melhorias de UI/UX, estado persistente e recurso de câmera com fallback. O protótipo mantém a proposta sustentável da Sprint 1 e cria uma base técnica clara para autenticação e backend em etapas futuras.", styles["Bodyx"]),
    Spacer(1, 6 * mm),
    Paragraph("CÓDIGO-FONTE", styles["Kicker"]),
    Paragraph(f'<link href="{REPO_URL}" color="#173F2A">{REPO_URL}</link>', styles["Linkx"]),
])

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
