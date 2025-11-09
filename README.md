# 🩺 AWS Project Indra — Backend de Agendamiento Médico (Serverless + Node.js)

## 📘 Descripción del Proyecto

**AWS Project Indra** es una aplicación backend **serverless** diseñada para gestionar el **agendamiento de citas médicas** para asegurados en **Perú (PE)** y **Chile (CL)**.  
Utiliza los servicios administrados de AWS para garantizar escalabilidad, disponibilidad y bajo acoplamiento entre los componentes.

El sistema recibe solicitudes de citas, las almacena temporalmente, las enruta según el país y actualiza su estado una vez que el proceso se completa.

---

## 🧩 Flujo General del Sistema

1. **Lambda `appointment`**
   - Recibe solicitudes REST (POST/GET).
   - Guarda el registro inicial en **DynamoDB** con estado `"pending"`.
   - Publica el evento en un **SNS Topic**.

2. **SNS Topic**
   - Distribuye los mensajes hacia el **SQS** correspondiente según el `countryISO`:
     - `SQS_PE` → Perú  
     - `SQS_CL` → Chile

3. **Lambdas `appointment_pe` y `appointment_cl`**
   - Consumen sus colas respectivas.
   - Simulan la inserción en una **base de datos MySQL (RDS)**.
   - Envían la confirmación a un **SQS de confirmación**.

4. **Lambda `appointment_confirmation`**
   - Escucha la cola de confirmación.
   - Actualiza el estado del registro en DynamoDB a `"completed"`.

---

## ⚙️ Stack Tecnológico

| Tecnología | Uso principal |
|-------------|----------------|
| **Node.js 18.x** | Lógica de negocio |
| **Serverless Framework v3** | Infraestructura como código |
| **AWS SDK v2** | Interacción con servicios AWS |
| **DynamoDB / SNS / SQS / RDS** | Persistencia y mensajería |
| **Jest** | Pruebas unitarias |
| **dotenv** | Variables de entorno |

---

## 🏗️ Arquitectura AWS

- **API Gateway** — expone los endpoints REST.
- **AWS Lambda** — procesamiento sin servidores.
- **Amazon SNS** — publica eventos de agendamiento.
- **Amazon SQS** — colas por país y confirmación.
- **DynamoDB** — almacenamiento inicial del agendamiento.
- **RDS (MySQL)** — persistencia final.
- **EventBridge (simulado)** — flujo de confirmación.

---

## 📁 Estructura del Proyecto

aws-project-indra/
│
├─ src/
│ ├─ functions/
│ │ ├─ appointment/
│ │ │ ├─ handler.js
│ │ │ ├─ dynamoService.js
│ │ │ ├─ snsService.js
│ │ │ ├─ sqsService.js
│ │ ├─ appointment_pe/
│ │ │ └─ handler.js
│ │ ├─ appointment_cl/
│ │ │ └─ handler.js
│ │ └─ appointment_confirmation/
│ │ └─ handler.js
│ └─ tests/
│ ├─ appointmentHandler.test.js
│ ├─ dynamoService.test.js
│ ├─ snsService.test.js
│ ├─ sqsService.test.js
│
├─ .env
├─ .env.example
├─ .gitignore
├─ .openapi.yaml
├─ package-lock.json
├─ package.json
├─ serverless.yml
├─ README.md
└─ serverless.yml


---

## 🌍 Endpoints REST

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| **POST** | `/appointments` | Crea un nuevo agendamiento |
| **GET** | `/appointments/{insuredId}` | Obtiene todas las citas de un asegurado |

### Ejemplo de `POST /appointments`

**Request**
```json
{
  "insuredId": "00045",
  "countryISO": "PE",
  "schedule": {
    "scheduleId": 100,
    "centerId": 4,
    "specialtyId": 3,
    "medicId": 4,
    "date": "2024-09-30T12:30:00Z"
  }
}


Response

{
  "message": "Cita registrada correctamente",
  "status": "pending"
}

🧰 Variables de Entorno

Archivo .env en la raíz del proyecto:

RDS_HOST=
RDS_USER=
RDS_PASSWORD=
RDS_DB=
DYNAMO_TABLE=
SNS_TOPIC_ARN=
SQS_PE_URL=
SQS_CL_URL=
SQS_CONFIRMATION_URL=

🚀 Despliegue
1️⃣ Instalar dependencias
npm install

2️⃣ Desplegar con Serverless
sls deploy --verbose


📦 Ejemplo de salida:

endpoints:
  POST - https://lgnm6ddlik.execute-api.us-east-1.amazonaws.com/dev/appointments
  GET  - https://lgnm6ddlik.execute-api.us-east-1.amazonaws.com/dev/appointments/{insuredId}
  REAL:
        GET  - https://lgnm6ddlik.execute-api.us-east-1.amazonaws.com/dev/appointments/00001
functions:
  appointment
  appointment_pe
  appointment_cl
  appointment_confirmation

🧪 Pruebas Unitarias

Ejecuta las pruebas con:

npm run test


📋 Resultado esperado:

Test Suites: 4 passed, 0 failed, 4 total
Tests:       12 passed

🧠 Principios y Buenas Prácticas

Single Responsibility: cada servicio (SNS, Dynamo, SQS, etc.) tiene una función clara.

Clean Architecture: separación entre lógica de negocio e infraestructura.

Event-driven: comunicación asincrónica basada en eventos.

Testable Design: todos los servicios cuentan con mocks unitarios.

🧾 Detalles de Implementación

Service: aws-project-indra
Framework: Serverless v3
Runtime: Node.js 18.x
Región: us-east-1
Infraestructura: AWS (DynamoDB, SNS, SQS, RDS)

🧠 Autor

👨‍💻 Desarrollado por: JUAN CARLOS CRUZ CHACÓN
GitHub: https://github.com/JCCRUZCHACON
Correo: confeccionesmc2018@gmail.com
Versión: 1.0.0
Licencia: MIT

💬 “Arquitectura limpia, asincronía total y despliegue sin servidores. Una base sólida para escalar.”


---

¿Quieres que te lo deje **personalizado con tu nombre y tu GitHub**, así lo pegas directo en tu repo p