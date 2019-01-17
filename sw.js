// Import
importScripts('js/sw-utils.js');

// Para manejar los caches
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Para manejar los archivos criticos para que la aplicacion funcione
const APP_SHELL = [ // Si alguna de estas librerias o archivos no existe o está mal escrito, el APP_SHELL daria error
    // '/', en desarrollo es necesaria esta linea pero en produccion no!!
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

// OJO con el FETCH a estas librerias. Estas peticiones realizan otras peticiones las cuales hay que capturarlas y guardarlas en cache dinamico para que en futuras peticiones, se hagan desde ahi!!
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// Proceso de Instalacion
self.addEventListener('install', e => {

    // Guardo en el cache
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));

    // Espero a que ambas promesas terminen
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Este evento solo se va a activar cuando la instalacion termine
// Proceso para borrar del cache cada vez que se active un nuevo SW
self.addEventListener('activate', e => {

    const respuesta = caches.keys().then(keys => {
        keys.forEach(key => {
            // En este caso 'static-v1'
            // Borro los caches (los key) que sean diferentes a 'static-v1' (STATIC_CACHE) y que incluyan 'static'. si no incluyen 'static', no los borra
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(respuesta);
});


self.addEventListener('fetch', e => {

    // Consulto en cache si lo que estoy pidiendo por la request existe.
    const respuesta = caches.match(e.request).then(resp => {

        if (resp) {
            return resp;
        } else {
            // Si no existe en cache lo que estoy buscando, lo busco en la red
            return fetch( e.request ).then( newResp => {
                
                // ARgumentos: nombre del cache, la request y la respuesta
                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newResp );
            });
        }

    });

    e.respondWith(respuesta);
});
