# Suscripciones con plan asociado

Las suscripciones con plan asociado se utilizan cuando es necesario utilizar la misma suscripción en diferentes ocasiones para organizarlas en grupos identificables. Por ejemplo, para una suscripción mensual y anual a un gimnasio.

La integración de **suscripciones con plan asociado** se realiza en dos pasos. En el primero es necesario **crear un plan** que irá asociado a la suscripción y en el segundo, la **creación de la suscripción**.

## Crear plan

El plan de suscripción te permite definir, entre otros atributos, el título, el valor y la frecuencia de las suscripciones creadas por el vendedor. Para crear un plan y asociarlo con una suscripción, mira el endpoint `/preapproval_plan`, completa los atributos necesarios y ejecuta el request o, si prefieres, usa el *curl* a continuación.

> **NOTA:** Al ejecutar la API, se creará el plan y tendrás acceso a `preapproval_plan_id`, **que en la respuesta de la API se mostrará como `id**`. Este **atributo es obligatorio** para crear la suscripción.

```curl
curl -X POST \
      'https://api.mercadopago.com/preapproval_plan' \
      -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
      -H 'Content-Type: application/json' \ 
      -d '{
  "reason": "Yoga classes",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "repetitions": 12,
    "billing_day": 10,
    "billing_day_proportional": true,
    "free_trial": {
      "frequency": 1,
      "frequency_type": "months"
    },
    "transaction_amount": 10,
    "currency_id": "ARS"
  },
  "payment_methods_allowed": {
    "payment_types": [
      {}
    ],
    "payment_methods": [
      {}
    ]
  },
  "back_url": "https://www.yoursite.com"
}'

```

> **IMPORTANTE:** Una *Suscripción con plan asociado* siempre deberá ser creada con su `card_token_id` y en status `Authorized`.

¡Listo! Ya creaste el plan de su suscripción con plan asociado. Para finalizar la integración, ahora deberás **crear una suscripción**.

## Crear suscripción

La suscripción es una autorización del pagador para cargos recurrentes con un medio de pago definido (tarjeta de crédito, por ejemplo). Al suscribirse a un producto/servicio, el cliente acepta que se le cobre periódicamente un cierto monto por el período de tiempo definido.

Para crear una suscripción, primero deberás contar con el valor `preapproval_plan_id`.

Luego, podrás continuar la integración por dos caminos: puedes acceder al endpoint `/preapproval` y completar los atributos como se indica en la tabla de parámetros, o también puedes usar el *curl* que te compartimos a continuación.

```curl
curl -X POST \
      'https://api.mercadopago.com/preapproval' \
      -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
      -H 'Content-Type: application/json' \ 
      -d '{
  "preapproval_plan_id": "2c938084726fca480172750000000000",
  "reason": "Yoga classes",
  "external_reference": "YG-1234",
  "payer_email": "test_user@testuser.com",
  "card_token_id": "e3ed6f098462036dd2cbabe314b9de2a",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "start_date": "2020-06-02T13:07:14.260Z",
    "end_date": "2022-07-20T15:59:52.581Z",
    "transaction_amount": 10,
    "currency_id": "ARS"
  },
  "back_url": "https://www.mercadopago.com.ar",
  "status": "authorized"
}'

```

Cuando termines de llenar los atributos, ejecuta el request y ¡listo! Ya habrás creado la suscripción con el plan asociado.

---

# Suscripciones con pago pendiente

Las suscripciones con pago pendiente son un modelo de suscripción donde no se define un método de pago en el momento de su creación. Cuando esto ocurre, los pagos pasan automáticamente al estado `pending` y dependen de que el usuario busque una forma de completar el pago.

En este caso, es posible actualizar la suscripción y definir un medio de pago a través del endpoint `/preapproval/{id}`, o compartir un link de pago para que el comprador pueda completar la compra con el método de pago de su elección.

Para ofrecer **suscripciones sin plan asociado y con pago pendiente**, envía un POST con los atributos necesarios al endpoint `/preapproval` y presta atención al parámetro `status`, que debe ser rellenado con el valor `pending`. Si prefieres, usa el *curl* a continuación.

