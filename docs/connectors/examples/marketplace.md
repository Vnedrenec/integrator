# Примеры маркетплейс-коннекторов

В этом документе представлены примеры реализации коннекторов для маркетплейсов в рамках проекта "BPM Centr".

## Обзор маркетплейс-коннекторов

Маркетплейс-коннекторы обеспечивают интеграцию между платформой Make и различными маркетплейсами, такими как Ozon, Wildberries, Яндекс.Маркет и другие. Эти коннекторы позволяют автоматизировать работу с товарами, заказами, остатками и другими сущностями маркетплейсов.

## Пример коннектора для Shopify

### Структура коннектора

```json
// app.json
{
  "name": "shopify",
  "label": "Shopify",
  "version": "1.0.0",
  "description": "Коннектор для Shopify API",
  "language": "ru",
  "categories": ["marketplace", "ecommerce"],
  "icon": "app.png",
  "author": "BPM Centr",
  "website": "https://bpmcentr.com",
  "docs": "https://docs.bpmcentr.com/connectors/shopify"
}
```

### Конфигурация аутентификации

```json
// connections/api_key.json
{
  "name": "api_key",
  "type": "api_key",
  "label": "API Key",
  "fields": [
    {
      "name": "shopName",
      "type": "text",
      "label": "Shop Name",
      "required": true,
      "help": "Название вашего магазина Shopify (например, mystore.myshopify.com)"
    },
    {
      "name": "apiKey",
      "type": "text",
      "label": "API Key",
      "required": true,
      "help": "Ваш Shopify API Key"
    },
    {
      "name": "apiSecret",
      "type": "password",
      "label": "API Secret",
      "required": true,
      "sensitive": true,
      "help": "Ваш Shopify API Secret"
    },
    {
      "name": "accessToken",
      "type": "password",
      "label": "Access Token",
      "required": true,
      "sensitive": true,
      "help": "Ваш Shopify Access Token"
    },
    {
      "name": "bpmCentrApiKey",
      "type": "text",
      "label": "BPM Centr API Key",
      "required": true,
      "sensitive": true,
      "help": "API ключ из вашего аккаунта BPM Centr для проверки подписки"
    }
  ],
  "test": {
    "request": {
      "url": "https://{{connection.shopName}}.myshopify.com/admin/api/2023-07/products.json?limit=1",
      "method": "GET",
      "headers": {
        "X-Shopify-Access-Token": "{{connection.accessToken}}",
        "Content-Type": "application/json"
      }
    },
    "response": {
      "status": 200
    }
  }
}
```

### Модуль для работы с товарами

