// Imports
importScripts('js/sw-utils.js');

// Creamos las constantes de las tres caches que utilizaremos
const STATIC_CACHE      = 'static-v2';
const DYNAMIC_CACHE     = 'dynamic-v1';
const INMUTABLE_CACHE   = 'inmutable-v1';

// Creamos el array con el App Shell
const APP_SHELL = [
    '/', //necesario para que funcione la app
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    //estas llamadas no se guardaran por que son referencias
    'https://fonts.googleapis.com/css?family=Quicksand:300,400', 
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// Realizamos la instalacion
self.addEventListener('install', e => {
    // Guardo la cache estatica...
    const cacheStatic = caches.open( STATIC_CACHE ).then( cache => {
        cache.addAll(APP_SHELL);
    });
    // ...y la inmutable (otra manera de hacerlo)
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => 
        cache.addAll(APP_SHELL_INMUTABLE));
    // Espero a que todo se instale
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
})

// Borramos las caches antiguas cuando cambie el SW
self.addEventListener('activate', e => {
    const respuesta = caches.keys().then( keys => {
        // recorro todos los keys
        keys.forEach(key => {
            if (key !== STATIC_CACHE && key.includes('static')){
                return caches.delete(key);
            }
        });
    });
    e.waitUntil( respuesta );
});

// Implementamos la estrategia del cache
self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            //si la respuesta existe, la devuelvo desde la cache
            return res;
        } else {
            //si no, la busco en la red y la guardo en cache dinamica
            return fetch(e.request).then(newRes => {
                return  actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
        
    });
    e.respondWith(respuesta);
});