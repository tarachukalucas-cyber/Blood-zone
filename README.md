# Blood Zone

FPS multiplayer 3D para navegador, construído com Three.js, Node.js, Express e Socket.IO. É um projeto original inspirado no ritmo dos battle royales; não utiliza arquivos ou recursos proprietários de Blood Strike.

## Requisitos
- Node.js 20 ou superior
- npm

## Instalação
```bash
git clone https://github.com/tarachukalucas-cyber/Blood-zone.git
cd Blood-zone
npm install
npm start
```

Abra http://localhost:3000. Para validar a sintaxe dos módulos, execute `npm run check`.

## Estrutura
- `server/server.js`: salas, simulação e eventos Socket.IO autoritativos.
- `server/game/rules.js`: configuração de Strikers, Wildcards e obstáculos.
- `client/index.html`: menu e HUD.
- `client/css/style.css`: interface responsiva.
- `client/js/main.js`: loop de jogo, controles e HUD.
- `client/js/game/scene.js`: arena Three.js e modelos geométricos.
- `client/js/network.js`: comunicação em tempo real.

## Multiplayer
1. Abra o endereço em duas abas ou em dois computadores conectados à mesma rede.
2. Para testar na mesma rede, descubra o IP local do computador servidor e abra `http://IP-DO-SERVIDOR:3000` no outro dispositivo.
3. Selecione o mesmo modo e entre. O servidor faz o pareamento automático em uma sala.
4. Para jogar pela internet, publique o serviço Node em Render ou Railway e use a URL HTTPS fornecida pela plataforma.

A sala BR aceita até 24 jogadores e inicia com 2 para facilitar testes. Squad Fight aceita até 10 jogadores, divididos em duas equipes. Em produção, o mínimo de jogadores pode ser aumentado.

## Controles
- WASD: movimentar
- Mouse: mirar; clique esquerdo: disparar
- Shift: correr
- Ctrl: agachar
- Espaço: pular
- Q: habilidade do Striker
- E: coletar Wildcard
- Celular: joystick virtual, arrastar o lado direito para mirar, botão de tiro e pulo

## Sistemas incluídos
- Ethan: Protection Matrix frontal com 400 HP e duração de 30 segundos; passiva de armadura reforçada.
- Zero: Shadowstrike de mobilidade; passiva de velocidade e recarga de habilidade reduzida.
- Hank: torreta com 100 HP e 15 de dano por segundo; passiva de alcance de detecção ampliado.
- Wildcards com raridades, até três equipadas e uma carta aleatória dropada ao morrer. Efeitos de velocidade, cura, armadura, coleta e dano.
- Armadura que evolui ao absorver dano, aumenta sua capacidade e sua eficiência.
- Battle Royale com zona que encolhe e Sudden Death Flag que aparece no meio/final da partida.
- Squad Fight com equipes, $600 por eliminação, loja entre rodadas, equipamento persistente e vitória por três rodadas. No empate 2–2, a rodada decisiva vira um duelo 1v1; 3–3 não é possível em um formato de primeira equipe a três vitórias.
- Hit zones simplificadas com multiplicadores para cabeça, tronco e membros.
- Colisões autoritativas com a cobertura da arena e gravidade/pulo sincronizados.
- Servidor controla posições, vida, dano, cooldowns, habilidades, eliminações e dinheiro. O cliente envia intenção de movimento e pedidos de ação, não valores de vida ou pontuação.

## Deploy
O arquivo `render.yaml` já define um serviço web Node:
- Build command: `npm install`
- Start command: `npm start`
- Porta: definida automaticamente por `process.env.PORT`
- Health check: `/health`

No Railway, crie um serviço a partir do repositório e use `npm install` e `npm start`. Para produção, restrinja CORS ao domínio do jogo, adicione autenticação, validação anti-cheat mais forte, persistência e proteção contra abuso.

## Escopo
Esta é uma primeira base multiplayer jogável para expansão, não uma reprodução integral do produto comercial. Os modelos são geométricos e o mapa é compacto. Ainda faltam animações avançadas, áudio, armas 3D detalhadas, bots, persistência de contas e testes de carga com partidas cheias.