```json
// modules/actions/get-product.json
{
  "name": "getProduct",
  "label": "Получить товар",
  "description": "Получает информацию о товаре по ID",
  "connection": "api_key",

  "parameters": [
    {
      "name": "productId",
      "type": "text",
      "label": "ID товара",
      "required": true,
      "help": "Shopify Product ID"
    }
  ],

  "communication": {
    "url": "https://{{connection.shopName}}.myshopify.com/admin/api/2023-07/products/{{parameters.productId}}.json",
    "method": "GET",
    "headers": {
      "X-Shopify-Access-Token": "{{connection.accessToken}}",
      "Content-Type": "application/json"
    },
    "response": {
      "output": {
        "id": "{{body.product.id}}",
        "title": "{{body.product.title}}",
        "description": "{{body.product.body_html}}",
        "vendor": "{{body.product.vendor}}",
        "product_type": "{{body.product.product_type}}",
        "price": "{{body.product.variants[0].price}}",
        "compare_at_price": "{{body.product.variants[0].compare_at_price}}",
        "status": "{{body.product.status}}",
        "images": "{{body.product.images}}",
        "created_at": "{{formatDate(body.product.created_at, 'YYYY-MM-DD')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'shopify')}}"
      }
    }
  },

  "expect": [
    {
      "name": "productId",
      "type": "text",
      "label": "ID товара",
      "required": true
    }
  ],

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "title",
      "type": "text",
      "label": "Название"
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Описание"
    },
    {
      "name": "vendor",
      "type": "text",
      "label": "Производитель"
    },
    {
      "name": "product_type",
      "type": "text",
      "label": "Тип товара"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена"
    },
    {
      "name": "compare_at_price",
      "type": "number",
      "label": "Сравнительная цена"
    },
    {
      "name": "status",
      "type": "text",
      "label": "Статус"
    },
    {
      "name": "images",
      "type": "collection",
      "label": "Изображения"
    },
    {
      "name": "created_at",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": {
    "id": "12345678901234",
    "title": "Смартфон XYZ",
    "description": "<p>Описание товара</p>",
    "vendor": "XYZ Electronics",
    "product_type": "Смартфоны",
    "price": 499.99,
    "compare_at_price": 599.99,
    "status": "active",
    "images": [
      {
        "id": "123456789",
        "src": "https://example.com/image1.jpg"
      }
    ],
    "created_at": "2023-01-15"
  }
}
```json
// modules/actions/update-price.json
{
  "name": "updatePrice",
  "label": "Обновить цену",
  "description": "Обновляет цену товара",
  "connection": "api_key",

  "parameters": [
    {
      "name": "productId",
      "type": "text",
      "label": "ID товара",
      "required": true,
      "help": "Shopify Product ID"
    },
    {
      "name": "variantId",
      "type": "text",
      "label": "ID варианта",
      "required": true,
      "help": "Shopify Variant ID"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена",
      "required": true
    },
    {
      "name": "compareAtPrice",
      "type": "number",
      "label": "Сравнительная цена",
      "required": false
    }
  ],

  "communication": {
    "url": "https://{{connection.shopName}}.myshopify.com/admin/api/2023-07/variants/{{parameters.variantId}}.json",
    "method": "PUT",
    "headers": {
      "X-Shopify-Access-Token": "{{connection.accessToken}}",
      "Content-Type": "application/json"
    },
    "body": {
      "variant": {
        "id": "{{parameters.variantId}}",
        "price": "{{parameters.price}}",
        "compare_at_price": "{{parameters.compareAtPrice}}"
      }
    },
    "response": {
      "output": {
        "success": true,
        "product_id": "{{parameters.productId}}",
        "variant_id": "{{body.variant.id}}",
        "price": "{{body.variant.price}}",
        "compare_at_price": "{{body.variant.compare_at_price}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'shopify')}}"
      }
    }
  },

  "expect": [
    {
      "name": "productId",
      "type": "text",
      "label": "ID товара",
      "required": true
    },
    {
      "name": "variantId",
      "type": "text",
      "label": "ID варианта",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена",
      "required": true
    },
    {
      "name": "compareAtPrice",
      "type": "number",
      "label": "Сравнительная цена",
      "required": false
    }
  ],

  "interface": [
    {
      "name": "success",
      "type": "boolean",
      "label": "Успех"
    },
    {
      "name": "product_id",
      "type": "text",
      "label": "ID товара"
    },
    {
      "name": "variant_id",
      "type": "text",
      "label": "ID варианта"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена"
    },
    {
      "name": "compare_at_price",
      "type": "number",
      "label": "Сравнительная цена"
    }
  ],

  "samples": {
    "success": true,
    "product_id": "12345678901234",
    "variant_id": "98765432109876",
    "price": 499.99,
    "compare_at_price": 599.99
  }
}
```json
// modules/triggers/new-products.json
{
  "name": "newProducts",
  "label": "Новые товары",
  "description": "Срабатывает при добавлении новых товаров",
  "connection": "api_key",
  "type": "polling",

  "parameters": [
    {
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "communication": {
    "url": "https://{{connection.shopName}}.myshopify.com/admin/api/2023-07/products.json",
    "method": "GET",
    "headers": {
      "X-Shopify-Access-Token": "{{connection.accessToken}}",
      "Content-Type": "application/json"
    },
    "params": {
      "limit": "{{parameters.maxResults}}",
      "created_at_min": "{{state.lastPollTime}}",
      "order": "created_at asc"
    },
    "response": {
      "iterate": "{{body.products}}",
      "output": {
        "id": "{{item.id}}",
        "title": "{{item.title}}",
        "vendor": "{{item.vendor}}",
        "product_type": "{{item.product_type}}",
        "price": "{{item.variants[0].price}}",
        "status": "{{item.status}}",
        "created_at": "{{formatDate(item.created_at, 'YYYY-MM-DD')}}"
      },
      "state": {
        "lastPollTime": "{{formatDate(now(), 'YYYY-MM-DDTHH:mm:ss')}}"
      },
      "wrapper": {
        "data": "{{output}}",
        "subscription": "{{checkSubscription(connection.bpmCentrApiKey, 'shopify')}}"
      }
    }
  },

  "expect": [
    {
      "name": "maxResults",
      "type": "uinteger",
      "label": "Максимальное количество результатов",
      "required": false,
      "default": 10
    }
  ],

  "interface": [
    {
      "name": "id",
      "type": "text",
      "label": "ID"
    },
    {
      "name": "title",
      "type": "text",
      "label": "Название"
    },
    {
      "name": "vendor",
      "type": "text",
      "label": "Производитель"
    },
    {
      "name": "product_type",
      "type": "text",
      "label": "Тип товара"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Цена"
    },
    {
      "name": "status",
      "type": "text",
      "label": "Статус"
    },
    {
      "name": "created_at",
      "type": "date",
      "label": "Дата создания"
    }
  ],

  "samples": [
    {
      "id": "12345678901234",
      "title": "Смартфон XYZ",
      "vendor": "XYZ Electronics",
      "product_type": "Смартфоны",
      "price": 499.99,
      "status": "active",
      "created_at": "2023-01-15"
    },
    {
      "id": "98765432109876",
      "title": "Наушники ABC",
      "vendor": "ABC Audio",
      "product_type": "Аудио",
      "price": 99.99,
      "status": "active",
      "created_at": "2023-01-16"
    }
  ]
}
```