```curl
curl --location --request POST 'https://api.mercadopago.com/preapproval' \
--header 'Authorization: Bearer YOU_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "reason": "Yoga classes",
    "external_reference": "YG-1234",
    "payer_email": "test_user_75650838@testuser.com",
    "auto_recurring": {
        "frequency": 1,
        "frequency_type": "months",
        "end_date": "2023-07-20T15:59:52.581Z",
        "transaction_amount": 10,
        "currency_id": "BRL"
    },
    "back_url": "https://www.yoursite.com",
    "status": "pending"
}'

```

---

# Gestión de suscripciones

A través de la gestión de suscripciones es posible pausar, cancelar o reactivar una suscripción ya creada, además de realizar otros cambios específicos dentro de su configuración inicial.

En la siguiente tabla encontrarás más información sobre las posibilidades de gestión.

| Tipo | Descripción |
| --- | --- |
| Buscar suscripción | Permite buscar suscripciones independientemente de su estado (activa, en pausa, cancelada). Para hacerlo, envía un GET con los parámetros necesarios al endpoint `/preapproval/search` y ejecuta la solicitud. |
| Modificar monto | Permite modificar el monto de una suscripción existente. Envía el nuevo monto a través de `auto_recurring.transaction_amount` y `auto_recurring.currency_id` en un PUT al endpoint `/preapproval/{id}`. |
| Modificar tarjeta del medio de pago principal | Permite modificar la tarjeta asociada a la suscripción existente. Envía un PUT con el nuevo token en atributo `card_token_id` para el endpoint `/preapproval/{id}`. |
| Modificar medio de pago secundario | Permite agregar un segundo medio de pago a una suscripción existente. Envía un PUT en el endpoint `/preapproval/{id}` con los parámetros `card_token_id_secondary` y `payment_method_id_secondary` en caso de que el método secundario sea una tarjeta, y sólo `payment_method_id_secondary` para otros medios de pago. |
| Cancelar o pausar suscripción | Permite cancelar o pausar una suscripción existente. Para cancelarla, envía un PUT con el atributo `status` y el valor `cancelled` al endpoint `/preapproval/{id}` y ejecuta la solicitud. Para pausarla, envía un PUT con el atributo `status` y el valor `paused` al mismo endpoint  y ejecuta la solicitud. |
| Reactivar una suscripción | Permite reactivar una suscripción en pausa y establecer una fecha límite para su finalización. Para hacerlo, envía un PUT con los parámetros necesarios al endpoint `/preapproval/{id}` y ejecuta la solicitud. |
| Cambiar la fecha de facturación | Para las suscripciones con una frecuencia de pago mensual, puedes elegir un día fijo del mes para que se produzca la facturación. Para hacerlo, envía un PUT con los parámetros necesarios al endpoint `/preapproval/{id}` y ejecuta la solicitud. |
| Establecer monto proporcional | Puedes establecer un monto proporcional para facturar una suscripción en particular. Para hacerlo, envía un PUT con los parámetros necesarios al endpoint `/preapproval/{id}` y ejecuta la solicitud. |
| Ofrecer prueba gratuita | Es posible ofrecer un período de prueba gratuito para que los clientes puedan probar el producto y/o servicio antes de comprarlo. Para ello, envía un PUT con los parámetros `free_trial`, `frequency` y `frequency_type` con el número y el tipo (días/meses) al endpoint `/preapproval_plan/{id}` y ejecuta la solicitud. |

---

# ¿Por qué se rechaza un pago?

> **IMPORTANTE:** Esta documentación está destinada a integradores. Si sos comprador y tu pago fue rechazado al usar Mercado Pago, consultá nuestro Centro de Ayuda para obtener orientación sobre cómo proceder.

La denegación de pagos es una realidad en el mundo de las ventas online y puede ocurrir por varias razones. Un **pago puede ser rechazado por**:

* un error con el medio de pago;
* llenado incorrecto de información por parte del cliente;
* tarjetas sin saldo suficiente;
* carga errónea de datos;
* incumplimiento con algún requisito de seguridad;
* comportamientos sospechosos que indiquen riesgo de fraude;
* problemas en la comunicación entre adquirentes y sub-adquirentes.

Puedes encontrar **toda la información sobre un pago y verificar su estado** a través de la API por medio del método Obtener pago. El campo de `status` indica si el pago fue aprobado o no, mientras que el campo `status_detail` proporciona más detalles, incluidos los motivos del rechazo.

```json
{
    "status": "rejected",
    "status_detail": "cc_rejected_insufficient_amount",
    "id": 47198050,
    "payment_method_id": "master",
    "payment_type_id": "credit_card",
    ...
}

```

