const CACHE_NAME = 'card-wave-rpg-cache-v2'; // Versão atualizada do cache
const urlsToCache = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'manifest.json',
  'PixelifySans-Regular.ttf', // Adicionado para garantir o cache da fonte
  'PixelifySans-Bold.ttf',    // Adicionado para garantir o cache da fonte
  'click1.wav',
  'hitHurt1.wav',
  'powerUp1.wav',
  'hitHurtPlayer.wav',
  'powerUp2.wav',
  'hitHurtCriticalPlayer.wav',
  'hitHurtEnemy.wav',
  'click2.wav',
  'blipSelectbutton1.wav',
  'BattleTheme1.wav',
  'BossTheme1.mp3',
  'VictoryTheme1.mp3',
  'HitcriticalSurtar.wav',
  'IceActive1.wav',
  'ShieldActive1.wav',
  'ActiveArmorSpike.wav',
  'RestourationHP.wav',
  'UltraSeriousPunch.wav', // NOVO SFX
  'images/icon-192x192.png',
  'images/icon-512x512.png',
  // Novas imagens para os certificados
  'images/certificates/empty_certificate.png',
  'images/certificates/bronze_certificate.png',
  'images/certificates/silver_certificate.png',
  'images/certificates/golden_certificate.png'
];

// Instalação do Service Worker - cacheia todos os assets
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto, adicionando URLs.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força o Service Worker a ativar imediatamente
      .catch(error => {
        console.error('Service Worker: Falha ao adicionar URLs ao cache:', error);
      })
  );
});

// Ativação do Service Worker - limpa caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve assets do cache ou da rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        // Nenhuma correspondência no cache - busca na rede
        // Clona a requisição para que possa ser lida tanto pelo cache quanto pela rede
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para que possa ser usada pelo navegador e adicionada ao cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.error('Service Worker: Erro ao buscar da rede:', error);
          // Opcional: retornar uma página offline customizada em caso de falha total
          // return caches.match('/offline.html');
        });
      })
  );
});

