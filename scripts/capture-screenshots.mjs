import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { cpSync, mkdirSync, readFile, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'docs', 'assets');
const sample = path.join(assets, 'sample-chair.svg');
const baseUrl = process.env.REUSE_URL || 'http://127.0.0.1:4173/reuse-mobile-fiap-sprint-2/';

const previewRoot = path.join(root, '.preview');
const baseRoot = path.join(previewRoot, 'reuse-mobile-fiap-sprint-2');
rmSync(previewRoot, { recursive: true, force: true });
mkdirSync(baseRoot, { recursive: true });
cpSync(path.join(root, 'dist'), baseRoot, { recursive: true });

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  let target = path.resolve(previewRoot, `.${pathname}`);
  if (!target.startsWith(previewRoot)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (statSync(target).isDirectory()) target = path.join(target, 'index.html');
  } catch {
    response.writeHead(404).end();
    return;
  }
  readFile(target, (error, data) => {
    if (error) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream' });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

const shot = async (name, fullPage = false) => {
  await page.screenshot({ path: path.join(assets, name), fullPage });
};

await page.getByText('Dê uma nova história ao que já existe.').waitFor();
await shot('s2-01-boas-vindas.png');

await page.getByRole('button', { name: 'Começar a explorar' }).click();
await page.getByText('Descubra boas escolhas').waitFor();
await shot('s2-02-inicio.png');

await page.getByText('Buscar', { exact: true }).click();
await page.getByText('Encontre o que merece continuar').waitFor();
await page.getByLabel('Buscar itens').fill('mochila');
await page.getByText('1 item encontrado').waitFor();
await shot('s2-03-busca.png');

await page.getByText('Início', { exact: true }).click();
await page.getByRole('button', { name: 'Ver Cafeteira italiana' }).click();
await page.getByText('Pronta para uma nova história').waitFor();
await shot('s2-04-detalhes.png');
await page.getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }).click();
await page.getByRole('button', { name: 'Voltar' }).click();

await page.getByText('Favoritos', { exact: true }).click();
await page.getByText('Suas escolhas salvas').waitFor();
await shot('s2-05-favoritos.png');

await page.getByText('Anunciar', { exact: true }).click();
await page.getByText('O que você quer colocar em circulação?').waitFor();
await shot('s2-06-anunciar-vazio.png');
const chooserPromise = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Escolher da galeria' }).click();
const chooser = await chooserPromise;
await chooser.setFiles(sample);
await page.getByLabel('Prévia da foto do anúncio').waitFor();
await page.getByLabel('Título do anúncio').fill('Cadeira restaurada');
await page.getByLabel('Valor do anúncio').fill('85');
await page.getByLabel('Descrição do anúncio').fill('Madeira recuperada, estrutura firme e acabamento renovado.');
await page.mouse.wheel(0, 180);
await page.waitForTimeout(250);
await shot('s2-07-foto-e-rascunho.png');
await page.getByRole('button', { name: 'Publicar anúncio' }).click();
await page.getByText('Anúncio publicado e salvo neste dispositivo.').waitFor();

await page.getByText('Perfil', { exact: true }).click();
await page.getByText('Seu espaço ReUse').waitFor();
await shot('s2-08-perfil.png');
await page.getByRole('button', { name: 'Abrir meus anúncios' }).click();
await page.getByText('Meus anúncios').last().waitFor();
await page.getByText('Cadeira restaurada').waitFor();
await shot('s2-09-meus-anuncios.png');

const checks = {
  myListingsScreen: await page.getByText('Meus anúncios').last().isVisible(),
  listingPersisted: await page.getByText('Cadeira restaurada').isVisible(),
  screenshots: 9,
  viewport: '390x844@2x',
};
console.log(JSON.stringify(checks));
await browser.close();
server.close();
