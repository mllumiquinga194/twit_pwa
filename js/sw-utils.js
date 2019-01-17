// Actualizar caché dinamico!!
function actualizaCacheDinamico(dynamicCache, req, res) {

    // Si la respuesta tiene data, significa que tiene informacion que debo guardar en el cache
    if (res.ok) {

        return caches.open(dynamicCache).then(cache => {

            // Actualizo ese cache!!!
            cache.put(req, res.clone());
            return res.clone();
        });
    } else { // Si no tiene nada significa que fallo el cache antes de llamar a esta funcion y fallo la red.

        return res;
    }

}