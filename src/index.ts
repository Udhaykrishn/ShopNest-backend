import app from "@/app"
import { DatabaseService } from "./config"
const bootstrap = async () => {
    await DatabaseService.connection()
    app.listen(3001, () => console.log(`🚀 Server started on ${3001}`))
}

bootstrap()