> **NOTA:** Puedes encontrar más información sobre el detalle del pago en la actividad de la cuenta de Mercado Pago.

## Rechazos por errores en el relleno de datos

Estos rechazos ocurren debido a **errores al momento del checkout**, que pueden suceder por diversas razones: una falla de entendimiento en la pantalla de pago, problemas en la experiencia del comprador, o falta de validación de ciertos campos, así como errores que comete el cliente a la hora de completar sus datos.

En estos casos, el campo `status_detail` puede devolver:

* `cc_rejected_bad_filled_card_number`
* `cc_rejected_bad_filled_date`
* `cc_rejected_bad_filled_other`
* `cc_rejected_bad_filled_security_code`

## Rechazos del banco emisor

Al ofrecer un **pago con tarjeta de crédito o débito**, el banco emisor puede rechazar el cobro por distintas razones: que la tarjeta se encuentre vencida, que sus fondos o límites sean insuficientes, o que se encuentre bloqueada para compras online.

En estos casos, el campo `status_detail` puede devolver:

* `cc_rejected_call_for_authorize`
* `cc_rejected_card_disabled`
* `cc_rejected_duplicated_payment`
* `cc_rejected_insufficient_amount`
* `cc_rejected_invalid_installments`
* `cc_rejected_max_attempts`

## Rechazos para prevenir fraude

Monitoreamos en tiempo real las transacciones, buscando **reconocer características y patrones sospechosos** que apunten a un intento de fraude. Esto es hecho tanto por los algoritmos de Mercado Pago como por los bancos, todo para evitar al máximo los contracargos (*chargebacks*).

Cuando los sistemas de prevención detectan un pago sospechoso, la respuesta de la API puede devolver en el `status_detail`:

* `cc_rejected_blacklist`
* `cc_rejected_high_risk`
* `cc_rejected_other_reason`

> **ATENCIÓN:** La respuesta `cc_rejected_other_reason` es un status que proviene del banco emisor y, si bien no explicita el motivo de rechazo, se trata de una estimación de riesgo de fraude. Igualmente, hay otros motivos por los cuales este status puede ser devuelto. En caso de duda, es recomendable elegir otro medio de pago o ponerse en contacto con la entidad bancaria.

```json
 {
    "status": "rejected",
    "status_detail": "cc_rejected_high_risk",
    "id": 47198050,
    "payment_method_id": "master",
    "payment_type_id": "credit_card",
    ...
}

```

> **ATENCIÓN:** En algunos casos, la respuesta `cc_rejected_high_risk` puede aparecer cuando se intentan realizar dos pagos consecutivos con los mismos ítems o con parámetros muy similares. Esto puede hacer que el motor antifraude lo interprete como un intento duplicado y lo rechace por precaución. Se recomienda implementar controles para evitar reintentos inmediatos con los mismos datos.

---

# Recomendaciones para mejorar la aprobación de pagos

Para **evitar que un pago legítimo sea rechazado** por no cumplir con las validaciones de seguridad, es necesario incluir el máximo de información posible a la hora de realizar la operación, así como que tu checkout cuente con su interfaz optimizada.

## Obtén y envía el Device ID

El **Device ID** es una información importante para lograr una mejor seguridad y, en consecuencia, una mejor tasa de aprobación de pagos. Representa un **identificador único para el dispositivo de cada comprador** en el momento de la compra.

> **ATENCIÓN:** Si estás utilizando el JS SDK de Mercado Pago, **no** será necesario agregar el código de seguridad, ya que la información relativa al Device ID será obtenida por defecto.

Puedes **agregar el código de seguridad de Mercado Pago** a tu sitio reemplazando el valor de `view` con el nombre de la sección de tu web en la que deseas agregarlo (ej. `checkout`, `home`, `search`, `item`).

```html
<script src="https://www.mercadopago.com/v2/security.js" view="home"></script>

```

## Uso del Device ID en la web

### 1. Agrega nuestro código de seguridad

Para implementar la generación del Device ID en tu sitio, agrega el siguiente código a tu página de Checkout:

```html
<script src="https://www.mercadopago.com/v2/security.js" view="checkout"></script>

```

### 2. Obtén el device ID

Se crea una variable JavaScript global llamada `MP_DEVICE_SESSION_ID`. Si prefieres asignarlo a otra variable, indica el nombre agregando el atributo `output`:

