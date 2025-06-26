// 🧠 game.js - Versão Final de Emotion RPG (Correção do erro updateTexts)

// 📋 SFX do jogo //
const sfx = {
    // Carrega arquivos de áudio para efeitos sonoros
    click: new Audio("click1.wav"), // Geral para cliques de cartas (pode ser usado em outras interações)
    hit: new Audio("hitHurt1.wav"), // Som de acerto normal em inimigo (quando jogador ataca)
    heal: new Audio("powerUp1.wav"), // Som de cura/power-up (para Regeneração)
    restorationHP: new Audio("RestourationHP.wav"), // Efeito sonoro para recuperação de vida (para Vida +35)
    enemyHit: new Audio("hitHurtEnemy.wav"), // Som de inimigo acertando o jogador (normal)
    powerUp2: new Audio("powerUp2.wav"), // SFX para Surtar/Varinha de Mágico
    hitCriticalPlayer: new Audio("hitHurtCriticalPlayer.wav"), // SFX para crítico no jogador (inimigo ataca criticamente)
    hitCriticalEnemy: new Audio("hitHurtEnemy.wav"), // SFX para crítico no inimigo (jogador ataca criticamente)
    click2: new Audio("click2.wav"), // Novo SFX para botões de menu
    blipSelectbutton1: new Audio("blipSelectbutton1.wav"), // Novo SFX para botões de voltar/cancelar
    victoryTheme: new Audio("VictoryTheme1.mp3"), // Música de vitória

    bossTheme: new Audio("BossTheme1.mp3"), // Música dos Bosses
    surtarHit: new Audio("HitcriticalSurtar.wav"), // Dano com Surtar ativado
    iceActive: new Audio("IceActive1.wav"), // Ativar Ar Congelante
    shieldActive: new Audio("ShieldActive1.wav"), // Ativar Defesa
    armorSpikeActive: new Audio("ActiveArmorSpike.wav"), // Ativar Armadura de Espinhos
    ultraSeriousPunch: new Audio("UltraSeriousPunch.wav") // SFX: Soco Ultramente Sério
};

// Variável para a música de fundo
let backgroundMusic; // Será o tema de batalha normal
let bossMusic;       // Será o tema dos chefes
let musicVolume = 0.5; // Volume inicial da música (0.0 a 1.0)
let sfxVolume = 0.8;   // Volume inicial dos efeitos sonoros (0.0 a 1.0)
let wasMusicPlayingBeforeHide = false; // Flag para controlar se a música estava tocando antes de esconder a aba


// 🎮 ESTADOS DE TELA //
// Referências aos elementos HTML das diferentes telas do jogo
const screens = {
    main: document.getElementById("main-menu"),
    shop: document.getElementById("shop-menu"),
    deck: document.getElementById("deck-menu"),
    game: document.getElementById("game-screen"),
    options: document.getElementById("options-menu"),
    victory: document.getElementById("victory-screen"),
    story: document.getElementById("story-screen"),
    postVictoryOverlay: document.getElementById("post-victory-message-overlay") // NOVO: Overlay pós-vitória
};
let currentScreen = null; // Inicializa como null, será definido em window.onload

// Referências diretas aos elementos da UI para otimização de acesso
const playerHealthText = document.getElementById("player-health");
const playerManaText = document.getElementById("player-mana");
const playerCubesText = document.getElementById("player-cubes");
const waveCountText = document.getElementById("wave-count");
const mainCubesText = document.getElementById("main-cubes");
const shopCubesText = document.getElementById("shop-cubes");
const enemyEmojiElement = document.getElementById("enemy"); // O próprio emoji do inimigo
const enemyHealthBarFill = document.getElementById("enemy-health");
const bossIndicatorElement = document.getElementById("boss-indicator");

const shopItemsContainer = document.getElementById("shop-items");
const deckCardsContainer = document.getElementById("deck-cards");
const cardHandContainer = document.getElementById("card-hand");
const deckCardCountDisplay = document.getElementById("deck-card-count");
const deckWarningMessage = document.getElementById("deck-warning-message"); // NOVO: Aviso de deck

const gameMessageDisplay = document.getElementById("game-message");
const customConfirmDialog = document.getElementById("custom-confirm-dialog");
const customConfirmMessage = document.getElementById("custom-confirm-message");
const customConfirmYesBtn = document.getElementById("custom-confirm-yes");
const customConfirmNoBtn = document.getElementById("custom-confirm-no");

const storyContentBox = document.getElementById("story-content-box");
const storyBackBtn = document.getElementById("btn-story-back");

const victoryTitleMain = document.getElementById("victory-title-main"); // NOVO: Título da tela de vitória
const victoryTotalDamageSpan = document.getElementById("victory-total-damage");
const victoryCardsUsedSpan = document.getElementById("victory-cards-used");
const victoryCertificateDisplay = document.getElementById("victory-certificate-display");
const postVictoryText = document.getElementById("post-victory-text"); // NOVO: Texto do overlay pós-vitória


// 🧪 VARIÁVEIS DE JOGO //
let playerHealth;     // Vida atual do jogador
const MAX_HEALTH = 100;  // Vida máxima do jogador (AGORA CONSTANTE)
let playerCubes;      // Moeda do jogo (persistente)
let playerMana;       // Mana atual do jogador
const MAX_MANA = 120;    // Mana máxima do jogador (AGORA CONSTANTE)
let wave;             // Onda atual (nível)
let defense;          // Defesa do jogador
let enemyHealth;      // Vida atual do inimigo
let deck = [];        // Cartas que o jogador tem no deck para usar no jogo
const MAX_DECK_SIZE = 3; // CORRIGIDO: Limite de 3 cartas no deck

// Objetos para rastrear status do jogador e inimigo
let playerStatus = {
    attackBuffTurns: 0,
    attackBuffAmount: 0,
    critBuffTurns: 0,
    critBuffAmount: 0,
    thornTurns: 0,
    thornDamage: 0,
    socoUltramenteSerioUsed: false // Flag para Soco Ultramente Sério
};

let playerRegenStatus = {
    active: false,
    turnsRemaining: 0,
    currentRegenAmount: 0,
    initialRegenAmount: 40,
    regenTickDecrease: 10
};

let enemyStatus = {
    missTurns: 0,
    frozenTurns: 0,
    burnTurns: 0,
    burnDamage: 0
};

// Objeto para armazenar informações do inimigo atual
let currentEnemy = {
    emoji: "",
    nameKey: "", // Chave de tradução para o nome (não será exibido, mas mantido na lógica)
    health: 0,
    isBoss: false,
    bossType: null // Referência ao objeto do boss se for um
};

// Variáveis para estatísticas de jogo e certificados
let totalDamageDealt = 0;
let totalPlayerAttacks = 0;
let totalPlayerCriticalAttacks = 0;
let damageTakenLastBossFight = 0; // Dano tomado no último boss
let cardsUsedThisRun = [];
let certificates = []; // Array para armazenar os certificados ganhos
const MAX_CERTIFICATE_SLOTS = 3; // Máximo de slots para certificados (AUMENTADO)


// 🃏 CARTAS DISPONÍVEIS //
const cards = [
    // Cartas de Ataque
    { id: 1, nameKey: "card_faca_name", cost: 0, type: "attack", manaCost: 0, unlocked: true, critChance: 0.10, critMultiplier: 1.5, action: function() { dealDamage(5, this); }, descriptionKey: "card_faca_desc" },
    { id: 2, nameKey: "card_dualespada_name", cost: 20, type: "attack", manaCost: 0, unlocked: false, critChance: 0.15, critMultiplier: 1.5, action: function() { dealDamage(5, this); dealDamage(5, this); }, descriptionKey: "card_dualespada_desc" },
    { id: 6, nameKey: "card_marteloaben_name", cost: 35, type: "attack", manaCost: 0, unlocked: false, critChance: 0.30, critMultiplier: 1.7, action: function() { dealDamage(10, this, true); }, descriptionKey: "card_marteloaben_desc" },
    { id: 7, nameKey: "card_facacozinha_name", cost: 20, type: "attack", manaCost: 0, unlocked: false, critChance: 0.45, critMultiplier: 1.6, action: function() { dealDamage(8, this); }, descriptionKey: "card_facacozinha_desc" },

    // Cartas de Magia
    { id: 3, nameKey: "card_vida15_name", cost: 25, type: "magic", manaCost: 60, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { heal(35); sfx.restorationHP.play(); }, descriptionKey: "card_vida15_desc" },
    {
        id: 5,
        nameKey: "card_regen_name",
        cost: 30,
        type: "magic",
        manaCost: 65, // CORRIGIDO: Custo de mana da Regeneração para 65
        unlocked: false,
        critChance: 0,
        critMultiplier: 0,
        action: function() {
            playerRegenStatus.active = true;
            playerRegenStatus.turnsRemaining = 4;
            playerRegenStatus.currentRegenAmount = playerRegenStatus.initialRegenAmount;
            displayMessage(getText("card_regen_activated"));
            sfx.heal.play();
            updateUI();
        },
        descriptionKey: "card_regen_desc"
    },
    { id: 8, nameKey: "card_bolamag_name", cost: 45, type: "magic", manaCost: 45, unlocked: false, critChance: 0.70, critMultiplier: 2.0, action: function() { dealDamage(11, this); }, descriptionKey: "card_bolamag_desc" },
    { id: 9, nameKey: "card_varinhamag_name", cost: 50, type: "magic", manaCost: 80, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { enemyStatus.missTurns = 3; displayMessage(getText("enemy_miss_effect")); sfx.powerUp2.play(); }, descriptionKey: "card_varinhamag_desc" },
    { id: 10, nameKey: "card_surtar_name", cost: 60, type: "magic", manaCost: 95, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { playerStatus.attackBuffTurns = 2; playerStatus.attackBuffAmount = 0.05; playerStatus.critBuffTurns = 2; playerStatus.critBuffAmount = 0.05; displayMessage(getText("player_buff_effect")); sfx.powerUp2.play(); }, descriptionKey: "card_surtar_desc" },
    { id: 11, nameKey: "card_bolafogo_name", cost: 65, type: "magic", manaCost: 75, unlocked: false, critChance: 0.65, critMultiplier: 1.8, action: function() { dealDamage(13, this); enemyStatus.burnTurns = 10; enemyStatus.burnDamage = 3; displayMessage(getText("enemy_burn_effect")); }, descriptionKey: "card_bolafogo_desc" },
    { id: 12, nameKey: "card_arcong_name", cost: 70, type: "magic", manaCost: 85, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { enemyStatus.frozenTurns = 1; displayMessage(getText("enemy_frozen_effect")); sfx.iceActive.play(); }, descriptionKey: "card_arcong_desc" },

    // Cartas de Suporte
    { id: 4, nameKey: "card_defesa_name", cost: 25, type: "support", manaCost: 0, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { defense += 1; updateUI(); sfx.shieldActive.play(); }, descriptionKey: "card_defesa_desc" },
    { id: 13, nameKey: "card_armaduraespin_name", cost: 80, type: "support", manaCost: 90, unlocked: false, critChance: 0, critMultiplier: 0, action: function() { playerStatus.thornTurns = 5; playerStatus.thornDamage = 3; displayMessage(getText("player_thorns_effect")); updateUI(); sfx.armorSpikeActive.play(); }, descriptionKey: "card_armaduraespin_desc" },

    // NOVAS CARTAS ESPECIAIS (Contorno Roxo)
    {
        id: 14,
        nameKey: "card_soco_serio_name",
        cost: 0, // Custo 0 na loja, só pode ser desbloqueada com certificado dourado
        type: "special",
        manaCost: 110,
        unlocked: false, // Desbloqueado via certificado dourado
        critChance: 0, // Não tem crítico
        critMultiplier: 0,
        action: function() {
            // Verifica se a carta já foi usada nesta corrida
            if (playerStatus.socoUltramenteSerioUsed) {
                displayMessage(getText("card_soco_serio_used"));
                sfx.blipSelectbutton1.play(); // Som de erro
                return; // Impede o uso se já foi usada
            }
            sfx.ultraSeriousPunch.play(); // Efeito sonoro do soco
            // O último parâmetro 'true' indica que é uma ultimate e NÃO deve gerar cubos por dano
            dealDamage(9999, this, false, true); // CORRIGIDO: Passe 'true' para isUltimate aqui
            playerStatus.socoUltramenteSerioUsed = true; // Marca como usada
            displayMessage(getText("card_soco_serio_effect"));
            // Esta carta não é removida do deck, mas a flag `socoUltramenteSerioUsed` impede uso futuro.
        },
        descriptionKey: "card_soco_serio_desc"
    },
    {
        id: 15,
        nameKey: "card_suborno_name",
        cost: 755, // Custo em cubos na loja
        type: "special",
        manaCost: 0, // Não gasta mana
        unlocked: false,
        critChance: 0,
        critMultiplier: 0,
        action: function() {
            if (playerCubes >= 1000) {
                // Verifica se o inimigo é humanoide (Ninja 🥷 ou Vilão 🦹‍♂️)
                const isHuman = (currentEnemy.emoji === "🥷" || currentEnemy.emoji === "🦹‍♂️");

                if (isHuman) {
                    playerCubes -= 1000;
                    saveCubes(); // Salva cubos após o suborno
                    enemyHealth = 0; // Inimigo desiste instantaneamente
                    displayMessage(getText("card_suborno_success"));
                    sfx.click2.play(); // Som de sucesso
                    updateUI();
                    // Avança para a próxima onda ou vitória após um pequeno atraso
                    setTimeout(() => {
                        if (wave === MAX_WAVE) {
                            showVictoryScreen(); // Se o suborno finaliza o último boss
                        } else {
                            nextWave();
                            enableCardButtons();
                        }
                    }, 500);
                } else {
                    displayMessage(getText("card_suborno_fail_type")); // Mensagem de falha para tipo errado
                    sfx.blipSelectbutton1.play(); // Som de erro
                    // Devolve o mana se a carta tem custo de mana e falhou (neste caso, suborno não tem manaCost, mas é boa prática)
                    playerMana = Math.min(MAX_MANA, playerMana + this.manaCost);
                    updateUI();
                }
            } else {
                displayMessage(getText("card_suborno_fail_cubes")); // Mensagem de falha por falta de cubos
                sfx.blipSelectbutton1.play(); // Som de erro
                // Devolve o mana se a carta tem custo de mana e falhou
                playerMana = Math.min(MAX_MANA, playerMana + this.manaCost);
                updateUI();
            }
        },
        descriptionKey: "card_suborno_desc"
    }
];

