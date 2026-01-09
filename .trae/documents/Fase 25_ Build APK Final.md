# Fase 25: Generación Final del APK (Cloud-Connected) ☁️📱

¡Vamos a empaquetar todo!
El usuario dijo "si dale", así que ejecutaré el script de construcción.

## 1. Pasos de Construcción
- Ejecutar `build_apk.ps1`.
- Este script:
    1.  Copia los archivos web (`deploy/` -> `neuronex-mobile/www`).
    2.  Ejecuta `npm run build` (si es React/Vite) o simplemente sincroniza con Capacitor.
    3.  Ejecuta `npx cap sync`.
    4.  Ejecuta `gradlew assembleDebug` para crear el `.apk`.

## 2. Resultado
- Obtendremos un archivo `app-debug.apk` en `neuronex-mobile/android/app/build/outputs/apk/debug/`.
- Lo copiaré a la raíz del proyecto como `NEXA_ROBOT_CLOUD.apk` para que sea fácil de encontrar.

¡Iniciando la fábrica de APKs! 🏭