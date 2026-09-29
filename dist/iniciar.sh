#!/bin/bash
# ═══════════════════════════════════════════════
# LilyLuz Spa — Peluquería Canina
# Script de inicio para Linux
# Solo hacer doble clic o ejecutar: ./iniciar.sh
# ═══════════════════════════════════════════════

cd "$(dirname "$0")"

echo ""
echo "  🐾  LilyLuz Spa — Peluquería Canina"
echo "  ════════════════════════════════════"
echo ""

# Buscar Java en el sistema
JAVA_CMD=""
if command -v java &>/dev/null; then
    JAVA_CMD="java"
elif [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVA_CMD="$JAVA_HOME/bin/java"
else
    echo "  ❌ No se encontró Java instalado."
    echo "  Instala Java 21 o superior con:"
    echo "     sudo apt install openjdk-21-jre"
    echo ""
    read -p "  Presiona Enter para salir..."
    exit 1
fi

# Verificar versión mínima
JAVA_VER=$("$JAVA_CMD" -version 2>&1 | head -1 | grep -oP '\"?\K[\d]+' | head -1)
echo "  ☕ Java detectado: versión $JAVA_VER"

if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
    echo "  ⚠️  Se requiere Java 17 o superior. Tienes la versión $JAVA_VER."
    echo "     Instala una versión más reciente con: sudo apt install openjdk-21-jre"
    read -p "  Presiona Enter para salir..."
    exit 1
fi

# Obtener la IP local para acceso desde el celular
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

echo "  💾 Base de datos: ./data/lilyluzdb.mv.db"
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  🌐 Abre en tu navegador:               │"
echo "  │                                         │"
echo "  │  Desde este PC:   http://localhost:8080  │"
if [ -n "$LOCAL_IP" ]; then
echo "  │  Desde tu iPhone:  http://${LOCAL_IP}:8080  │"
fi
echo "  │                                         │"
echo "  │  Para detener: Ctrl+C o cierra esta     │"
echo "  │  ventana.                               │"
echo "  └─────────────────────────────────────────┘"
echo ""

# Abrir navegador automáticamente
(sleep 2 && xdg-open "http://localhost:8080" 2>/dev/null) &

# Ejecutar el servidor
"$JAVA_CMD" -jar lilyluz-spa.jar