// 👾 TIPOS DE INIMIGOS E SEUS ATAQUES //
const normalEnemyTypes = [
    { emoji: "🧟‍♂️", nameKey: "enemy_zombie_name" },
    { emoji: "🦇", nameKey: "enemy_bat_name" },
    { emoji: "🐍", nameKey: "enemy_snake_name" }
];

// Definição dos tipos de ataque dos inimigos com chance de crítico
const enemyAttackTypes = [
    { nameKey: "attack_normal_name", minDamage: 2, maxDamage: 5, critChance: 0.05, critMultiplier: 1.5 },
    { nameKey: "attack_semi_special_name", minDamage: 5, maxDamage: 10, critChance: 0.10, critMultiplier: 1.7 },
    { nameKey: "attack_special_name", minDamage: 10, maxDamage: 15, critChance: 0.20, critMultiplier: 2.0 }
];

// 👑 BOSSES E SEUS ATAQUES ESPECIAIS //
const MAX_WAVE = 30; // Limite de ondas no jogo inteiro
const BOSS_HEALTH = 200; // Vida fixa para todos os chefes

const bossAttackLogic = {
    "🥷": function() { // Ninja: ataque rápido com alta chance de crítico
        const damage = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
        const critChance = 0.40;
        const critMultiplier = 2.0;
        processEnemyAttack(damage, critChance, critMultiplier);
        displayMessage(getText("boss_ninja_attack"));
    },
    "🦹‍♂️": function() { // Vilão: debuff de mana e defesa do jogador
        const damage = Math.floor(Math.random() * (10 - 6 + 1)) + 6;
        processEnemyAttack(damage, 0.05, 1.5);
        playerMana = Math.max(0, playerMana - 30);
        defense = Math.max(0, defense - 1);
        displayMessage(getText("boss_villain_attack"));
    },
    "🦖": function() { // Dinossauro Rex: dano que ignora parte da defesa (Boss Final)
        const damage = Math.floor(Math.random() * (25 - 15 + 1)) + 15; // Dano mais alto para o final
        // Ignora metade da defesa
        let effectiveDamage = Math.max(0, damage - (defense * 0.5));
        playerHealth -= effectiveDamage;
        spawnParticles("player", effectiveDamage, "damage", false, 'red'); // Não é crítico de fato, só dano
        sfx.enemyHit.play(); // Som de acerto normal para o dino
        displayMessage(getText("boss_dino_attack"));
    }
};

const bossTypes = [
    { emoji: "🥷", nameKey: "boss_ninja_name", attackLogic: bossAttackLogic["🥷"] },
    { emoji: "🦹‍♂️", nameKey: "boss_villain_name", attackLogic: bossAttackLogic["🦹‍♂️"] },
    { emoji: "🦖", nameKey: "boss_dino_name", attackLogic: bossAttackLogic["🦖"] } // O último boss
];

