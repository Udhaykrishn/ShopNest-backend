import "reflect-metadata";
import "source-map-support"
import app from "@/app";
import { DatabaseService ,config} from "@/config"
const PORT = config.PORT;

const bootstrap = async () => {
  await DatabaseService.connect();
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
};

bootstrap()