```html
  <script src="https://www.mercadopago.com/v2/security.js" view="checkout" output="deviceId"></script>

```

También puedes **crear tu propia variable** agregando una etiqueta HTML con `id="deviceID"`:

```html
  <input type="hidden" id="deviceId">

```

### 3. Uso del device ID

Debes **enviarlo a nuestros servidores** al crear un pago agregando el siguiente **encabezado (*header*)** a la solicitud:

```html
X-meli-session-id: device_id

```

## Implementa el Device ID en tu aplicación móvil nativa

### 1. Agrega la dependencia

**iOS (Podfile):**

```ios
use_frameworks!
pod ‘MercadoPagoDevicesSDK’

```

**Android (build.gradle):**

```android
repositories {
    maven {
        url "https://artifacts.mercadolibre.com/repository/android-releases"
    }
}
dependencies {
   implementation 'com.mercadolibre.android.device:sdk:3.0.5'
}

```

### 2. Inicializa el módulo

**Swift (AppDelegate):**

```swift
import MercadoPagoDevicesSDK
...
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        ...        
        MercadoPagoDevicesSDK.shared.execute()
        ...
}

```

**Objective-C (AppDelegate):**

```objective-c
@import ‘MercadoPagoDevicesSDK’;
...
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    ...
    [[MercadoPagoDevicesSDK shared] execute];
    ...
}

```

**Java (MainApplication):**

```java
import com.mercadolibre.android.device.sdk.DeviceSDK;
DeviceSDK.getInstance().execute(this);

```

### 3. Captura la información

Ejecuta alguna de estas funciones para obtener la información:

**Swift:**

```swift
MercadoPagoDevicesSDK.shared.getInfo() // objeto Device Codable
MercadoPagoDevicesSDK.shared.getInfoAsJson() // objeto Data
MercadoPagoDevicesSDK.shared.getInfoAsJsonString() // String
MercadoPagoDevicesSDK.shared.getInfoAsDictionary() // Dictionary<String,Any>

```

**Objective-C:**

```objective-c
[[[MercadoPagoDevicesSDK] shared] getInfoAsJson] // objeto Data
[[[MercadoPagoDevicesSDK] shared] getInfoAsJsonString] // String
[[[MercadoPagoDevicesSDK] shared] getInfoAsDictionary] // Dictionary<String,Any>

```

**Java:**

```java
Device device = DeviceSDK.getInstance().getInfo() // objeto Device, serializable
Map deviceMap = DeviceSDK.getInstance().getInfoAsMap()  // Map<String, Object>
String jsonString = DeviceSDK.getInstance().getInfoAsJsonString() // String tipo Json

```

### 4. Envía la información

Envía la información en el campo `device` al crear el `card_token`. (Ver ejemplo en formato JSON en el material original que incluye información de fingerprint del OS, disco, memoria, UUIDs, etc).

## Detalla toda la información sobre el pago

Para optimizar la validación de la seguridad, envía la mayor cantidad posible de **datos del comprador y del ítem** (nodo `additional_info`). Existen también **campos extra** dependiendo del ramo de actividades de tu tienda (Industry Data).

## Mejora la experiencia del usuario

Revisa cada paso y posibles interacciones para comprobar que todo esté claro. Si un pago resultara rechazado, explica a tus clientes el motivo y qué medidas pueden tomar. Si quieres garantizar una interfaz optimizada, puedes utilizar los **componentes visuales de Checkout Bricks** (ej. Status Screen Brick).

---

# Generación del card token

La integración de los pagos con tarjeta se realiza a través de *CardForm*. En este modo de integración, **MercadoPago.js** se encarga de los flujos necesarios para obtener la información requerida para la generación de un pago.

> **NOTA:** Además de las opciones disponibles en esta documentación, también es posible integrar pagos con tarjeta utilizando el **Brick de Card Payment**.

## Importar MercadoPago.js

```html
<body>
  <script src="https://sdk.mercadopago.com/js/v2"></script>
</body>

```

```bash
npm install @mercadopago/sdk-js

```

## Configurar credenciales

```html
<script>
  const mp = new MercadoPago("YOUR_PUBLIC_KEY");
</script>

```

```javascript
import { loadMercadoPago } from "@mercadopago/sdk-js";
await loadMercadoPago();
const mp = new window.MercadoPago("YOUR_PUBLIC_KEY");

```