### Модуль для работы с заказами

```javascript
// modules/orders.js
const { checkSubscription } = require('../utils/subscription');
const ordersApi = require('../api/orders-api');

module.exports = {
  name: 'orders',
  label: 'Orders',
  description: 'Work with orders in Ozon Seller',

  operations: [
    {
      name: 'getOrder',
      label: 'Get Order',
      description: 'Retrieve an order by ID',
      input: {
        fields: [
          {
            name: 'orderId',
            type: 'string',
            label: 'Order ID',
            required: true
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'order_id',
            type: 'string',
            label: 'Order ID'
          },
          {
            name: 'order_number',
            type: 'string',
            label: 'Order Number'
          },
          {
            name: 'status',
            type: 'string',
            label: 'Status'
          },
          {
            name: 'created_at',
            type: 'date',
            label: 'Created At'
          },
          {
            name: 'items',
            type: 'array',
            label: 'Items'
          },
          {
            name: 'delivery',
            type: 'object',
            label: 'Delivery'
          },
          {
            name: 'financial_data',
            type: 'object',
            label: 'Financial Data'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'ozon', context);

          // Выполнение операции
          const { orderId } = params;
          const { clientId, apiKey } = context.auth;

          const order = await ordersApi.getOrder(clientId, apiKey, orderId, context);

          return order;
        } catch (error) {
          throw new Error(`Error getting order: ${error.message}`);
        }
      }
    },
    {
      name: 'shipOrder',
      label: 'Ship Order',
      description: 'Mark order as shipped',
      input: {
        fields: [
          {
            name: 'orderId',
            type: 'string',
            label: 'Order ID',
            required: true
          },
          {
            name: 'items',
            type: 'array',
            label: 'Items',
            required: true,
            spec: {
              type: 'object',
              properties: {
                sku: {
                  type: 'string',
                  label: 'SKU'
                },
                quantity: {
                  type: 'number',
                  label: 'Quantity'
                }
              }
            }
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'success',
            type: 'boolean',
            label: 'Success'
          },
          {
            name: 'order_id',
            type: 'string',
            label: 'Order ID'
          }
        ]
      },
      execute: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'ozon', context);

          // Выполнение операции
          const { orderId, items } = params;
          const { clientId, apiKey } = context.auth;

          const result = await ordersApi.shipOrder(clientId, apiKey, orderId, items, context);

          return result;
        } catch (error) {
          throw new Error(`Error shipping order: ${error.message}`);
        }
      }
    }
  ],

  triggers: [
    {
      name: 'newOrders',
      label: 'New Orders',
      description: 'Triggers when new orders are received',
      type: 'polling',
      input: {
        fields: [
          {
            name: 'maxResults',
            type: 'uinteger',
            label: 'Max Results',
            required: false,
            default: 10
          },
          {
            name: 'status',
            type: 'select',
            label: 'Status',
            required: false,
            options: [
              { label: 'Awaiting Approval', value: 'awaiting_approval' },
              { label: 'Awaiting Packaging', value: 'awaiting_packaging' },
              { label: 'Awaiting Deliver', value: 'awaiting_deliver' },
              { label: 'Delivering', value: 'delivering' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'Cancelled', value: 'cancelled' }
            ],
            default: 'awaiting_packaging'
          }
        ]
      },
      output: {
        fields: [
          {
            name: 'order_id',
            type: 'string',
            label: 'Order ID'
          },
          {
            name: 'order_number',
            type: 'string',
            label: 'Order Number'
          },
          {
            name: 'status',
            type: 'string',
            label: 'Status'
          },
          {
            name: 'created_at',
            type: 'date',
            label: 'Created At'
          },
          {
            name: 'items',
            type: 'array',
            label: 'Items'
          }
        ]
      },
      poll: async function(params, context) {
        try {
          // Проверка подписки
          await checkSubscription(context.auth.bpmCentrApiKey, 'ozon', context);

          // Выполнение операции
          const { maxResults, status } = params;
          const { clientId, apiKey } = context.auth;
          const { lastPollTime } = context.state;

          const orders = await ordersApi.getNewOrders(clientId, apiKey, status, lastPollTime, maxResults, context);

          // Сохранение времени последнего опроса
          if (orders.length > 0) {
            context.state.lastPollTime = new Date().toISOString();
          }

          return orders;
        } catch (error) {
          throw new Error(`Error polling for new orders: ${error.message}`);
        }
      }
    }
  ]
};
```