// Objeto de traduções
const translations = {
    pt: {
        game_title_browser: "Emotion RPG", // Título da aba do navegador
        main_title: "Emotion RPG",
        btn_play: "▶️ Jogar",
        btn_shop: "🛒 Loja",
        btn_cards: "🎴 Cartas",
        btn_options: "⚙️ Opções",
        cubes_label: "🟨 Cubos:", // Mantido para HUD no menu e loja
        shop_title: "🛒 Loja",
        deck_title: "🎴 Cartas Disponíveis",
        player_health_label: "❤️ Vida:", // Mantido para HUD no jogo
        wave_label: "🌊 Onda:", // Mantido para HUD no jogo
        player_mana_label: "💠 Mana:", // Mantido para HUD no jogo
        options_title: "⚙️ Opções",
        music_volume_label: "Volume da Música:",
        sfx_volume_label: "Volume dos Efeitos Sonoros:",
        language_label: "Idioma:",
        lang_pt: "🇧🇷 Português",
        lang_en: "🇬🇧 English",
        lang_es: "🇪🇸 Español",
        card_bought: "Comprado",
        card_buy: "Comprar",
        card_info: "Info.",
        mana_insufficient: "Mana insuficiente!",
        deck_full: "Seu deck já está cheio!",
        deck_no_attack_cards_warning: "Seu deck não tem cartas de ataque. Escolha pelo menos uma!",
        deck_warning_3_attack: "Seu deck está sem cartas de defesa e de suporte. Volte ao menu de cartas.", // NOVO: Aviso de deck
        deck_warning_3_magic: "Seu deck está sem cartas de ataque! Volte ao menu de cartas.", // NOVO: Aviso de deck
        game_over_message: "☠️ Você perdeu!",
        deck_empty_hand: "Seu deck está vazio! Adicione cartas na tela 'Cartas'.",
        critical_hit: "CRÍTICO!", // Usado indiretamente no spawnParticles
        attack_normal_name: "Ataque Normal", // Não usado para exibição
        attack_semi_special_name: "Ataque Semi-Especial", // Não usado para exibição
        attack_special_name: "Ataque Especial", // Não usado para exibição
        enemy_miss_effect: "Inimigo está errando ataques!",
        player_buff_effect: "Seu dano e crítico aumentaram!",
        enemy_burn_effect: "Inimigo está queimando!",
        enemy_frozen_effect: "Inimigo congelado por 1 turno!",
        player_thorns_effect: "Armadura de espinhos ativada!",
        credits_label: "Criador do jogo:",
        creator_name: "Renato Santos",
        btn_back: "🔙 Voltar", // Texto genérico para botões de voltar
        boss_label: "BOSS", // Novo: Texto para o indicador de boss
        // Nomes e descrições das cartas
        card_faca_name: "🗡️ Faca",
        card_faca_desc: "Carta inicial. Causa 5 de dano direto ao inimigo.",
        card_dualespada_name: "⚔️ Espada Dupla",
        card_dualespada_desc: "Causa 10 de dano total ao inimigo (2 golpes de 5). Custo: 20🟨 cubos.",
        card_vida15_name: "❤️ Vida +35",
        card_vida15_desc: "Restaura 35 pontos de vida. Custo: 30🟨 cubos, 60💠 mana.",
        card_defesa_name: "🛡️ Defesa",
        card_defesa_desc: "Aumenta sua defesa em 1 ponto pelo resto da rodada. Custo: 25🟨 cubos.",
        card_regen_name: "♻️ Regeneração",
        card_regen_desc: "Regenera vida por 4 turnos. Cura inicial: 40 HP, diminuindo 10 HP a cada turno (40, 30, 20, 10). Custo: 50🟨 cubos, 65💠 mana.", // CORRIGIDO: Custo de mana na descrição
        card_regen_activated: "Regeneração ativada!",
        card_marteloaben_name: "🔨 Martelo Abençoado",
        card_marteloaben_desc: "Causa 10 de dano. Rouba 1 HP a cada acerto, 2 HP em acerto crítico.",
        card_facacozinha_name: "🔪 Faca de Cozinha",
        card_facacozinha_desc: "Causa 8 de dano (45% chance de crítico). Custo: 20🟨 cubos.",
        card_bolamag_name: "✨ Bola de Magia",
        card_bolamag_desc: "Causa 11 de dano (70% chance de crítico). Custo: 45🟨 cubos, 45💠 mana.",
        card_varinhamag_name: "🪄 Varinha de Mágico",
        card_varinhamag_desc: "Inimigo erra ataques por 3 turnos. Custo: 50🟨 cubos, 80💠 mana.",
        card_surtar_name: "😡 Surtar",
        card_surtar_desc: "Aumenta seu dano base em 5% e chance de crítico em 5% por 2 turnos. Custo: 60🟨 cubos, 95💠 mana.",
        card_bolafogo_name: "🔥 Bola de Fogo",
        card_bolafogo_desc: "Causa 13 de dano (65% chance de crítico) e 3 de dano de queimadura por 10 turnos. Custo: 65🟨 cubos, 75💠 mana.",
        card_arcong_name: "❄️ Ar Congelante",
        card_arcong_desc: "Congela o inimigo por 1 turno (impede ataque). Custo: 70🟨 cubos, 85💠 mana.",
        card_armaduraespin_name: "✴️ Armadura de Espinhos",
        card_armaduraespin_desc: "O inimigo recebe 3 de dano ao te atacar por 5 turnos. Custo: 80🟨 cubos, 90💠 mana.",
        // NOVAS CARTAS ESPECIAIS
        card_soco_serio_name: "🥊 Soco Ultramente Sério!",
        card_soco_serio_desc: "Causa 9999 de dano. Não crita e não pode ser melhorado. Usável uma vez por partida. Custo: 110💠 mana. Desbloqueia com certificado 🥇.",
        card_soco_serio_effect: "Um soco devastador que rachou a realidade!",
        card_soco_serio_used: "Essa carta só pode ser usada uma vez por partida!",
        card_suborno_name: "💰 Suborno",
        card_suborno_desc: "Gasta 1000 cubos para fazer inimigos humanos desistirem da batalha. Custo na loja: 755🟨 cubos.",
        card_suborno_success: "Suborno aceito! O inimigo fugiu!",
        card_suborno_fail_type: "Este inimigo não é humanoide!",
        card_suborno_fail_cubes: "Cubos insuficientes para o suborno!",
        // Nomes dos bosses e ataques especiais
        boss_ninja_attack: "O Ninja atacou com Agilidade!",
        boss_villain_attack: "O Vilão te drenou!",
        boss_dino_attack: "O Tiranossauro Rex esmagou sua Defesa!",
        // Textos da tela de vitória
        victory_title: "🏆 Vitória!",
        victory_title_final: "MEUS PARABÉNS VOCÊ CONSEGUIU!", // NOVO: Mensagem final de vitória
        total_damage_dealt_label: "Dano Total Causado:",
        cards_used_label: "Cartas Usadas:",
        btn_back_to_main_menu: "🔙 Voltar ao Menu Principal",
        no_cards_used: "Nenhuma", // Tradução para "Nenhuma"
        // Nomes dos inimigos normais (não serão exibidos na UI, mas mantidos para lógica)
        enemy_zombie_name: "Zumbi",
        enemy_bat_name: "Morcego",
        enemy_snake_name: "Cobra",
        // Boss names for display (não serão exibidos na UI, mas mantidos para lógica)
        boss_ninja_name: "Ninja Sombrio",
        boss_villain_name: "Mago Vilão",
        boss_dino_name: "Tiranossauro Rex",
        // Textos da história
        btn_story: "📖 História do Jogo", // Texto do botão de história
        story_title: "📖 História do Jogo", // Título da tela de história
        story_confirm_title: "⚠️ Deseja continuar?",
        story_confirm_yes: "Sim",
        story_confirm_no: "Não",
        story_back_button: "🔙 Voltar",

        story_line_0: "_Olá, jogador...",
        story_line_1: "*Você diz que não tem tempo para conversas sem sentido.",
        story_line_2: "_Muito bem... Então ouça com atenção.",
        story_line_3: "_Há muito tempo...",
        story_line_4: "_Os dinossauros dominavam a Terra.",
        story_line_5: "_O rei deles se chamava Rex — uma criatura implacável, movida por um propósito oculto.",
        story_line_6: "_Até que um dia...",
        story_line_7: "_Um portal inesperado se abriu, lançando Rex em plena era atual.",
        story_line_8: "_Desde então, ele começou a reunir criaturas estranhas... e silenciosamente recrutou mais de 29 pessoas.",
        story_line_9: "_Jogador...",
        story_line_10: "_Seu objetivo é claro:",
        story_line_11: "_Use suas cartas com sabedoria...",
        story_line_12: "_E impeça que esse exército misterioso conclua o que começou.",
        // NOVO: Mensagens pós-vitória
        post_victory_msg1: "_Você sente algo..., Um portal acabou de se abrir...",
        post_victory_msg2: "_E assim...",
        post_victory_msg3: "_Todo sua jornada até derrotar o Rex se reinicia......"
    },
    en: {
        game_title_browser: "Emotion RPG",
        main_title: "Emotion RPG",
        btn_play: "▶️ Play",
        btn_shop: "🛒 Shop",
        btn_cards: "🎴 Cards",
        btn_options: "⚙️ Options",
        cubes_label: "🟨 Cubes:",
        shop_title: "🛒 Shop",
        deck_title: "🎴 Available Cards",
        player_health_label: "❤️ Health:",
        wave_label: "🌊 Wave:",
        player_mana_label: "💠 Mana:",
        options_title: "⚙️ Options",
        music_volume_label: "Music Volume:",
        sfx_volume_label: "Sound Effects Volume:",
        language_label: "Language:",
        lang_pt: "🇧🇷 Portuguese",
        lang_en: "🇬🇧 English",
        lang_es: "🇪🇸 Spanish",
        card_bought: "Purchased",
        card_buy: "Buy",
        card_info: "Info.",
        mana_insufficient: "Insufficient Mana!",
        deck_full: "Your deck is full!",
        deck_no_attack_cards_warning: "Your deck has no attack cards. Choose at least one!",
        deck_warning_3_attack: "Your deck has no defense or support cards. Go back to the cards menu.", // NEW: Deck warning
        deck_warning_3_magic: "Your deck has no attack cards! Go back to the cards menu.", // NEW: Deck warning
        game_over_message: "☠️ Game Over!",
        deck_empty_hand: "Your deck is empty! Add cards in the 'Cards' screen.",
        critical_hit: "CRITICAL!",
        attack_normal_name: "Normal Attack",
        attack_semi_special_name: "Semi-Special Attack",
        attack_special_name: "Special Attack",
        enemy_miss_effect: "Enemy is missing attacks!",
        player_buff_effect: "Your damage and crit increased!",
        enemy_burn_effect: "Enemy is burning!",
        enemy_frozen_effect: "Enemy frozen for 1 turn!",
        player_thorns_effect: "Thorn armor activated!",
        credits_label: "Game Creator:",
        creator_name: "Renato Santos",
        btn_back: "🔙 Back",
        boss_label: "BOSS",
        // Card names and descriptions
        card_faca_name: "🗡️ Knife",
        card_faca_desc: "Starting card. Deals 5 direct damage to enemy.",
        card_dualespada_name: "⚔️ Dual Sword",
        card_dualespada_desc: "Deals 10 total damage to enemy (2 hits of 5). Cost: 20🟨 cubes.",
        card_vida15_name: "❤️ Health +35",
        card_vida15_desc: "Restores 35 health. Cost: 30🟨 cubes, 60💠 mana.",
        card_defesa_name: "🛡️ Defense",
        card_defesa_desc: "Increases your defense by 1 for the rest of the round. Cost: 25🟨 cubes.",
        card_regen_name: "♻️ Regeneration",
        card_regen_desc: "Regenerates health for 4 turns. Initial heal: 40 HP, decreasing by 10 HP each turn (40, 30, 20, 10). Cost: 50🟨 cubes, 65💠 mana.",
        card_regen_activated: "Regeneration activated!",
        card_marteloaben_name: "🔨 Blessed Hammer",
        card_marteloaben_desc: "Deals 10 damage. Steals 1 HP per hit, 2 HP on critical hit.",
        card_facacozinha_name: "🔪 Kitchen Knife",
        card_facacozinha_desc: "Deals 8 damage (45% crit chance). Cost: 20🟨 cubes.",
        card_bolamag_name: "✨ Magic Orb",
        card_bolamag_desc: "Deals 11 damage (70% crit chance). Cost: 45🟨 cubes, 45💠 mana.",
        card_varinhamag_name: "🪄 Wizard's Wand",
        card_varinhamag_desc: "Makes enemy miss attacks for 3 turns. Cost: 50🟨 cubes, 80💠 mana.",
        card_surtar_name: "😡 Go Berserk",
        card_surtar_desc: "Increases your base damage by 5% and crit chance by 5% for 2 turns. Cost: 60🟨 cubos, 95💠 mana.",
        card_bolafogo_name: "🔥 Fireball",
        card_bolafogo_desc: "Deals 13 damage (65% crit chance) and 3 burn damage for 10 turns. Cost: 65🟨 cubes, 75💠 mana.",
        card_arcong_name: "❄️ Freezing Air",
        card_arcong_desc: "Freezes enemy for 1 turn (precludes attack). Cost: 70🟨 cubes, 85💠 mana.",
        card_armaduraespin_name: "✴️ Thorn Armor",
        card_armaduraespin_desc: "Enemy takes 3 damage when attacking you for 5 turns. Cost: 80🟨 cubes, 90💠 mana.",
        // NEW SPECIAL CARDS
        card_soco_serio_name: "🥊 Ultra Serious Punch!",
        card_soco_serio_desc: "Deals 9999 damage. No crit, no buffs. Usable once per game. Cost: 110💠 mana. Unlocks with 🥇 certificate.",
        card_soco_serio_effect: "A devastating punch that cracked reality!",
        card_soco_serio_used: "This card can only be used once per game!",
        card_suborno_name: "💰 Bribe",
        card_suborno_desc: "Spend 1000 cubes to make human enemies give up the battle. Shop cost: 755🟨 cubes.",
        card_suborno_success: "Bribe accepted! The enemy fled!",
        card_suborno_fail_type: "This enemy is not humanoid!",
        card_suborno_fail_cubes: "Insufficient cubes for bribe!",
        // Boss names and special attacks
        boss_ninja_attack: "The Ninja attacked with Agility!",
        boss_villain_attack: "The Villain drained you!",
        boss_dino_attack: "The Tyrannosaurus Rex crushed your Defense!",
        // Victory screen texts
        victory_title: "🏆 Victory!",
        victory_title_final: "CONGRATULATIONS YOU MADE IT!", // NEW: Final victory message
        total_damage_dealt_label: "Total Damage Dealt:",
        cards_used_label: "Cards Used:",
        btn_back_to_main_menu: "🔙 Back to Main Menu",
        no_cards_used: "None",
        // Normal enemy names (not displayed in UI, but kept for logic)
        enemy_zombie_name: "Zombie",
        enemy_bat_name: "Bat",
        enemy_snake_name: "Snake",
        // Boss names for display (not displayed in UI, but kept for logic)
        boss_ninja_name: "Shadow Ninja",
        boss_villain_name: "Evil Mage",
        boss_dino_name: "Tyrannosaurus Rex",
        // Story texts
        btn_story: "📖 Game Story",
        story_title: "📖 Game Story",
        story_confirm_title: "⚠️ Do you want to continue?",
        story_confirm_yes: "Yes",
        story_confirm_no: "No",
        story_back_button: "🔙 Back",

        story_line_0: "_Hello, player...",
        story_line_1: "*You say you don't have time for meaningless conversations.",
        story_line_2: "_Very well... Then listen carefully.",
        story_line_3: "_A long time ago...",
        story_line_4: "_Dinosaurs ruled the Earth.",
        story_line_5: "_Their king was named Rex — a relentless creature, driven by a hidden purpose.",
        story_line_6: "_Until one day...",
        story_line_7: "_An unexpected portal opened, throwing Rex into the current era.",
        story_line_8: "_Since then, he began gathering strange creatures... and silently recruited over 29 people.",
        story_line_9: "_Player...",
        story_line_10: "_Your objective is clear:",
        story_line_11: "_Use your cards wisely...",
        story_line_12: "_And prevent this mysterious army from completing what they started.",
        // NEW: Post-victory messages
        post_victory_msg1: "_You feel something..., A portal has just opened...",
        post_victory_msg2: "_And so...",
        post_victory_msg3: "_Your whole journey to defeat Rex restarts......"
    },
    es: {
        game_title_browser: "Emotion RPG",
        main_title: "Emotion RPG",
        btn_play: "▶️ Jugar",
        btn_shop: "🛒 Tienda",
        btn_cards: "🎴 Cartas",
        btn_options: "⚙️ Opciones",
        cubes_label: "🟨 Cubos:",
        shop_title: "🛒 Tienda",
        deck_title: "🎴 Cartas Disponibles",
        player_health_label: "❤️ Vida:",
        wave_label: "🌊 Ola:",
        player_mana_label: "💠 Maná:",
        options_title: "⚙️ Opciones",
        music_volume_label: "Volumen de la Música:",
        sfx_volume_label: "Volumen de Efectos Sonoros:",
        language_label: "Idioma:",
        lang_pt: "🇧🇷 Portugués",
        lang_en: "🇬🇧 Inglés",
        lang_es: "🇪🇸 Español",
        card_bought: "Comprado",
        card_buy: "Comprar",
        card_info: "Info.",
        mana_insufficient: "¡Maná insuficiente!",
        deck_full: "¡Tu mazo está lleno!",
        deck_no_attack_cards_warning: "¡Tu mazo no tiene cartas de ataque. Elige al menos una!",
        deck_warning_3_attack: "Tu mazo no tiene cartas de defensa o soporte. Vuelve al menú de cartas.", // NUEVO: Aviso de mazo
        deck_warning_3_magic: "¡Tu mazo no tiene cartas de ataque! Vuelve al menú de cartas.", // NUEVO: Aviso de mazo
        game_over_message: "☠️ ¡Has Perdido!",
        deck_empty_hand: "¡Tu mazo está vacío! Añade cartas en la pantalla 'Cartas'.",
        critical_hit: "¡CRÍTICO!",
        attack_normal_name: "Ataque Normal",
        attack_semi_special_name: "Ataque Semi-Especial",
        attack_special_name: "Ataque Especial",
        enemy_miss_effect: "¡El enemigo está fallando ataques!",
        player_buff_effect: "¡Tu daño y crítico aumentaron!",
        enemy_burn_effect: "¡El enemigo está quemándose!",
        enemy_frozen_effect: "¡Enemigo congelado por 1 turno!",
        player_thorns_effect: "¡Armadura de espinas activada!",
        credits_label: "Creador del juego:",
        creator_name: "Renato Santos",
        btn_back: "🔙 Volver",
        boss_label: "BOSS",
        // Card names and descriptions
        card_faca_name: "🗡️ Cuchillo",
        card_faca_desc: "Carta inicial. Inflige 5 de daño directo al enemigo.",
        card_dualespada_name: "⚔️ Espada Doble",
        card_dualespada_desc: "Inflige 10 de daño total al enemigo (2 golpes de 5). Costo: 20🟨 cubos.",
        card_vida15_name: "❤️ Vida +35",
        card_vida15_desc: "Restaura 35 puntos de vida. Costo: 30🟨 cubos, 60💠 maná.",
        card_defesa_name: "🛡️ Defensa",
        card_defesa_desc: "Aumenta tu defensa en 1 punto por el resto de la ronda. Costo: 25🟨 cubos.",
        card_regen_name: "♻️ Regeneración",
        card_regen_desc: "Regenera vida durante 4 turnos. Curación inicial: 40 HP, disminuyendo 10 HP cada turno (40, 30, 20, 10). Costo: 50🟨 cubos, 65💠 maná.",
        card_regen_activated: "¡Regeneración activada!",
        card_marteloaben_name: "🔨 Martillo Bendito",
        card_marteloaben_desc: "Inflige 10 de daño. Roba 1 HP por golpe, 2 HP en golpe crítico.",
        card_facacozinha_name: "🔪 Cuchillo de Cocina",
        card_facacozinha_desc: "Inflige 8 de daño (45% de probabilidad crítica). Costo: 20🟨 cubos.",
        card_bolamag_name: "✨ Orbe Mágico",
        card_bolamag_desc: "Inflige 11 de daño (70% de probabilidad crítica). Costo: 45🟨 cubos, 45💠 maná.",
        card_varinhamag_name: "🪄 Varita Mágica",
        card_varinhamag_desc: "Hace que el enemigo falle ataques durante 3 turnos. Costo: 50🟨 cubos, 80💠 maná.",
        card_surtar_name: "😡 Enfurecer",
        card_surtar_desc: "Aumenta tu daño base en 5% y la probabilidad crítica en 5% durante 2 turnos. Costo: 60🟨 cubos, 95💠 maná.",
        card_bolafogo_name: "🔥 Bola de Fuego",
        card_bolafogo_desc: "Inflige 13 de daño (65% de probabilidad crítica) y 3 de daño por quemadura durante 10 turnos. Costo: 65🟨 cubos, 75💠 maná.",
        card_arcong_name: "❄️ Aire Congelante",
        card_arcong_desc: "Congela al enemigo por 1 turno (previene el ataque). Costo: 70🟨 cubos, 85💠 maná.",
        card_armaduraespin_name: "✴️ Armadura de Espinas",
        card_armaduraespin_desc: "El enemigo recibe 3 de daño al atacarte durante 5 turnos. Costo: 80🟨 cubos, 90💠 maná.",
        // NEW SPECIAL CARDS
        card_soco_serio_name: "🥊 Puño Ultra Serio!",
        card_soco_serio_desc: "Inflige 9999 de daño. No es crítico y no se puede mejorar. Se usa una vez por partida. Costo: 110💠 maná. Se desbloquea con certificado 🥇.",
        card_soco_serio_effect: "¡Un puñetazo devastador que rajó la realidad!",
        card_soco_serio_used: "¡Esta carta solo se puede usar una vez por partida!",
        card_suborno_name: "💰 Soborno",
        card_suborno_desc: "Gasta 1000 cubos para hacer que los enemigos humanos abandonen la batalla. Costo en la tienda: 755🟨 cubos.",
        card_suborno_success: "¡Soborno aceptado! ¡El enemigo huyó!",
        card_suborno_fail_type: "¡Este enemigo no es humanoide!",
        card_suborno_fail_cubes: "¡Cubos insuficientes para el soborno!",
        // Boss names and special attacks
        boss_ninja_attack: "¡El Ninja atacó con Agilidad!",
        boss_villain_attack: "¡El Villano te drenó!",
        boss_dino_attack: "¡El Tiranosaurio Rex aplastó tu Defensa!",
        // Victory screen texts
        victory_title: "🏆 ¡Victoria!",
        victory_title_final: "¡FELICIDADES LO HAS LOGRADO!", // NUEVO: Mensaje final de victoria
        total_damage_dealt_label: "Daño Total Infligido:",
        cards_used_label: "Cartas Usadas:",
        btn_back_to_main_menu: "🔙 Volver al Menú Principal",
        no_cards_used: "Ninguna",
        // Normal enemy names (not displayed in UI, but kept for logic)
        enemy_zombie_name: "Zombi",
        enemy_bat_name: "Murciélago",
        enemy_snake_name: "Serpiente",
        // Boss names for display (not displayed in UI, but kept for logic)
        boss_ninja_name: "Ninja Oscuro",
        boss_villain_name: "Mago Malvado",
        boss_dino_name: "Tiranosaurio Rex",
        // Story texts
        btn_story: "📖 Historia del Juego",
        story_title: "📖 Historia del Juego",
        story_confirm_title: "⚠️ ¿Deseas continuar?",
        story_confirm_yes: "Sí",
        story_confirm_no: "No",
        story_back_button: "🔙 Volver",

        story_line_0: "_Hola, jugador...",
        story_line_1: "*Dices que no tienes tiempo para conversaciones sin sentido.",
        story_line_2: "_Muy bien... Entonces escucha atentamente.",
        story_line_3: "_Hace mucho tiempo...",
        story_line_4: "_Los dinosaurios dominaban la Tierra.",
        story_line_5: "_Su rey se llamaba Rex — una criatura implacable, impulsada por un propósito oculto.",
        story_line_6: "_Hasta que un día...",
        story_line_7: "_Un portal inesperado se abrió, lanzando a Rex a la era actual.",
        story_line_8: "_Desde entonces, comenzó a reunir criaturas extrañas... y reclutó silenciosamente a más de 29 personas.",
        story_line_9: "_Jugador...",
        story_line_10: "_Tu objetivo es claro:",
        story_line_11: "_Usa tus cartas con sabiduría...",
        story_line_12: "_E impide que este misterioso ejército complete lo que empezó.",
        // NEW: Post-victory messages
        post_victory_msg1: "_Sientes algo..., Un portal acaba de abrirse...",
        post_victory_msg2: "_Y así...",
        post_victory_msg3: "_Toda tu jornada para derrotar a Rex se reinicia......"
    }
};

