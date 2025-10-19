# Guía de Estilos para Temas - Zentry App

## Reglas de Oro 🏆

### 1. NUNCA usar colores hardcoded
❌ **MAL:**
```scss
.my-component {
  color: #ffffff;
  background: #000000;
  border: 1px solid #E5E7EB;
}
```

✅ **BIEN:**
```scss
.my-component {
  color: var(--ion-text-color);
  background: var(--ion-background-color);
  border: 1px solid var(--color-border);
}
```

### 2. Evitar !important (salvo casos excepcionales)
❌ **MAL:**
```scss
.my-text {
  color: var(--ion-text-color) !important;
}
```

✅ **BIEN:**
```scss
.my-text {
  color: var(--ion-text-color);
}
```

**Excepciones permitidas:**
- Overlays de Ionic (modals, alerts, toasts) que requieren forzar estilos
- Correcciones de bugs de terceros (Leaflet, etc.)

### 3. Usar el selector correcto para temas
❌ **MAL:**
```scss
body.dark-theme .my-class { }
:host-context(body.dark) .my-class { }
```

✅ **BIEN:**
```scss
body[data-theme="dark"] .my-class { }
:host-context(body[data-theme="dark"]) .my-class { }
```

**MEJOR AÚN:** No uses selectores específicos de tema, deja que las variables lo manejen:
```scss
.my-class {
  background: var(--surface); // Cambia automáticamente
}
```

### 4. No crear variables locales con colores fijos
❌ **MAL:**
```scss
:host {
  --my-bg: #ffffff;  // NO cambia con el tema
  --my-text: #000000;
}

.my-class {
  background: var(--my-bg);
  color: var(--my-text);
}
```

✅ **BIEN:**
```scss
:host {
  --my-bg: var(--surface);  // Hereda del tema
  --my-text: var(--text);
}

.my-class {
  background: var(--my-bg);
  color: var(--my-text);
}
```

## Variables a Usar

### Para Fondos
```scss
--ion-background-color    // Fondo general de la app
--ion-toolbar-background  // Toolbars/headers
--ion-item-background     // Items, modals, cards
--ion-card-background     // Cards específicamente
--surface                 // Alias para componentes
--surface-2               // Fondo alternativo
```

### Para Texto
```scss
--ion-text-color          // Texto principal
--color-text-secondary    // Texto secundario/muted
--text                    // Alias semántico
--text-muted              // Alias para secundario
```

### Para Bordes
```scss
--ion-border-color        // Bordes generales
--color-border            // Alias
--border                  // Alias semántico
```

### Para Colores de Marca (NO cambian con tema)
```scss
--ion-color-primary       // Azul principal
--ion-color-success       // Verde
--ion-color-warning       // Amarillo
--ion-color-danger        // Rojo
--ion-color-secondary     // Gris
```

## Patrones Comunes

### Cards
```scss
.my-card {
  background: var(--ion-card-background);
  border: 1px solid var(--color-border);
  box-shadow: var(--ion-card-box-shadow);
  
  .card-title {
    color: var(--ion-text-color);
  }
  
  .card-subtitle {
    color: var(--color-text-secondary);
  }
}
```

### Inputs
```scss
ion-input, ion-textarea {
  --background: var(--ion-item-background);
  --color: var(--ion-text-color);
  --placeholder-color: var(--color-text-secondary);
  --border-color: var(--color-border);
}
```

### Botones
```scss
// Botón primario (usa color de marca)
ion-button {
  --background: var(--ion-color-primary);
  --color: #ffffff; // OK porque primary no cambia
}

// Botón outline (respeta tema)
ion-button[fill="outline"] {
  --border-color: var(--color-border);
  --color: var(--ion-text-color);
}

// Botón clear (respeta tema)
ion-button[fill="clear"] {
  --color: var(--ion-text-color);
}
```

### Modales
```scss
ion-modal {
  ion-header ion-toolbar {
    --background: var(--ion-toolbar-background);
    --color: var(--ion-text-color);
  }
  
  ion-content {
    --background: var(--ion-background-color);
    --color: var(--ion-text-color);
  }
}
```

### Listas
```scss
ion-list {
  background: transparent;
  
  ion-item {
    --background: var(--ion-item-background);
    --color: var(--ion-text-color);
    --border-color: var(--color-border);
  }
}
```

## Casos Especiales

### Texto sobre Colores de Marca
Cuando pones texto sobre un color de marca, usa blanco:

```scss
.primary-badge {
  background: var(--ion-color-primary);
  color: #ffffff; // OK porque primary es siempre azul
}

.success-chip {
  background: var(--ion-color-success);
  color: #ffffff; // OK porque success es siempre verde
}
```

### Overlays (Modals, Alerts, Toasts)
Estos SÍ pueden usar `!important` porque Ionic los inyecta dinámicamente:

```scss
// En global.scss
.alert-wrapper {
  --background: var(--ion-item-background) !important;
}

.alert-message {
  color: var(--ion-text-color) !important;
}
```

### Librerías de Terceros (Leaflet, etc.)
También pueden usar `!important` para forzar estilos:

```scss
// En global.scss
.leaflet-container {
  background-color: var(--map-background) !important;
}

.leaflet-popup-content-wrapper {
  background-color: var(--ion-item-background) !important;
  color: var(--ion-text-color) !important;
}
```

## Checklist para Nuevos Componentes

Cuando crees un nuevo componente, verifica:

- [ ] No usas colores hardcoded (#fff, #000, etc.)
- [ ] No usas `!important` innecesariamente
- [ ] Usas variables del sistema (`--ion-text-color`, `--surface`, etc.)
- [ ] Probaste el componente en light Y dark mode
- [ ] Los textos son legibles en ambos modos
- [ ] Los bordes son visibles en ambos modos
- [ ] Los inputs funcionan correctamente

## Debugging de Temas

Si un componente NO cambia de tema:

### 1. Inspecciona en DevTools
```
F12 → Elements → Busca el elemento → Styles
```

### 2. Busca colores hardcoded
```bash
# En la terminal
grep "#fff\|#000\|#ffffff\|#000000" src/app/path/component.scss
```

### 3. Busca !important innecesarios
```bash
grep "!important" src/app/path/component.scss
```

### 4. Verifica el selector
```scss
// ❌ Incorrecto
body.dark-theme .my-class { }

// ✅ Correcto
body[data-theme="dark"] .my-class { }
```

### 5. Reemplaza por variables
```scss
// Antes
color: #ffffff;

// Después
color: var(--ion-text-color);
```

## Recursos

- **Variables disponibles:** `src/theme/variables.scss`
- **Estilos globales:** `src/global.scss`
- **Servicio de tema:** `src/app/services/theme/theme.service.ts`
- **Documentación Ionic:** https://ionicframework.com/docs/theming/themes

## Resumen

✅ **Usa variables CSS del sistema**  
✅ **Evita colores hardcoded**  
✅ **Evita !important (salvo excepciones)**  
✅ **Prueba en ambos modos (light/dark)**  
✅ **Confía en las variables (cambian automáticamente)**  

---

**Mantener esta guía a mano cuando se desarrollen nuevos componentes.**
