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

## Atualização visual desta versão
- Mapa expandido para uma arena de aproximadamente 440 x 440 metros, com cinco áreas identificadas: Downtown, Industrial Yard, Old Village, Port Sector e Radar Ridge.
- Prédios de vários tamanhos, armazéns, casas, contêineres/estruturas industriais, estradas, postes, árvores, radar, guindaste e montanhas low-poly.
- Colisões do servidor alinhadas com os volumes principais dos edifícios.
- Avião de transporte no início do Battle Royale, com hélices animadas e rota atravessando a ilha.
- Jogadores podem saltar da aeronave pelo botão na tela ou tecla F; quem permanecer a bordo é lançado automaticamente quando o avião sai da área.
- Paraquedas com descida controlada e direção no ar.
- Strikers com capacete, máscara, colete, placas de proteção, mochila, luvas, braços e pernas articulados.
- Visão em primeira pessoa com duas mãos, luvas e rifle geométrico detalhado.
- Animações de caminhada/corrida, movimento de braços e pernas, respiração, oscilação da câmera/arma, recuo e hélices.

## Multiplayer e testes
1. Inicie com `npm start`.
2. Abra http://localhost:3000 em duas abas e entre no mesmo modo.
3. No Battle Royale, ambos entram na aeronave; use **SALTAR DO AVIÃO** ou **F** para iniciar o paraquedas.
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

No Railway, use os mesmos comandos de instalação e inicialização. Configure CORS para o domínio do jogo antes de abrir o serviço publicamente.

## Limitações conhecidas
Os modelos são construídos proceduralmente com geometrias Three.js, sem pacotes de animação ou assets externos. Esta atualização melhora a apresentação e cria a sequência de entrada aérea; não representa uma reprodução completa do Blood Strike comercial. Ainda são necessários playtests, otimização de rede sob carga, áudio, animações de recarga/contextuais e modelos artísticos finais.