let currentLanguage = 'pt'; // Idioma padrão, será carregado do localStorage


// **** FUNÇÃO updateTexts DEFINIDA AQUI NO TOPO ****
/**
 * Atualiza todos os textos visíveis na UI para o idioma atualmente selecionado.
 * Esta função deve ser chamada após a mudança de idioma ou ao carregar a página.
 */
function updateTexts() {
    // Atualiza o título da aba do navegador
    document.querySelector('title').textContent = getText('game_title_browser');

    // Seleciona todos os elementos com o atributo 'data-key'
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        } else {
            // Fallback: se a tradução não for encontrada, exibe a chave ou o texto original se for um input
            console.warn(`Chave de tradução '${key}' não encontrada para o idioma '${currentLanguage}'`);
        }
    });

    // Atualiza textos específicos que podem não ter data-key diretamente ou precisam de formatação
    if (deckCardCountDisplay) {
        deckCardCountDisplay.textContent = `Cartas no Deck: ${deck.length}/${MAX_DECK_SIZE}`;
    }

    // Re-renderiza a loja e o deck para aplicar os textos traduzidos
    if (currentScreen === screens.shop) {
        renderShop();
    }
    if (currentScreen === screens.deck) {
        renderDeck();
    }
    // Garante que o aviso de deck também seja atualizado se estiver visível
    if (!deckWarningMessage.classList.contains('hidden-element')) {
        checkDeckForWarnings();
    }
}
// **** FIM DA DEFINIÇÃO DE updateTexts ****


/**
 * Helper para obter texto traduzido.
 * @param {string} key - Chave do texto no objeto translations.
 * @returns {string} O texto traduzido.
 */
function getText(key) {
    return translations[currentLanguage][key] || key; // Retorna a chave se a tradução não for encontrada
}

/**
 * Carrega os cubos do localStorage.
 * @returns {number} O número de cubos armazenados ou 0 se não houver.
 */
function loadCubes() {
    try {
        const storedCubes = localStorage.getItem('emotionRpgCubes');
        const parsedCubes = parseInt(storedCubes, 10);
        return isNaN(parsedCubes) ? 0 : parsedCubes;
    } catch (e) {
        console.error("Erro ao carregar cubos do localStorage:", e);
        return 0;
    }
}

/**
 * Salva os cubos no localStorage.
 */
function saveCubes() {
    try {
        localStorage.setItem('emotionRpgCubes', playerCubes.toString());
    } catch (e) {
        console.error("Erro ao salvar cubos no localStorage:", e);
    }
}

/**
 * Carrega o status de 'unlocked' das cartas do localStorage.
 * Atualiza o array global 'cards'.
 */
function loadUnlockedCards() {
    try {
        const storedUnlockedCards = localStorage.getItem('emotionRpgUnlockedCards');
        if (storedUnlockedCards) {
            const unlockedCardIds = new Set(JSON.parse(storedUnlockedCards));
            cards.forEach(card => {
                card.unlocked = unlockedCardIds.has(card.id);
            });
        } else {
            // Se não há dados salvos, apenas 'Faca' é desbloqueada por padrão.
            cards.forEach(card => {
                card.unlocked = (card.id === 1);
            });
            saveUnlockedCards(); // Salva este estado inicial
        }
        // A carta Soco Ultramente Sério (id: 14) tem seu desbloqueio gerenciado por `loadCertificates`
    } catch (e) {
        console.error("Erro ao carregar cartas desbloqueadas do localStorage:", e);
        // Fallback: em caso de erro, apenas 'Faca' é desbloqueada.
        cards.forEach(card => {
            card.unlocked = (card.id === 1);
        });
    }
}

/**
 * Salva o status de 'unlocked' das cartas no localStorage.
 */
function saveUnlockedCards() {
    try {
        // Salva IDs de todas as cartas desbloqueadas, exceto o Soco Ultramente Sério (id: 14),
        // pois seu status é gerenciado via certificados.
        const unlockedCardIds = cards.filter(card => card.unlocked && card.id !== 14).map(card => card.id);
        localStorage.setItem('emotionRpgUnlockedCards', JSON.stringify(unlockedCardIds));
    } catch (e) {
        console.error("Erro ao salvar cartas desbloqueadas no localStorage:", e);
    }
}

/**
 * Carrega as IDs das cartas selecionadas para o deck do localStorage e reconstrói o array 'deck'.
 */
function loadSelectedDeck() {
    try {
        const storedSelectedDeckIds = localStorage.getItem('emotionRpgSelectedDeck');
        if (storedSelectedDeckIds) {
            const selectedIds = JSON.parse(storedSelectedDeckIds);
            deck = selectedIds
                .map(id => cards.find(card => card.id === id && card.unlocked))
                .filter(Boolean)
                .slice(0, MAX_DECK_SIZE); // Garante que o deck não exceda o tamanho máximo
            console.log("Deck selecionado carregado:", deck.map(c => getText(c.nameKey)));
        } else {
            // Se não há deck salvo, cria um inicial com as cartas desbloqueadas
            // Filtra por cartas já desbloqueadas e pega as primeiras MAX_DECK_SIZE
            deck = cards.filter(c => c.unlocked).slice(0, MAX_DECK_SIZE);
            saveSelectedDeck(); // Salva este deck inicial
        }
    } catch (e) {
        console.error("Erro ao carregar deck selecionado do localStorage:", e);
        deck = cards.filter(c => c.unlocked).slice(0, MAX_DECK_SIZE); // Fallback
    }
}

/**
 * Salva as IDs das cartas atualmente no array 'deck' no localStorage.
 */
function saveSelectedDeck() {
    try {
        localStorage.setItem('emotionRpgSelectedDeck', JSON.stringify(deck.map(card => card.id)));
    }
    catch (e) {
        console.error("Erro ao salvar deck selecionado no localStorage:", e);
    }
}

/**
 * Carrega as configurações de volume e idioma do localStorage.
 */
function loadSettings() {
    try {
        const storedMusicVolume = localStorage.getItem('emotionRpgMusicVolume');
        const storedSfxVolume = localStorage.getItem('emotionRpgSfxVolume');
        const storedLanguage = localStorage.getItem('emotionRpgLanguage');

        musicVolume = storedMusicVolume !== null ? parseFloat(storedMusicVolume) : 0.5;
        sfxVolume = storedSfxVolume !== null ? parseFloat(storedSfxVolume) : 0.8;
        currentLanguage = storedLanguage || 'pt';
        
        console.log("Configurações carregadas: Música:", musicVolume, "SFX:", sfxVolume, "Idioma:", currentLanguage);
    } catch (e) {
        console.error("Erro ao carregar configurações do localStorage:", e);
        musicVolume = 0.5;
        sfxVolume = 0.8;
        currentLanguage = 'pt';
    }
    applyVolumeSettings(); // Aplica as configurações carregadas/padrão
}

/**
 * Salva as configurações de volume e idioma no localStorage.
 */
function saveSettings() {
    try {
        localStorage.setItem('emotionRpgMusicVolume', musicVolume.toString());
        localStorage.setItem('emotionRpgSfxVolume', sfxVolume.toString());
        localStorage.setItem('emotionRpgLanguage', currentLanguage);
        console.log("Configurações salvas.");
    } catch (e) {
        console.error("Erro ao salvar configurações no localStorage:", e);
    }
}

/**
 * Carrega os certificados do localStorage.
 */
function loadCertificates() {
    try {
        const storedCertificates = localStorage.getItem('emotionRpgCertificates');
        if (storedCertificates) {
            certificates = JSON.parse(storedCertificates);
        } else {
            certificates = [];
        }
        // Verifica se a carta Soco Ultramente Sério (id 14) deve ser desbloqueada com base nos certificados
        const socoSerioCard = cards.find(c => c.id === 14);
        if (socoSerioCard) {
            socoSerioCard.unlocked = certificates.includes("golden"); // Desbloqueia se tiver certificado dourado
        }

    } catch (e) {
        console.error("Erro ao carregar certificados do localStorage:", e);
        certificates = [];
    }
    renderCertificates(); // Atualiza a exibição dos certificados
}

/**
 * Salva os certificados no localStorage.
 */
function saveCertificates() {
    try {
        localStorage.setItem('emotionRpgCertificates', JSON.stringify(certificates));
    } catch (e) {
        console.error("Erro ao salvar certificados no localStorage:", e);
    }
}

/**
 * Aplica as configurações de volume atuais aos elementos de áudio.
 */
function applyVolumeSettings() {
    if (backgroundMusic) {
        backgroundMusic.volume = musicVolume;
    }
    if (bossMusic) {
        bossMusic.volume = musicVolume;
    }
    sfx.victoryTheme.volume = musicVolume; // Música de vitória também tem volume de música
    sfx.ultraSeriousPunch.volume = sfxVolume; // Define volume para o novo SFX
    // Aplica volume para todos os outros SFX
    for (const key in sfx) {
        if (sfx.hasOwnProperty(key) && sfx[key] instanceof Audio && key !== 'victoryTheme' && key !== 'ultraSeriousPunch') {
            sfx[key].volume = sfxVolume;
        }
    }
}

/**
 * Função principal para salvar todo o progresso do jogo.
 */
function saveGameProgress() {
    saveCubes();
    saveUnlockedCards();
    saveSelectedDeck();
    saveSettings();
    saveCertificates();
}

/**
 * Função principal para carregar todo o progresso do jogo.
 */
function loadGameProgress() {
    loadSettings(); // Carrega volume e idioma primeiro
    playerCubes = loadCubes();
    loadUnlockedCards(); // Deve ser chamado antes de loadSelectedDeck e loadCertificates
    loadCertificates(); // Deve ser chamado depois de loadUnlockedCards para garantir status da carta especial
    loadSelectedDeck();
}
// --- Fim das Funções de Persistência ---


