# Blood Zone

FPS multiplayer 3D para navegador, desenvolvido com Three.js, Node.js, Express e Socket.IO. Projeto original inspirado na experiência de battle royale, sem reutilizar arquivos ou recursos proprietários de Blood Strike.

## Requisitos e instalação
- Node.js 20 ou superior
- npm

```bash
git clone https://github.com/tarachukalucas-cyber/Blood-zone.git
cd Blood-zone
npm install
npm start
```

Abra http://localhost:3000. Use `npm run check` para verificar a sintaxe dos módulos JavaScript.

## Estrutura
- `server/server.js`: salas, simulação e eventos multiplayer autoritativos.
- `server/game/rules.js`: regras, personagens, Wildcards e colisões da arena.
- `client/index.html` e `client/css/style.css`: menu e HUD responsivo.
- `client/js/main.js`: câmera, input, renderização e sincronização.
- `client/js/game/scene.js`: mapa, avião, personagens, mãos, armas e animações.
- `client/js/network.js`: eventos Socket.IO do cliente.

## Atualização visual e mapa
- Arena ampliada para aproximadamente 440 x 440 metros, com cinco regiões identificadas: Downtown, Industrial Yard, Old Village, Port Sector e Radar Ridge.
- Prédios de diferentes alturas, casas, armazéns, estradas, postes de iluminação, árvores low-poly, guindaste portuário, radar e montanhas no horizonte.
- Colisões autoritativas no servidor para as estruturas principais do mapa.
- Avião de transporte no início do Battle Royale, com fuselagem, asas, motores, trem de pouso e hélices animadas.
- Salto manual da aeronave com botão na tela ou tecla F; quem permanecer a bordo é lançado automaticamente ao final da rota.
- Paraquedas com descida controlada e direção no ar.
- Strikers com capacete, máscara, colete, placas de proteção, mochila, luvas, braços e pernas articulados.
- Visão em primeira pessoa com mãos/luvas e modelos geométricos separados para Rifle, SMG, Marksman e Shotgun.
- Animações de caminhada/corrida, movimento dos membros, respiração, oscilação de câmera/arma, recuo, pose aérea e hélices.

## Multiplayer e testes
1. Inicie com `npm start`.
2. Abra http://localhost:3000 em duas abas e entre no mesmo modo.
3. No Battle Royale, aguarde a aeronave. Use **SALTAR DO AVIÃO** ou **F** para iniciar o paraquedas.
4. Em outra máquina da mesma rede, abra `http://IP-LOCAL-DO-SERVIDOR:3000`.

Battle Royale aceita até 24 jogadores e inicia com dois para facilitar testes. Squad Fight aceita até dez jogadores.

## Controles
- WASD: movimentar
- Mouse: mirar; clique esquerdo: disparar
- Shift: correr
- Ctrl: agachar
- Espaço: pular depois de pousar
- F: saltar da aeronave
- Q: habilidade do Striker
- E: coletar Wildcard
- Celular: joystick à esquerda, arrastar o lado direito para mirar, botões de tiro, salto e salto da aeronave

## Sistemas de jogo
- Ethan: Protection Matrix frontal com 400 HP e duração de 30 segundos; passiva de armadura reforçada.
- Zero: Shadowstrike e mobilidade superior.
- Hank: torreta com 100 HP e 15 de dano por segundo.
- Wildcards com raridades, até três equipadas e efeitos passivos.
- Armadura evolutiva, zona de segurança e Sudden Death Flag.
- Squad Fight com equipes, $600 por eliminação, loja e vitória por três rodadas.
- Hit zones simplificadas com multiplicadores para cabeça, tronco e membros.
- O servidor controla posições, dano, vida, cooldowns, habilidades, eliminações e dinheiro. O cliente envia intenções de movimento e ações.

## Deploy
O arquivo `render.yaml` prepara um serviço Node no Render:
- Build: `npm install`
- Start: `npm start`
- Health check: `/health`

No Railway, use os mesmos comandos de instalação e inicialização. Restrinja CORS ao domínio do jogo antes de abrir o serviço publicamente.

## Escopo desta versão
Os modelos são gerados proceduralmente com geometrias Three.js, sem pacotes externos de animação ou assets artísticos. Esta versão traz uma melhoria visual e a sequência de entrada aérea, mas ainda é um protótipo. Recomenda-se fazer testes de jogabilidade em navegador desktop e celular antes de publicar uma partida aberta. Ainda faltam áudio, animações de recarga/contextuais, física mais completa para cobertura e testes de carga com partidas cheias.
