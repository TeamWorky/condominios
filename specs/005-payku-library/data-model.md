# Data Model: Payku Payment Gateway Library

**Note**: This library has NO database entities. All "models" are TypeScript interfaces representing Payku API request/response payloads.

## Configuration

### PaykuConfig
| Field | Type | Description |
|-------|------|-------------|
| publicToken | string | Payku public API token (Bearer auth) |
| privateToken | string | Payku private token (HMAC signing) |
| sandbox | boolean | Whether to use sandbox environment |
| baseUrl | string | Derived: `https://des.payku.cl/api` (sandbox) or `https://app.payku.cl/api` (production) |

## Transaction Interfaces

### CreateTransactionRequest
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Customer email (max 100 chars) |
| order | string | Yes | Merchant order ID (max 40 chars) |
| subject | string | Yes | Payment description (max 2000 chars) |
| amount | number | Yes | Amount in CLP (max 14 digits) |
| currency | string | No | Currency code (default: "CLP") |
| payment | number | Yes | Payment method ID (1=Webpay, 4=Etpay, 9=Mach, etc.) |
| urlreturn | string | Yes | Return URL after payment (max 200 chars) |
| urlnotify | string | Yes | Webhook notification URL (max 600 chars) |
| expired | string | No | Expiration datetime (format: "YYYY-MM-DD HH:mm:ss") |
| additional_parameters | Record<string, string> | No | Extra params (order_ext, payer_rut, payer_bank) |

### TransactionCreateResponse
| Field | Type | Description |
|-------|------|-------------|
| status | string | "pending" or "register" |
| id | string | Payku transaction identifier (e.g., "trx3b4d77b43acd9a720") |
| url | string | Payment URL to redirect customer |

### TransactionDetailResponse
| Field | Type | Description |
|-------|------|-------------|
| status | string | "register", "pending", "success", "rejected" |
| id | string | Transaction identifier |
| created_at | string | Creation date |
| order | string | Merchant order ID |
| email | string | Customer email |
| subject | string | Payment description |
| amount | string | Amount (returned as string by API) |
| payment | PaymentDetail | Payment detail object |
| nullify | NullifyDetail | Nullification info (if applicable) |
| gateway_response | GatewayResponse | Gateway processing result |

### PaymentDetail
| Field | Type | Description |
|-------|------|-------------|
| start | string | Transaction start datetime |
| end | string | Transaction end datetime |
| media | string | Payment method name ("Webpay", etc.) |
| transaction_id | number | Payku internal transaction ID |
| payment_key | string | Payment key identifier |
| transaction_key | string | Transaction key |
| deposit_date | string | Estimated deposit date |
| verification_key | string | Verification code |
| authorization_code | string | Bank authorization code |
| last_4_digits | string | Last 4 card digits |
| installments | number | Number of installments |
| card_type | string | Card type code |
| currency | string | Currency code |
| additional_parameters | Record<string, any> | Additional response data |

### GatewayResponse
| Field | Type | Description |
|-------|------|-------------|
| status | string | "pending", "success", "rejected", "refunded partial", "refunded" |
| message | string | Descriptive message |

### TransactionListResponse
| Field | Type | Description |
|-------|------|-------------|
| transaction | TransactionDetailResponse[] | Array of transactions |

### TransactionListParams
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number |
| per_page | number | No | Items per page (max 4000) |
| date_init | string | No | Start date filter (YYYY-MM-DD) |
| date_end | string | No | End date filter (YYYY-MM-DD) |
| success | boolean | No | Filter by success status |
| pending | boolean | No | Filter by pending status |
| rejected | boolean | No | Filter by rejected status |

## Nullification Interfaces

### CreateNullificationRequest
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Transaction ID to nullify (max 40 chars) |
| amount | number | Yes | Refund amount (max 14 digits) |
| subject | string | Yes | Reason for nullification (max 200 chars) |

### NullificationResponse
| Field | Type | Description |
|-------|------|-------------|
| status | string | "pending", "awaiting_funds", "waiting_bank_details", "complete", "reverse_deleted", "reverse_completed" |
| id | string | Nullification identifier |

## Wallet Interfaces

### WalletPayoutRequest
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Recipient email |
| phone | string | Yes | Recipient phone |
| subject | string | Yes | Payout description |
| currency | string | Yes | Currency code ("CLP") |
| order | string | Yes | Merchant order ID |
| amount | number | Yes | Amount |
| accountbank_name | string | Yes | Bank account holder name |
| accountbank_rut | string | Yes | Account holder RUT |
| accountbank_sbif | string | Yes | Bank SBIF code |
| accountbank_type | string | Yes | Account type ("1"=checking, etc.) |
| accountbank_num | string | Yes | Account number |
| url_notify | string | No | Webhook URL |
| additional_parameters | Record<string, string> | No | Extra params |

### WalletBalanceResponse
| Field | Type | Description |
|-------|------|-------------|
| balance | number | Available balance |
| currency | string | Currency code |

## Webhook Interface

### PaykuWebhookPayload
| Field | Type | Description |
|-------|------|-------------|
| transaction_id | string | Transaction identifier |
| payment_key | string | Payment key |
| transaction_key | string | Transaction key |
| verification_key | string | Verification hash |
| order | string | Merchant order ID |
| status | string | "success" or "failed" |

## Constants

### PaykuPaymentMethod (numeric enum)
| Value | Name | Description |
|-------|------|-------------|
| 99 | ALL | All methods (user chooses) |
| 1 | WEBPAY | Webpay credit/debit |
| 4 | ETPAY | Etpay bank transfer |
| 6 | PAGO46 | Pago46 |
| 9 | MACH | Mach digital wallet |
| 19 | FINTOC | Fintoc bank transfer |
| 23 | TENPO | Tenpo digital wallet |
| 26 | FLOID | Floid bank transfer |
| 100 | WEBPAY_PLUS_1_3 | Webpay Plus 1-3 installments |
| 101 | WEBPAY_PLUS_4_6 | Webpay Plus 4-6 installments |
| 102 | WEBPAY_PLUS_7_12 | Webpay Plus 7-12 installments |

### PaykuTransactionStatus (string literal type)
`"register" | "pending" | "success" | "rejected"`

### PaykuNullificationStatus (string literal type)
`"pending" | "awaiting_funds" | "waiting_bank_details" | "complete" | "reverse_deleted" | "reverse_completed"`

### PaykuWebhookStatus (string literal type)
`"success" | "failed"`
