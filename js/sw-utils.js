

// Guardar en cache dinamico
// Con esta funcion guardamos recursos en la cache dinamica
// como las fuentes de google apis
function actualizaCacheDinamico(dynamicCache, req, res) {
    if (res.ok) {
        return caches.open(dynamicCache).then(cache => {
            cache.put(req, res.clone());
            return res.clone();
        });
    } else {
        return res;
    }
}