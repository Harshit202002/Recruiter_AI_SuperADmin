import express from 'express'
import cors from 'cors'
import session from 'express-session'
import superAdminRoutes from "./routes/superAdmin.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import companyRoutes from "./routes/company.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"

const app = express()

app.use(cors({
   origin: ["https://final-frontend-ai-project.vercel.app","http://localhost:5173","http://20.81.204.72"],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type","Authorization"]
}))


app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}))

app.use(express.json());
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/subscription", subscriptionRoutes);

export default app;


