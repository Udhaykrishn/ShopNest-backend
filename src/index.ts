import "reflect-metadata";
import app from "@/app";
import { DatabaseService } from "@/config"
const PORT = 3001;

const bootstrap = async () => {
  await DatabaseService.connection();
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}, PID: ${process.pid}`);
  });
};

bootstrap()