## Añadir formulario de pago

Para añadir el formulario de pago, inserta el siguiente HTML directamente en el proyecto.

```html
  <style>
    #form-checkout { display: flex; flex-direction: column; max-width: 600px; }
    .container { height: 18px; display: inline-block; border: 1px solid rgb(118, 118, 118); border-radius: 2px; padding: 1px 2px; }
  </style>
  <form id="form-checkout">
    <div id="form-checkout__cardNumber" class="container"></div>
    <div id="form-checkout__expirationDate" class="container"></div>
    <div id="form-checkout__securityCode" class="container"></div>
    <input type="text" id="form-checkout__cardholderName" />
    <select id="form-checkout__issuer"></select>
    <select id="form-checkout__installments"></select>
    <select id="form-checkout__identificationType"></select>
    <input type="text" id="form-checkout__identificationNumber" />
    <input type="email" id="form-checkout__cardholderEmail" />
    <button type="submit" id="form-checkout__submit">Pagar</button>
    <progress value="0" class="progress-bar">Cargando...</progress>
  </form>

```

## Inicializar formulario de pago

La biblioteca se encargará de rellenar, obtener y validar todos los datos necesarios en la confirmación del pago.

> **IMPORTANTE:** Al enviar el formulario, se genera un *token* (`CardToken`). Puede ser utilizado **solo una vez** y caduca en un plazo de **7 días**.

```javascript
    const cardForm = mp.cardForm({
      amount: "100.5",
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: { id: "form-checkout__cardNumber", placeholder: "Numero de tarjeta" },
        expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
        securityCode: { id: "form-checkout__securityCode", placeholder: "Código de seguridad" },
        cardholderName: { id: "form-checkout__cardholderName", placeholder: "Titular de la tarjeta" },
        issuer: { id: "form-checkout__issuer", placeholder: "Banco emisor" },
        installments: { id: "form-checkout__installments", placeholder: "Cuotas" },        
        identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
        identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número del documento" },
        cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "E-mail" },
      },
      callbacks: {
        onFormMounted: error => {
          if (error) return console.warn("Form Mounted handling error: ", error);
          console.log("Form mounted");
        },
        onSubmit: event => {
          event.preventDefault();

          const {
            paymentMethodId: payment_method_id,
            issuerId: issuer_id,
            cardholderEmail: email,
            amount,
            token,
            installments,
            identificationNumber,
            identificationType,
          } = cardForm.getCardFormData();

          fetch("/process_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              issuer_id,
              payment_method_id,
              transaction_amount: Number(amount),
              installments: Number(installments),
              description: "Descripción del producto",
              payer: {
                email,
                identification: {
                  type: identificationType,
                  number: identificationNumber,
                },
              },
            }),
          });
        },
        onFetching: (resource) => {
          console.log("Fetching resource: ", resource);
          const progressBar = document.querySelector(".progress-bar");
          progressBar.removeAttribute("value");
          return () => { progressBar.setAttribute("value", "0"); };
        }
      },
    });

```

## Enviar pago

En el backend, envía un **POST** con los atributos requeridos al endpoint `/v1/payments`.

> **IMPORTANTE:** Envía obligatoriamente el atributo `X-Idempotency-Key` (UUID V4) en los *headers* para evitar la reejecución accidental de la misma transacción.

Aquí tienes los ejemplos de cómo generar este llamado en múltiples lenguajes:

**PHP**

```php
<?php
  use MercadoPago\Client\Payment\PaymentClient;
  use MercadoPago\Client\Common\RequestOptions;
  use MercadoPago\MercadoPagoConfig;

  MercadoPagoConfig::setAccessToken("YOUR_ACCESS_TOKEN");

  $client = new PaymentClient();
  $request_options = new RequestOptions();
  $request_options->setCustomHeaders(["X-Idempotency-Key: <SOME_UNIQUE_VALUE>"]);

  $payment = $client->create([
    "transaction_amount" => (float) $_POST['<TRANSACTION_AMOUNT>'],
    "token" => $_POST['<TOKEN>'],
    "description" => $_POST['<DESCRIPTION>'],
    "installments" => $_POST['<INSTALLMENTS>'],
    "payment_method_id" => $_POST['<PAYMENT_METHOD_ID'],
    "issuer_id" => $_POST['<ISSUER>'],
    "payer" => [
      "email" => $_POST['<EMAIL>'],
      "identification" => [
        "type" => $_POST['<IDENTIFICATION_TYPE'],
        "number" => $_POST['<NUMBER>']
      ]
    ]
  ], $request_options);
  echo implode($payment);
?>

```

