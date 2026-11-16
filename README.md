# Blood Zone

FPS multiplayer 3D para navegador, construído com Three.js, Node.js, Express e Socket.IO. Projeto original inspirado no ritmo de jogos battle royale; não utiliza arquivos ou recursos proprietários de Blood Strike.

## Requisitos
- Node.js 20 ou superior
- npm

## Instalação
```bash
git clone https://github.com/tarachukalucas-cyber/Blood-zone.git
cd Blood-zone
npm install
npm start
``
Abra http://localhost:3000.

## Multiplayer
1. Abra o endereço em duas abas ou em dois computadores conectados à mesma rede.
2. Para testar na mesma rede, descubra o IP local do computador servidor e abra `http://IP-DO-SERVIDOR:3000` no outro dispositivo.
3. Selecione o mesmo modo e entre. O servidor faz o pareamento automático em uma sala.
4. Para jogar pela internet, publique o serviço Node em Render ou Railway e use a URL HTTPS fornecida pela plataforma.

## Controles
- WASD: movimentar
- Mouse: mirar; clique esquerdo: disparar
- Shift: correr
- Ctrl: agachar
- Espaço: pular
- Q: habilidade do Striker
- E: coletar Wildcard
- Celular: joystick virtual, botão de tiro e pulo

## Sistemas incluídos
- Três Strikers: Ethan (barreira), Zero (investida) e Hank (torreta).
- Wildcards com raridades e limite de três por jogador; uma carta é perdida ao ser eliminado.
- Armadura que absorve parte do dano e registra evolução de nível.
- Battle Royale com zona que encolhe e ponto de captura Sudden Death Flag.
- Squad Fight com equipes, dinheiro por eliminação, loja entre rodadas e vitória por três rodadas.
- Hit zones simplificadas com multiplicadores para cabeça, tronco e membros.
- Servidor controla vida, posições, cooldowns, habilidades, eliminações e dinheiro. O cliente envia intenção de movimento e pedidos de ação, não valores de vida ou pontuação.

## Deploy
Configure o serviço como aplicação Node:
- Build command: `npm install`
- Start command: `npm start`
- Porta: definida automaticamente por `process.env.PORT`
- Health check: `/health`

Não publique segredos no repositório. Para produção, restrinja CORS ao domínio do jogo, adicione autenticação, validação anti-cheat mais forte, persistência e proteção contra abuso.

## Escopo desta versão
Esta é uma base jogável/protótipo multiplayer, não uma reprodução integral do produto comercial. A partida começa quando dois jogadores entram na mesma sala. O modo Squad Fight encerra o confronto ao atingir três rodadas; o desempate é sinalizado no placar empatado em 2–2, antes da rodada decisiva, pois 3–3 não pode ocorrer em um formato de primeira equipe a três vitórias.