// Event listener para controle de música em segundo plano
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
            wasMusicPlayingBeforeHide = true;
        }
        if (bossMusic && !bossMusic.paused) {
            bossMusic.pause();
            wasMusicPlayingBeforeHide = true;
        }
        if (sfx.victoryTheme && !sfx.victoryTheme.paused) { // Pausa música de vitória também
            sfx.victoryTheme.pause();
            wasMusicPlayingBeforeHide = true;
        }
    } else {
        // Retoma a música apenas se estava tocando antes e a tela atual é a do jogo ou vitória
        if (currentScreen === screens.game && wasMusicPlayingBeforeHide) {
            if (currentEnemy.isBoss && bossMusic && bossMusic.paused) {
                bossMusic.play().catch(e => console.log("Autoplay bloqueado (boss):", e));
            } else if (!currentEnemy.isBoss && backgroundMusic && backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log("Autoplay bloqueado (fundo):", e));
            }
            wasMusicPlayingBeforeHide = false;
        } else if (currentScreen === screens.victory && wasMusicPlayingBeforeHide) {
            if (sfx.victoryTheme && sfx.victoryTheme.paused) {
                sfx.victoryTheme.play().catch(e => console.log("Autoplay bloqueado (vitória):", e));
            }
            wasMusicPlayingBeforeHide = false;
        }
    }
});


/**
 * Função para exibir apenas uma tela por vez.
 * Garante que todas as outras telas sejam ocultadas.
 * @param {HTMLElement} targetScreen - A referência para o elemento da tela que deve ser exibida.
 */
function showScreen(targetScreen) {
    console.log(`Tentando mostrar tela: ${targetScreen.id}`);
    // Percorre todas as telas e remove a classe 'active'
    Array.from(document.querySelectorAll('.screen')).forEach(s => {
        if (s.id !== targetScreen.id) { // Evita remover e adicionar na mesma tela se já for a ativa
            s.classList.remove('active');
            s.style.display = 'none'; // Garante que a tela está oculta via JS
            s.style.zIndex = '10'; // Reseta o z-index
        }
    });

    // Adiciona a classe 'active' e define display:flex e z-index para a tela alvo
    targetScreen.classList.add('active');
    targetScreen.style.display = 'flex'; // Força a exibição como flexbox
    targetScreen.style.zIndex = '20'; // Garante que a tela ativa esteja na frente

    currentScreen = targetScreen; // Atualiza a variável global da tela atual
    console.log(`Tela ativa: ${currentScreen.id}`);
}


/**
 * Reseta apenas as estatísticas e o estado da sessão de jogo atual.
 * Não afeta cubos, cartas desbloqueadas ou configurações persistentes.
 */
function resetGameStatsOnly() {
    playerHealth = MAX_HEALTH;
    playerMana = MAX_MANA;
    wave = 0; // Garante que a onda comece em 0 para a próxima onda ser 1
    defense = 0;
    playerRegenStatus = { active: false, turnsRemaining: 0, currentRegenAmount: 0, initialRegenAmount: 40, regenTickDecrease: 10 };
    playerStatus = { attackBuffTurns: 0, attackBuffAmount: 0, critBuffTurns: 0, critBuffAmount: 0, thornTurns: 0, thornDamage: 0, socoUltramenteSerioUsed: false }; // Resetar flag da carta
    enemyStatus = { missTurns: 0, frozenTurns: 0, burnTurns: 0, burnDamage: 0 };
    totalDamageDealt = 0;
    totalPlayerAttacks = 0;
    totalPlayerCriticalAttacks = 0;
    damageTakenLastBossFight = 0;
    cardsUsedThisRun = [];
    currentEnemy = { emoji: "", nameKey: "", health: 0, isBoss: false, bossType: null };
    console.log("Estatísticas da sessão de jogo resetadas.");
}


// ↩️ Voltar para menu principal //
function backToMenu() {
    console.log("Voltando para o menu principal.");
    sfx.blipSelectbutton1.play();

    // Pausa e reinicia todas as músicas relevantes
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    if (bossMusic && !bossMusic.paused) {
        bossMusic.pause();
        bossMusic.currentTime = 0;
    }
    if (sfx.victoryTheme && !sfx.victoryTheme.paused) { // Pausa música de vitória também
        sfx.victoryTheme.pause();
        sfx.victoryTheme.currentTime = 0;
    }

    // Reseta as estatísticas da partida apenas se vindo da tela de jogo, vitória ou história
    if (currentScreen === screens.game || currentScreen === screens.victory || currentScreen === screens.story || currentScreen === screens.postVictoryOverlay) { // Inclui o overlay pós-vitória
        resetGameStatsOnly();
    }

    showScreen(screens.main);
    updateUI(); // Atualiza HUD do menu principal
    updateTexts(); // Atualiza textos do menu principal (idioma)
    renderCertificates(); // Atualiza a exibição dos certificados no menu principal
}

// ↩️ Voltar do menu de opções para o menu principal //
function backToMenuFromOptions() {
    console.log("Voltando do menu de opções.");
    sfx.blipSelectbutton1.play();
    saveSettings();
    showScreen(screens.main);
    updateTexts();
}

// ▶️ Iniciar partida //
function goToGame() {
    console.log("Tentando iniciar jogo...");
    sfx.click2.play();

    const attackCardsInDeck = deck.filter(card => card.type === 'attack' || (card.type === 'special' && card.id === 14));
    const magicCardsInDeck = deck.filter(card => card.type === 'magic');
    const supportCardsInDeck = deck.filter(card => card.type === 'support');

    // VERIFICAÇÃO PARA O CASO INICIAL COM APENAS A FACA (ID 1)
    const isInitialDeckWithFaca = deck.length === 1 && deck[0].id === 1;

    // NOVO: Validações para decks incompatíveis (excluindo o caso inicial da Faca)
    if (!isInitialDeckWithFaca) {
        if (deck.length === MAX_DECK_SIZE) { // Só aplica avisos se o deck estiver cheio
            if (attackCardsInDeck.length === MAX_DECK_SIZE) { // Todas as 3 são de ataque
                displayMessage(getText("deck_warning_3_attack"));
                return; // Bloqueia o início do jogo
            }
            if (magicCardsInDeck.length === MAX_DECK_SIZE) { // Todas as 3 são de magia
                displayMessage(getText("deck_warning_3_magic"));
                return; // Bloqueia o início do jogo
            }
        }
    }
    
    // Verificação de ter pelo menos uma carta de ataque (ainda é importante)
    if (deck.length === 0) {
        displayMessage(getText("deck_empty_hand"));
        return;
    }
    if (attackCardsInDeck.length === 0 && !isInitialDeckWithFaca) { // CORRIGIDO: Nao bloqueia se for so a faca
        displayMessage(getText("deck_no_attack_cards_warning"));
        return;
    }

    resetGameStatsOnly(); // Garante que todas as variáveis de jogo sejam resetadas
    showScreen(screens.game); // Troca para a tela do jogo ANTES de iniciar a onda
    nextWave(); // Inicia a primeira onda (agora wave será 1)
    updateUI(); // Atualiza a UI do jogo
    drawCards();
    enableCardButtons();
}

// 🛒 Abrir loja //
function openShop() {
    console.log("Abrindo loja...");
    sfx.click2.play();
    renderShop();
    showScreen(screens.shop);
    updateUI(); // Garante que os cubos estejam atualizados
    updateTexts(); // Atualiza os textos da loja
}

// 🎴 Abrir deck //
function openDeck() {
    console.log("Abrindo deck...");
    sfx.click2.play();
    renderDeck();
    showScreen(screens.deck);
    updateTexts(); // Atualiza os textos do deck
    deckWarningMessage.classList.add('hidden-element'); // Esconde qualquer aviso antigo
}

// ⚙️ Abrir menu de opções //
function openOptions() {
    console.log("Abrindo opções...");
    sfx.click2.play();
    showScreen(screens.options);
    // Garante que os sliders reflitam o volume atual
    document.getElementById('music-volume-slider').value = musicVolume;
    document.getElementById('sfx-volume-slider').value = sfxVolume;
    updateTexts(); // Re-renderiza textos para o idioma atual
}

// Atualiza o volume com base nos sliders
function updateVolume() {
    musicVolume = parseFloat(document.getElementById('music-volume-slider').value);
    sfxVolume = parseFloat(document.getElementById('sfx-volume-slider').value);
    applyVolumeSettings(); // Aplica o novo volume
    saveSettings(); // Salva as configurações imediatamente ao mover o slider
}

// Define o idioma do jogo
function setLanguage(langCode) {
    currentLanguage = langCode;
    sfx.click2.play(); // SFX para seleção de idioma
    saveSettings(); // Salva o idioma selecionado
    updateTexts(); // Atualiza a UI para o novo idioma
    // Força a atualização dos sliders para garantir que o oninput re-renderize os valores (não necessário mas boa prática)
    // document.getElementById('music-volume-slider').value = musicVolume;
    // document.getElementById('sfx-volume-slider').value = sfxVolume;
    console.log("Idioma alterado para:", langCode);
}

// ** NOVA LÓGICA DE HISTÓRIA **
const storyLines = [
    "story_line_0",
    "story_line_1",
    "story_line_2",
    "story_line_3",
    "story_line_4",
    "story_line_5",
    "story_line_6",
    "story_line_7",
    "story_line_8",
    "story_line_9",
    "story_line_10",
    "story_line_11",
    "story_line_12"
];
let currentStoryLineIndex = 0;
let storyTimeoutId; // Para poder limpar o timeout da história

function openStory() {
    sfx.click2.play();
    showCustomConfirm(getText("story_confirm_title"),
        () => { // Sim
            sfx.click2.play(); // SFX ao confirmar "Sim"
            showScreen(screens.story);
            storyContentBox.innerHTML = ''; // Limpa o conteúdo anterior
            currentStoryLineIndex = 0; // Reinicia o índice da história
            storyBackBtn.style.display = 'block'; // Garante que o botão de voltar esteja visível.
            clearTimeout(storyTimeoutId); // Limpa qualquer timeout anterior
            setTimeout(displayStoryText, 500); // Espera 0.5 segundos antes da primeira caixa de texto
        },
        () => { // Não
            // Fica no menu principal, nada a fazer aqui
            sfx.blipSelectbutton1.play(); // SFX ao confirmar "Não"
        }
    );
}

function displayStoryText() {
    if (currentStoryLineIndex < storyLines.length) {
        const lineKey = storyLines[currentStoryLineIndex];
        const lineText = getText(lineKey);

        const p = document.createElement('p');
        p.className = 'story-text-line';
        p.textContent = lineText;
        storyContentBox.appendChild(p);

        // Rola para a parte inferior da caixa de texto conforme o conteúdo aparece
        storyContentBox.scrollTop = storyContentBox.scrollHeight;

        // Força o reflow para a transição funcionar (trigger reflow to apply initial opacity 0)
        void p.offsetWidth; // Use void to indicate intentional side effect
        p.classList.add('visible');

        currentStoryLineIndex++;

        // Define o próximo timeout
        let delay = 3000; // Padrão: 3 segundos por linha
        if (lineKey === "story_line_1" || lineKey === "story_line_5" || lineKey === "story_line_8" || lineKey === "story_line_12") {
            delay = 5000; // Linhas mais longas ou de transição
        } else if (lineKey === "story_line_0" || lineKey === "story_line_9" || lineKey === "story_line_10") {
            delay = 2000; // Linhas curtas
        }
        
        storyTimeoutId = setTimeout(displayStoryText, delay);
    } else {
        // Fim da história
        setTimeout(() => { // Redireciona para o menu principal após um pequeno atraso
            backToMenu();
        }, 3000);
    }
}

// ** Diálogo de Confirmação Customizado **
function showCustomConfirm(message, onConfirm, onCancel) {
    customConfirmMessage.textContent = message;
    customConfirmDialog.classList.remove('hidden-element');

    const handleConfirm = () => {
        customConfirmDialog.classList.add('hidden-element');
        customConfirmYesBtn.removeEventListener('click', handleConfirm);
        customConfirmNoBtn.removeEventListener('click', handleCancel);
        onConfirm();
    };

    const handleCancel = () => {
        customConfirmDialog.classList.add('hidden-element');
        customConfirmYesBtn.removeEventListener('click', handleConfirm);
        customConfirmNoBtn.removeEventListener('click', handleCancel);
        onCancel();
    };

    // Remove listeners anteriores para evitar múltiplos disparos
    customConfirmYesBtn.removeEventListener('click', handleConfirm);
    customConfirmNoBtn.removeEventListener('click', handleCancel);

    customConfirmYesBtn.addEventListener('click', handleConfirm);
    customConfirmNoBtn.addEventListener('click', handleCancel);
}