**Node.js**

```node
import { Payment, MercadoPagoConfig } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: '<ACCESS_TOKEN>' });

payment.create({
    body: { 
        transaction_amount: req.transaction_amount,
        token: req.token,
        description: req.description,
        installments: req.installments,
        payment_method_id: req.paymentMethodId,
        issuer_id: req.issuer,
            payer: {
            email: req.email,
            identification: { type: req.identificationType, number: req.number }
    }},
    requestOptions: { idempotencyKey: '<SOME_UNIQUE_VALUE>' }
})
.then((result) => console.log(result))
.catch((error) => console.log(error));

```

**Java**

```java
Map<String, String> customHeaders = new HashMap<>();
    customHeaders.put("x-idempotency-key", <SOME_UNIQUE_VALUE>);
 
MPRequestOptions requestOptions = MPRequestOptions.builder()
    .customHeaders(customHeaders)
    .build();

MercadoPagoConfig.setAccessToken("YOUR_ACCESS_TOKEN");

PaymentClient client = new PaymentClient();

PaymentCreateRequest paymentCreateRequest =
   PaymentCreateRequest.builder()
       .transactionAmount(request.getTransactionAmount())
       .token(request.getToken())
       .description(request.getDescription())
       .installments(request.getInstallments())
       .paymentMethodId(request.getPaymentMethodId())
       .payer(
           PaymentPayerRequest.builder()
               .email(request.getPayer().getEmail())
               .firstName(request.getPayer().getFirstName())
               .identification(
                   IdentificationRequest.builder()
                       .type(request.getPayer().getIdentification().getType())
                       .number(request.getPayer().getIdentification().getNumber())
                       .build())
               .build())
       .build();

client.create(paymentCreateRequest, requestOptions);

```

**Ruby**

```ruby
require 'mercadopago'
sdk = Mercadopago::SDK.new('YOUR_ACCESS_TOKEN')

custom_headers = { 'x-idempotency-key': '<SOME_UNIQUE_VALUE>' }

custom_request_options = Mercadopago::RequestOptions.new(custom_headers: custom_headers)

payment_data = {
 transaction_amount: params[:transactionAmount].to_f,
 token: params[:token],
 description: params[:description],
 installments: params[:installments].to_i,
 payment_method_id: params[:paymentMethodId],
 payer: {
   email: params[:email],
   identification: {
     type: params[:identificationType],
     number: params[:identificationNumber]
   }
 }
}
 
payment_response = sdk.payment.create(payment_data, custom_request_options)
payment = payment_response[:response]
 
puts payment

```

**C#**

```csharp
using System;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
 
MercadoPagoConfig.AccessToken = "YOUR_ACCESS_TOKEN";

var requestOptions = new RequestOptions();
requestOptions.CustomHeaders.Add("x-idempotency-key", "<SOME_UNIQUE_VALUE>");
 
var paymentRequest = new PaymentCreateRequest
{
   TransactionAmount = decimal.Parse(Request["transactionAmount"]),
   Token = Request["token"],
   Description = Request["description"],
   Installments = int.Parse(Request["installments"]),
   PaymentMethodId = Request["paymentMethodId"],
   Payer = new PaymentPayerRequest
   {
       Email = Request["email"],
       Identification = new IdentificationRequest
       {
           Type = Request["identificationType"],
           Number = Request["identificationNumber"],
       },
   },
};
 
var client = new PaymentClient();
Payment payment = await client.CreateAsync(paymentRequest, requestOptions);
 
Console.WriteLine(payment.Status);

```

**Python**

```python
import mercadopago
sdk = mercadopago.SDK("ACCESS_TOKEN")

request_options = mercadopago.config.RequestOptions()
request_options.custom_headers = {
    'x-idempotency-key': '<SOME_UNIQUE_VALUE>'
}

payment_data = {
   "transaction_amount": float(request.POST.get("transaction_amount")),
   "token": request.POST.get("token"),
   "description": request.POST.get("description"),
   "installments": int(request.POST.get("installments")),
   "payment_method_id": request.POST.get("payment_method_id"),
   "payer": {
       "email": request.POST.get("email"),
       "identification": {
           "type": request.POST.get("type"), 
           "number": request.POST.get("number")
       }
   }
}
 
payment_response = sdk.payment().create(payment_data, request_options)
payment = payment_response["response"]
 
print(payment)

```

