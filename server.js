const express = require('express');
const connectDB = require('./config/db');
const authRouters = require('./routers/authRouters');
const contactRoutes = require('./routers/contactRoutes');
const appointmentRouters = require('./routers/appointmentRouters');
const pharmacyRoutes = require('./routers/pharmacyRoutes');
const departmentRouter = require('./routers/departmentRouter');
const inventoryRoutes = require('./routers/inventoryRoutes');
const prescriptionRoutes = require('./routers/prescriptionRoutes');
const diagnosisRoutes = require('./routers/diagnosisRoutes');
const invoiceRoutes = require('./routers/invoiceRoutes');
const paymentRouter = require('./routers/paymentRouter');
const dotenv = require('dotenv');
const cors = require('cors');
const ErrorMiddleware = require('./middleware/error');
const cookieParser = require('cookie-parser')
const app = express()
app.use(express.json())
app.use(cookieParser())

dotenv.config()
connectDB()

// Middleware to parse JSON and URL-encoded data with a limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
    origin:["http://localhost:5173"],
    allowedHeaders : ["Content-Type" ,"Authorization","user",, 'Cache-Control'],
    methods : ["GET", "POST","PUT","PATCH", "DELETE"],
    credentials : true
}))

app.use('/user', authRouters)
app.use('/contact', contactRoutes)
app.use('/appointment', appointmentRouters)
app.use('/pharmacy', pharmacyRoutes)
app.use('/department',departmentRouter)
app.use('/inventory',inventoryRoutes)
app.use('/prescription',prescriptionRoutes)
app.use('/diagnosis',diagnosisRoutes)
app.use('/invoice',invoiceRoutes)
app.use('/payment',paymentRouter)


//middleware
app.use(ErrorMiddleware)

const port = process.env.PORT || 3000
app.listen(port, ()=>{console.log(`connected to port ${port}`);
})