<?php
function guardarImagen($base64, $tipo, $nombre_archivo) {
    // Decodificar imagen base64
    $image_data = explode(',', $base64);
    if (count($image_data) < 2) {
        return null;
    }
    
    $image_data = base64_decode($image_data[1]);
    
    // Determinar extensión
    $extension = 'jpg';
    if (strpos($base64, 'data:image/png') !== false) {
        $extension = 'png';
    } elseif (strpos($base64, 'data:image/jpeg') !== false || strpos($base64, 'data:image/jpg') !== false) {
        $extension = 'jpg';
    }
    
    // Crear directorio si no existe
    $upload_dir = __DIR__ . '/../../uploads/' . $tipo . '/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Generar nombre único
    $nombre_completo = $nombre_archivo . '_' . time() . '.' . $extension;
    $ruta_completa = $upload_dir . $nombre_completo;
    
    // Guardar archivo
    file_put_contents($ruta_completa, $image_data);
    
    // Retornar ruta relativa
    return 'uploads/' . $tipo . '/' . $nombre_completo;
}

function guardarFirma($base64, $prestamo_id) {
    // Similar a guardarImagen pero para firmas
    return guardarImagen($base64, 'responsivas', 'firma_' . $prestamo_id);
}