**Go**

```go
accessToken := "{{ACCESS_TOKEN}}"

cfg, err := config.New(accessToken)
if err != nil {
   fmt.Println(err)
   return
}

client := payment.NewClient(cfg)

request := payment.Request{
   TransactionAmount: <transaction_amount>,
   Token: <token>,
   Description: <description>,
   PaymentMethodID:   <paymentMethodId>,
   Payer: &payment.PayerRequest{
      Email: <email>,
      Identification: &payment.IdentificationRequest{
         Type: <type>,
         Number: <number>,
      },
   },
}

resource, err := client.Create(context.Background(), request)
if err != nil {
   fmt.Println(err)
}

fmt.Println(resource)

```

**cURL**

```curl
curl -X POST \
   -H 'accept: application/json' \
   -H 'content-type: application/json' \
   -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
   -H 'X-Idempotency-Key: SOME_UNIQUE_VALUE' \
   'https://api.mercadopago.com/v1/payments' \
   -d '{
         "transaction_amount": 100,
         "token": "ff8080814c11e237014c1ff593b57b4d",
         "description": "Blue shirt",
         "installments": 1,
         "payment_method_id": "visa",
         "issuer_id": 310,
         "payer": {
           "email": "PAYER_EMAIL"
         }
   }'

```

La respuesta devolverá el siguiente resultado:

```json
{
   "status": "approved",
   "status_detail": "accredited",
   "id": 3055677,
   "date_approved": "2019-02-23T00:01:10.000-04:00",
   "payer": {
       ...
   },
   "payment_method_id": "visa",
   "payment_type_id": "credit_card",
   "refunds": [],
   ...
}

```

---

# Reembolsos y cancelaciones

**Reembolsos** son transacciones que se realizan cuando un determinado cargo se revierte y las cantidades pagadas se devuelven al comprador a su cuenta o tarjeta.
**Cancelaciones** ocurren cuando se realiza una compra pero el pago aún no ha sido aprobado, devolviendo el límite a la tarjeta sin generar un cargo final.

## Cancelaciones

* **Status de pago**: Solo se pueden cancelar pagos en estado `Pending` o `In process`.
* **Fecha de vencimiento**: Un pago vence a los 30 días sin confirmación y se cancela automáticamente (`Cancelled` o `Expired`).

## Reembolsos

Se pueden realizar **totales** o **parciales**.

* **Límite**: Dentro de los 180 días posteriores a la fecha de aprobación.
* **Saldo**: Debes tener suficiente saldo disponible en tu cuenta.
* **Forma de pago**: Se reembolsa en la factura de la tarjeta, o a la cuenta para medios como Pix o débito.

---

# Obtener Access Token

Los flujos disponibles para la generación del Access Token (*OAuth*) son:

* **Authorization code**: se usan credenciales para acceder a un recurso a nombre de un tercero (interacción del vendedor requerida).
* **Client credentials**: se usan credenciales para acceder a un recurso en nombre propio.

## Authorization code

### Configurar PKCE

Añade una capa extra de seguridad para el intercambio de códigos de autorización.

1. Habilita el flujo con PKCE en tu aplicación de Mercado Pago.
2. Genera un `code_verifier` (43 a 128 caracteres).
3. Crea un `code_challenge` usando S256 o Plain.
4. Envía estos parámetros en la URL de autenticación:

```url
https://auth.mercadopago.com/authorization?response_type=code&client_id=$APP_ID&redirect_uri=$YOUR_URL&code_challenge=$CODE_CHALLENGE&code_challenge_method=$CODE_METHOD

```

### Obtener token

1. Envía la **URL de autenticación** (incluyendo `client_id`, `state` y `redirect_uri`) al vendedor.
2. Espera a que el vendedor inicie sesión y permita el acceso.
3. Recibe el `code` en tu `redirect_uri`.
4. Envía tus credenciales (`client_id`, `client_secret`), el `code` y el `code_verifier` a `/oauth/token`. Recibirás tu Access Token válido por 180 días.

Ejemplo en cURL:

