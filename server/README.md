# CUSTOMER

```
{
"name": "Jane Smith",
"email": "jane9.smith@example.com",
"password": "securePassword123",
"role": "CUSTOMER",
"phone": "+1234567890",
"address": "789 Maple Drive, Austin, TX"
}

```

# TECHNICIAN

```

{
  "name": "Robert Miller",
  "email": "robert.spark@example.com",
  "password": "sparkyPassword456",
  "role": "TECHNICIAN",
  "phone": "+1987654321",
  "address": "456 Industrial Blvd, Austin, TX"
}

```

# Login

```
{
  "email": "jane.smith@example.com",
  "password": "securePassword123"
}

```

# Create Category

```
{"name": "Emergency Electrical Wiring Repair",
  "description": "Comprehensive troubleshooting for residential power failures and socket overloads."}

```

# Create Service

```
{
  "title": "Emergency Electrical Wiring Repair",
  "description": "Comprehensive troubleshooting for residential power failures and socket overloads.",
  "price": 75.50,
  "location": "Austin Central Area",
  "categoryId": "PASTE_THE_CATEGORY_UUID_HERE"
}

```

# Create Booking

```
here technicianId is the technician user id not technician table id


{
  "serviceId": "3728988d-e769-4277-bf85-adbe356255f0",
  "technicianId": "7bce1d58-95b6-4c83-a8a2-07c3a9c42f88",
  "scheduledDate": "2026-08-15T14:30:00.000Z",
  "totalPrice": 500
}

```

# create payment

```
{


    "bookingId":"002ee3c9-b4c1-47dd-b915-9a2025b9b07f"
}
```

# confirm payment

```

{
"transactionId":"Fix-It-Now-2026-6-3-15-3"
}

```

# create review

```
{
  "bookingId": "002ee3c9-b4c1-47dd-b915-9a2025b9b07f",
  "rating": 4.5,
  "comment": "Excellent service. Highly recommended!"
}
```

submission

```
Backend Repo : https://github.com/Shihab2022/FixItNow-

Live API : https://fixitnow-one.vercel.app/

API Docs : https://documenter.getpostman.com/view/21086915/2sBY4LQMXu#cf931068-eba1-46b6-b950-bfd26e6306e1

Demo Video : https://drive.google.com/file/d/1c6eMrZS971Oa9Bxbvl6ASO8As5VmypL0/view?usp=drive_link

Admin Email : admin@fixitnow.com

Admin Password : admin@123
```