### API-адаптер для работы с товарами

```javascript
// api/products-api.js
async function getProduct(clientId, apiKey, productId, context) {
  try {
    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v2/product/info',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        offer_id: productId
      }
    });

    if (response.statusCode >= 400) {
      const errorMessage = response.body?.message || 'Unknown error';
      const errorCode = response.statusCode;
      throw {
        response: {
          statusCode: errorCode,
          body: response.body
        },
        message: `API returned error ${errorCode}: ${errorMessage}`
      };
    }

    if (response.body.result === undefined) {
      throw new Error('API response missing result data');
    }

    return response.body.result;
  } catch (error) {
    // Если ошибка уже структурирована, пробрасываем её
    if (error.response) {
      throw error;
    }
    // Иначе оборачиваем в стандартный формат ошибки
    throw {
      message: `Error in getProduct: ${error.message}`,
      originalError: error
    };
  }
}

async function updatePrice(clientId, apiKey, productId, price, oldPrice, context) {
  try {
    const priceData = {
      offer_id: productId,
      price: price.toString(),
      old_price: oldPrice ? oldPrice.toString() : undefined
    };

    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v1/product/import/prices',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        prices: [priceData]
      }
    });

    if (response.statusCode !== 200) {
      throw new Error(response.body.message || 'Failed to update price');
    }

    return {
      success: true,
      product_id: response.body.result.product_id,
      offer_id: productId,
      price: price,
      old_price: oldPrice
    };
  } catch (error) {
    throw new Error(`Error in updatePrice: ${error.message}`);
  }
}

async function getNewProducts(clientId, apiKey, lastPollTime, maxResults, context) {
  try {
    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v1/product/list',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        limit: maxResults,
        offset: 0,
        filter: {
          visibility: 'ALL'
        }
      }
    });

    if (response.statusCode !== 200) {
      throw new Error(response.body.message || 'Failed to get products');
    }

    let products = response.body.result.items;

    // Фильтрация по времени создания, если указано
    if (lastPollTime) {
      const lastPollDate = new Date(lastPollTime);
      products = products.filter(product => {
        const productDate = new Date(product.created_at);
        return productDate > lastPollDate;
      });
    }

    // Получение детальной информации о каждом товаре
    const detailedProducts = [];
    for (const product of products.slice(0, maxResults)) {
      const detailedProduct = await getProduct(clientId, apiKey, product.offer_id, context);
      detailedProducts.push(detailedProduct);
    }

    return detailedProducts;
  } catch (error) {
    throw new Error(`Error in getNewProducts: ${error.message}`);
  }
}

module.exports = {
  getProduct,
  updatePrice,
  getNewProducts
};
```

### API-адаптер для работы с заказами

