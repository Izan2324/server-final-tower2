FINAL TOWER 2 — SERVIDOR DE SALAS ONLINE

DESPLIEGUE EN RENDER
1. Sube el contenido de esta carpeta a un repositorio GitHub nuevo.
2. En Render elige New + > Web Service y conecta ese repositorio.
3. Render detectará Node. Build Command: npm install. Start Command: npm start.
4. Despliega. Copia la URL HTTPS asignada (ejemplo: https://final-tower-2-server.onrender.com).
5. Abre Final_Tower_2_Online_Salas_0.5.html, pega esa URL en SERVIDOR ONLINE y pulsa GUARDAR DIRECCIÓN.
6. Desde el primer ordenador crea una sala. Desde el segundo abre la misma versión del juego, pega la misma URL y escribe el código.

PRUEBA
Abre https://TU-URL.onrender.com/health. Debe devolver JSON con {"ok":true}.

ALCANCE DE ESTA ENTREGA
Esta versión implementa creación de salas, códigos compartidos entre dispositivos, entradas/salidas, listado público, plazas 2–8, actualización de participantes en tiempo real e inicio sincronizado de la sesión.
Todavía NO sincroniza las acciones de combate, posiciones, disparos, enemigos, vida ni oleadas. Al iniciar, cada navegador ejecuta su propia simulación local. Para un cooperativo real en el que los jugadores compartan el mismo combate hace falta una segunda fase de sincronización del estado del juego.

NOTAS
- Las salas viven en memoria del servidor y desaparecen si Render reinicia o duerme el servicio.
- El plan gratuito puede tardar en despertar después de inactividad.
- No compartas secretos ni claves; este prototipo no tiene cuentas ni autenticación.
