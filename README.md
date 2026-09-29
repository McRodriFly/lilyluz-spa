# 🐾 LilyLuz Spa — Sistema de Gestión para Peluquería Canina

LilyLuz Spa es una aplicación web *offline-first* diseñada a la medida para la gestión operativa y financiera de una peluquería canina. Cuenta con una interfaz optimizada para teléfonos móviles (inspirada en las directrices de diseño de Apple / iOS) y está construida para operar de forma 100% local, privada y portátil sin necesidad de conexión a servicios en la nube.

---

## 🚀 1. Cómo Ponerlo en Marcha (Despliegue Portable)

El sistema ha sido empaquetado para ser completamente **portable**. Toda la aplicación (Frontend, Backend y Base de Datos) vive en la carpeta `dist`. Solo necesitas copiar esa carpeta a cualquier máquina para que el sistema funcione.

### Prerrequisitos
El único requisito del sistema anfitrión es tener instalado **Java 17** o **Java 21**.
- **Windows:** [Descargar instalador (.msi) de Adoptium Temurin](https://adoptium.net/temurin/releases/?version=21)
- **Linux:** `sudo apt install openjdk-21-jre`

### Ejecución
1. Descarga o copia la carpeta **`dist`** al equipo deseado.
2. Ingresa a la carpeta `dist` y ejecuta el lanzador según tu sistema operativo:
   - **En Windows:** Haz doble clic en el archivo **`iniciar.bat`**.
   - **En Linux:** Haz doble clic en el archivo **`iniciar.sh`** (o en el acceso directo `LilyLuz-Spa.desktop`).
3. Se abrirá una ventana de terminal iniciando el servidor (no la cierres).
4. El navegador de la PC se abrirá automáticamente en `http://localhost:8080`.
5. La terminal mostrará una dirección IP (Ejemplo: `http://192.168.0.X:8080`). Escribe esta dirección exacta en el navegador de tu **iPhone / Teléfono móvil** conectado al mismo WiFi para utilizar la aplicación como si fuera nativa.

### 💾 Migración y Respaldo
Para hacer un respaldo de todo el sistema o llevarlo a otra computadora, **simplemente copia y pega la carpeta `dist` completa**. Toda la base de datos se guarda en el archivo `./dist/data/lilyluzdb.mv.db`.

---

## ✨ 2. Informe Detallado de Funcionalidades

El sistema está dividido en cinco módulos principales, accesibles mediante la barra de navegación inferior (estilo iOS).

### 📊 2.1. Panel Principal (Dashboard)
Una vista gerencial enfocada puramente en la **operación del día**, libre de distracciones y datos financieros expuestos.
- **Citas de Hoy:** Indicador de ocupación (ej. "2 / 4 máximo") separando a los perritos finalizados de los que están actualmente en curso.
- **Resumen CRM:** Conteo total de perritos registrados en la base de datos.
- **Alertas de Herramientas:** Visor rápido que advierte si alguna herramienta de trabajo ha superado los 60 días sin mantenimiento.
- **Control de Shampoos:** Visualiza inmediatamente qué bidones de insumos están abiertos y cuántos días llevan rindiendo en el local.

### 📅 2.2. Agenda Inteligente
Gestor de citas con validación de tiempo y mensajería automatizada.
- **Flujo Simplificado:** Se agenda seleccionando únicamente la mascota, la fecha y la hora (en bloques prediseñados).
- **Regla de 2 Horas:** El sistema impide automáticamente chocar turnos. Valida de manera estricta que haya un lapso de ±120 minutos entre cada perrito.
- **Límite de Fatiga (Máx 4/día):** Protege los tiempos de trabajo limitando a 4 perros por día. Si se intenta agendar un quinto, salta una alerta requiriendo una confirmación manual de "excepción de cupo".
- **Notificación por WhatsApp Automática:** Al presionar "Confirmar Cita", si el dueño de la mascota tiene un celular registrado, el sistema abre automáticamente WhatsApp Web / App con un mensaje pre-armado y listo para enviar notificándole del turno.

### 🐶 2.3. Directorio de Mascotas (CRM Clínico)
Libro de pacientes altamente visual y detallado.
- **Vista Dual Toggle:** Alterna al instante con un botón entre vista de \"Galería\" (cuadrícula de fotos tamaño XL) y vista de \"Lista\" clásica.
- **Fotos de Avatar integradas:** Usa la cámara del teléfono o sube un archivo para asignarle un rostro a cada perro. Las fotos se comprimen y se guardan directamente en el dispositivo local de forma ultra-rápida.
- **Atributos y Comportamiento:** Registro de Edad (`🎂`), Tamaño (`📏`), Raza y _Tags_ de comportamiento rápidos configurables a un toque (ej. *Miedoso, No máquina, Regalón*).
- **Comunicación en un clic:** Botones directos para **Llamar** y enviar **WhatsApp** al tutor sin teclear el número telefónico.
- **Historial incrustado:** Cada ficha despliega en formato acordeón *todas las citas y trabajos* que se le han realizado a ese perro históricamente, permitiendo tomar decisiones rápidas al recibirlo.

### 📦 2.4. Inventario y Mantenimiento
Control de bodega y desgaste de material que no requiere tediosos controles de stock unidad por unidad.
- **Insumos (Ej. Shampoos / Acondicionadores):** Operan en base a *Duración*. Se registra solo la apertura (Ej. Un galón de 5L) y muestra un contador en vivo de **cuántos días lleva rindiendo**. Cuando se vacía, se "Marca Terminado", dejando en el historial que un bidón dura estadísticamente X días.
- **Herramientas de Trabajo (Ej. Máquinas / Tijeras):** Operan en base a *Mantenimiento*. Cuentan con un semáforo interactivo (🟢 Operativa / 🟡 Revisión / 🔴 En Taller) y cuentan los días desde el último afilado o mantención para disparar alertas automáticas.

### 💰 2.5. Finanzas
Módulo contable blindado y aislado del resto del app para privacidad clínica.
- **Ciclo de Cobro Simple:** Cuando un perro se despacha de la peluquería en la sección Agenda, el programa pide ingresar únicamente el "Monto Cobrado ($)". No pide desgloses engorrosos ni elegir medio de pago, agilizando el traspaso.
- **Recaudación Mensual e Histórica:** Refleja todo el total global transaccionado en la plataforma.
- **Cuentas por Cobrar:** Citas que figuran en estado finalizado o retirado, pero a las que por error, o acuerdo de trato, todavía no se les ha asignado el importe ingresado en caja, alertando para cobrar.
- **Registro Detallado:** Listado de todas las entradas de dinero, referenciando la fecha, la mascota y la hora de atención.

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend:** React, HTML5, Tailwind CSS, Lucide Icons, Vite. (Desarrollado modularmente simulando un entorno nativo iOS PWA).
- **Backend:** Java 21, Spring Boot, JPA/Hibernate, Spring Web. 
- **Base de Datos:** H2 Database Engine (Motor robusto y rápido insertado dentro del mismo programa, en archivo `.db`).
- **Despliegue Combinado:** El framework *Spring Boot* levanta tanto el API REST local (`:8080`) como el Frontend renderizado en su propia carpeta estática embuída, eliminando la necesidad de Nginx, Node.js o servidores Apache externos garantizando un peso menor a 60MB globales.