```javascript
// api/orders-api.js
async function getOrder(clientId, apiKey, orderId, context) {
  try {
    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v3/order/get',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        order_id: parseInt(orderId)
      }
    });

    if (response.statusCode !== 200 || response.body.result === undefined) {
      throw new Error(response.body.message || 'Failed to get order');
    }

    return response.body.result;
  } catch (error) {
    throw new Error(`Error in getOrder: ${error.message}`);
  }
}

async function shipOrder(clientId, apiKey, orderId, items, context) {
  try {
    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v2/posting/fbs/ship',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        posting_number: orderId,
        items: items.map(item => ({
          sku: item.sku,
          quantity: item.quantity
        }))
      }
    });

    if (response.statusCode !== 200) {
      throw new Error(response.body.message || 'Failed to ship order');
    }

    return {
      success: true,
      order_id: orderId
    };
  } catch (error) {
    throw new Error(`Error in shipOrder: ${error.message}`);
  }
}

async function getNewOrders(clientId, apiKey, status, lastPollTime, maxResults, context) {
  try {
    const response = await context.http.post({
      url: 'https://api-seller.ozon.ru/v3/order/list',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: {
        limit: maxResults,
        offset: 0,
        filter: {
          status: status,
          since: lastPollTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        with: {
          analytics_data: true,
          financial_data: true
        }
      }
    });

    if (response.statusCode !== 200) {
      throw new Error(response.body.message || 'Failed to get orders');
    }

    return response.body.result.orders;
  } catch (error) {
    throw new Error(`Error in getNewOrders: ${error.message}`);
  }
}

module.exports = {
  getOrder,
  shipOrder,
  getNewOrders
};
```

## Пример коннектора для Wildberries

### Структура коннектора

```javascript
// index.js
const auth = require('./auth');
const productsModule = require('./modules/products');
const ordersModule = require('./modules/orders');
const stocksModule = require('./modules/stocks');
const { checkSubscription } = require('./utils/subscription');

module.exports = {
  name: 'wildberries',
  label: 'Wildberries',
  description: 'Connector for Wildberries API',
  icon: './assets/icon.png',
  version: '1.0.0',
  authentication: auth,
  modules: [
    productsModule,
    ordersModule,
    stocksModule
  ]
};
```

### Конфигурация аутентификации

```javascript
// auth.js
module.exports = {
  type: 'api_key',
  fields: {
    apiKey: {
      type: 'password',
      label: 'API Key',
      required: true,
      sensitive: true,
      help: 'Your Wildberries API Key'
    },
    bpmCentrApiKey: {
      type: 'string',
      label: 'BPM Centr API Key',
      required: true,
      sensitive: true,
      help: 'API key from your BPM Centr account to verify subscription'
    }
  },
  test: {
    request: {
      url: 'https://suppliers-api.wildberries.ru/api/v2/supplies',
      method: 'GET',
      headers: {
        'Authorization': '{{apiKey}}'
      }
    },
    response: {
      status: 200
    }
  }
};
```

## Рекомендации по разработке маркетплейс-коннекторов

### Общие рекомендации

1. **Учет особенностей API маркетплейсов** - каждый маркетплейс имеет свои особенности API, которые необходимо учитывать
2. **Обработка ошибок API** - корректно обрабатывайте ошибки API маркетплейсов
3. **Оптимизация запросов** - минимизируйте количество запросов к API
4. **Документирование особенностей** - документируйте особенности работы с конкретным маркетплейсом

### Типичные операции маркетплейс-коннекторов

1. **Товары**:
   - Получение товара по ID
   - Создание товара
   - Обновление товара
   - Обновление цены товара
   - Обновление остатков товара
   - Архивация товара

2. **Заказы**:
   - Получение заказа по ID
   - Получение списка заказов
   - Подтверждение заказа
   - Отмена заказа
   - Отправка заказа
   - Трекинг заказа

3. **Остатки**:
   - Получение остатков
   - Обновление остатков
   - Резервирование товаров

4. **Аналитика**:
   - Получение статистики продаж
   - Получение отчетов
   - Анализ эффективности товаров

### Типичные триггеры маркетплейс-коннекторов

1. **Новый заказ** - срабатывает при получении нового заказа
2. **Изменение статуса заказа** - срабатывает при изменении статуса заказа
3. **Новый отзыв** - срабатывает при получении нового отзыва
4. **Изменение цены конкурента** - срабатывает при изменении цены конкурента
5. **Низкий остаток товара** - срабатывает при достижении минимального остатка товара

## Связанные разделы

- [Обзор коннекторов](../overview.md)
- [Структура коннекторов](../structure.md)
- [Разработка коннекторов](../development.md)
- [Тестирование коннекторов](../testing.md)
- [Примеры CRM-коннекторов](crm.md)
- [Примеры платежных коннекторов](payment.md)