// 🧩 Renderizar loja //
function renderShop() {
    shopItemsContainer.innerHTML = ""; // Limpa o conteúdo anterior
    shopCubesText.textContent = playerCubes; // Atualiza cubos na loja
    
    const sortedCards = [...cards].sort((a, b) => a.id - b.id); // Ordena por ID

    sortedCards.forEach(card => {
        // Soco Ultramente Sério (id 14) não é vendido na loja
        if (card.id === 14) return;

        const item = document.createElement("div");
        item.className = `card type-${card.type}`;
        
        const cardNameCost = document.createElement("span");
        cardNameCost.className = "card-name"; // Adiciona classe para estilização
        let cardCostText = `${getText(card.nameKey)}`;
        if (card.cost > 0) { // Só mostra custo em cubos se for maior que 0
            cardCostText += ` - ${card.cost}🟨`;
        }
        if (card.manaCost > 0) {
            cardCostText += ` | ${card.manaCost}💠`;
        }
        cardNameCost.textContent = cardCostText;
        item.appendChild(cardNameCost);

        const btnBuy = document.createElement("button");
        btnBuy.textContent = card.unlocked ? getText("card_bought") : getText("card_buy");
        btnBuy.disabled = card.unlocked || (card.cost > 0 && playerCubes < card.cost);
        
        btnBuy.onclick = () => {
            sfx.click.play();
            if (!card.unlocked && (card.cost === 0 || playerCubes >= card.cost)) { // Verifica custo se houver
                if (card.cost > 0) { // Só subtrai se a carta tiver um custo em cubos
                    playerCubes -= card.cost;
                }
                card.unlocked = true; // Marca a carta como desbloqueada
                saveGameProgress(); // Salva o progresso após a compra
                
                updateUI();
                renderShop(); // Re-renderiza a loja para atualizar o estado dos botões
                console.log(`Carta '${getText(card.nameKey)}' comprada! Cubos restantes: ${playerCubes}`);
            }
        };
        item.appendChild(btnBuy);

        const btnInfo = document.createElement("button");
        btnInfo.textContent = getText("card_info");
        btnInfo.classList.add('btn-info'); // Adiciona uma classe para estilização específica se quiser
        btnInfo.onclick = () => {
            sfx.click.play();
            displayMessage(getText(card.descriptionKey));
            console.log(`Info da carta '${getText(card.nameKey)}': ${getText(card.descriptionKey)}`);
        };
        item.appendChild(btnInfo);

        shopItemsContainer.appendChild(item);
    });
}

// 🔄 Renderizar seleção de deck //
function renderDeck() {
    deckCardsContainer.innerHTML = ""; // Limpa o conteúdo anterior
    deckCardCountDisplay.textContent = `Cartas no Deck: ${deck.length}/${MAX_DECK_SIZE}`;
    deckWarningMessage.classList.add('hidden-element'); // Esconde avisos ao re-renderizar o deck

    cards.forEach(card => {
        if (card.unlocked) { // Apenas cartas desbloqueadas podem ser adicionadas ao deck
            const el = document.createElement("div");
            el.className = `card type-${card.type}`;
            
            const cardNameSpan = document.createElement("span");
            cardNameSpan.className = "card-name";
            cardNameSpan.textContent = getText(card.nameKey); // Usa o nome traduzido
            el.appendChild(cardNameSpan);

            if (card.manaCost > 0) {
                const manaCostSpan = document.createElement("span");
                manaCostSpan.className = "mana-cost-display";
                manaCostSpan.textContent = `-${card.manaCost} 💠`;
                el.appendChild(manaCostSpan);
            }
            
            if (deck.some(c => c.id === card.id)) {
                el.classList.add("selected-card");
            }
            
            el.onclick = () => {
                sfx.click.play();
                const isSelected = deck.some(c => c.id === card.id);

                if (isSelected) {
                    deck = deck.filter(c => c.id !== card.id);
                    el.classList.remove("selected-card");
                } else if (deck.length < MAX_DECK_SIZE) {
                    // Impede adicionar a carta Soco Ultramente Sério se já estiver no deck
                    if (card.id === 14 && deck.some(c => c.id === 14)) {
                        displayMessage("Você só pode ter uma carta 'Soco Ultramente Sério!' no deck.");
                        sfx.blipSelectbutton1.play();
                        return;
                    }
                    deck.push(card);
                    el.classList.add("selected-card");
                } else {
                    displayMessage(getText("deck_full"));
                    console.log("Tentativa de adicionar carta, mas deck cheio.");
                    return;
                }
                
                saveSelectedDeck();
                deckCardCountDisplay.textContent = `Cartas no Deck: ${deck.length}/${MAX_DECK_SIZE}`;
                // Re-renderiza para que as outras cartas atualizem seu status visual (selected/unselected)
                renderDeck(); // Isso também limpará avisos anteriores
                checkDeckForWarnings(); // NOVO: Verifica e exibe avisos após cada seleção/desseleção
            };
            
            deckCardsContainer.appendChild(el);
        }
    });
    checkDeckForWarnings(); // NOVO: Verifica e exibe avisos quando o deck é renderizado pela primeira vez
}

/**
 * NOVO: Verifica se o deck atual tem combinações "incompatíveis" e exibe avisos.
 * Bloqueia o botão de "Jogar" se o deck for incompatível.
 */
function checkDeckForWarnings() {
    const playButton = document.getElementById("btn-play");
    let warningMessage = '';
    let shouldBlockPlay = false;

    // Se o deck estiver vazio, não há avisos de incompatibilidade, mas o jogo não pode começar
    if (deck.length === 0) {
        // playButton.disabled = true; // Isso já é tratado por goToGame
        deckWarningMessage.classList.add('hidden-element');
        return;
    }

    const attackCardsInDeck = deck.filter(card => card.type === 'attack' || (card.type === 'special' && card.id === 14));
    const magicCardsInDeck = deck.filter(card => card.type === 'magic');
    const supportCardsInDeck = deck.filter(card => card.type === 'support');

    // REGRA DE EXCEÇÃO: Se o deck tiver apenas 1 carta e for a Faca (ID 1), não aplica avisos.
    const isInitialDeckWithFaca = deck.length === 1 && deck[0].id === 1;
    if (isInitialDeckWithFaca) {
        deckWarningMessage.classList.add('hidden-element');
        playButton.disabled = false; // Garante que o botão de jogar esteja habilitado
        return;
    }

    // Aviso: Se o deck estiver cheio (3 cartas) E todas forem de ataque
    if (deck.length === MAX_DECK_SIZE && attackCardsInDeck.length === MAX_DECK_SIZE) {
        warningMessage = getText("deck_warning_3_attack");
        shouldBlockPlay = true;
    }
    // Aviso: Se o deck estiver cheio (3 cartas) E todas forem de magia
    else if (deck.length === MAX_DECK_SIZE && magicCardsInDeck.length === MAX_DECK_SIZE) {
        warningMessage = getText("deck_warning_3_magic");
        shouldBlockPlay = true;
    }
    // Aviso: Se não houver cartas de ataque (a não ser que seja o deck inicial da faca, já tratado)
    else if (attackCardsInDeck.length === 0) {
        warningMessage = getText("deck_no_attack_cards_warning");
        shouldBlockPlay = true;
    }

    if (warningMessage) {
        deckWarningMessage.textContent = warningMessage;
        deckWarningMessage.classList.remove('hidden-element');
        playButton.disabled = shouldBlockPlay;
    } else {
        deckWarningMessage.classList.add('hidden-element');
        playButton.disabled = false; // Habilita o botão se não houver avisos
    }
}


// 🎯 FUNÇÕES PRINCIPAIS DO JOGO //

// Processa o ataque do inimigo (normal ou crítico)
function processEnemyAttack(baseDamage, critChance, critMultiplier) {
    let damage = baseDamage;
    let isCritical = false;

    if (Math.random() < critChance) {
        damage *= critMultiplier;
        isCritical = true;
        sfx.hitCriticalPlayer.play();
    } else {
        sfx.enemyHit.play(); // SFX de dano normal do inimigo
    }

    damage = Math.floor(damage);
    let finalDamage = Math.max(0, damage - defense);

    if (wave === MAX_WAVE && currentEnemy.isBoss) { // Se for o T-Rex (último boss)
        damageTakenLastBossFight += finalDamage;
    }

    // Flash da HUD do jogador em vermelho
    const playerUiElement = document.getElementById('player-ui');
    playerUiElement.classList.add('flash-red-hud');
    setTimeout(() => {
        playerUiElement.classList.remove('flash-red-hud');
    }, 200); // Pisca por 200ms

    spawnParticles("player", finalDamage, "damage", isCritical);
    playerHealth -= finalDamage;
}


// Causa dano ao inimigo
function dealDamage(baseAmount, callingCard = null, isLifesteal = false, isUltimate = false) {
    let finalDamage = baseAmount;
    let isCritical = false;

    totalPlayerAttacks++;

    // Buff de ataque do jogador (NÃO APLICA SE FOR ULTIMATE)
    if (!isUltimate && playerStatus.attackBuffTurns > 0) {
        finalDamage += baseAmount * playerStatus.attackBuffAmount;
        sfx.surtarHit.play();
    }

    // Verifica crítico (NÃO APLICA SE FOR ULTIMATE)
    let effectiveCritChance = callingCard ? callingCard.critChance : 0;
    let effectiveCritMultiplier = callingCard ? callingCard.critMultiplier : 1.5;

    if (!isUltimate && playerStatus.critBuffTurns > 0) {
        effectiveCritChance += playerStatus.critBuffAmount;
        if (playerStatus.attackBuffTurns === 0) { // Evita tocar o SFX duas vezes
            sfx.surtarHit.play();
        }
    }

    if (!isUltimate && Math.random() < effectiveCritChance) {
        finalDamage *= effectiveCritMultiplier;
        isCritical = true;
        totalPlayerCriticalAttacks++;
        if (playerStatus.attackBuffTurns === 0 && playerStatus.critBuffTurns === 0) {
            sfx.hitCriticalEnemy.play();
        }
    } else {
        if (playerStatus.attackBuffTurns === 0 && playerStatus.critBuffTurns === 0 && !isUltimate) {
            sfx.hit.play();
        } else if (isUltimate) {
            // No SFX for normal hit if it's ultimate (already played sfx.ultraSeriousPunch)
        }
    }

    finalDamage = Math.floor(finalDamage);
    totalDamageDealt += finalDamage;

    spawnParticles("enemy", finalDamage, "damage", isCritical);
    spawnParticles("enemy", null, "spark"); // Efeito visual de faísca

    enemyHealth -= finalDamage;

    // Lifesteal - ajustado para o Martelo Abençoado
    if (isLifesteal) {
        const stolenHealth = isCritical ? 2 : 1;
        playerHealth = Math.min(MAX_HEALTH, playerHealth + stolenHealth);
        spawnParticles("player", stolenHealth, "heal");
    }

    // CORRIGIDO: Só ganha cubos se a carta NÃO for o Soco Ultramente Sério (isUltimate = false)
    // CORRIGIDO: Chance de drop de cubos diminuída para 10%
    if (!isUltimate) { 
        playerCubes += Math.floor(finalDamage * 0.10); 
        saveCubes();
    }
    
    updateUI();
    
    if (enemyHealth <= 0) {
        disableCardButtons();
        enemyEmojiElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        enemyEmojiElement.style.opacity = '0';
        enemyEmojiElement.style.transform = 'scale(0.5)';

        setTimeout(() => {
            enemyEmojiElement.style.transition = 'none';
            enemyEmojiElement.style.opacity = '1';
            enemyEmojiElement.style.transform = 'scale(1)';
            if (wave === MAX_WAVE) {
                showVictoryScreen();
            } else {
                nextWave();
                if (playerHealth > 0) { // Garante que habilita botões apenas se o jogador estiver vivo
                    enableCardButtons();
                }
            }
        }, 500); // Tempo da transição do inimigo
    }
}

// Cura o jogador
function heal(amount) {
    playerHealth = Math.min(MAX_HEALTH, playerHealth + amount);
    spawnParticles("player", amount, "heal"); // Partícula de cura
    updateUI();
}

