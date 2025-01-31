import app from "@/app"

const bootstrap = async () => {
    app.listen(3001, () => console.log(`🚀 Server started on ${3001}`))
}

bootstrap()