```curl
curl -X POST \
    'https://api.mercadopago.com/oauth/token'\
    -H 'Content-Type: application/json' \
    -d '{
  "client_id": "client_id",
  "client_secret": "client_secret",
  "code": "TG-XXXXXXXX-241983636",
  "grant_type": "authorization_code",
  "redirect_uri": "https://www.mercadopago.com.br/developers/example/redirect-url",
  "test_token": "false"
}'

```

## Client credentials

Este flujo se utiliza sin interacción del usuario, usando solo tus propias credenciales.

1. Envía `client_id` y `client_secret` a `/oauth/token` con `"grant_type": "client_credentials"`.
2. **El token tiene validez de 6 horas**.

Ejemplo en cURL:

```curl
curl -X POST \
    'https://api.mercadopago.com/oauth/token'\
    -H 'Content-Type: application/json' \
    -d '{
  "client_id": "client_id",
  "client_secret": "client_secret",
  "grant_type": "client_credentials",
}'

```

---

# Renovar Access Token

El flujo **Refresh token** se usa para intercambiar un `refresh_token` temporal por un nuevo Access Token cuando el original está próximo a caducar. Válido por 180 días adicionales. *(Solo aplica si el vendedor autorizó previamente el scope `offline_access`)*.

1. Envía el `refresh_token`, credenciales y el `grant_type: refresh_token` a `/oauth/token`.

Ejemplo en cURL:

```curl
curl -X POST \
'https://api.mercadopago.com/oauth/token'\
-H 'Content-Type: application/json' \
-d '{
 "client_id": "client_id",
 "client_secret": "client_secret",
 "grant_type": "refresh_token",
 "refresh_token": "TG-XXXXXXXX-241983636"
}'

```

---

# Gestionar Access Token

El token y sus permisos pueden deshabilitarse por:

* **Expiración** de tiempo.
* **Cambio de contraseña** del usuario.
* **Revocación de autorización** por parte del vendedor.
* **Lavado por fraude**.
* **Limpieza de sesión** de usuario.
* **Eliminación de la aplicación**.

---

# Buenas prácticas de integración de OAuth

* **Header de la solicitud**: Utiliza siempre los header `accept` y `content-type`. No agregues valores innecesarios.
* **Valores params**: Envía sólo los requeridos.
* **Query Params**: No envíes parámetros dentro de Query Params. Hazlo en el cuerpo (Body).
* **Campo `grant_type**`: Utiliza `authorization_code`, `client_credentials` o `refresh_token`.
* **Campo `state**`: Úsalo para incrementar la seguridad y validar que la respuesta te pertenece. Asegúrate que `redirect_uri` sea una URL estática exacta.

---

# Glosario

| Término | Descripción |
| --- | --- |
| Plan de suscripción | Modelo para definir el título, valor y frecuencia de las suscripciones (sin método de pago). |
| Suscripción o preapproval | Autorización del pagador para cargos recurrentes con un medio de pago definido. |
| Pago autorizado | Porción de la suscripción que se cobra en función de la recurrencia. |
| Cargo de verificación | Cargo mínimo reembolsado inmediatamente para comprobar la validez de la tarjeta. |
| Fecha de facturación | Fecha para los cargos mensuales automáticos. |
| Importe prorrateado | Importe proporcional a los días transcurridos entre el alta y la primera mensualidad. |
| Prueba Gratuita | Período gratis ofrecido antes de la primera carga. |
| Saldo en cuenta | Saldo de la billetera de Mercado Pago disponible para pagos. |
| Plugin | Componentes que añaden funcionalidades específicas en plataformas ecommerce. |
| SDK | Kit de herramientas de desarrollo de software para facilitar integración de API. |

---

# Mantén tus credenciales seguras

Manejarás datos sensibles como el Access Token que deben protegerse.

* **Envía el access token por header:** Nunca como query param. Ej: `Authorization: Bearer APP_USR-...`. Nunca lo expongas del lado público.
* **Usa la Public Key en el front-end:** Para cifrar los datos de la tarjeta.
* **Renueva periódicamente:** Hazlo desde el Panel del Desarrollador > Credenciales de Producción. (Tienes 12 horas de transición donde ambas funcionan).
* **Comparte por Dashboard:** Si otras personas necesitan acceso, usa "Compartir mis credenciales" desde tu panel para agregarlos con su email en lugar de enviar claves sueltas. Elimina los permisos cuando ya no los necesiten.
* **Utiliza OAuth:** Para gestionar credenciales de terceros sin exponer su información sensible.