// Avança para a próxima onda de inimigos
function nextWave() {
    wave++; // Incrementa a onda antes de definir o inimigo
    playerHealth = MAX_HEALTH; // Restaura HP inteiro

    // Somente dá cubos de bônus por onda a partir da Onda 2
    if (wave > 1) {
        playerCubes += (2 + Math.floor(wave * 0.5));
        saveCubes();
    }

    // Pausa a música do boss se estiver tocando
    if (bossMusic && !bossMusic.paused) {
        bossMusic.pause();
        bossMusic.currentTime = 0;
    }
    // Pausa a música de fundo normal se estiver tocando
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
    }
    
    // Lógica da música de fundo conforme as ondas
    if (wave === 10 || wave === 20 || wave === MAX_WAVE) { // MAX_WAVE é a onda do último boss
        // Boss Wave
        if (bossMusic) {
            bossMusic.currentTime = 0; // Sempre reinicia a música do boss
            bossMusic.play().catch(e => console.log("Autoplay bloqueado (boss):", e));
        }
        bossIndicatorElement.classList.remove('hidden-element'); // Mostra o indicador BOSS
        currentEnemy.isBoss = true;
        let selectedBoss;
        if (wave === 10) selectedBoss = bossTypes[0]; // Ninja
        else if (wave === 20) selectedBoss = bossTypes[1]; // Vilão
        else if (wave === MAX_WAVE) selectedBoss = bossTypes[2]; // T-Rex (Boss Final)
        
        currentEnemy.emoji = selectedBoss.emoji;
        currentEnemy.nameKey = selectedBoss.nameKey;
        currentEnemy.bossType = selectedBoss;
        enemyHealth = BOSS_HEALTH;
        displayMessage(`Prepare-se! Um Chefe apareceu na Onda ${wave}!`);
    } else if (wave > MAX_WAVE) {
        // Isso não deve ser alcançado se showVictoryScreen for chamado na MAX_WAVE
        // Mas como fallback, volta ao menu.
        displayMessage("Parabéns! Você derrotou todos os inimigos!");
        setTimeout(() => backToMenu(), 3000);
        return;
    } else {
        // Normal Wave (Onda 1-9, 11-19, 21-29)
        currentEnemy.isBoss = false;
        bossIndicatorElement.classList.add('hidden-element'); // Esconde o indicador BOSS

        // CORRIGIDO: Se a música de fundo normal NÃO estiver tocando, inicie.
        // Se ela já estiver tocando, ela continuará em loop automaticamente.
        if (backgroundMusic && backgroundMusic.paused) { 
            backgroundMusic.play().catch(e => console.log("Autoplay bloqueado (música):", e));
        }

        const selectedEnemy = normalEnemyTypes[Math.floor(Math.random() * normalEnemyTypes.length)];
        currentEnemy.emoji = selectedEnemy.emoji;
        currentEnemy.nameKey = selectedEnemy.nameKey; // Não será exibido, mas mantido na lógica
        const baseHP = 40 + wave * 10;
        enemyHealth = baseHP;
    }

    enemyEmojiElement.textContent = currentEnemy.emoji;
    defense = 0;
    playerMana = MAX_MANA;
    
    playerStatus = { attackBuffTurns: 0, attackBuffAmount: 0, critBuffTurns: 0, critBuffAmount: 0, thornTurns: 0, thornDamage: 0, socoUltramenteSerioUsed: playerStatus.socoUltramenteSerioUsed }; // Mantém o status do soco
    playerRegenStatus = { active: false, turnsRemaining: 0, currentRegenAmount: 0, initialRegenAmount: 40, regenTickDecrease: 10 };
    enemyStatus = { missTurns: 0, frozenTurns: 0, burnTurns: 0, burnDamage: 0 };

    updateUI();
}

// Turno do inimigo
function enemyTurn() {
    // 1. Aplica status de queimadura (burn) no inimigo
    if (enemyStatus.burnTurns > 0 && enemyStatus.burnDamage > 0) {
        enemyHealth -= enemyStatus.burnDamage;
        spawnParticles("enemy", `🔥${enemyStatus.burnDamage}`, "damage", false, 'orange');
        enemyStatus.burnTurns--;
        
        if (enemyHealth <= 0) {
            disableCardButtons();
            enemyEmojiElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            enemyEmojiElement.style.opacity = '0';
            enemyEmojiElement.style.transform = 'scale(0.5)';
            setTimeout(() => {
                enemyEmojiElement.style.transition = 'none';
                enemyEmojiElement.style.opacity = '1';
                enemyEmojiElement.style.transform = 'scale(1)';
                if (wave === MAX_WAVE) {
                    showVictoryScreen();
                } else {
                    nextWave();
                    if (playerHealth > 0) {
                        enableCardButtons();
                    }
                }
            }, 500);
            updateUI();
            return;
        }
    }

    // 2. Aplica regeneração do jogador (se ativa)
    if (playerRegenStatus.active) {
        if (playerRegenStatus.turnsRemaining > 0) {
            heal(playerRegenStatus.currentRegenAmount);
            spawnParticles("player", `💚${playerRegenStatus.currentRegenAmount}`, "heal", false, 'lightblue');
            playerRegenStatus.currentRegenAmount = Math.max(0, playerRegenStatus.currentRegenAmount - playerRegenStatus.regenTickDecrease);
            playerRegenStatus.turnsRemaining--;
        } else {
            playerRegenStatus.active = false;
            playerRegenStatus.currentRegenAmount = 0;
        }
    }

    // 3. Verifica se inimigo está congelado (impede ataque)
    if (enemyStatus.frozenTurns > 0) {
        displayMessage(getText("enemy_frozen_effect"));
        enemyStatus.frozenTurns--;
        playerMana = Math.min(MAX_MANA, playerMana + 20); // Mana ainda regenera
        updateUI();
        drawCards();
        enableCardButtons();
        return; // Inimigo não ataca se estiver congelado
    }

    // 4. Inimigo pode errar ataques (miss chance do inimigo)
    let missedAttack = false;
    if (enemyStatus.missTurns > 0) {
        if (Math.random() < 0.5) { // 50% de chance de errar se missTurns > 0
            displayMessage(getText("enemy_miss_effect"));
            missedAttack = true;
        }
        enemyStatus.missTurns--;
    }

    const enemyEl = enemyEmojiElement; // Usando a referência direta
    enemyEl.style.transform = 'translateX(-10px) scale(1.1)'; // Animação de "avanço"
    
    setTimeout(() => { // Após 0.25s, o inimigo retorna à posição original
        enemyEl.style.transform = 'translateX(0px) scale(1)';
        
        // O restante da lógica do turno do inimigo acontece após a animação de ataque
        setTimeout(() => {
            if (!missedAttack) {
                if (currentEnemy.isBoss && currentEnemy.bossType && currentEnemy.bossType.attackLogic) {
                    // Se for um boss, executa a lógica de ataque específica dele
                    currentEnemy.bossType.attackLogic();
                } else {
                    // Se for um inimigo normal, escolhe um ataque aleatório
                    const attackType = enemyAttackTypes[Math.floor(Math.random() * enemyAttackTypes.length)];
                    let damage = Math.floor(Math.random() * (attackType.maxDamage - attackType.minDamage + 1)) + attackType.minDamage;
                    processEnemyAttack(damage, attackType.critChance, attackType.critMultiplier);
                }
            } // Fim do if (!missedAttack)

            // Aplica dano de espinhos do jogador
            if (playerStatus.thornTurns > 0 && playerStatus.thornDamage > 0) {
                enemyHealth -= playerStatus.thornDamage;
                spawnParticles("enemy", `✴️${playerStatus.thornDamage}`, "damage", false, 'purple'); // Dano de espinhos
                playerStatus.thornTurns--; // Decrementa o turno dos espinhos
                if (enemyHealth <= 0) { // Inimigo pode morrer por espinhos
                    disableCardButtons();
                    enemyEl.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    enemyEl.style.opacity = '0';
                    enemyEl.style.transform = 'scale(0.5)';
                    setTimeout(() => {
                        enemyEl.style.transition = 'none';
                        enemyEl.style.opacity = '1';
                        enemyEl.style.transform = 'scale(1)';
                        if (wave === MAX_WAVE) {
                            showVictoryScreen();
                        } else {
                            nextWave();
                            if (playerHealth > 0) {
                                enableCardButtons();
                            }
                        }
                    }, 500);
                    updateUI();
                    return;
                }
            }

            playerMana = Math.min(MAX_MANA, playerMana + 20); // Regeneração de mana (aumentado para 20 mana por turno do inimigo)

            // Decrementa turnos de buffs do jogador
            if (playerStatus.attackBuffTurns > 0) playerStatus.attackBuffTurns--;
            if (playerStatus.critBuffTurns > 0) playerStatus.critBuffTurns--;


            // Verifica a vida do jogador APÓS todos os efeitos do turno
            if (playerHealth <= 0) {
                playerHealth = 0; // Garante que a vida não seja negativa no display
                updateUI(); // Atualiza UI para mostrar 0 vida
                disableCardButtons(); // Desabilita os botões de carta IMEDIATAMENTE
                displayMessage(getText("game_over_message"));
                setTimeout(() => backToMenu(), 2000); // Volta ao menu após 2 segundos
            }
            updateUI(); // Atualiza a interface (novamente para garantir 0 HP display e mana)
            // Se o jogador não morreu e o inimigo também não, desenha as cartas para o próximo turno
            if (playerHealth > 0 && enemyHealth > 0) {
                drawCards();
                enableCardButtons(); // Reabilita botões de carta
            }
        }, 250); // Continua a lógica após a primeira parte da animação
    }, 250); // Atraso total de 0.5 segundos para a animação do inimigo (0.25s para avançar + 0.25s para retornar)
}

// Função para exibir mensagens customizadas (substituindo alert)
function displayMessage(message) {
    gameMessageDisplay.textContent = message;
    gameMessageDisplay.classList.remove('hidden-element');

    setTimeout(() => {
        gameMessageDisplay.classList.add('hidden-element');
    }, 2000); // Mensagem desaparece após 2 segundos
}


// 🔄 Atualizar HUD e barras //
function updateUI() {
    playerHealthText.textContent = `❤️ ${playerHealth}/${MAX_HEALTH}`;
    playerManaText.textContent = `💠 ${playerMana}`;
    playerCubesText.textContent = `🟨 ${playerCubes}`;
    // BUG FIX: Garante que 'wave' é um número antes de tentar exibir
    waveCountText.textContent = `🌊 Onda: ${typeof wave === 'number' ? wave : '?'}`; 
    
    mainCubesText.textContent = playerCubes; // Atualiza cubos no menu principal
    shopCubesText.textContent = playerCubes; // Atualiza cubos na loja

    enemyEmojiElement.textContent = currentEnemy.emoji; // Garante que o emoji do inimigo esteja correto

    // Atualiza o indicador de BOSS
    if (currentEnemy.isBoss) {
        bossIndicatorElement.classList.remove('hidden-element');
    } else {
        bossIndicatorElement.classList.add('hidden-element');
    }

    const maxHPEnemy = currentEnemy.isBoss ? BOSS_HEALTH : (40 + wave * 10);
    // BUG FIX: Garante que enemyHealth e maxHPEnemy são números válidos para evitar NaN
    const healthPercent = Math.max(0, (enemyHealth / (maxHPEnemy || 1)) * 100); 
    enemyHealthBarFill.style.width = healthPercent + "%"; // Atualiza largura da barra
}

// 🃏 Desenhar cartas no jogo //
function drawCards() {
    cardHandContainer.innerHTML = ""; // Limpa a mão atual
    
    if (deck.length === 0) { // Se o deck estiver vazio
        cardHandContainer.textContent = getText("deck_empty_hand");
        disableCardButtons(); // Desabilita botões se não houver cartas no deck
        return;
    }
    
    const cardsInHand = [...deck]; // Copia o deck para a mão (embaralhe se quiser ordem aleatória)

    cardsInHand.forEach(card => {
        const el = document.createElement("div");
        el.className = `card type-${card.type}`;
        
        const cardNameSpan = document.createElement("span");
        cardNameSpan.className = "card-name";
        cardNameSpan.textContent = getText(card.nameKey);
        el.appendChild(cardNameSpan);

        if (card.manaCost > 0) {
            const manaCostSpan = document.createElement("span");
            manaCostSpan.className = "mana-cost-display";
            manaCostSpan.textContent = `-${card.manaCost} 💠`;
            el.appendChild(manaCostSpan);
        }
        
        el.onclick = function() {
            console.log("Carta clicada:", getText(card.nameKey)); // Adicionado para depuração

            if (playerHealth <= 0) {
                disableCardButtons();
                displayMessage(getText("game_over_message"));
                setTimeout(() => backToMenu(), 2000);
                return;
            }

            // Verifica se é a carta Soco Ultramente Sério e se já foi usada
            if (card.id === 14 && playerStatus.socoUltramenteSerioUsed) {
                displayMessage(getText("card_soco_serio_used"));
                sfx.blipSelectbutton1.play(); // Som de erro
                return;
            }

            if (card.manaCost && playerMana < card.manaCost) {
                displayMessage(getText("mana_insufficient"));
                sfx.blipSelectbutton1.play(); // Usar sfx de erro para mana insuficiente
                return; // Impede a ação da carta
            }

            cardsUsedThisRun.push(getText(card.nameKey));

            if (card.manaCost) {
                playerMana -= card.manaCost;
            }

            disableCardButtons(); // Desabilita os botões de carta IMEDIATAMENTE após usar uma carta
            
            card.action.call(card); // Chama a função de ação da carta
            
            setTimeout(() => {
                // Se o inimigo foi derrotado pela carta, dealDamage já chamou nextWave().
                // nextWave() por sua vez habilita os botões e redesenha as cartas.
                // Se o inimigo ainda está vivo e o jogador também, é a vez do inimigo.
                if (playerHealth > 0 && enemyHealth > 0) {
                    enemyTurn();
                } else if (playerHealth <= 0) {
                    // O jogador morreu pela própria carta (ex: lifesteal negativo, etc.)
                    // enemyTurn() lida com o game over.
                    console.log("Jogador morreu após ação da carta.");
                }
            }, 500); // Pequeno atraso para efeitos visuais/sonoros antes do turno do inimigo começar
        };
        cardHandContainer.appendChild(el); // Adiciona a carta à mão
    });
}

// 🚫 Habilitar/Desabilitar botões de carta 
function disableCardButtons() {
    Array.from(cardHandContainer.children).forEach(cardElement => {
        if (cardElement.classList.contains('card')) { // Garante que é uma carta e não o texto "Deck vazio"
            cardElement.onclick = null; // Remove o evento de clique
            cardElement.classList.add('card-button-disabled');
        }
    });
}

