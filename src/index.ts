import "reflect-metadata";
import app from "@/app";
import { DatabaseService ,config} from "@/config"
const PORT = config.PORT;

const bootstrap = async () => {
  await DatabaseService.connection();
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}, PID: ${process.pid}`);
  });
};

bootstrap()