function enableCardButtons() {
    // Re-desenha as cartas para garantir que os handlers estejam corretos e sem a classe de desabilitação
    drawCards(); // drawCards já atribui os onclicks e remove 'card-button-disabled'
    Array.from(cardHandContainer.children).forEach(cardElement => {
        if (cardElement.classList.contains('card')) {
            cardElement.classList.remove('card-button-disabled');
        }
    });
}


// ✨ Função de partículas aprimorada //
/**
 * Cria e anima partículas para indicar dano, cura ou efeitos visuais.
 * @param {string} target - 'enemy' ou 'player'.
 * @param {string|number|null} content - O texto/número a ser exibido na partícula, ou null para faíscas.
 * @param {string} type - 'damage', 'heal', 'spark'.
 * @param {boolean} [isCritical=false] - Indica se o dano é crítico (apenas para tipo 'damage').
 * @param {string} [customColor=null] - Cor personalizada para a partícula.
 */
function spawnParticles(target, content, type, isCritical = false, customColor = null) {
    let areaElement;
    let color = customColor || 'white';
    let text = content;
    let fontSize = 20;

    if (target === "enemy") {
        areaElement = document.getElementById("enemy-area"); // Área do inimigo para posicionamento
        if (type === "damage") {
            color = isCritical ? '#FF4500' : 'red';
            text = isCritical ? `💥 ${content}` : content;
            fontSize = isCritical ? 28 : 24;
        } else if (type === "spark") {
            const numSparks = 7;
            for (let i = 0; i < numSparks; i++) {
                const sparkParticle = document.createElement("div");
                sparkParticle.className = "particle";
                sparkParticle.textContent = '';
                sparkParticle.style.width = '4px';
                sparkParticle.style.height = '4px';
                sparkParticle.style.borderRadius = '50%';
                sparkParticle.style.backgroundColor = '#FFD700';
                sparkParticle.style.boxShadow = '0 0 4px #FFA500';

                const rect = areaElement.getBoundingClientRect();
                const startX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 40;
                const startY = rect.top + rect.height / 2 + (Math.random() - 0.5) * 40;
                sparkParticle.style.left = `${startX}px`;
                sparkParticle.style.top = `${startY}px`;
                
                document.body.appendChild(sparkParticle);

                let currentTranslateY = 0;
                let currentTranslateX = 0;
                let currentOpacity = 1;
                const sparkInterval = setInterval(() => {
                    if (currentOpacity <= 0.05) {
                        clearInterval(sparkInterval);
                        sparkParticle.remove();
                    }
                    currentTranslateY -= (2 + Math.random() * 3);
                    currentTranslateX += (Math.random() - 0.5) * 5;
                    currentOpacity -= 0.05;
                    sparkParticle.style.transform = `translateY(${currentTranslateY}px) translateX(${currentTranslateX}px)`;
                    sparkParticle.style.opacity = currentOpacity;
                }, 30);
            }
            return;
        }
    } else { // target === "player"
        areaElement = document.getElementById("player-ui"); // A área agora é o HUD do jogador para posicionar partículas de dano/cura
        if (type === "damage") {
            color = isCritical ? '#FF4500' : 'red';
            text = isCritical ? `💥 ${content}` : content;
            fontSize = isCritical ? 28 : 24;
        } else if (type === "heal") {
            color = customColor || 'limegreen';
            text = `💚 ${content}`;
            fontSize = 24;
        }
    }

    // Código para partículas de texto/número (dano/cura)
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = text;
    particle.style.color = color;
    particle.style.fontSize = `${fontSize}px`;
    particle.style.position = 'absolute';
    particle.style.fontWeight = 'bold';
    particle.style.textShadow = '1px 1px 2px black';

    // Calcula a posição inicial da partícula aleatoriamente perto do alvo
    const rect = areaElement.getBoundingClientRect();
    // Ajusta a posição para que a partícula surja na altura do meio da HUD ou ícone
    particle.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 30}px`;
    particle.style.top = `${rect.top + rect.height / 2 - 20 + (Math.random() - 0.5) * 10}px`;
    
    document.body.appendChild(particle);

    let translateY = 0;
    let opacity = 1;
    const interval = setInterval(() => {
        if (opacity <= 0.05) {
            clearInterval(interval);
            particle.remove();
        }
        translateY -= 1;
        opacity -= 0.02;
        particle.style.transform = `translateY(${translateY}px)`;
        particle.style.opacity = opacity;
    }, 20);
}

/**
 * Exibe a tela de vitória com as estatísticas da partida.
 */
function showVictoryScreen() {
    console.log("Mostrando tela de vitória!");
    if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
    if (bossMusic && !bossMusic.paused) bossMusic.pause();
    
    sfx.victoryTheme.currentTime = 0;
    sfx.victoryTheme.play().catch(e => console.log("Autoplay bloqueado (vitória):", e));
    sfx.victoryTheme.loop = false;

    // NOVO: Condição para a mensagem de vitória final
    if (wave === MAX_WAVE) {
        victoryTitleMain.textContent = getText("victory_title_final"); // Define a mensagem "MEUS PARABÉNS..."
        victoryTotalDamageSpan.parentElement.classList.add('hidden-element'); // Esconde o parágrafo de dano
        victoryCardsUsedSpan.parentElement.classList.add('hidden-element'); // Esconde o parágrafo de cartas usadas
    } else {
        victoryTitleMain.textContent = getText("victory_title"); // Volta ao título normal de vitória
        victoryTotalDamageSpan.parentElement.classList.remove('hidden-element'); // Mostra o parágrafo de dano
        victoryCardsUsedSpan.parentElement.classList.remove('hidden-element'); // Mostra o parágrafo de cartas usadas
        victoryTotalDamageSpan.textContent = totalDamageDealt;
        victoryCardsUsedSpan.textContent = cardsUsedThisRun.length > 0 ? cardsUsedThisRun.join(', ') : getText("no_cards_used");
    }

    checkCertificates(); // Verifica e concede certificados
    showScreen(screens.victory);
    updateUI(); // Garante que a UI esteja atualizada

    // NOVO: Inicia a sequência pós-vitória se for a vitória final
    if (wave === MAX_WAVE) {
        setTimeout(startPostVictorySequence, 3000); // Espera 3 segundos antes de iniciar a sequência
    }
}

/**
 * NOVO: Gerencia a sequência de mensagens pós-vitória da Onda 30.
 */
function startPostVictorySequence() {
    showScreen(screens.postVictoryOverlay); // Mostra o overlay de tela preta
    postVictoryText.textContent = ""; // Limpa o texto anterior
    postVictoryText.classList.remove('visible'); // Garante que não comece visível

    const messages = [
        getText("post_victory_msg1"),
        getText("post_victory_msg2"),
        getText("post_victory_msg3")
    ];
    let messageIndex = 0;

    function displayNextPostVictoryMessage() {
        if (messageIndex < messages.length) {
            postVictoryText.textContent = messages[messageIndex];
            postVictoryText.classList.remove('hidden-element');
            postVictoryText.style.opacity = 0; // Reset opacity for fade-in
            setTimeout(() => {
                postVictoryText.style.transition = 'opacity 1s ease-in'; // Smooth fade-in
                postVictoryText.style.opacity = 1;
            }, 100); // Small delay to trigger transition

            messageIndex++;
            let delay = 3000; // Padrão: 3 segundos
            if (messageIndex === messages.length) { // Última mensagem
                delay = 4000; // Um pouco mais de tempo para a última mensagem
            }
            setTimeout(displayNextPostVictoryMessage, delay);
        } else {
            // Fim da sequência, volta para o menu principal
            postVictoryText.style.transition = 'opacity 1s ease-out';
            postVictoryText.style.opacity = 0;
            setTimeout(() => {
                backToMenu(); // Volta para o menu principal
            }, 1500); // Espera um pouco para o fade-out do texto
        }
    }
    displayNextPostVictoryMessage(); // Inicia a sequência
}


/**
 * Verifica as condições para conceder certificados.
 */
function checkCertificates() {
    let earnedCertificate = "bronze"; // Nome da imagem para certificado bronze (ex: 'bronze_certificate.png')

    // Condição para certificado dourado: zerar o jogo (chegar à onda MAX_WAVE)
    // E ter um desempenho muito bom (ex: pouco dano recebido do último boss - T-Rex)
    const finalBossWaveReached = (wave === MAX_WAVE); // Onda 30
    const efficientFinalBossKill = (damageTakenLastBossFight <= 20);

    // Certificado Ouro: Zerar o jogo E pouquíssimo dano do último boss
    if (finalBossWaveReached && efficientFinalBossKill) {
        earnedCertificate = "golden"; // Assumindo 'golden_certificate.png'
        // Desbloqueia Soco Ultramente Sério se não estiver desbloqueado
        const socoSerioCard = cards.find(c => c.id === 14);
        if (socoSerioCard && !socoSerioCard.unlocked) {
            socoSerioCard.unlocked = true;
            saveUnlockedCards(); // Salva o status de desbloqueio da carta
            // displayMessage(getText("card_soco_serio_unlocked_message")); // Pode adicionar uma mensagem se quiser
        }
    } else if (finalBossWaveReached) { // Certificado Prata: Zerar o jogo
        earnedCertificate = "silver"; // Assumindo 'silver_certificate.png'
    }

    // Adiciona o certificado ao array, gerenciando o limite de slots
    if (certificates.length >= MAX_CERTIFICATE_SLOTS) {
        certificates.shift(); // Remove o certificado mais antigo
    }
    // Garante que não adicione certificados duplicados
    if (!certificates.includes(earnedCertificate)) {
        certificates.push(earnedCertificate); // Adiciona o novo
    }

    saveCertificates(); // Salva os certificados no localStorage
    renderCertificates(); // Atualiza a exibição dos certificados no menu principal
    // Exibe o certificado na tela de vitória
    victoryCertificateDisplay.src = `images/certificates/${earnedCertificate}_certificate.png`;
    victoryCertificateDisplay.classList.remove('empty-slot'); // Remove a classe de slot vazio
    victoryCertificateDisplay.style.borderStyle = 'solid';
    victoryCertificateDisplay.style.opacity = '1';
}

/**
 * Renderiza os certificados nos slots do menu principal.
 */
function renderCertificates() {
    for (let i = 0; i < MAX_CERTIFICATE_SLOTS; i++) {
        const slotEl = document.getElementById(`certificate-slot-${i}`); // IDs de 0 a 4
        if (slotEl) {
            const certName = certificates[i];
            if (certName) {
                slotEl.src = `images/certificates/${certName}_certificate.png`;
                slotEl.classList.remove('empty-slot');
                slotEl.style.borderStyle = 'solid';
                slotEl.style.opacity = '1';
            } else {
                slotEl.src = 'images/certificates/empty_certificate.png';
                slotEl.classList.add('empty-slot');
                slotEl.style.borderStyle = 'dashed';
                slotEl.style.opacity = '0.6';
            }
        }
    }
}


// ▶️ Inicialização Global //
// Executa quando a janela e todos os seus recursos são carregados
window.onload = () => {
    console.log("Página carregada. Inicializando jogo.");

    // Inicializa as músicas de fundo
    backgroundMusic = new Audio("BattleTheme1.wav");
    backgroundMusic.loop = true;
    bossMusic = new Audio("BossTheme1.mp3");
    bossMusic.loop = true;
    sfx.victoryTheme.loop = false; // Garante que a música de vitória não toque em loop

    loadGameProgress(); // Carrega todo o progresso (inclui idioma e volumes)
    applyVolumeSettings(); // Aplica as configurações de volume carregadas
    updateTexts(); // CHAMA updateTexts AQUI, AGORA QUE ESTÁ DEFINIDA

    // Atribuição de event listeners para os botões do menu principal
    document.getElementById("btn-play").addEventListener('click', goToGame);
    document.getElementById("btn-shop").addEventListener('click', openShop);
    document.getElementById("btn-cards").addEventListener('click', openDeck);
    document.getElementById("btn-options").addEventListener('click', openOptions);
    document.getElementById("btn-story").addEventListener('click', openStory); // Event listener para o botão da história

    // Botões de voltar
    document.getElementById("btn-shop-back").addEventListener('click', backToMenu);
    document.getElementById("btn-deck-back").addEventListener('click', backToMenu);
    document.getElementById("btn-game-back").addEventListener('click', backToMenu);
    document.getElementById("btn-options-back").addEventListener('click', backToMenuFromOptions);
    document.getElementById("btn-victory-back").addEventListener('click', backToMenu);
    document.getElementById("btn-story-back").addEventListener('click', backToMenu); // Botão de voltar da história

    // Inicializa variáveis de sessão para a primeira exibição/nova partida
    resetGameStatsOnly(); // Garante que wave, playerHealth, etc., estejam em um estado limpo
    
    showScreen(screens.main); // Mostra o menu principal ao carregar (e oculta todas as outras)
    updateUI(); // Atualiza a UI para refletir o estado inicial (cubos, mana no menu, etc.)
}

